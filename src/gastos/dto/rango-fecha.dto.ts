import { IsDateString, IsOptional, IsInt, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RangoFechaDto {
  @IsDateString()
  @IsOptional()
  start?: string;

  @IsDateString()
  @IsOptional()
  end?: string;

  @IsOptional()
  limit?: number;
}
