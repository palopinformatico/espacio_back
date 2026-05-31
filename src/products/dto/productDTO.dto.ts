import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';

export class CategoryDto {
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  icono?: string;
}

export class ProductDto {
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray({ message: 'Las categorías deben enviarse en un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];
}