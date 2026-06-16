import { Controller, Post, Get, Body, Param, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('assessments') // global prefix is api
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  async getAll(@CurrentUser() user: any) {
    return this.assessmentsService.getAllAssessments(user.id);
  }

  @Get('search')
  async search(@Query('q') query: string, @CurrentUser() user: any) {
    return this.assessmentsService.searchGlobal(user.id, query);
  }

  @Post('start')
  async start(@Body() body: StartAssessmentDto, @CurrentUser() user: any) {
    return this.assessmentsService.startAssessment({ ...body, user_id: user.id });
  }

  @Post(':id/respond')
  async respond(@Param('id', ParseUUIDPipe) id: string, @Body('message') message: string) {
    // 1. Add user message
    await this.assessmentsService.addMessage(id, {
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // 2. To get the next message, we would ideally use ChatGateway/LlmService
    // For this simple REST endpoint, we could trigger LlmService directly
    // but the websocket is the preferred way for interaction.
    // For now, return a success status so the client knows it can poll or wait for WS.
    return { status: 'Message received' };
  }

  @Get(':id/status')
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    const assessment = await this.assessmentsService.getAssessment(id);
    return { status: assessment.status, phase: assessment.phase };
  }

  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessmentsService.getAssessment(id);
  }

  @Post(':id/analyze')
  async analyze(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.assessmentsService.analyzeAssessment(id, user.id);
  }
}
