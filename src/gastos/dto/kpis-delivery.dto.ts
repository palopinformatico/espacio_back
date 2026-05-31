import { Type } from 'class-transformer';

export class KpisDeliveryResponseDto {
  pedidos: number;
  pagados: number;
  pendientes: number;
  tiempoPromedio: number;
  puntualidad: number;
  recaudado: number;
}

export class TopBarrioResponseDto {
  barrio: string;
  pedidos: number;
}
