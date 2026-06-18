import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class ChatMessage {
  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

/**
 * Tracks a single validated ML input field extracted from the chat conversation.
 * Each field maps directly to a feature required by build_inference_row() in the ML pipeline.
 */
export class ValidatedField {
  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  raw_answer: string; // The user's original text that was parsed

  @Prop({ default: false })
  is_valid: boolean;

  @Prop({ default: Date.now })
  extracted_at: Date;
}

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true })
  assessment_id: string; // Links to PostgreSQL Assessment.id

  @Prop({ required: true })
  session_id: string;

  @Prop({ type: Object, default: {} })
  extracted_data: Record<string, any>;

  /**
   * Real-time validated fields extracted from the chat.
   * Keys match the ML model's expected input names:
   *   ai_investment_usd, ai_maturity_score, automation_rate,
   *   ai_adoption_level, employee_training_hrs, num_deployments
   */
  @Prop({ type: Object, default: {} })
  validated_fields: Record<string, ValidatedField>;

  /** Percentage of required ML fields that have been validated (0–100) */
  @Prop({ default: 0 })
  completion_pct: number;

  @Prop({ type: [ChatMessage], default: [] })
  messages: ChatMessage[];

  @Prop({ default: 'PHASE_1' })
  phase: string;

  @Prop({ default: false })
  complete: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
