import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { Nft } from '../entities/nft.entity';
import { Stake } from '../entities/stake.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { BlockchainService } from './blockchain.service';
import { SecretStoreService } from './secret-store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, Nft, Stake])],
  providers: [WalletService, BlockchainService, SecretStoreService],
  controllers: [WalletController],
})
export class WalletModule {}