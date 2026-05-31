import { PartialType } from '@nestjs/mapped-types';
import { CreateEtaDto } from './create-eta.dto';

export class UpdateEtaDto extends PartialType(CreateEtaDto) {}
