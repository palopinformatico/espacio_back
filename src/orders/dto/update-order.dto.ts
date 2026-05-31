import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateOrderDto {

  // ✅ Todo opcional, porque en "pendientes" solo quieres enviar propina
  @IsOptional()
  @IsInt()
  tableNumber?: number;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  // ✅ El backend recalcula total. No lo envías desde Angular.
  @IsOptional()
  @IsInt()
  total?: number;

  @IsOptional()
  @IsInt()
  neto?: number;

  // ✅ Esta es la estrella: propina editable
  @IsOptional()
  @IsString()
  propinaTipo?: '5' | '10' | '12' | 'custom'| 'none';

  @IsOptional()
  @IsNumber()
  propinaValor?: number;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  userId?: number;

  @IsOptional()
  customerId?: number;
}
