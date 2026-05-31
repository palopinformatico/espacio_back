import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsArray, IsString, ValidateNested, IsNumber, isString } from 'class-validator';

class OrderProductDto {
  @IsInt()
  id: number; // id del producto

  @IsInt()
  cantidad: number;
}


export class CreateSOrderDto {
  @IsOptional()
  @IsInt()
  mesaId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @IsOptional()
  @IsInt()
  customerId?: number;

  @IsOptional()
  @IsInt()
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsInt()
  costo_delivery?:number;

  @IsOptional()
  @IsNumber()
  neto?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  detalle_venta?: string;

  @IsOptional()
  newCustomer?: {
    customerName: string;
    customerEmail?: string;
    customerAddress?: string;
    customerPhone?: string;
  };
}

 