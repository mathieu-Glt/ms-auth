import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SampleNestjsService } from './sample-nestjs.service';
import { CreateSampleNestjDto } from 'dto/create-sample-nestj.dto';
import { UpdateSampleNestjDto } from 'dto/update-sample-nestj.dto';

@Controller()
export class SampleNestjsController {
  constructor(private readonly sampleNestjsService: SampleNestjsService) {}

  @MessagePattern('createSampleNestj')
  create(@Payload() createSampleNestjDto: CreateSampleNestjDto) {
    return this.sampleNestjsService.create(createSampleNestjDto);
  }

  @MessagePattern('findAllSampleNestjs')
  findAll() {
    return this.sampleNestjsService.findAll();
  }

  @MessagePattern('findOneSampleNestj')
  findOne(@Payload() id: number) {
    return this.sampleNestjsService.findOne(id);
  }

  @MessagePattern('updateSampleNestj')
  update(@Payload() updateSampleNestjDto: UpdateSampleNestjDto) {
    return this.sampleNestjsService.update(
      updateSampleNestjDto.id,
      updateSampleNestjDto,
    );
  }

  @MessagePattern('removeSampleNestj')
  remove(@Payload() id: number) {
    return this.sampleNestjsService.remove(id);
  }
}
