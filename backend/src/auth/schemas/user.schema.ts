import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  company_name: string;

  @Prop()
  industry: string;

  @Prop()
  valuation: string;

  @Prop()
  country: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
