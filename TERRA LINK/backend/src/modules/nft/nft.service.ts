import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { Plot } from '../../entities/plot.entity';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';

export interface NftMetadataInput {
  geolocation: string;
  certifications: string[];
  productionHistoryUri: string;
  valuation: number;
  riskScore: number;
  tokenFractionCount: number;
  status: 'active' | 'collateralized' | 'underReview';
  recipientAddress?: string;
}

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    @InjectRepository(NftMetadata)
    private nftRepository: Repository<NftMetadata>,
    @InjectRepository(Plot)
    private plotRepository: Repository<Plot>,
    private readonly blockchainService: BlockchainService,
    private readonly ipfsService: IpfsService,
  ) {}

  async createNft(plotId: number, metadata: NftMetadataInput) {
    try {
      const plot = await this.plotRepository.findOne({ where: { id: plotId } });
      if (!plot) {
        throw new Error('Plot not found');
      }

      const recipientAddress = metadata.recipientAddress;
      if (!recipientAddress) {
        throw new Error('recipientAddress is required to mint NFT on-chain');
      }

      const ipfsMetadata = {
        plotId,
        geolocation: metadata.geolocation,
        certifications: metadata.certifications,
        productionHistoryUri: metadata.productionHistoryUri,
        valuation: metadata.valuation,
        riskScore: metadata.riskScore,
        fractionCount: metadata.tokenFractionCount,
        collateralized: metadata.status === 'collateralized',
        createdAt: new Date().toISOString(),
      };

      const metadataUri = await this.ipfsService.uploadMetadata(ipfsMetadata);
      this.logger.log(`Uploaded NFT metadata to IPFS: ${metadataUri}`);

      const mintResult = await this.blockchainService.mintAsset(
        recipientAddress,
        metadataUri,
        metadata.geolocation,
        metadata.certifications,
        metadata.productionHistoryUri,
        metadata.valuation,
        metadata.riskScore,
        metadata.tokenFractionCount,
      );

      const tokenId = mintResult.tokenId;
      const nftMetadata = this.nftRepository.create({
        token_id: tokenId,
        plot_id: plotId,
        geolocation: metadata.geolocation,
        certifications: metadata.certifications,
        production_history_uri: metadata.productionHistoryUri,
        token_uri: metadataUri,
        metadata_uri: metadataUri,
        valuation: metadata.valuation,
        risk_score: metadata.riskScore,
        fraction_count: metadata.tokenFractionCount,
        collateralized: metadata.status === 'collateralized',
        minted_at: new Date(),
        transaction_hash: mintResult.transactionHash,
      });

      await this.nftRepository.save(nftMetadata);
      await this.plotRepository.update(plotId, { nft_token: tokenId });

      return {
        tokenId,
        status: metadata.status,
        message: 'NFT minted and persisted successfully',
        metadata: nftMetadata,
        mintResult,
      };
    } catch (error) {
      throw new Error(`Failed to create NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateNft(tokenId: string, metadata: Partial<NftMetadataInput>) {
    try {
      const nft = await this.nftRepository.findOne({ where: { token_id: tokenId } });
      if (!nft) {
        throw new Error('NFT not found');
      }

      if (metadata.valuation !== undefined) nft.valuation = metadata.valuation;
      if (metadata.riskScore !== undefined) nft.risk_score = metadata.riskScore;
      if (metadata.certifications !== undefined) nft.certifications = metadata.certifications;
      if (metadata.status !== undefined) nft.collateralized = metadata.status === 'collateralized';
      if (metadata.productionHistoryUri !== undefined) nft.production_history_uri = metadata.productionHistoryUri;
      if (metadata.tokenFractionCount !== undefined) nft.fraction_count = metadata.tokenFractionCount;
      if (metadata.geolocation !== undefined) nft.geolocation = metadata.geolocation;

      nft.last_updated = new Date();

      await this.nftRepository.save(nft);

      if (this.blockchainService.isConfigured()) {
        await this.blockchainService.updateMetadata(
          tokenId,
          nft.geolocation,
          nft.certifications || [],
          nft.production_history_uri || '',
          Number(nft.valuation || 0),
          Number(nft.risk_score || 0),
          Number(nft.fraction_count || 0),
        );
      }

      return {
        tokenId,
        updatedMetadata: metadata,
        message: 'NFT metadata updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async collateralizeNft(tokenId: string) {
    try {
      const nft = await this.nftRepository.findOne({ where: { token_id: tokenId } });
      if (!nft) {
        throw new Error('NFT not found');
      }

      if (nft.collateralized) {
        throw new Error('NFT already collateralized');
      }

      let blockchainResult = undefined;
      if (this.blockchainService.isConfigured()) {
        blockchainResult = await this.blockchainService.collateralizeNft(tokenId);
      }

      nft.collateralized = true;
      nft.last_updated = new Date();
      await this.nftRepository.save(nft);

      return {
        tokenId,
        collateralized: true,
        blockchainResult,
        message: 'NFT marked as collateral successfully',
      };
    } catch (error) {
      throw new Error(`Failed to collateralize NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNftMetadata(tokenId: string) {
    const nft = await this.nftRepository.findOne({
      where: { token_id: tokenId },
      relations: ['plot'],
    });

    if (!nft) {
      throw new Error('NFT not found');
    }

    return nft;
  }

  async getNftsByPlot(plotId: number) {
    return await this.nftRepository.find({
      where: { plot_id: plotId },
      relations: ['plot'],
    });
  }
}
