import { IsOptional, IsString } from 'class-validator';

export class UpdateMesaDto {
  @IsOptional()
  @IsString()
  numero_mesa?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

