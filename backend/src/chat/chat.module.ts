import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './chat.gateway';
import { LlmService } from './llm.service';
import { AssessmentsModule } from '../assessments/assessments.module';

@Module({
  imports: [HttpModule, forwardRef(() => AssessmentsModule)],
  providers: [ChatGateway, LlmService],
  exports: [LlmService]
})
export class ChatModule {}
