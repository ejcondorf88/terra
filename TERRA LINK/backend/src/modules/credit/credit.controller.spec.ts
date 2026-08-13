import { Test, TestingModule } from '@nestjs/testing';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';

describe('CreditController', () => {
  let controller: CreditController;
  let service: CreditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditController],
      providers: [
        {
          provide: CreditService,
          useValue: {
            createCreditProposal: jest.fn(),
            getDynamicCreditProfile: jest.fn(),
            evaluateCollateral: jest.fn(),
            getCreditProposalsByBorrower: jest.fn(),
            updateProposalStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CreditController>(CreditController);
    service = module.get<CreditService>(CreditService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a proposal', async () => {
    const dto = {
      tokenId: 'nft-test',
      borrowerId: 1,
      requestedAmount: 100000,
      durationMonths: 24,
      interestRate: 8.5,
      stablecoin: 'USDC',
    };
    const expected = { proposalId: 1, status: 'draft' };

    jest.spyOn(service, 'createCreditProposal').mockResolvedValue(expected as any);

    const result = await controller.createProposal(dto as any);

    expect(result).toBe(expected);
    expect(service.createCreditProposal).toHaveBeenCalledWith(
      dto.tokenId,
      dto.borrowerId,
      dto.requestedAmount,
      dto.durationMonths,
      dto.interestRate,
      dto.stablecoin,
    );
  });

  it('should return dynamic credit profile', async () => {
    const expected = { tokenId: 'nft-test', adjustedLimit: 250000 };
    jest.spyOn(service, 'getDynamicCreditProfile').mockResolvedValue(expected as any);

    const result = await controller.evaluateDynamicCollateral('nft-test');

    expect(result).toBe(expected);
    expect(service.getDynamicCreditProfile).toHaveBeenCalledWith('nft-test');
  });

  it('should evaluate collateral', async () => {
    const expected = { tokenId: 'nft-test', recommendation: 'approve' };
    jest.spyOn(service, 'evaluateCollateral').mockResolvedValue(expected as any);

    const result = await controller.evaluateCollateral('nft-test');

    expect(result).toBe(expected);
    expect(service.evaluateCollateral).toHaveBeenCalledWith('nft-test');
  });

  it('should get proposals by borrower', async () => {
    const expected = [{ id: 1, borrower_id: 1 }];
    jest.spyOn(service, 'getCreditProposalsByBorrower').mockResolvedValue(expected as any);

    const result = await controller.getProposalsByBorrower(1);

    expect(result).toBe(expected);
    expect(service.getCreditProposalsByBorrower).toHaveBeenCalledWith(1);
  });

  it('should update proposal status', async () => {
    const expected = { proposalId: 1, status: 'approved' };
    jest.spyOn(service, 'updateProposalStatus').mockResolvedValue(expected as any);

    const result = await controller.updateStatus(1, { status: 'approved' });

    expect(result).toBe(expected);
    expect(service.updateProposalStatus).toHaveBeenCalledWith(1, 'approved');
  });
});
