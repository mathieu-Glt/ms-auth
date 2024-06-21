import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { connect, JSONCodec, NatsConnection } from 'nats'; 
import { firstValueFrom } from 'rxjs';
// import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { userInterfaceEmail } from '../../interface/userId.interface';

export default class NatsService {

  constructor(
    @Inject('NATS_SERVICE')
    private readonly nats: ClientProxy,
  ) {}
  // async send(command: string, data: any): Promise<any> {
  //   try {
  //     const connection = await this.__startServiceNats();
  //     const payload = this.setPayload(data);
  //     console.log("🚀 ~ NatsService ~ send ~ payload:", payload)
  //     const message = await connection.request(
  //       command,
  //       JSONCodec().encode(payload),
  //     );
  //     const response: any = JSONCodec().decode(message.data);
  //     return response;
  //   } catch (error) {
  //           console.error('Error in NATS request:', error);
  //           // return  error.message
  //       }
  //   }

  async send(cmd: string, payload: any): Promise<any> {
    try {
      console.log('send', cmd, payload);
      return await firstValueFrom(this.nats.send(cmd, payload));
    } catch (error) {
      console.log('error', error);
    }
  }

    async emit(command: string, data: any): Promise<void> {
      try {
        const connection = await this.__startServiceNats();
        const payload = this.setPayload(data);
        console.log('COMMAND' , command);
        console.log('DATA' , data);
        
        console.log("🚀 ~ NatsService ~ send ~ payload:", payload)

        // Publier le message sans attendre de réponse
        connection.publish(
          command,
          JSONCodec().encode(payload)
        );
    
        // Optionnel : fermer la connexion si vous le souhaitez après l'envoi
        // await connection.close();
      } catch (error) {
        console.error('Error in NATS publish:', error.message);
      }
    }

    async emitEmailForgotPassword(email: string, newLinkToken: string): Promise<string> {
      console.log('emitEmailForgotPassword');
      console.log('emitEmailForgotPassword - email : ', email);
      console.log('emitEmailForgotPassword - newLinkToken : ', newLinkToken);
      const datas = { email: email, url: newLinkToken}

      try {
        const res = await this.send('SEND_EMAIL_FORGOT_PASSWORD', datas);
        console.log('====================================');
        console.log('res ~ emitEmailForgotPassword', res );
        console.log('====================================');

        return res;
    
      } catch (error) {
        console.log('====================================');
        console.log(error.message);
        console.log('====================================');
      }
      
    }


    setPayload(data: any) {
        return {
          id: uuidv4(),
          body: data,
        };
      }


    private async __startServiceNats(): Promise<NatsConnection> {
        try {
            return await connect({
        servers: [`nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`],
            });
        } catch (error: any) {
            console.log("🚀 ~ NatsService ~ __startServiceNats ~ error:", error)
            throw new Error(`MESSAGING-ERROR: ${error.message}`);
            
        }
    }
}

