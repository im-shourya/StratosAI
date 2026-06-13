import { Controller, Get, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('assessments')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/report')
  async getReport(@Param('id') id: string) {
    return this.reportsService.getReport(id);
  }
}
