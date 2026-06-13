import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './chat.gateway';
import { LlmService } from './llm.service';
import { AssessmentsModule } from '../assessments/assessments.module';

@Module({
  imports: [HttpModule, AssessmentsModule],
  providers: [ChatGateway, LlmService],
  exports: [LlmService]
})
export class ChatModule {}
