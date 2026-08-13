import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { CreditService } from './credit.service';

@Controller('credit')
@UseGuards(JwtAuthGuard, RbacGuard)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('proposal')
  @Roles('banco', 'admin')
  async createProposal(@Body() body: {
    tokenId: string;
    borrowerId: number;
    requestedAmount: number;
    durationMonths: number;
    interestRate: number;
    stablecoin?: string;
  }) {
    return this.creditService.createCreditProposal(
      body.tokenId,
      body.borrowerId,
      body.requestedAmount,
      body.durationMonths,
      body.interestRate,
      body.stablecoin,
    );
  }

  @Get('dynamic/:tokenId')
  @Roles('banco', 'admin')
  async evaluateDynamicCollateral(@Param('tokenId') tokenId: string) {
    return this.creditService.getDynamicCreditProfile(tokenId);
  }

  @Post('evaluate/:tokenId')
  @Roles('banco', 'admin')
  async evaluateCollateral(@Param('tokenId') tokenId: string) {
    return this.creditService.evaluateCollateral(tokenId);
  }

  @Get('proposals/:borrowerId')
  @Roles('banco', 'admin')
  async getProposalsByBorrower(@Param('borrowerId') borrowerId: number) {
    return this.creditService.getCreditProposalsByBorrower(borrowerId);
  }

  @Patch('proposal/:id/status')
  @Roles('banco', 'admin')
  async updateStatus(@Param('id') id: number, @Body() body: { status: string }) {
    return this.creditService.updateProposalStatus(id, body.status);
  }
}
