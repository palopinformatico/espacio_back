import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoriaGastoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  nombre: string;
}
