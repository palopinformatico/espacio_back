import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';


export class OrderProductDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10) || 0)
  id: number; // id del producto

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10) || 1)
  cantidad: number;
}

export class CreateOrderDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10) || 0)
  tableNumber?: number;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsString()
  detalle_venta?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10) || 0)
  propina?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10) || 0)
  neto?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10) || 0)
  mesaId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10) || undefined)
  customerId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}

export class ProductoCantidadDto {
  @IsNumber()
  productId: number;
  @IsNumber()
  cantidad: number;
}
export class AgregarProductosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoCantidadDto)
  productos: ProductoCantidadDto[];
}