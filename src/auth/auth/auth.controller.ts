import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from '../dto/AuthCredentialsDto.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() dto: AuthCredentialsDto) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    if (!user) return { message: 'Usuario o contraseña incorrecta' };
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }
}

