import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../../src/entities/wallet.entity';
import { WalletService } from './wallet.service';
import { BlockchainService } from './blockchain.service';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: Repository<Wallet>;
  let blockchainService: BlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useClass: Repository,
        },
        {
          provide: BlockchainService,
          useValue: {
            getBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  it('should create a wallet', async () => {
    const mockWallet = { id: '1', userId: 'user1', blockchainAddress: '0x123', xCoinBalance: '0', stablecoinBalance: '0' };
    jest.spyOn(walletRepository, 'create').mockReturnValue(mockWallet as any);
    jest.spyOn(walletRepository, 'save').mockResolvedValue(mockWallet as any);

    const result = await service.createWallet('user1');
    expect(result).toEqual(mockWallet);
  });

  it('should get wallet balance', async () => {
    const mockWallet = { id: '1', blockchainAddress: '0x123' };
    jest.spyOn(walletRepository, 'findOne').mockResolvedValue(mockWallet as any);
    jest.spyOn(blockchainService, 'getBalance').mockResolvedValue('100');

    const result = await service.getWalletBalance('1');
    expect(result.xCoinBalance).toBe('100');
  });

  it('should throw error if wallet not found', async () => {
    jest.spyOn(walletRepository, 'findOne').mockResolvedValue(null);

    await expect(service.getWalletBalance('1')).rejects.toThrow('Wallet not found');
  });
});