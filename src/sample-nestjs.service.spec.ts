import { Test, TestingModule } from '@nestjs/testing';
import { SampleNestjsService } from './sample-nestjs.service';

describe('SampleNestjsService', () => {
  let service: SampleNestjsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SampleNestjsService],
    }).compile();

    service = module.get<SampleNestjsService>(SampleNestjsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
