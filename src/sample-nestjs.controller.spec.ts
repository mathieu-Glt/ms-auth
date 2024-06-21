import { Test, TestingModule } from '@nestjs/testing';
import { SampleNestjsController } from './sample-nestjs.controller';
import { SampleNestjsService } from './sample-nestjs.service';

describe('SampleNestjsController', () => {
  let controller: SampleNestjsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SampleNestjsController],
      providers: [SampleNestjsService],
    }).compile();

    controller = module.get<SampleNestjsController>(SampleNestjsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
