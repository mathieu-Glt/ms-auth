import { PartialType } from '@nestjs/mapped-types';
import { CreateSampleNestjDto } from './create-sample-nestj.dto';

export class UpdateSampleNestjDto extends PartialType(CreateSampleNestjDto) {
  id: number;
}
