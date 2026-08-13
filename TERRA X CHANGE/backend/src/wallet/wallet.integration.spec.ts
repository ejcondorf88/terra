import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from './wallet.service';
import { BlockchainService } from './blockchain.service';
import { SecretStoreService } from './secret-store.service';
import { Wallet } from '../entities/wallet.entity';

describe('Wallet integration - transfer flow', () => {
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
            getBalance: jest.fn().mockResolvedValue('100'),
            transfer: jest.fn().mockResolvedValue('0xmockTxHash'),
          },
        },
        SecretStoreService,
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  it('should delegate a transfer to blockchain service', async () => {
    const wallet = { id: 'wallet-1', blockchainAddress: '0xabc', userId: 'user-1' } as Wallet;
    jest.spyOn(walletRepository, 'findOne').mockResolvedValue(wallet);

    const result = await service.transfer('wallet-1', '0xdef', '10');

    expect(result).toEqual({ txHash: '0xmockTxHash' });
    expect(blockchainService.transfer).toHaveBeenCalledWith('0xabc', '0xdef', '10');
  });

  it('should allow an integration-style transfer when a real provider is configured', async () => {
    const hasRealRpc = Boolean(process.env.ETH_RPC_URL && process.env.PRIVATE_KEY);
    if (!hasRealRpc) {
      return;
    }

    const realService = new BlockchainService();
    const txHash = await realService.transfer('0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000001', '0.000001');

    expect(typeof txHash).toBe('string');
    expect(txHash.startsWith('0x')).toBe(true);
  });
});
