import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditService } from './credit.service';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { CreditProposal } from '../../entities/credit-proposal.entity';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { EudrRegistry } from '../../entities/eudr-registry.entity';
import { EsgReport } from '../../entities/esg-report.entity';
import { TraceService } from '../compliance/services/trace.service';

describe('CreditService', () => {
  let service: CreditService;
  let creditRepository: Repository<CreditProposal>;
  let nftRepository: Repository<NftMetadata>;
  let traceService: TraceService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        CreditService,
        {
          provide: getRepositoryToken(CreditProposal),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NftMetadata),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EudrRegistry),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EsgReport),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: BlockchainService,
          useValue: {
            collateralizeNft: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: TraceService,
          useValue: {
            getTraceComplianceStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<CreditService>(CreditService);
    creditRepository = moduleRef.get<Repository<CreditProposal>>(getRepositoryToken(CreditProposal));
    nftRepository = moduleRef.get<Repository<NftMetadata>>(getRepositoryToken(NftMetadata));
    traceService = moduleRef.get<TraceService>(TraceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCreditProposal', () => {
    it('should create credit proposal successfully', async () => {
      const mockNft = { token_id: 'nft-test', valuation: 500000, collateralized: false };
      const mockProposal = { id: 1, token_id: 'nft-test', borrower_id: 1 };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);
      jest.spyOn(creditRepository, 'create').mockReturnValue(mockProposal as any);
      jest.spyOn(creditRepository, 'save').mockResolvedValue(mockProposal as any);

      const result = await service.createCreditProposal('nft-test', 1, 100000, 24, 8.5);

      expect(result.message).toContain('Credit proposal created successfully');
      expect(result.proposalId).toBeDefined();
      expect(result.stablecoin).toBe('USDC');
    });

    it('should create credit proposal with a specific stablecoin', async () => {
      const mockNft = { token_id: 'nft-test', valuation: 500000, collateralized: false };
      const mockProposal = { id: 2, token_id: 'nft-test', borrower_id: 1, stablecoin: 'DAI' };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);
      jest.spyOn(creditRepository, 'create').mockReturnValue(mockProposal as any);
      jest.spyOn(creditRepository, 'save').mockResolvedValue(mockProposal as any);

      const result = await service.createCreditProposal('nft-test', 1, 100000, 24, 8.5, 'DAI');

      expect(result.stablecoin).toBe('DAI');
      expect(result.message).toContain('Credit proposal created successfully');
    });

    it('should throw error if NFT not found', async () => {
      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createCreditProposal('invalid-token', 1, 100000, 24, 8.5)).rejects.toThrow('NFT not found');
    });

    it('should throw error if NFT already collateralized', async () => {
      const mockNft = { token_id: 'nft-test', collateralized: true };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);

      await expect(service.createCreditProposal('nft-test', 1, 100000, 24, 8.5)).rejects.toThrow('already used as collateral');
    });
  });

  describe('evaluateCollateral', () => {
    it('should evaluate collateral successfully', async () => {
      const mockNft = { token_id: 'nft-test', risk_score: 15, certifications: ['EUDR'], valuation: 500000 };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);

      const result = await service.evaluateCollateral('nft-test');

      expect(result.score).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(result.message).toContain('evaluation completed');
    });

    it('should calculate dynamic credit profile with EUDR and ESG data', async () => {
      const mockNft = {
        token_id: 'nft-test',
        valuation: 500000,
        risk_score: 20,
        certifications: ['EUDR'],
        plot_id: 10,
        trace_id: '550e8400-e29b-41d4-a716-446655440000',
      };
      const mockEudr = { trace_id: '550e8400-e29b-41d4-a716-446655440000', compliance_status: 'verified' };
      const mockEsgReports = [{ score: 88, category: 'water', created_at: new Date() }];
      const mockTraceCompliance = {
        eudrRecord: mockEudr,
        tracesStatus: { traceId: mockNft.trace_id, isValid: true, complianceStatus: 'verified', riskLevel: 'low', issues: [] },
        riskAssessment: { level: 'low', issues: [] },
      };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);
      const eudrRepo = moduleRef.get<Repository<EudrRegistry>>(getRepositoryToken(EudrRegistry));
      const esgRepo = moduleRef.get<Repository<EsgReport>>(getRepositoryToken(EsgReport));
      jest.spyOn(eudrRepo, 'findOne').mockResolvedValue(mockEudr as any);
      jest.spyOn(esgRepo, 'find').mockResolvedValue(mockEsgReports as any);
      jest.spyOn(traceService, 'getTraceComplianceStatus').mockResolvedValue(mockTraceCompliance as any);

      const result = await service.getDynamicCreditProfile('nft-test');

      expect(result.tokenId).toBe('nft-test');
      expect(result.eudrStatus).toBe('verified');
      expect(result.traceComplianceStatus).toBe('verified');
      expect(result.traceRiskLevel).toBe('low');
      expect(result.latestEsgScore).toBe(88);
      expect(result.adjustedLimit).toBeGreaterThan(0);
      expect(result.creditHealth).toBe('healthy');
    });

    it('should give low score for high risk NFT', async () => {
      const mockNft = { token_id: 'nft-test', risk_score: 85, certifications: [], valuation: 50000 };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);

      const result = await service.evaluateCollateral('nft-test');

      expect(result.score).toBeLessThan(70);
      expect(result.recommendation).toBe('review');
    });
  });

  describe('getCreditProposalsByBorrower', () => {
    it('should return credit proposals for borrower', async () => {
      const mockProposals = [
        { id: 1, borrower_id: 1, token_id: 'nft-test', status: 'approved' },
      ];

      jest.spyOn(creditRepository, 'find').mockResolvedValue(mockProposals as any);

      const result = await service.getCreditProposalsByBorrower(1);

      expect(result).toHaveLength(1);
      expect(result[0].borrower_id).toBe(1);
    });
  });

  describe('updateProposalStatus', () => {
    it('should approve a credit proposal and collateralize on-chain', async () => {
      const proposal = { id: 1, token_id: 'nft-test', status: 'draft', updated_at: new Date() };

      jest.spyOn(creditRepository, 'findOne').mockResolvedValue(proposal as any);
      jest.spyOn(creditRepository, 'save').mockResolvedValue(proposal as any);
      jest.spyOn(nftRepository, 'update').mockResolvedValue({} as any);
      const blockchainService = moduleRef.get<BlockchainService>(BlockchainService);
      jest.spyOn(blockchainService, 'collateralizeNft').mockResolvedValue({} as any);

      const result = await service.updateProposalStatus(1, 'approved');

      expect(result.status).toBe('approved');
      expect(blockchainService.collateralizeNft).toHaveBeenCalledWith('nft-test');
    });
  });
});
