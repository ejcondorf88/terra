import { Controller, Post, Body } from '@nestjs/common'
import { IntegrationService } from './integration.service'

@Controller('wallet/integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('proposal')
  async proposal(@Body() body: any) {
    return this.integrationService.submitProposal(body)
  }

  @Post('iot')
  async iot(@Body() body: any) {
    return this.integrationService.handleIotEvent(body)
  }
}
