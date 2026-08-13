import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StakingService } from './staking.service';

@Controller('api/staking')
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Post('create')
  async createStake(@Body() body: { walletId: string; amount: string }) {
    return this.stakingService.createStake(body.walletId, body.amount);
  }

  @Get(':walletId/stakes')
  async getStakes(@Param('walletId') walletId: string) {
    return this.stakingService.getStakesByWallet(walletId);
  }

  @Get(':stakeId/rewards')
  async getRewards(@Param('stakeId') stakeId: string) {
    const rewards = await this.stakingService.calculateRewards(stakeId);
    return { rewards };
  }

  @Post(':stakeId/unstake')
  async unstake(@Param('stakeId') stakeId: string) {
    return this.stakingService.unstake(stakeId);
  }
}