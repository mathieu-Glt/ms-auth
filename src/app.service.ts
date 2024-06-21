import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './Schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StatusUserEnum } from './Enum/user.enum';
import bcrypt = require('bcrypt');
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import {
  getTokenInterface,
  signInInterface,
} from './interface/signIn.interface';
import NatsService from './libs/nats';
import { uuid } from 'uuidv4';
import {
  AuthUserToken,
  AuthUserTokenDocument,
} from './Schema/authUserToken.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './Schema/refreshToken.schema';
import { ObjectId } from 'mongoose';
import { userIdInterface, userIdRoleInterface, userInterfaceOmit } from './interface/userId.interface';
import { userInterfaceEmail } from './interface/userId.interface'; 
import {
  RegisterInterface,
  loginInterface,
} from './interface/loginAndRegister.interface';
import { loginResponseInterface } from './interface/userId.interface';
@Injectable()
export class AppService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(AuthUserToken.name)
    private readonly authUserTokenModel: Model<AuthUserTokenDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private readonly natsMessengerService: NatsService,
  ){}

  async signIn(data: any): Promise<any>
  {
    try {
      const userExists = await this.getUserByEmail(data.email);
      console.log('user exists', userExists);

      if (!(await bcrypt.compare(data.password, userExists.password)))
        throw new Error('Password is incorrect');

      userExists.password = ' ';

    } catch (error) {
      console.log("🚀 ~ AppService ~ createUser ~ error:", error)
      throw new Error(error.message);

    }
  }
