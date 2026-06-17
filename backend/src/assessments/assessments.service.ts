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
      // 1. Extract features from chat history using LLM
      try {
        const chatPrompt = assessment.chat_history.map((m: any) => `${m.role}: ${m.content}`).join('\n');
        const extractionPrompt = `Given the following chat transcript, extract these values into a strict JSON object:
- "ai_investment_usd": total AI investment amount in USD (number). If not explicitly mentioned, estimate based on company scale or default to 500000.
- "ai_maturity_score": AI maturity score from 1.0 to 10.0 (number). Default to 3.0.
- "automation_rate": estimated automation rate from 0.0 to 1.0 (number). Default to 0.2.
- "num_deployments": number of existing AI deployments (integer). Default to 1.
- "employee_training_hrs": hours of training (number). Default to 40.

Chat Transcript:
${chatPrompt}

Return ONLY raw JSON.`;

        const extractionResult = await this.llmService.generateResponse([
          { role: 'user', content: extractionPrompt }
        ], true);

        const cleanJson = extractionResult.replace(/```json/gi, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(cleanJson);
        
        assessment.ai_budget = extracted.ai_investment_usd || assessment.ai_budget || 500000;
        assessment.ai_maturity = extracted.ai_maturity_score || assessment.ai_maturity || 3.0;
        assessment.extracted_data = { ...assessment.extracted_data, ...extracted };
        this.logger.log(`Extracted ML features: ${JSON.stringify(extracted)}`);
      } catch (extractError: any) {
        this.logger.error(`LLM Extraction failed, using defaults. Error: ${extractError.message}`);
      }

      // Call ML Integration
      const features = {
        industry: assessment.user?.industry || 'Unknown',
        country: assessment.user?.country || 'US',
        budget: assessment.ai_budget,
        maturity: assessment.ai_maturity,
        ...assessment.extracted_data
      };
      
      const mlResults = await this.mlIntegration.predictFull(features);

      // Map nested Flask response to flat Prisma fields
      const roi         = mlResults.roi || {};
      const prod        = mlResults.productivity || {};
      const risk        = mlResults.risk || {};
      const riskScores  = risk.risk_scores || {};
      const maturity    = mlResults.maturity || {};
      const scenarios   = mlResults.scenarios || {};
      const readiness   = mlResults.readiness || {};
      const tfScore     = mlResults.transformation_score || 0;

      // Save ML results to predictions table and update Assessment using a Transaction
      await this.prisma.$transaction([
        this.prisma.prediction.upsert({
          where: { assessment_id: assessment.id },
          update: {
            annual_revenue_impact: roi.quarterly_revenue_impact ? roi.quarterly_revenue_impact * 4 : 0,
            quarterly_revenue_impact: roi.quarterly_revenue_impact || 0,
            annual_net_benefit: roi.annual_net_benefit || 0,
            productivity_gain_pct: prod.predicted_productivity_gain || 0,
            roi_percentage: roi.roi_percentage || 0,
            payback_months: roi.payback_months || 0,
            risk_score: riskScores.technical?.score || riskScores.technical || 0,
            transformation_score: tfScore,
            readiness_level: readiness.readiness_level || 'LOW',
            maturity_tier: maturity.maturity_tier || 1,
            peer_percentile: maturity.peer_percentile || 0,
            risk_technical: typeof riskScores.technical === 'object' ? riskScores.technical.score : (riskScores.technical || 0),
            risk_financial: typeof riskScores.financial === 'object' ? riskScores.financial.score : (riskScores.financial || 0),
            risk_talent: typeof riskScores.talent === 'object' ? riskScores.talent.score : (riskScores.talent || 0),
            risk_regulatory: typeof riskScores.regulatory === 'object' ? riskScores.regulatory.score : (riskScores.regulatory || 0),
            risk_market: typeof riskScores.market === 'object' ? riskScores.market.score : (riskScores.market || 0),
            scenario_baseline_roi: scenarios.baseline?.roi_percentage || roi.roi_percentage || 0,
            scenario_cautious_roi: scenarios.cautious?.roi_percentage || 0,
            scenario_aggressive_roi: scenarios.aggressive?.roi_percentage || 0,
            board_recommendation: scenarios.board_recommendation || '',
            model_version: '2.0.0',
            predicted_at: new Date()
          },
          create: {
            assessment_id: assessment.id,
            annual_revenue_impact: roi.quarterly_revenue_impact ? roi.quarterly_revenue_impact * 4 : 0,
            quarterly_revenue_impact: roi.quarterly_revenue_impact || 0,
            annual_net_benefit: roi.annual_net_benefit || 0,
            productivity_gain_pct: prod.predicted_productivity_gain || 0,
            roi_percentage: roi.roi_percentage || 0,
            payback_months: roi.payback_months || 0,
            risk_score: riskScores.technical?.score || riskScores.technical || 0,
            transformation_score: tfScore,
            readiness_level: readiness.readiness_level || 'LOW',
            maturity_tier: maturity.maturity_tier || 1,
            peer_percentile: maturity.peer_percentile || 0,
            risk_technical: typeof riskScores.technical === 'object' ? riskScores.technical.score : (riskScores.technical || 0),
            risk_financial: typeof riskScores.financial === 'object' ? riskScores.financial.score : (riskScores.financial || 0),
            risk_talent: typeof riskScores.talent === 'object' ? riskScores.talent.score : (riskScores.talent || 0),
            risk_regulatory: typeof riskScores.regulatory === 'object' ? riskScores.regulatory.score : (riskScores.regulatory || 0),
            risk_market: typeof riskScores.market === 'object' ? riskScores.market.score : (riskScores.market || 0),
            scenario_baseline_roi: scenarios.baseline?.roi_percentage || roi.roi_percentage || 0,
            scenario_cautious_roi: scenarios.cautious?.roi_percentage || 0,
            scenario_aggressive_roi: scenarios.aggressive?.roi_percentage || 0,
            board_recommendation: scenarios.board_recommendation || '',
            model_version: '2.0.0'
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
