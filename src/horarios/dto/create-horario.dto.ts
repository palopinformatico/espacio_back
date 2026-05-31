import { IsBoolean, IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateHorarioDto {
  @IsNotEmpty()
  @IsString()
  seccion: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'Hora inválida' })
  hora_inicio: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'Hora inválida' })
  hora_fin: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsIn(['S', 'N'], { message: 'trabaja_domingo debe ser "S" o "N"' })
  trabaja_domingo: string;
}
