import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stake } from '../../src/entities/stake.entity';
import { StakingService } from './staking.service';

describe('StakingService', () => {
  let service: StakingService;
  let stakeRepository: Repository<Stake>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StakingService,
        {
          provide: getRepositoryToken(Stake),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StakingService>(StakingService);
    stakeRepository = module.get<Repository<Stake>>(getRepositoryToken(Stake));
  });

  it('should create a stake', async () => {
    const mockStake = { id: '1', walletId: 'wallet1', amount: '100', rewards: '0', status: 'active', createdAt: new Date() };
    jest.spyOn(stakeRepository, 'create').mockReturnValue(mockStake as any);
    jest.spyOn(stakeRepository, 'save').mockResolvedValue(mockStake as any);

    const result = await service.createStake('wallet1', '100');
    expect(result).toEqual(mockStake);
  });

  it('should get stakes by wallet', async () => {
    const mockStakes = [{ id: '1', walletId: 'wallet1', status: 'active' }];
    jest.spyOn(stakeRepository, 'find').mockResolvedValue(mockStakes as any);

    const result = await service.getStakesByWallet('wallet1');
    expect(result).toEqual(mockStakes);
  });

  it('should calculate rewards', async () => {
    const mockStake = { id: '1', amount: '100', createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) };
    jest.spyOn(stakeRepository, 'findOne').mockResolvedValue(mockStake as any);

    const result = await service.calculateRewards('1');
    expect(parseFloat(result)).toBeGreaterThan(0);
  });
});