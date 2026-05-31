import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGastoDto {

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  concepto?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Validamos que solo acepte valores permitidos
  @IsEnum(['ingreso', 'egreso'], { message: 'El tipo debe ser ingreso o egreso' })
  type: 'ingreso' | 'egreso';

  @IsEnum(['efectivo', 'tarjeta', 'transferencia', 'cheque'])
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';

  // --- RELACIONES (Aquí es donde solucionamos el error) ---

  // Recibimos el ID numérico desde Angular, no el objeto entero
  @IsNumber()
  proveedorId: number;

  @IsNumber()
  categoriaId: number;

  // --- FECHAS ---

  // Type transforma el string '2023-01-01' que envía Angular en un objeto Date real
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsEnum(['ninguno', 'diario', 'semanal', 'mensual'])
  @IsOptional()
  frequency?: 'ninguno' | 'diario' | 'semanal' | 'mensual';

  @IsEnum(['activo', 'cancelado', 'anulado'])
  @IsOptional()
  estado?: 'activo' | 'cancelado' | 'anulado';
}