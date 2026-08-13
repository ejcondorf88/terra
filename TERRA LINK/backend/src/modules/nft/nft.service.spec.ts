import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NftService } from './nft.service';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { Plot } from '../../entities/plot.entity';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';

const mockBlockchainService = {
  isConfigured: jest.fn().mockReturnValue(true),
  mintAsset: jest.fn(),
  updateMetadata: jest.fn(),
  collateralizeNft: jest.fn(),
};

const mockIpfsService = {
  uploadMetadata: jest.fn(),
};

describe('NftService', () => {
  let service: NftService;
  let nftRepository: Repository<NftMetadata>;
  let plotRepository: Repository<Plot>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NftService,
        {
          provide: getRepositoryToken(NftMetadata),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Plot),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
        {
          provide: IpfsService,
          useValue: mockIpfsService,
        },
      ],
    }).compile();

    service = module.get<NftService>(NftService);
    nftRepository = module.get<Repository<NftMetadata>>(getRepositoryToken(NftMetadata));
    plotRepository = module.get<Repository<Plot>>(getRepositoryToken(Plot));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNft', () => {
    it('should create NFT successfully', async () => {
      const mockPlot = { id: 1, name: 'Test Plot' };
      const mockNft = { token_id: 'nft-test', plot_id: 1 };

      jest.spyOn(plotRepository, 'findOne').mockResolvedValue(mockPlot as Plot);
      jest.spyOn(nftRepository, 'create').mockReturnValue(mockNft as any);
      jest.spyOn(nftRepository, 'save').mockResolvedValue(mockNft as any);
      jest.spyOn(plotRepository, 'update').mockResolvedValue({} as any);
      mockIpfsService.uploadMetadata.mockResolvedValue('ipfs://mock-cid');
      mockBlockchainService.mintAsset.mockResolvedValue({ tokenId: '1', transactionHash: '0xabc123' });

      const metadata = {
        geolocation: 'POINT(-79.35 -2.05)',
        certifications: ['EUDR'],
        productionHistoryUri: 'ipfs://test',
        valuation: 450000,
        riskScore: 12,
        tokenFractionCount: 10,
        status: 'active' as const,
        recipientAddress: '0x0000000000000000000000000000000000000001',
      };

      const result = await service.createNft(1, metadata);

      expect(result.message).toContain('NFT minted and persisted successfully');
      expect(result.tokenId).toBe('1');
      expect(mockIpfsService.uploadMetadata).toHaveBeenCalled();
      expect(mockBlockchainService.mintAsset).toHaveBeenCalledWith(
        '0x0000000000000000000000000000000000000001',
        'ipfs://mock-cid',
        metadata.geolocation,
        metadata.certifications,
        metadata.productionHistoryUri,
        metadata.valuation,
        metadata.riskScore,
        metadata.tokenFractionCount,
      );
    });

    it('should throw error if plot not found', async () => {
      jest.spyOn(plotRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createNft(999, {} as any)).rejects.toThrow('Plot not found');
    });
  });

  describe('collateralizeNft', () => {
    it('should collateralize NFT successfully', async () => {
      const mockNft = { token_id: 'nft-test', collateralized: false };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);
      jest.spyOn(nftRepository, 'save').mockResolvedValue({ ...mockNft, collateralized: true } as any);

      const result = await service.collateralizeNft('nft-test');

      expect(result.collateralized).toBe(true);
      expect(result.message).toContain('collateral successfully');
    });

    it('should throw error if NFT already collateralized', async () => {
      const mockNft = { token_id: 'nft-test', collateralized: true };

      jest.spyOn(nftRepository, 'findOne').mockResolvedValue(mockNft as any);

      await expect(service.collateralizeNft('nft-test')).rejects.toThrow('already collateralized');
    });
  });
});
