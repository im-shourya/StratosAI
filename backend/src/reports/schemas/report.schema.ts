import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ required: true })
  assessment_id: string;

  @Prop()
  executive_summary: string;

  @Prop([String])
  recommendations: string[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  roadmap: any;

  @Prop([String])
  risk_mitigations: string[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  budget_plan: any;

  @Prop()
  llm_model: string;

  @Prop({ default: Date.now })
  generated_at: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
