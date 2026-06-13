import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Vendor extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string; // e.g. 'Customer Support AI', 'Fraud Detection ML'

  @Prop()
  description: string;

  @Prop()
  website_url: string;

  @Prop({ default: 0 })
  lead_count: number;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
