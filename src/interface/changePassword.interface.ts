import { passwords } from './passwords.interface';
import { uuidInterface } from './uuid.interface';

export interface changePassUser {
  tokenUuid: uuidInterface;
  body: passwords;
  }