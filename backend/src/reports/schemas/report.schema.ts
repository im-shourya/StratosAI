import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ required: true })
  assessment_id: string; // Links to PG Assessment.id

  @Prop({ required: true })
  executive_summary: string;

  @Prop({ type: [Object], default: [] })
  recommendations: Array<any>;

  @Prop({ type: Object, default: {} })
  roadmap: Record<string, any>;

  @Prop({ type: [String], default: [] })
  risk_mitigations: string[];

  @Prop({ type: Object, default: {} })
  budget_plan: Record<string, any>;

  @Prop()
  llm_model: string;

  @Prop({ default: Date.now })
  generated_at: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
