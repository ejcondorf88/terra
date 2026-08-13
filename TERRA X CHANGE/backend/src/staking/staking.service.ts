import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stake } from '../entities/stake.entity';

@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(Stake)
    private stakeRepository: Repository<Stake>,
  ) {}

  async createStake(walletId: string, amount: string): Promise<Stake> {
    const stake = this.stakeRepository.create({
      walletId,
      amount,
      rewards: '0',
      status: 'active',
    });
    return this.stakeRepository.save(stake);
  }

  async getStakesByWallet(walletId: string): Promise<Stake[]> {
    return this.stakeRepository.find({
      where: { walletId, status: 'active' },
    });
  }

  async calculateRewards(stakeId: string): Promise<string> {
    const stake = await this.stakeRepository.findOne({ where: { id: stakeId } });
    if (!stake) {
      throw new Error('Stake not found');
    }

    // Yield simple: 10% anual (simplificado)
    const yearsStaking = (Date.now() - stake.createdAt.getTime()) / (365 * 24 * 60 * 60 * 1000);
    const rewards = (parseFloat(stake.amount) * 0.1 * yearsStaking).toString();

    return rewards;
  }

  async unstake(stakeId: string): Promise<Stake> {
    const stake = await this.stakeRepository.findOne({ where: { id: stakeId } });
    if (!stake) {
      throw new Error('Stake not found');
    }

    stake.status = 'withdrawn';
    return this.stakeRepository.save(stake);
  }
}