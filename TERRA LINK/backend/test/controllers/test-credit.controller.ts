import { Body, Controller, Get, Param, Patch, Post, HttpException, HttpStatus } from '@nestjs/common';
import { TestCreditService } from '../services/test-credit.service';

@Controller('credit')
export class TestCreditController {
  constructor(private readonly creditService: TestCreditService) {}

  @Post('proposal')
  async createProposal(@Body() body: {
    tokenId: string;
    borrowerId: number;
    requestedAmount: number;
    durationMonths: number;
    interestRate: number;
  }) {
    try {
      return await this.creditService.createCreditProposal(
        body.tokenId,
        body.borrowerId,
        body.requestedAmount,
        body.durationMonths,
        body.interestRate
      );
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Credit proposal creation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('evaluate/:tokenId')
  async evaluateCollateral(@Param('tokenId') tokenId: string) {
    try {
      return await this.creditService.evaluateCollateral(tokenId);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Collateral evaluation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('proposals/:borrowerId')
  async getProposalsByBorrower(@Param('borrowerId') borrowerId: number) {
    try {
      return await this.creditService.getCreditProposalsByBorrower(borrowerId);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Credit proposals retrieval failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch('proposal/:id/status')
  async updateStatus(@Param('id') id: number, @Body() body: { status: string }) {
    try {
      return await this.creditService.updateProposalStatus(id, body.status);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Status update failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
