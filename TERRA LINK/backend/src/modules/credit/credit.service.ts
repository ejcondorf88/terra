import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditProposal } from '../../entities/credit-proposal.entity';
import { NftMetadata } from '../../entities/nft-metadata.entity';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { EudrRegistry } from '../../entities/eudr-registry.entity';
import { EsgReport } from '../../entities/esg-report.entity';
import { TraceService } from '../compliance/services/trace.service';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  constructor(
    @InjectRepository(CreditProposal)
    private creditRepository: Repository<CreditProposal>,
    @InjectRepository(NftMetadata)
    private nftRepository: Repository<NftMetadata>,
    @InjectRepository(EudrRegistry)
    private eudrRepository: Repository<EudrRegistry>,
    @InjectRepository(EsgReport)
    private esgRepository: Repository<EsgReport>,
    private readonly blockchainService: BlockchainService,
    private readonly traceService: TraceService,
  ) {}

  async createCreditProposal(
    tokenId: string,
    borrowerId: number,
    requestedAmount: number,
    durationMonths: number,
    interestRate: number,
    stablecoin: string = 'USDC',
  ) {
    try {
      // Verify NFT exists and is not already collateralized
      const nft = await this.nftRepository.findOne({ where: { token_id: tokenId } });
      if (!nft) {
        throw new Error('NFT not found');
      }

      if (nft.collateralized) {
        throw new Error('NFT already used as collateral');
      }

      // Create credit proposal
      const proposal = this.creditRepository.create({
        token_id: tokenId,
        borrower_id: borrowerId,
        requested_amount: requestedAmount,
        duration_months: durationMonths,
        interest_rate: interestRate,
        stablecoin,
        status: 'draft',
      });

      await this.creditRepository.save(proposal);

      return {
        proposalId: proposal.id,
        status: proposal.status,
        stablecoin,
        message: 'Credit proposal created successfully',
        proposal,
      };
    } catch (error) {
      throw new Error(`Failed to create credit proposal: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async evaluateCollateral(tokenId: string) {
    try {
      const nft = await this.nftRepository.findOne({
        where: { token_id: tokenId },
        relations: ['plot'],
      });

      if (!nft) {
        throw new Error('NFT not found');
      }

      // Simple risk evaluation based on NFT metadata
      let score = 100;
      const recommendations = [];

      if (nft.risk_score && nft.risk_score > 50) {
        score -= nft.risk_score - 50;
        recommendations.push('High risk score detected');
      }

      if (!nft.certifications || nft.certifications.length === 0) {
        score -= 20;
        recommendations.push('No certifications found');
      }

      if (nft.valuation && nft.valuation < 100000) {
        score -= 10;
        recommendations.push('Low valuation may limit credit amount');
      }

      const approvalThreshold = 70;
      const recommendation = score >= approvalThreshold ? 'approve' : 'review';

      return {
        tokenId,
        score,
        recommendation,
        maxCreditAmount: nft.valuation ? nft.valuation * 0.8 : 0,
        recommendations,
        message: `Collateral evaluation completed with score ${score}`,
      };
    } catch (error) {
      throw new Error(`Failed to evaluate collateral: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getDynamicCreditProfile(tokenId: string) {
    const nft = await this.nftRepository.findOne({
      where: { token_id: tokenId },
      relations: ['plot'],
    });

    if (!nft) {
      throw new Error('NFT not found');
    }

    const esgReports = await this.esgRepository.find({
      where: { plot_id: nft.plot_id },
      order: { created_at: 'DESC' },
    });

    const latestEsg = esgReports.length > 0 ? esgReports[0] : null;
    let eudrRecord = await this.eudrRepository.findOne({ where: { trace_id: nft.trace_id } });
    let traceComplianceStatus: string | null = null;
    let traceRiskLevel: string | null = null;
    let riskAssessment = { level: 'unknown', issues: [] as string[] };

    if (nft.trace_id) {
      try {
        const complianceResult = await this.traceService.getTraceComplianceStatus(nft.trace_id);
        eudrRecord = eudrRecord || complianceResult.eudrRecord;
        traceComplianceStatus = complianceResult.tracesStatus.complianceStatus;
        traceRiskLevel = complianceResult.tracesStatus.riskLevel || null;
        riskAssessment = complianceResult.riskAssessment;
      } catch (error) {
        // Si no hay registro de EUDR en TRACES, seguimos con la información local.
        this.logger.warn(`Trace compliance lookup failed for ${nft.trace_id}: ${error instanceof Error ? error.message : error}`);
      }
    }

    const eudrStatus = eudrRecord?.compliance_status || traceComplianceStatus || 'unknown';
    const baseLimit = nft.valuation ? nft.valuation * 0.7 : 0;
    const riskFactor = Math.max(0, (nft.risk_score || 0) / 100);
    const esgBonus = latestEsg?.score ? Math.min(latestEsg.score / 100, 0.25) : 0;
    const compliancePenalty = eudrStatus === 'verified' ? 0 : eudrStatus === 'pending' ? 0.15 : 0.3;
    const traceRiskPenalty = riskAssessment.level === 'high' ? 0.1 : riskAssessment.level === 'medium' ? 0.05 : 0;

    const adjustedLimit = baseLimit * (1 - riskFactor * 0.5 + esgBonus) * (1 - compliancePenalty - traceRiskPenalty);
    const maxLimit = Math.max(0, adjustedLimit);
    const creditHealth = riskFactor < 0.25 ? 'healthy' : riskFactor < 0.5 ? 'watch' : 'at-risk';

    return {
      tokenId,
      valuation: nft.valuation || 0,
      riskScore: nft.risk_score || 0,
      certifications: nft.certifications || [],
      eudrStatus,
      traceComplianceStatus,
      traceRiskLevel,
      latestEsgScore: latestEsg?.score ?? null,
      esgCategory: latestEsg?.category ?? null,
      riskAssessment,
      baseLimit,
      adjustedLimit: maxLimit,
      creditHealth,
      creditNotes: [
        eudrStatus !== 'verified' ? 'EUDR compliance not fully verified' : 'EUDR verified',
        latestEsg ? `Latest ESG score: ${latestEsg.score}` : 'No ESG report available',
        riskAssessment.level !== 'low' ? `Trace risk assessment: ${riskAssessment.level}` : 'Trace risk level low',
      ],
      message: 'Dynamic credit profile calculated successfully.',
    };
  }

  async getCreditProposalsByBorrower(borrowerId: number) {
    return await this.creditRepository.find({
      where: { borrower_id: borrowerId },
      relations: ['nft'],
      order: { created_at: 'DESC' },
    });
  }

  async updateProposalStatus(proposalId: number, status: string) {
    const proposal = await this.creditRepository.findOne({ where: { id: proposalId } });
    if (!proposal) {
      throw new Error('Credit proposal not found');
    }

    proposal.status = status;
    proposal.updated_at = new Date();

    // If approved, lock NFT on-chain and mark it as collateralized
    if (status === 'approved') {
      await this.nftRepository.update(
        { token_id: proposal.token_id },
        { collateralized: true }
      );

      try {
        await this.blockchainService.collateralizeNft(proposal.token_id);
      } catch (error) {
        this.logger.warn(`Blockchain collateralization failed for ${proposal.token_id}: ${error instanceof Error ? error.message : error}`);
      }
    }

    await this.creditRepository.save(proposal);

    return {
      proposalId,
      status,
      message: `Credit proposal ${status}`,
    };
  }
}
