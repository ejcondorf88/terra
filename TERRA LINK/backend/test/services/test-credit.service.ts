import { Injectable } from '@nestjs/common';

@Injectable()
export class TestCreditService {
  async createCreditProposal(
    tokenId: string,
    borrowerId: number,
    requestedAmount: number,
    durationMonths: number,
    interestRate: number
  ) {
    if (!tokenId || !borrowerId || !requestedAmount) {
      throw new Error('Token ID, borrower ID, and amount are required');
    }

    return {
      proposalId: Date.now(),
      status: 'draft',
      message: 'Credit proposal created successfully (test)',
    };
  }

  async evaluateCollateral(tokenId: string) {
    return {
      tokenId,
      score: 85,
      recommendation: 'approve',
      maxCreditAmount: 100000,
      recommendations: ['Good collateral'],
      message: 'Collateral evaluation completed (test)',
    };
  }

  async getCreditProposalsByBorrower(borrowerId: number) {
    return [{
      id: 1,
      borrower_id: borrowerId,
      token_id: 'test-token',
      status: 'approved',
    }];
  }

  async updateProposalStatus(proposalId: number, status: string) {
    return {
      proposalId,
      status,
      message: `Credit proposal ${status} (test)`,
    };
  }
}
