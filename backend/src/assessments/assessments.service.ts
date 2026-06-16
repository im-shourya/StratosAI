import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { v4 as uuidv4 } from 'uuid';
import { MlIntegrationService } from '../ml-integration/ml-integration.service';
import { LlmService } from '../chat/llm.service';

import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    private readonly mlIntegration: MlIntegrationService,
    @Inject(forwardRef(() => LlmService))
    private readonly llmService: LlmService,
    private readonly vendorsService: VendorsService
  ) {}

  async startAssessment(data: StartAssessmentDto) {
    const sessionId = uuidv4();
    
    // 1. Create Assessment in PostgreSQL (Prisma)
    const assessment = await this.prisma.assessment.create({
      data: {
        user_id: data.user_id as string,
        session_id: sessionId,
        project_name: data.project_name || 'New Project',
        department: data.department || 'Unknown',
        ai_budget: 0,
        ai_maturity: 1,
        status: 'IN_PROGRESS'
      }
    });

    const initialExtractedData: any = {};
    if (data.department) initialExtractedData.department = data.department;
    if (data.project_name) initialExtractedData.project_name = data.project_name;

    const projectStr = data.project_name ? ` for the ${data.project_name} project` : '';
    const deptStr = data.department ? ` in the ${data.department} department` : '';
    
    const initialMessage = {
      role: 'assistant',
      content: `Welcome to the StratosAI Internal Strategy Advisor! To help tailor a predictive AI roadmap and ROI model${projectStr}${deptStr}, I need to understand your primary objectives. What specific business problem or workflow are you hoping to optimize using AI?`,
      timestamp: new Date()
    };

    // 2. Create Conversation in MongoDB (Mongoose)
    const conversation = await this.conversationModel.create({
      assessment_id: assessment.id,
      session_id: sessionId,
      extracted_data: initialExtractedData,
      messages: [
        {
          role: 'system',
          content: 'You are StratosAI, an elite Corporate AI Strategy Advisor. Interview the user to extract their AI budget, timeline, company size, and specific use cases. Ask ONE concise question at a time.',
          timestamp: new Date()
        },
        initialMessage
      ]
    });

    return {
      assessment_id: assessment.id,
      status: assessment.status,
      message: initialMessage
    };
  }

  async getAssessment(assessmentId: string) {
    const assessment = await this.prisma.assessment.findUnique({ 
      where: { id: assessmentId },
      include: { prediction: true, user: true }
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    return {
      ...assessment,
      chat_history: conversation.messages,
      extracted_data: conversation.extracted_data,
      phase: conversation.phase
    };
  }

  async getAllAssessments(userId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { user_id: userId },
      include: { prediction: true },
      orderBy: { created_at: 'desc' }
    });

    return assessments.map(a => {
      let progress = 0;
      if (a.status === 'completed' || a.status === 'COMPLETED') progress = 100;
      else if (a.status === 'error' || a.status === 'FAILED') progress = 40;
      else progress = 65;

      return {
        id: a.id,
        project_name: a.project_name,
        department: a.department,
        status: a.status.toLowerCase(),
        date: a.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        roi: a.prediction?.roi_percentage ? `${a.prediction.roi_percentage}%` : '--',
        progress
      };
    });
  }

  async addMessage(assessmentId: string, message: { role: string; content: string; timestamp: Date }) {
    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    conversation.messages.push(message);
    await conversation.save();
    return message;
  }

  async analyzeAssessment(assessmentId: string, userId: string) {
    // Run analysis synchronously/directly since BullMQ/Redis was removed
    this.logger.log(`Starting analysis for assessment ${assessmentId} (User: ${userId})`);
    const results = await this.executeAnalysis(assessmentId, userId);
    return { status: 'COMPLETED', results };
  }

  async executeAnalysis(assessmentId: string, userId: string) {
    const assessment = await this.getAssessment(assessmentId);

    try {
      // Call ML Integration
      const features = {
        industry: assessment.user?.industry || 'Unknown',
        budget: assessment.ai_budget,
        maturity: assessment.ai_maturity,
        ...assessment.extracted_data
      };
      
      const mlResults = await this.mlIntegration.predictFull(features);

      // Save ML results to predictions table and update Assessment using a Transaction
      await this.prisma.$transaction([
        this.prisma.prediction.create({
          data: {
            assessment_id: assessment.id,
            annual_revenue_impact: mlResults.annualRevenueImpact || 0,
            quarterly_revenue_impact: mlResults.quarterlyRevenueImpact || 0,
            annual_net_benefit: mlResults.annualNetBenefit || 0,
            productivity_gain_pct: mlResults.productivityGainPct || 0,
            roi_percentage: mlResults.roiPercentage || 0,
            risk_score: mlResults.riskScore || 0,
            transformation_score: mlResults.transformationScore || 0,
            readiness_level: mlResults.readinessLevel || 'LOW',
            maturity_tier: mlResults.maturityTier || 1,
            peer_percentile: mlResults.peerPercentile || 0,
            risk_technical: mlResults.riskTechnical || 0,
            risk_financial: mlResults.riskFinancial || 0,
            risk_talent: mlResults.riskTalent || 0,
            risk_regulatory: mlResults.riskRegulatory || 0,
            risk_market: mlResults.riskMarket || 0,
            model_version: '1.0.0'
          }
        }),
        this.prisma.assessment.update({
          where: { id: assessment.id },
          data: { status: 'COMPLETED' }
        })
      ]);

      // In a real scenario, here we would also generate the LLM report and save to MongoDB via ReportsService
      // If saving to MongoDB fails, it will throw and go to catch block

      return mlResults;
    } catch (error: any) {
      this.logger.error(`Analysis failed for ${assessmentId} (User: ${userId}), performing soft rollback. Error: ${error.message}`);
      
      // Soft Delete / Rollback
      await this.prisma.assessment.update({
        where: { id: assessmentId },
        data: { status: 'FAILED' }
      });

      throw error;
    }
  }

  async searchGlobal(userId: string, query: string) {
    if (!query || query.length < 2) return { assessments: [], vendors: [] };

    // Check if query is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query);

    const orConditions: any[] = [
      { project_name: { contains: query, mode: 'insensitive' } },
      { department: { contains: query, mode: 'insensitive' } }
    ];

    if (isUuid) {
      orConditions.push({ id: query });
    }

    // Search assessments by project name, department, or exact ID
    const assessments = await this.prisma.assessment.findMany({
      where: {
        user_id: userId,
        OR: orConditions
      },
      take: 5,
      select: {
        id: true,
        project_name: true,
        department: true,
        status: true,
        created_at: true
      }
    });

    // Search vendors
    const vendors = await this.vendorsService.search(query);

    return { assessments, vendors };
  }
}
