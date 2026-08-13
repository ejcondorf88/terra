import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditSmartContractService } from './credit-smart-contract.service';
import { CreditSmartContractGateway } from './credit-smart-contract.gateway';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { CreditProposal } from '../../entities/credit-proposal.entity';
import { NftMetadata } from '../../entities/nft-metadata.entity';

describe('CreditSmartContractService', () => {
  let service: CreditSmartContractService;
  let blockchainService: BlockchainService;
  let creditRepository: Repository<CreditProposal>;
  let nftRepository: Repository<NftMetadata>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditSmartContractService,
        {
          provide: BlockchainService,
          useValue: {
            collateralizeNft: jest.fn().mockResolvedValue({ collateralized: true, locked: true, transactionHash: '0xabc', lockTransactionHash: '0xdef' }),
            releaseCollateral: jest.fn().mockResolvedValue({ collateralized: false, locked: false, transactionHash: '0x123', unlockTransactionHash: '0x456' }),
          },
        },
        {
          provide: CreditSmartContractGateway,
          useValue: {
            notifyCollateralization: jest.fn(),
            notifyRiskLimit: jest.fn(),
            notifyMetricsUpdate: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CreditProposal),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(NftMetadata),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<CreditSmartContractService>(CreditSmartContractService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    creditRepository = module.get<Repository<CreditProposal>>(getRepositoryToken(CreditProposal));
    nftRepository = module.get<Repository<NftMetadata>>(getRepositoryToken(NftMetadata));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should collateralize a token using the blockchain service', async () => {
    const result = await service.collateralizeToken('nft-1');
    expect(result.collateralized).toBe(true);
    expect(result.transactionHash).toBe('0xabc');
    expect(blockchainService.collateralizeNft).toHaveBeenCalledWith('nft-1');
  });

  it('should release a token collateral on-chain', async () => {
    const result = await service.releaseTokenCollateral('nft-1');
    expect(result.collateralized).toBe(false);
    expect(result.unlockTransactionHash).toBe('0x456');
    expect(blockchainService.releaseCollateral).toHaveBeenCalledWith('nft-1');
  });

  it('should compute financial dashboard metrics', async () => {
    jest.spyOn(creditRepository, 'find').mockResolvedValue([
      { requested_amount: 100000, stablecoin: 'USDC', status: 'draft' },
      { requested_amount: 50000, stablecoin: 'DAI', status: 'approved' },
    ] as any);
    jest.spyOn(nftRepository, 'find').mockResolvedValue([
      { valuation: 200000, collateralized: true, risk_score: 20 },
      { valuation: 100000, collateralized: false, risk_score: 30 },
    ] as any);

    const result = await service.getFinancialMetrics();
    expect(result.totalCollateralizedValue).toBe(200000);
    expect(result.activeProposals).toBe(2);
    expect(result.stablecoinDistribution.USDC).toBe(100000);
    expect(result.stablecoinDistribution.DAI).toBe(50000);
  });
});
