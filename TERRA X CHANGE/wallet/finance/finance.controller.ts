import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { FinanceService } from './finance.service'

@Controller('wallet/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('pools')
  async pools() {
    return this.financeService.listPools()
  }

  @Post('stake')
  async stake(@Body() body: { userId: string; poolId: string; amount: number }) {
    return this.financeService.stake(body.userId, body.poolId, body.amount)
  }

  @Post('loan')
  async loan(@Body() body: { userId: string; amount: number; collateralId?: string }) {
    return this.financeService.requestLoan(body.userId, body.amount, body.collateralId)
  }
}
