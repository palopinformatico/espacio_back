import { IsString, IsOptional } from "class-validator";

export class CustomerDto {
  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;


}