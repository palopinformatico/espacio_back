import { Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload), role: user.role };
  }

  async register(dto: CreateUserDto) {
    const userExist = await this.userService.findByUsername(dto.username);
    if (userExist) {
      throw new Error('El usuario ya existe');
    }

    if (!dto.role) {
      dto.role = 'user'; // or set a default user type
    }
    return this.userService.create(dto);
  }

}
