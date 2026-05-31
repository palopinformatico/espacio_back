import { IsInt, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    nombre:string;

    @IsString()
    icono: string;
}
