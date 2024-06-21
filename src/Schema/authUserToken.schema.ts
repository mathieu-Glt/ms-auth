import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsMongoId, IsString } from "class-validator";
import { Document } from "mongoose";

export type AuthUserTokenDocument = AuthUserToken & Document
@Schema({
  collection: 'authUserToken',
  timestamps: true,
  versionKey: false,
  expires: '7d',
})
export class AuthUserToken {
    @Prop()
    @IsString()
    email: string

    @Prop()
    @IsString()
    token?: string

    @Prop()
    @IsString()
    @IsMongoId()
    user_id?: string


}

export const AuthUserTokenSchema = SchemaFactory.createForClass(AuthUserToken)

