import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true })
  session_id: string;

  @Prop({
    type: [{
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      timestamp: { type: Date, default: Date.now },
    }],
    default: [],
  })
  messages: Array<{ role: string; content: string; timestamp: Date }>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  extracted_data: any;

  @Prop({ required: true, min: 1, max: 5 })
  phase: number;

  @Prop({ default: false })
  complete: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
