import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { Assessment, AssessmentSchema } from './schemas/assessment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Assessment.name, schema: AssessmentSchema }])
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService]
})
export class AssessmentsModule {}
