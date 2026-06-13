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

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true })
  assessment_id: string; // Links to PostgreSQL Assessment.id

  @Prop({ required: true })
  session_id: string;

  @Prop({ type: Object, default: {} })
  extracted_data: Record<string, any>;

  @Prop({ type: [ChatMessage], default: [] })
  messages: ChatMessage[];

  @Prop({ default: 'PHASE_1' })
  phase: string;

  @Prop({ default: false })
  complete: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
