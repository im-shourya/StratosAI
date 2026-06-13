import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report.name) private reportModel: Model<Report>) {}

  async getReport(assessmentId: string) {
    const report = await this.reportModel.findOne({ assessment_id: assessmentId });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async saveReport(assessmentId: string, reportData: any) {
    const existingReport = await this.reportModel.findOne({ assessment_id: assessmentId });
    if (existingReport) {
      return this.reportModel.findByIdAndUpdate(existingReport._id, reportData, { new: true });
    }
    return this.reportModel.create({
      assessment_id: assessmentId,
      ...reportData
    });
  }
}
