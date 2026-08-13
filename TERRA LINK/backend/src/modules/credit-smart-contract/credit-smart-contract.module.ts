import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditSmartContractController } from './credit-smart-contract.controller';
import { CreditSmartContractService } from './credit-smart-contract.service';
import { CreditSmartContractGateway } from './credit-smart-contract.gateway';
import { CreditProposal } from '../../entities/credit-proposal.entity';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CreditProposal, NftMetadata]), BlockchainModule, AuthModule],
  controllers: [CreditSmartContractController],
  providers: [CreditSmartContractService, CreditSmartContractGateway],
  exports: [CreditSmartContractService],
})
export class CreditSmartContractModule {}
