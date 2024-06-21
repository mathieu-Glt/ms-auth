import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusUserEnum } from 'src/Enum/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema({ collection: 'users', versionKey: false, timestamps: true })
export class User {
  @Prop({
    required: true,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  @ApiProperty()
  firstname: string;

  @Prop({
    required: true
  })
  @IsString()
  @MaxLength(30)
  @ApiProperty()
  lastname: string;

  
  @Prop({
    required: true
  })
  @IsEmail()
  @ApiProperty()
  email: string;

  
  @Prop({
    required: true
})
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  @ApiProperty()
  password: string;

  @Prop({
    required: true,
    enum: StatusUserEnum,
  })
  @ApiProperty({ enum: StatusUserEnum })
  role: StatusUserEnum;
}

export const UserSchema = SchemaFactory.createForClass(User)

