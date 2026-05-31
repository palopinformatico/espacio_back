import { IsString } from "class-validator";

export class AuthCredentialsDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}
