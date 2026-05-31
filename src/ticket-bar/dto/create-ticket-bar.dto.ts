import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTicketBarDto {
    @IsString()
    @IsNotEmpty()
    tipoTicket: string;

    @IsNumber()
    @IsOptional()
    totalTicket?: number;

    @IsNumber()
    @IsOptional()
    propinaBar?: number;

    @IsNumber()
    @IsNotEmpty()
    estadoTicket: number;

    @IsNumber()
    @IsOptional()
    idUser?: number;

    @IsNumber()
    @IsNotEmpty()
    idProduct: number;

    @IsNumber()
    @IsOptional()
    cantidad?: number;
}
