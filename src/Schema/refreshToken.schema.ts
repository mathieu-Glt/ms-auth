import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString } from 'class-validator';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document

@Schema({
  collection: 'refreshToken',
  timestamps: true,
  versionKey: false,
  expires: '7d',
})
export class RefreshToken {
  @Prop({ required: true }) // Exemple : spécification de required: true
  @IsString()
  refreshToken: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
