import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { Plot } from '../../entities/plot.entity';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([NftMetadata, Plot]), BlockchainModule, IpfsModule, AuthModule],
  controllers: [NftController],
  providers: [NftService],
})
export class NftModule {}
