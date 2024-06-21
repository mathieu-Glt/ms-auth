import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { refreshTokenUser } from './interface/refreshTokenUser.interface';
import { getTokenInterface } from './interface/signIn.interface';
import { UserIdInterface, userIdInterface, userIdRoleInterface, userPayloadPutInterface } from './interface/userId.interface'
import { changePassUser } from './interface/changePassword.interface';
import { userInterfaceEmail } from './interface/userId.interface';
import {
  RegisterInterface,
  loginInterface,
} from './interface/loginAndRegister.interface';
import {
  responseSucessInterface,
  responseErrorInterface,
} from './interface/responseTokens.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('REGISTER')
  async createUser(
    @Payload() payload: RegisterInterface,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    console.log("🚀 ~ AppController ~ createUser ~ payload.body:", payload)
    try {
      const user = await this.appService.createUser(payload)
      console.log("🚀 ~ AppController ~ createUser ~ user:", user)
      return {
        status: 201,
        error: false,
        message: 'User has been created',
        results: user,
      };

    } catch (error) {
      console.log("🚀 ~ AppController ~ createUser ~ error:", error)
            return { status: 500, error: true, message: error };

    }
  }

  @MessagePattern('LOGIN')
  async signIn(
    @Payload() payload: loginInterface,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    console.log('🚀 ~ AppController ~ signIn ~ payload.body:', payload);

    try {
      const loginUser = await this.appService.login(payload);
      console.log('loginUser', loginUser);
      return {
        status: 200,
        error: false,
        message: 'Users found',
        results: loginUser,
      };
    } catch (error) {
      console.log('🚀 ~ AppController ~ signIn ~ error:', error);
      return { status: 500, error: true, message: error };
    }
  }

  @MessagePattern('FORGOT_PASSWORD')
  async forgotPassword(
    @Payload('email') email: string,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    console.log('FORGOT_PASSWORD');

    console.log('🚀 ~ AppController ~ forgotPassword ~ payload.body:', email);

    try {
      const forgotPassUser = await this.appService.sendEmailForgotPassword(
        email
      );
      return {
        status: 200,
        error: false,
        message: 'Token link created',
        results: forgotPassUser
      };
    } catch (error) {
      console.log('🚀 ~ AppController ~ createUser ~ error:', error);
      return { status: 500, error: true, message: error };
    }
  }
 
  @MessagePattern('REFRESHTOKEN')
  async refreshToken(
    @Payload() user: refreshTokenUser,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    try {
      console.log('====================================');
      console.log('REFRESHTOKEN');
      console.log('====================================');
      console.log('====================================');
      console.log(user);
      console.log('====================================');
      const refreshTokens = await this.appService.refreshTokens(user.sub)
      console.log('refreshTokens ~ app.controller - refreshTokens ', refreshTokens);

      return {
        status: 200,
        error: false,
        message: 'Tokens has been updated',
        results: refreshTokens,
      };

    } catch (error) {
      console.log('🚀 ~ AppController ~ refresh_token ~ error:', error);
      return { status: 500, error: true, message: error };

    }
  }

  @MessagePattern('CHANGE_PASSWORD')
  async changePassword(
    @Payload() body: changePassUser,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    console.log('CHANGE_PASSWORD');

    console.log('🚀 ~ AppController ~ changePassword ~ payload.body:', body);
    console.log('🚀 ~ AppController ~ changePassword ~ payload.body:', body.tokenUuid.uuid);

    try {

      if(body.body.password === body.body.confirmPassword) {
        const changePassUser = await this.appService.changePassUser(
          body.tokenUuid.uuid,
        );
        // console.log('🚀 ~ AppController ~ changePassword ~ changePassUser:', changePassUser);

        const user = await this.appService.getUserByEmail(changePassUser.email)
        console.log('🚀 ~ AppController ~ changePassword ~ changePassUser:', user);

        // const existsUser = await this.appService.hasUserById(user._id.toString())
        const existsUser = await this.appService.hasUserByEmail(user.email)
        console.log('🚀 ~ AppController ~ changePassword ~ existsUser:', existsUser);

        const changePasswordUser = await this.appService.createNewPassword(
          user._id,
          body.body.password,
        )

        return {
          status: 200,
          error: false,
          message: 'password has been updated ',
          results: changePasswordUser
        };
  

      } else {
        console.log('pass do not match !');
        
      }


    } catch (error) {
      console.log('🚀 ~ AppController ~ createUser ~ error:', error);
      return { status: 500, error: true, message: error };
    }
  }

  @MessagePattern('GET_USERS')
  async findAllUsers() {
    try {
      const users = await this.appService.getUsers();
      console.log("🚀 ~ AppController ~ findAllUsers ~ users:", users)
      return {
        status: 200,
        error: false,
        message: 'Users found',
        results: users,
      };

  
    } catch (error) {
      console.log("🚀 ~ AppController ~ findAllUsers ~ error:", error)
      return { status: 500, error: true, message: error };

    }
  }
  @MessagePattern('PUT_USER_BY_ID')
  async putUserById(
    @Payload() payload: userPayloadPutInterface,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    console.log('PUT_USER_BY_ID');
    
    console.log("🚀 ~ AppController ~ putUserById ~ payload:", payload)

    const user = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    }

    try {
      const userUpdate = await this.appService.updateUser(payload.id, user);
        console.log("🚀 ~ UserController ~ userUpdate:", userUpdate)

        return {
          status: 200,
          error: false,
          message: 'User updated',
          results: userUpdate,
        };


    } catch (error) {
      console.log("🚀 ~ AppController ~ putUserById ~ error:", error)
      return { status: 500, error: true, message: error };

    }
  }

  @MessagePattern('PATCH_USER_BY_ID')
  async patchUserById(
    @Payload() payload: userIdRoleInterface,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    try {
      console.log('PATCH_USER_BY_ID');
    
      console.log("🚀 ~ AppController ~ patchUserById ~ payload:", payload)
      if (payload.role) {
        console.log('payload.role !');
        const user = await this.appService.patchUser(payload);
        return {
          status: 200,
          error: false,
          message: 'User updated',
          results: user,
        };

      } else if (payload.firstname) {
        console.log('payload.firstname !');
      } else if (payload.lastname) {
        console.log('payload.lastname !');
      } else if (payload.email) {
        console.log('payload.email !');
      } else if (payload.password) {
        console.log('payload.password !');
      } else {
        console.log('pas de payload correspondant !');
      }
    } catch (error) {
      console.log("🚀 ~ AppController ~ putUserById ~ error:", error)
      return { status: 500, error: true, message: error };

    }
  }

  @MessagePattern('GET_USER_BY_ID_ROLE')
  async findOneUserRole(
    @Payload() payload: userIdInterface,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    console.log('🚀 ~ AppController ~ findOneUserRole ~ payload:', payload);
    // console.log("🚀 ~ AppController ~ findOneUser ~ payload:", payload.params.id)
    try {

      // const user = await this.appService.getUserById(payload.body);
      const user = await this.appService.getUserById(payload);
      console.log("🚀 ~ AppController ~ findOneUserRole ~ user:", user)


      return {
          status: 200,
          error: false,
          message: 'User found',
          results: user,
        };
  
  
  

    } catch (error) {
      console.log("🚀 ~ AppController ~ findOneUserRole ~ error:", error)
      return { status: 500, error: true, message: error };

    }
  }


  @MessagePattern('GET_USER_BY_ID')
  async findOneUser(
    @Payload() payload: userIdInterface,
  ): Promise<responseSucessInterface | responseErrorInterface> {
    console.log('🚀 ~ AppController ~ findOneUser ~ payload:', payload);
    // console.log("🚀 ~ AppController ~ findOneUser ~ payload:", payload.params.id)
    try {

      // const user = await this.appService.getUserById(payload.body);
        const user = await this.appService.getUserById(payload.id);
        console.log("🚀 ~ AppController ~ findOneUser ~ user:", user)

        return {
          status: 200,
          error: false,
          message: 'User found',
          results: user,
        };
  
  
  

    } catch (error) {
      console.log("🚀 ~ AppController ~ findAllUsers ~ error:", error)
      return { status: 500, error: true, message: error };

    }
  }


  @MessagePattern('DELETE_USER')
  async remove(
    @Payload() id: number,
  ): Promise<responseSucessInterface | responseErrorInterface> 
    {
    try {
      const userDelete = await this.appService.deleteUser(id)
      return {
        status: 200,
        error: false,
        message: `User ${userDelete.firstname} ${userDelete.lastname} deleted`,
        results: userDelete,
      };
    } catch (error) {
      console.log("🚀 ~ AppController ~ createUser ~ error:", error)
      return { status: 500, error: true, message: error };

    }
    // return this.movieService.remove(id);
  }
}


