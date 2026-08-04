import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;


  @IsOptional()
  price: number;

  @IsOptional()
  cantidad?: number;

  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((v: string) => parseInt(v, 10));
      }
    }
    return value;
  })
  categoryIds: number[];

  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  ofreceLocal?: boolean;

  @IsBoolean()
  @IsOptional()
  ofreceDelivery?: boolean;
}
