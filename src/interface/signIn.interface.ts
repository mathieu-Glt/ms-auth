import { User, UserDocument } from '../Schema/user.schema';
import { userInterfaceEmail } from './userId.interface';

export interface getTokenInterface {
  accessToken: string;
  refreshToken: string;
}

export interface signInResponseInterface {
  user: UserDocument;
  tokens: getTokenInterface;
}

export class signInInterface {
  email: userInterfaceEmail;
  password: string;
}
