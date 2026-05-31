import { PartialType } from '@nestjs/mapped-types';
import { CreateIngresoDto } from './create-ingreso.dto';

export class UpdateIngresoDto extends PartialType(CreateIngresoDto) { }
