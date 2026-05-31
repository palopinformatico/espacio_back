import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO ligero para listados de productos
 * Excluye campos pesados como descripciones largas y URLs completas de imágenes
 */
export class LightweightProductDto {
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0, { message: 'El precio no puede ser negativo' })
    price: number;

    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @IsOptional()
    categoryIds?: number[];
}

/**
 * Respuesta paginada para productos ligeros
 */
export class LightweightProductResponse {
    data: LightweightProductDto[];
    total: number;
    currentPage: number;
    totalPages?: number;
    limit?: number;
}
