import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service';
import { Conversation } from '../conversations/schemas/conversation.schema';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { v4 as uuidv4 } from 'uuid';
import { MlIntegrationService } from '../ml-integration/ml-integration.service';
import { LlmService } from '../chat/llm.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    private readonly mlIntegration: MlIntegrationService,
    private readonly llmService: LlmService,
    @InjectQueue('analysisQueue') private analysisQueue: Queue
  ) {}

  async startAssessment(data: StartAssessmentDto) {
    const sessionId = uuidv4();
    
    // 1. Create Assessment in PostgreSQL (Prisma)
    const assessment = await this.prisma.assessment.create({
      data: {
        user_id: data.user_id,
        session_id: sessionId,
        company_name: data.company_name || 'Unknown',
        industry: data.industry || 'Unknown',
        company_size: 'Unknown',
        ai_budget: 0,
        ai_maturity: 1,
        status: 'IN_PROGRESS'
      }
    });

    const initialExtractedData: any = {};
    if (data.industry) initialExtractedData.industry = data.industry;
    if (data.company_name) initialExtractedData.company_name = data.company_name;

    const companyStr = data.company_name ? ` for ${data.company_name}` : '';
    const industryStr = data.industry ? ` in the ${data.industry} sector` : '';
    
    const initialMessage = {
      role: 'assistant',
      content: `Welcome to the StratosAI Corporate Strategy Advisor! To help tailor a predictive AI roadmap and ROI model${companyStr}${industryStr}, I need to understand your primary objectives. What specific business problem or workflow are you hoping to optimize using AI?`,
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
    const assessment = await this.prisma.assessment.findUnique({ where: { id: assessmentId } });
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

  async addMessage(assessmentId: string, message: { role: string; content: string; timestamp: Date }) {
    const conversation = await this.conversationModel.findOne({ assessment_id: assessmentId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    conversation.messages.push(message);
    await conversation.save();
    return message;
  }

  async analyzeAssessment(assessmentId: string, userId: string) {
    const job = await this.analysisQueue.add('analyze', { assessmentId, userId });
    return { jobId: job.id, status: 'QUEUED' };
  }

  async executeAnalysis(assessmentId: string, userId: string) {
    const assessment = await this.getAssessment(assessmentId);

    try {
      // Call ML Integration
      const features = {
        industry: assessment.industry,
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
            roi_12m: mlResults.roi?.roi_12m || 0,
            roi_36m: mlResults.roi?.roi_36m || 0,
            success_prob: mlResults.success_probability || 0,
            maturity_score: mlResults.maturity?.maturity_tier || 1,
            risk_technical: mlResults.risk_scores?.technical || 0,
            risk_financial: mlResults.risk_scores?.financial || 0,
            risk_talent: mlResults.risk_scores?.talent || 0,
            risk_regulatory: mlResults.risk_scores?.regulatory || 0,
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
}
