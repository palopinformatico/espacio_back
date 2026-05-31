import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaGastoDto } from './create-categoria-gasto.dto';

export class UpdateCategoriaGastoDto extends PartialType(CreateCategoriaGastoDto) {}