// for the Local strategy authguards
  async validateUser(email: string, password: string) {
    try {
      const user = await this.getUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, email } = user;
        return user;
      }
      return null;
    } catch (error) {
      console.log("🚀 ~ AppService ~ createUser ~ error:", error) 
      throw new Error(error.message);

    }
  }

  async createUser(data: RegisterInterface): Promise<User> 
  {
    console.log("data", data);
    try {
      const userExists = await this.getUserByEmail(data.email);
      console.log('user exists', userExists);

      if (!userExists) {
        console.log('it not existing !');
        const userHashPassword = await this.hashPassword(data.password)
        console.log('userHashPassword', userHashPassword);

        const user = {
          ...data,
          password: await this.hashPassword(data.password),
          // password: userHashPassword,
        };

        console.log('user', user);
        const userCreate = await this.userModel.create(user);

        return userCreate;
      } else {
        throw new Error('User already exists');
      }
      

    } catch (error) {
      console.log("🚀 ~ AppService ~ createUser ~ error:", error)
      throw new Error(error.message);
      
      
    }
  }
  async refreshTokens(userId: string): Promise<getTokenInterface> {
    console.log('====================================');
    console.log('refreshTokens ~ app.service', userId);
    console.log('====================================');
    try {
      const user = await this.userModel.findById(userId)
      console.log('refreshTokens ~ app.service - user ', user);

      const getTokensUser = await this.getTokens(user)
      console.log('refreshTokens ~ app.service - getTokensUser ', getTokensUser);
      const refreshToken = getTokensUser.refreshToken;
      console.log('refreshTokens ~ app.service - refreshToken ', refreshToken);

      try {
        const createdToken = await this.refreshTokenModel.create({
          refreshToken,
        });
        console.log('refreshTokens ~ app.service- createdToken', createdToken);

      } catch (error) {
        console.log('refreshTokens ~ app.service', error.message);

      }
      
  return getTokensUser;
    } catch (error) {
      console.log("🚀 ~ AppService ~ createUser ~ error:", error)
      throw new Error(error.message);

    }
  }

  async login(data: loginInterface): Promise<loginResponseInterface | Error>
  {
    try {
      // TODO continuer la partie login
      const user = await this.getUserByEmail(data.email)
      if (user) {
        if (!(await bcrypt.compare(data.password, user.password)))
          throw new BadRequestException('Password incorrect');
        // delete user.password;
        user.password = "";
        return {
          user,
          tokens: await this.__handlerToken(user)
        };
      }

    } catch (error) {
      console.log("🚀 ~ AppService ~ createUser ~ error:", error)
      throw new Error(error.message);

    }
  }


  async getUsers(): Promise<User[]> 
  {
    try {
      const users = await this.userModel.find()
      console.log("🚀 ~ AppService ~ getUsers ~ users:", users)
      return users;
    } catch (error) {
      console.log("🚀 ~ AppService ~ getUsers ~ error:", error)
      throw new Error(error.message);

    }
  }

  async updateUser(id: string, body: User): Promise<User> {
    console.log('🚀 ~ UserService ~ updateUser ~ id:', id);
    console.log('🚀 ~ UserService ~ updateUser ~ body:', body);
    try {

      const userExists = await this.userModel.findById(id);
        console.log('🚀 ~ AppService ~ updateUser ~ userExists:', userExists);
      if (userExists) {
        const updateUser = await this.userModel.findByIdAndUpdate(
          id,
          body,
          { new: true }
        )
        return updateUser;
        } else {
            throw new Error("User not found")
        }
    } catch (error) {
        console.log("🚀 ~ updateUser ~ error:", error)
      throw new Error(error);
    }

}

  async patchUser(data: userIdRoleInterface): Promise<User> {
    console.log('🚀 ~ UserService ~ patchUser ~ id:', data.id);
    console.log('🚀 ~ UserService ~ patchUser ~ body:', data.role);

    try {
      const userExists = await this.userModel.findById(data.id);
      console.log('🚀 ~ AppService ~ updateUser ~ userExists:', userExists);
    const updateUser = {
        firstname: userExists.firstname,
        lastname: userExists.lastname,
        email: userExists.email,
        password: userExists.password,
        role: data.role,
    }
    console.log('🚀 ~ AppService ~ updateUser ~ updateUser:', updateUser);

      if (userExists) {
        console.log('its exists !');

        const user = await this.userModel.findOneAndUpdate(
          { _id: data.id },
          updateUser,
          { new: true },
        );
        return user;
      } else {
        throw new Error('User not found');
  }
    } catch (error) {
      console.log('🚀 ~ updateUser ~ error:', error);
      throw new Error(error);

  }
}

  async getUserById(id: userIdInterface): Promise<User> {
    console.log("🚀 ~ AppService ~ getUserById ~ id:", id)
    try {
      const user = await this.userModel.findById(id)
      console.log('🚀 ~ AppService ~ getUserById ~ user:', user);
      return user;
    } catch (error) {
      console.log("🚀 ~ AppService ~ getUserById ~ error:", error)
      throw new Error(error.message);

    }
   
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }).lean();
      console.log('user :', user);
      return user
    } catch (error) {
      console.log("🚀 ~ AppService ~ getUserById ~ error:", error)
      throw new Error(error.message);

    }
  }

    //VERIFIE SI L UTILISATEUR EXISTE PAR SON ID 
  // @review => ok
  async hasUserById(id: userInterfaceOmit): Promise<boolean | string>{
    try {
      const userExists =
        (await this.userModel.countDocuments({ _id: id })) >= 1 ? true : false;
      
     if (userExists) {
        return userExists;

     } else {

       throw new BadRequestException('User not found')
     }
      
    } catch (error) {
      throw new NotFoundException(error)
    }
  } 
  
  //VERIFIE SI L UTILISATEUR EXISTE PAR SON ID 
  // @review => ok
  async hasUserByEmail(email: string): Promise<boolean | string>{
    try {
      const userExists =
        (await this.userModel.countDocuments({ email: email })) >= 1
          ? true
          : false;
      
     if (userExists) {
        return userExists;

     } else {

       throw new BadRequestException('User not found')
     }
      
    } catch (error) {
      throw new NotFoundException(error)
    }
  }

    // function nouveau pass & confirm nouveau pass
    async createNewPassword(userId: userInterfaceOmit, newPassword: string): Promise<any> {
    console.log("userId", userId);

      try {
      const hashedPassword: any = await this.hashPassword(newPassword);
        console.log("hashedPassword => ", hashedPassword);

        const userUpdatePass = await this.userModel.findByIdAndUpdate(
          {_id: userId},
          {password: hashedPassword},
        )

        console.log("userUpdatePass : ", userUpdatePass);

        return userUpdatePass

        
  
        // return hashedPassword;
      } catch (error) {
        throw new NotFoundException(error)
      }
    }
  

  async hashPassword(pass: string): Promise<any>
  {
    try {
      const salt: string = await bcrypt.genSalt(10);
      const hashPass: string = await bcrypt.hash(pass, salt);

      return hashPass;
  
    } catch (error) {
      console.log('🚀 ~ AppService ~ getUsers ~ error:', error);
      throw new Error(error.message);

    }
  }
  // recept an id and an email from user
  async getTokens(user: UserDocument): Promise<getTokenInterface> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET')!;
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    const userCheck = {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
   }
    console.log('userCheck', userCheck);
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets are not defined');
    }
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userCheck.id,
          email: userCheck.email,
          firstname: userCheck.firstname,
          lastname: userCheck.lastname,
          role: userCheck.role,
        },
        {
          secret: jwtSecret,
          expiresIn: '2h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userCheck.id,
          email: userCheck.email,
          firstname: userCheck.firstname,
          lastname: userCheck.lastname,
          role: userCheck.role,
        },
        {
          secret: jwtRefreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    }
  }

  async changePassUser(token: string): Promise<any> {
    console.log('====================================');
    console.log("id,", token);
    console.log('====================================');
    try {
      const getEmailUserForgotPass = await this.authUserTokenModel.findOne({ token });

      console.log('====================================');
      console.log("getEmailUserForgotPass,", getEmailUserForgotPass);
      console.log('====================================');

      return getEmailUserForgotPass
  
    } catch (error) {
      console.log('🚀 ~ AppService ~ getUsers ~ error:', error);
      throw new Error(error.message);

    }
  }

  async sendEmailForgotPassword(email: string): Promise<string> {
    console.log("email - sendEmailForgotPassword", email);
    
    console.log('sendEmailForgotPassword');
    
    try {
      const newToken = await this.createLinkTokenForgotPassword(email)
      return await this.natsMessengerService.emitEmailForgotPassword(
        email,
        newToken,
      );


    } catch (error) {
      console.log('🚀 ~ AppService ~ getUsers ~ error:', error);
      throw new Error(error.message);

    }
  }

  async createLinkTokenForgotPassword(email: string): Promise<any> {
    try {
      const newAuthToken = await this.createAuthToken(email);
      return `${process.env.PREFIX_URI}/auth/new-password/${newAuthToken.token}`
    } catch (error) {
      console.log('🚀 ~ AppService ~ getUsers ~ error:', error);
      throw new Error(error.message);

    }
  }

  async __handlerToken(user: any): Promise<any> {
    try {
      console.log('user - __handlerToken', user);

      const tokens = await this.getTokens(user)
      // console.log('tokens - __handlerToken', tokens);

      return tokens;

    } catch (error) {
      console.log('🚀 ~ AppService ~ getUsers ~ error:', error);
      throw new Error(error.message);

    }
  }

  async createAuthToken(email: string): Promise<any> {
    try {
      const user = await this.getUserByEmail(email);
      console.log("user", user);
      const userLink = {
        email: user.email,
        token: uuid(),
        // user_id: user.id
      }
      console.log("userLink", userLink);
      return await this.authUserTokenModel.create(userLink)

    } catch (error) {
      console.log('🚀 ~ AppService ~ getUsers ~ error:', error);
      throw new Error(error.message);

    }
  }

  async deleteUser(id: number): Promise<User> {
    try {
      const userDelete = await this.userModel.findByIdAndDelete(id)
      return userDelete;
    } catch (error) {
      console.log("🚀 ~ AppService ~ deleteUser ~ error:", error)
      throw new Error(error.message);

    }
  }

}
