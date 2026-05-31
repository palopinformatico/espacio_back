import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";



export class CreateCostoEnvioDto {
    @IsNumber()
    precio_envio: number;

    @IsString()
    descripcion:string;

    @IsOptional()
    @IsBoolean()
    porDefecto?: boolean;

}
