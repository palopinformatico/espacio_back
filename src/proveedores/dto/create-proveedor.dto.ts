import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProveedorDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    rut: string;

    @IsString()
    @IsOptional()
    razon_social?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}
