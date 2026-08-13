import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post(':userId/mfa/setup')
  async setupMFA(@Param('userId') userId: string) {
    return this.authService.setupMFA(userId);
  }

  @Post(':userId/mfa/verify')
  async verifyMFA(@Param('userId') userId: string, @Body() body: { token: string }) {
    const verified = await this.authService.verifyMFA(userId, body.token);
    return { verified };
  }
}