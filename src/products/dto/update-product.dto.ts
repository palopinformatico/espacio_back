import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  cantidad?: number;

 @IsOptional()
  @IsArray({ message: 'categories must be an array' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Cada categoría debe ser un número' })
  categories?: number[];

  @IsOptional()
  @IsBoolean()
  ofreceLocal?: boolean;

  @IsOptional()
  @IsBoolean()
  ofreceDelivery?: boolean;
}

