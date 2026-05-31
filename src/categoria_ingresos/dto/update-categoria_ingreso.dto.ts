import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaIngresoDto } from './create-categoria_ingreso.dto';

export class UpdateCategoriaIngresoDto extends PartialType(CreateCategoriaIngresoDto) { }
