import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('wallet/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password)
    if (!user) {
      return { error: 'invalid_credentials' }
    }
    const token = await this.authService.generateToken({ email: body.email })
    return { access_token: token }
  }
}
