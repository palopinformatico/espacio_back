import { Type } from 'class-transformer';

export class KpisClientesResponseDto {
  total: number;
  nuevos: number;
  recurrentes: number;
}

export class NuevosRecurrentesResponseDto {
  nuevos: number;
  recurrentes: number;
}

export class ActividadClientesResponseDto {
  labels: string[];
  nuevos: number[];
  recurrentes: number[];
}

export class TopClienteResponseDto {
  cliente: string;
  gasto: number;
}

export class TopClientePedidosResponseDto {
  cliente: string;
  pedidos: number;
}

export class FrecuenciaClientesResponseDto {
  ticketPromedio: number;
  frecuenciaPorNumPedidos: {
    numPedidos: number;
    clientes: number;
  }[];
}
