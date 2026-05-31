import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentoIngresoDto {
    @IsString()
    @IsNotEmpty()
    tipo_documento: string;

    @IsInt()
    @IsNotEmpty()
    num_documento: number;

    @IsInt()
    @IsOptional()
    ingresoId?: number;
}
