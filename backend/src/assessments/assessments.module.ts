import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AnalysisProcessor } from './analysis.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MlIntegrationModule } from '../ml-integration/ml-integration.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    ConversationsModule,
    MlIntegrationModule,
    ChatModule,
    BullModule.registerQueue({
      name: 'analysisQueue',
    })
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AnalysisProcessor],
  exports: [AssessmentsService]
})
export class AssessmentsModule {}
