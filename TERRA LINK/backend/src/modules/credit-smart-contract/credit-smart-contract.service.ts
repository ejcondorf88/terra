import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { CreditProposal } from '../../entities/credit-proposal.entity';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { CreditSmartContractGateway } from './credit-smart-contract.gateway';

@Injectable()
export class CreditSmartContractService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly gateway: CreditSmartContractGateway,
    @InjectRepository(CreditProposal)
    private creditRepository: Repository<CreditProposal>,
    @InjectRepository(NftMetadata)
    private nftRepository: Repository<NftMetadata>,
  ) {}

  async collateralizeToken(tokenId: string) {
    const result = await this.blockchainService.collateralizeNft(tokenId);
    const payload = {
      collateralized: result.collateralized,
      locked: result.locked,
      transactionHash: result.transactionHash,
      lockTransactionHash: result.lockTransactionHash,
    };
    this.gateway.notifyCollateralization(tokenId, payload);

    return {
      ...result,
      tokenId,
      message: 'Token collateralized via smart contract successfully.',
    };
  }

  async releaseTokenCollateral(tokenId: string) {
    const result = await this.blockchainService.releaseCollateral(tokenId);
    const payload = {
      collateralized: result.collateralized,
      locked: result.locked,
      transactionHash: result.transactionHash,
      unlockTransactionHash: result.unlockTransactionHash,
    };
    this.gateway.notifyCollateralization(tokenId, payload);

    return {
      ...result,
      tokenId,
      message: 'Token collateral released via smart contract successfully.',
    };
  }

  async getRiskAdjustedLimit(tokenId: string) {
    const nft = await this.nftRepository.findOne({ where: { token_id: tokenId } });
    if (!nft) {
      throw new Error('NFT not found');
    }

    const valuation = Number(nft.valuation || 0);
    const riskScore = Number(nft.risk_score || 0);
    const collateralized = Boolean(nft.collateralized);

    const baseLimit = valuation * 0.7;
    const riskPenalty = Math.min(riskScore / 100, 0.75);
    const adjustedLimit = collateralized ? baseLimit * (1 - riskPenalty * 0.5) : baseLimit * 0.3;
    const maxLimit = Math.max(0, adjustedLimit);
    const health = riskScore < 40 ? 'healthy' : riskScore < 70 ? 'watch' : 'at-risk';

    const payload = {
      adjustedLimit: maxLimit,
      collateralized,
      health,
      riskScore,
      valuation,
    };

    this.gateway.notifyRiskLimit(tokenId, payload);

    return {
      tokenId,
      adjustedLimit: maxLimit,
      collateralized,
      health,
      riskScore,
      valuation,
      message: 'Risk-adjusted credit limit calculated successfully.',
    };
  }

  notifyMetrics(metrics: Record<string, any>) {
    this.gateway.notifyMetricsUpdate(metrics);
  }

  async getFinancialMetrics() {
    const proposals = await this.creditRepository.find();
    const nfts = await this.nftRepository.find();

    const totalCollateralizedValue = nfts
      .filter(nft => nft.collateralized)
      .reduce((sum, nft) => sum + Number(nft.valuation || 0), 0);

    const totalRequested = proposals.reduce((sum, proposal) => sum + Number(proposal.requested_amount || 0), 0);
    const activeProposals = proposals.filter(p => p.status !== 'repaid').length;

    const averageRiskScore = nfts.length
      ? nfts.reduce((sum, nft) => sum + Number(nft.risk_score || 0), 0) / nfts.length
      : 0;

    const stablecoinDistribution = proposals.reduce((acc, proposal) => {
      const coin = proposal.stablecoin || 'USDC';
      acc[coin] = (acc[coin] || 0) + Number(proposal.requested_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const liquidityCoverage = totalRequested > 0 ? totalCollateralizedValue / totalRequested : 0;

    return {
      totalCollateralizedValue,
      totalRequested,
      activeProposals,
      averageRiskScore,
      stablecoinDistribution,
      liquidityCoverage,
      message: 'Financial dashboard metrics computed successfully.',
    };
  }
}
