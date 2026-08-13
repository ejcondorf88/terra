import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TerraJwtPayload } from '@terra/shared/auth';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(tenantId: number, username: string, password: string) {
    const user = await this.userService.findByUsernameAndTenant(tenantId, username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.is_active) {
      throw new UnauthorizedException('User is inactive');
    }
    const validPassword = await this.userService.validatePassword(user, password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: TerraJwtPayload = {
      sub: user.id,
      username: user.username,
      tenantId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, role: user.role, tenantId },
    };
  }

  verify(token: string) {
    return this.jwtService.verify(token);
  }
}
