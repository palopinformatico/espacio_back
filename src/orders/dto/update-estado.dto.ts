import { IsEnum, IsNotEmpty } from 'class-validator';

export enum EstadoOrden {
  PAGADO = 'pagado',
  PENDIENTE = 'pendiente',
}

export class UpdateEstadoDto {
  @IsNotEmpty()
  @IsEnum(EstadoOrden, {
    message: 'El estado debe ser "pagado" o "pendiente"',
  })
  estado: EstadoOrden;
}
