import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  tenant_id!: number;
  username!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { tenant_id, username, password } = body;
    if (!tenant_id || !username || !password) {
      throw new BadRequestException('Missing required fields: tenant_id, username, password');
    }
    return this.authService.login(tenant_id, username, password);
  }
}
