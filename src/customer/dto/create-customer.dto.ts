import { IsString } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsString()
  customerEmail: string;

  @IsString()
  customerAddress: string;
}
