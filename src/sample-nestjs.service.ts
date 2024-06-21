import { Injectable } from '@nestjs/common';
import { CreateSampleNestjDto } from 'dto/create-sample-nestj.dto';
import { UpdateSampleNestjDto } from 'dto/update-sample-nestj.dto';

@Injectable()
export class SampleNestjsService {
  create(createSampleNestjDto: CreateSampleNestjDto) {
    return 'This action adds a new sampleNestj';
  }

  findAll() {
    return `This action returns all sampleNestjs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sampleNestj`;
  }

  update(id: number, updateSampleNestjDto: UpdateSampleNestjDto) {
    return `This action updates a #${id} sampleNestj`;
  }

  remove(id: number) {
    return `This action removes a #${id} sampleNestj`;
  }
}
