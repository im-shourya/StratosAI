import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assessment } from './schemas/assessment.schema';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectModel(Assessment.name) private assessmentModel: Model<Assessment>
  ) {}

  async startAssessment(data: { user_id: string; industry?: string; company_name?: string }) {
    // 1. Initialize extracted data from what we know
    const initialExtractedData: any = {};
    if (data.industry) initialExtractedData.industry = data.industry;
    if (data.company_name) initialExtractedData.company_name = data.company_name;

    // 2. Formulate the LLM prompt context and the first greeting
    // In a full implementation, you might call Claude API here to generate the greeting dynamically.
    // For now, we seed the conversation with a deterministic but highly professional greeting.
    const companyStr = data.company_name ? ` for ${data.company_name}` : '';
    const industryStr = data.industry ? ` in the ${data.industry} sector` : '';
    
    const initialMessage = {
      role: 'assistant',
      content: `Welcome to the StratosAI Corporate Strategy Advisor! To help tailor a predictive AI roadmap and ROI model${companyStr}${industryStr}, I need to understand your primary objectives. What specific business problem or workflow are you hoping to optimize using AI (e.g., Customer Support, Supply Chain, Data Analytics)?`,
      timestamp: new Date()
    };

    // 3. Create the Assessment document in MongoDB
    const assessment = await this.assessmentModel.create({
      user_id: new Types.ObjectId(data.user_id),
      status: 'IN_PROGRESS',
      extracted_data: initialExtractedData,
      chat_history: [
        {
          role: 'system',
          content: 'You are StratosAI, an elite Corporate AI Strategy Advisor. Your goal is to interview the user to extract their AI budget, timeline, company size, and specific use cases. Ask ONE concise question at a time. Once you have enough data, output a JSON structure summarizing the extracted data.',
          timestamp: new Date()
        },
        initialMessage
      ],
      ml_results: {}
    });

    // 4. Return the session to the client
    return {
      assessment_id: assessment._id.toString(),
      status: assessment.status,
      message: initialMessage
    };
  }
}
