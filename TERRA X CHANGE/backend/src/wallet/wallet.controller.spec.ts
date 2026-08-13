import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            createWallet: jest.fn(),
            getWalletBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  it('should create wallet', async () => {
    const mockWallet = { id: '1' };
    jest.spyOn(service, 'createWallet').mockResolvedValue(mockWallet as any);

    const result = await controller.createWallet({ userId: 'user1' });
    expect(result).toEqual(mockWallet);
  });

  it('should get balance', async () => {
    const mockWallet = { id: '1', xCoinBalance: '100' };
    jest.spyOn(service, 'getWalletBalance').mockResolvedValue(mockWallet as any);

    const result = await controller.getBalance('1');
    expect(result).toEqual(mockWallet);
  });
});