import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMesaDto {
  @IsString()
  @IsNotEmpty()
  numero_mesa: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

