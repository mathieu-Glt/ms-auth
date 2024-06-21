import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import 'dotenv/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './Schema/user.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  AuthUserToken,
  AuthUserTokenSchema,
} from './Schema/authUserToken.schema';
import { RefreshToken, RefreshTokenSchema } from './Schema/refreshToken.schema';
import NatsService from './libs/nats';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          // servers: ['nats://localhost:4222'],
          servers: [
            'nats://' + process.env.NATS_DNS + ':' + process.env.NATS_PORT,
          ],
        },
      },
    ]),
    MongooseModule.forRoot(process.env.MONGO_DB, { dbName: 'cpa42' }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuthUserToken.name, schema: AuthUserTokenSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    AuthUserToken,
    RefreshToken,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  exports: [MongooseModule],
  controllers: [AppController],
  providers: [AppService, JwtService, NatsService],
})
export class AppModule {}
