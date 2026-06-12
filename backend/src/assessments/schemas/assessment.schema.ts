import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class ChatMessage {
  @Prop({ required: true })
  role: string; // 'user' | 'assistant' | 'system'

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Assessment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, default: 'IN_PROGRESS' })
  status: string; // 'IN_PROGRESS' | 'COMPLETED'

  @Prop({ type: Object, default: {} })
  extracted_data: Record<string, any>;

  @Prop({ type: [ChatMessage], default: [] })
  chat_history: ChatMessage[];

  @Prop({ type: Object, default: {} })
  ml_results: Record<string, any>;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
