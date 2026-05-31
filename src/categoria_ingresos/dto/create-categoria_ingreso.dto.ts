import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriaIngresoDto {
    @IsString()
    @IsNotEmpty()
    nombre_cat: string;
}
