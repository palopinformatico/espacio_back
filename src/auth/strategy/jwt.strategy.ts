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
  return { 
    id: Number(payload.sub || payload.id || payload.userId), // Aceptamos cualquiera, devolvemos 'id'
    username: payload.username, 
    role: payload.role 
  };
}
}
