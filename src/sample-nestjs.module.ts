import { Module } from '@nestjs/common';
import { SampleNestjsService } from './sample-nestjs.service';
import { SampleNestjsController } from './sample-nestjs.controller';

@Module({
  controllers: [SampleNestjsController],
  providers: [SampleNestjsService],
})
export class SampleNestjsModule {}
