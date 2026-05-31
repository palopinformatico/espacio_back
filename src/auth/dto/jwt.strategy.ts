import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SECRET_KEY', // 🔹 Debe coincidir con la clave usada para firmar el JWT
    });
  }

  async validate(payload: any) {
    // Lo que devuelvas aquí se asigna a request.user
    console.log('¡La estrategia validó el token!', payload);
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
