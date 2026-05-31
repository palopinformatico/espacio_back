import { Type } from 'class-transformer';

export class KpisFinanzasResponseDto {
  ingresos: number;
  egresos: number;
  propinas: number;
  balance: number;
  porCobrar: number;
}

export class BalanceDiasResponseDto {
  labels: string[];
  ingresos: number[];
  egresos: number[];
  propinas: number[];
  balance: number[];
}

export class EvolucionResponseDto {
  labels: string[];
  balance: number[];
  porCobrar: number[];
}

export class TopDiasResponseDto {
  dia: string;
  recaudacion: number;
}

export class DistribucionResponseDto {
  ingresos: number;
  propinas: number;
}
