import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { CreditProposal } from '../../entities/credit-proposal.entity';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { EudrRegistry } from '../../entities/eudr-registry.entity';
import { EsgReport } from '../../entities/esg-report.entity';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { ComplianceModule } from '../compliance/compliance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreditProposal, NftMetadata, EudrRegistry, EsgReport]),
    ConfigModule,
    BlockchainModule,
    ComplianceModule,
  ],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
