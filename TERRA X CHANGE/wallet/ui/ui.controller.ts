import { Controller, Get, Post, Body } from '@nestjs/common'
import { UiService } from './ui.service'

@Controller('wallet/ui')
export class UiController {
  constructor(private readonly uiService: UiService) {}

  @Get('dashboard')
  async dashboard(@Body() body: { userId: string }) {
    return this.uiService.getDashboard(body.userId)
  }

  @Post('onboarding')
  async onboarding(@Body() body: { userId: string }) {
    return this.uiService.startOnboarding(body.userId)
  }
}
