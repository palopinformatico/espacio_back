import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';

@ValidatorConstraint({ name: 'isEmailOrEmpty', async: false })
export class IsEmailOrEmptyConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text || text === '') return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return 'email must be an email';
  }
}

export class CreateProveedorDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    rut?: string;

    @IsString()
    @IsOptional()
    razon_social?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @Validate(IsEmailOrEmptyConstraint)
    @IsOptional()
    @IsString()
    email?: string;
}
