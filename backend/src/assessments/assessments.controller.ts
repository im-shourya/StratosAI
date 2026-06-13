import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';

@Controller('assessments') // global prefix is api
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('start')
  async start(@Body() body: StartAssessmentDto) {
    return this.assessmentsService.startAssessment(body);
  }

  @Post(':id/respond')
  async respond(@Param('id') id: string, @Body('message') message: string) {
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
  async getStatus(@Param('id') id: string) {
    const assessment = await this.assessmentsService.getAssessment(id);
    return { status: assessment.status, phase: assessment.phase };
  }

  @Post(':id/analyze')
  async analyze(@Param('id') id: string) {
    return this.assessmentsService.analyzeAssessment(id);
  }
}
