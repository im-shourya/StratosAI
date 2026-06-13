import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('start')
  async startAssessment(@Request() req, @Body() body: { industry?: string; company_name?: string }) {
    // req.user is populated by the JwtStrategy
    const userId = req.user.userId;
    
    return this.assessmentsService.startAssessment({
      user_id: userId,
      industry: body.industry,
      company_name: body.company_name
    });
  }
}
