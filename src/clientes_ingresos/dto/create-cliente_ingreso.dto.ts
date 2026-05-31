import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClienteIngresoDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    rut: string;

    @IsNumber()
    @IsOptional()
    telefono?: number;

    @IsEmail()
    @IsOptional()
    email?: string;
}
