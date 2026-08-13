import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { TerraJwtPayload } from '@terra/shared/types';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-prod',
    });
  }

  async validate(payload: TerraJwtPayload) {
    const userId = typeof payload.sub === 'number' ? payload.sub : Number(payload.sub);
    if (!payload.email || Number.isNaN(userId)) {
      throw new Error('Invalid token payload');
    }
    return this.authService.validateUser(userId, payload.email);
  }
}
