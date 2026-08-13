import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreditSmartContractService } from './credit-smart-contract.service';

@Controller('credit-smart-contract')
export class CreditSmartContractController {
  constructor(private readonly creditSmartContractService: CreditSmartContractService) {}

  @Post('collateralize')
  async collateralize(@Body() body: { tokenId: string }) {
    return this.creditSmartContractService.collateralizeToken(body.tokenId);
  }

  @Post('release')
  async release(@Body() body: { tokenId: string }) {
    return this.creditSmartContractService.releaseTokenCollateral(body.tokenId);
  }

  @Get('metrics')
  async metrics() {
    const metrics = await this.creditSmartContractService.getFinancialMetrics();
    this.creditSmartContractService.notifyMetrics(metrics);
    return metrics;
  }

  @Get('risk-limit/:tokenId')
  async riskLimit(@Param('tokenId') tokenId: string) {
    return this.creditSmartContractService.getRiskAdjustedLimit(tokenId);
  }
}
