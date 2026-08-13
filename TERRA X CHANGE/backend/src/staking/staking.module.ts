import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stake } from '../entities/stake.entity';
import { StakingService } from './staking.service';
import { StakingController } from './staking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stake])],
  providers: [StakingService],
  controllers: [StakingController],
})
export class StakingModule {}