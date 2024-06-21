import { Document, Types } from "mongoose";
import { StatusUserEnum } from "src/Enum/user.enum";
import { User } from "src/Schema/user.schema";
import { getTokenInterface } from "./signIn.interface";


export interface UserIdInterface {
  _id?: Types.ObjectId | string | number,
  firstname?: string,
  lastname?: string,
  email?: string,
  password?: string,
  role?: StatusUserEnum
  id: Types.ObjectId | string
}

export type userIdInterface = Pick<UserIdInterface, '_id'>;
export type userIdRoleInterface = Pick<
  UserIdInterface,
  '_id' | 'role' | 'id' | 'firstname' | 'lastname' | 'email' | 'password'
>;

export type userPayloadPutInterface = Omit<UserIdInterface, '_id'>;

export type userInterfacePick = Pick<
  UserIdInterface,
  'firstname' | 'lastname' | 'email' | 'password'
>;

export type userInterfaceOmit = Omit<
  UserIdInterface,
  'firstname' | 'lastname' | 'email' | 'password' | 'role'
>;

export type userInterfaceEmail = Omit<
  UserIdInterface,
'firstname' | 'lastname' | '_id' | 'password' | 'role'
>;

export interface loginResponseInterface {
  user: UserIdInterface;
  tokens: getTokenInterface;
}