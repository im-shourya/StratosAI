import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(@CurrentUser() user: any) {
    return this.dashboardService.getMetrics(user.id);
  }

  @Get('pipeline')
  async getPipeline(@CurrentUser() user: any) {
    return this.dashboardService.getPipeline(user.id);
  }

  @Get('budget')
  async getBudget(@CurrentUser() user: any) {
    return this.dashboardService.getBudget(user.id);
  }

  @Get('risks')
  async getRisks(@CurrentUser() user: any) {
    return this.dashboardService.getRisks(user.id);
  }
}
