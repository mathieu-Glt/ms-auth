import { Date, Types } from "mongoose";

export interface User {
  _id: string | Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}