import { PartialType } from '@nestjs/mapped-types';
import { CreateCostoEnvioDto } from './create-costo_envio.dto';

export class UpdateCostoEnvioDto extends PartialType(CreateCostoEnvioDto) {}
