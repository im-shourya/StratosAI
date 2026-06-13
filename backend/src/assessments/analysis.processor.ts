import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AssessmentsService } from './assessments.service';
import { Logger } from '@nestjs/common';

@Processor('analysisQueue')
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(private readonly assessmentsService: AssessmentsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { assessmentId, userId } = job.data;
    this.logger.log(`Processing analysis job ${job.id} for assessment ${assessmentId} (User: ${userId})`);
    try {
      const result = await this.assessmentsService.executeAnalysis(assessmentId, userId);
      this.logger.log(`Successfully processed job ${job.id}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`);
      throw error;
    }
  }
}
