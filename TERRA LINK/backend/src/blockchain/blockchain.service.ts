import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';

const AGRICULTURAL_NFT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'string', name: 'tokenURI', type: 'string' },
      { internalType: 'string', name: 'geohash', type: 'string' },
      { internalType: 'string[]', name: 'certifications', type: 'string[]' },
      { internalType: 'string', name: 'productionHistoryUri', type: 'string' },
      { internalType: 'uint256', name: 'valuation', type: 'uint256' },
      { internalType: 'uint256', name: 'riskScore', type: 'uint256' },
      { internalType: 'uint256', name: 'fractionCount', type: 'uint256' },
    ],
    name: 'mintAsset',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'string', name: 'geohash', type: 'string' },
      { internalType: 'string[]', name: 'certifications', type: 'string[]' },
      { internalType: 'string', name: 'productionHistoryUri', type: 'string' },
      { internalType: 'uint256', name: 'valuation', type: 'uint256' },
      { internalType: 'uint256', name: 'riskScore', type: 'uint256' },
      { internalType: 'uint256', name: 'fractionCount', type: 'uint256' },
    ],
    name: 'updateMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'bool', name: 'collateralized', type: 'bool' },
    ],
    name: 'setCollateralized',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'lockToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'unlockToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider?: JsonRpcProvider;
  private wallet?: Wallet;
  private contract?: Contract;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('POLYGON_RPC_URL');
    const contractAddress = this.configService.get<string>('AGRICULTURAL_NFT_ADDRESS');
    const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');

    if (!rpcUrl || !contractAddress || !privateKey) {
      this.logger.warn('Blockchain integration is disabled because POLYGON_RPC_URL, AGRICULTURAL_NFT_ADDRESS, or BLOCKCHAIN_PRIVATE_KEY is not configured.');
      return;
    }

    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider);
    this.contract = new Contract(contractAddress, AGRICULTURAL_NFT_ABI, this.wallet);
    this.logger.log('Blockchain service initialized with connected contract.');
  }

  isConfigured() {
    return Boolean(this.contract);
  }

  async mintAsset(
    recipient: string,
    tokenURI: string,
    geohash: string,
    certifications: string[],
    productionHistoryUri: string,
    valuation: number,
    riskScore: number,
    fractionCount: number,
  ) {
    if (!this.contract) {
      throw new Error('Blockchain service is not configured. Set POLYGON_RPC_URL, AGRICULTURAL_NFT_ADDRESS and BLOCKCHAIN_PRIVATE_KEY.');
    }

    const tx = await this.contract.mintAsset(
      recipient,
      tokenURI,
      geohash,
      certifications,
      productionHistoryUri,
      BigInt(Math.round(valuation)),
      BigInt(Math.round(riskScore)),
      BigInt(Math.round(fractionCount)),
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find((evt: any) => evt.event === 'AssetMinted');
    const tokenId = event?.args?.tokenId?.toString() ?? tx.hash;

    return {
      tokenId,
      transactionHash: tx.hash,
      receipt,
    };
  }

  async updateMetadata(
    tokenId: string,
    geohash: string,
    certifications: string[],
    productionHistoryUri: string,
    valuation: number,
    riskScore: number,
    fractionCount: number,
  ) {
    if (!this.contract) {
      throw new Error('Blockchain service is not configured. Set POLYGON_RPC_URL, AGRICULTURAL_NFT_ADDRESS and BLOCKCHAIN_PRIVATE_KEY.');
    }

    const numericId = tokenId.match(/\d+/)?.[0] ?? tokenId;
    const parsedTokenId = BigInt(numericId);

    const tx = await this.contract.updateMetadata(
      parsedTokenId,
      geohash,
      certifications,
      productionHistoryUri,
      BigInt(Math.round(valuation)),
      BigInt(Math.round(riskScore)),
      BigInt(Math.round(fractionCount)),
    );
    await tx.wait();

    return {
      tokenId,
      transactionHash: tx.hash,
    };
  }

  async collateralizeNft(tokenId: string) {
    if (!this.contract) {
      throw new Error('Blockchain service is not configured. Set POLYGON_RPC_URL, AGRICULTURAL_NFT_ADDRESS and BLOCKCHAIN_PRIVATE_KEY.');
    }

    const numericId = tokenId.match(/\d+/)?.[0] ?? tokenId;
    const parsedTokenId = BigInt(numericId);

    const tx = await this.contract.setCollateralized(parsedTokenId, true);
    await tx.wait();

    const lockTx = await this.contract.lockToken(parsedTokenId);
    await lockTx.wait();

    return {
      tokenId,
      collateralized: true,
      locked: true,
      transactionHash: tx.hash,
      lockTransactionHash: lockTx.hash,
    };
  }

  async releaseCollateral(tokenId: string) {
    if (!this.contract) {
      throw new Error('Blockchain service is not configured. Set POLYGON_RPC_URL, AGRICULTURAL_NFT_ADDRESS and BLOCKCHAIN_PRIVATE_KEY.');
    }

    const numericId = tokenId.match(/\d+/)?.[0] ?? tokenId;
    const parsedTokenId = BigInt(numericId);

    const tx = await this.contract.setCollateralized(parsedTokenId, false);
    await tx.wait();

    const unlockTx = await this.contract.unlockToken(parsedTokenId);
    await unlockTx.wait();

    return {
      tokenId,
      collateralized: false,
      locked: false,
      transactionHash: tx.hash,
      unlockTransactionHash: unlockTx.hash,
    };
  }
}
