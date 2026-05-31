import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteIngresoDto } from './create-cliente_ingreso.dto';

export class UpdateClienteIngresoDto extends PartialType(CreateClienteIngresoDto) { }
