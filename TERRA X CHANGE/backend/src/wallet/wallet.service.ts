import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { BlockchainService } from './blockchain.service';
import { SecretStoreService } from './secret-store.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private blockchainService: BlockchainService,
    private secretStoreService: SecretStoreService,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    const ethWallet = ethers.Wallet.createRandom();
    const secret = this.secretStoreService.getSecret('wallet-encryption-key') || process.env.WALLET_ENCRYPTION_KEY || 'terra-xchange-dev-key';
    if (!this.secretStoreService.getSecret('wallet-encryption-key') && process.env.WALLET_ENCRYPTION_KEY) {
      this.secretStoreService.setSecret('wallet-encryption-key', process.env.WALLET_ENCRYPTION_KEY);
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', crypto.createHash('sha256').update(secret).digest(), iv);
    const encryptedKey = Buffer.concat([cipher.update(ethWallet.privateKey), cipher.final()]).toString('hex');

    const wallet = this.walletRepository.create({
      userId,
      blockchainAddress: ethWallet.address,
      xCoinBalance: '0',
      stablecoinBalance: '0',
    } as Partial<Wallet>);

    const saved = await this.walletRepository.save(wallet);
    (saved as Wallet & { encryptedPrivateKey?: string; iv?: string }).encryptedPrivateKey = `${iv.toString('hex')}:${encryptedKey}`;
    return this.walletRepository.save(saved);
  }

  async getWalletBalance(id: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    wallet.xCoinBalance = await this.blockchainService.getBalance(wallet.blockchainAddress);
    return wallet;
  }

  async transfer(walletId: string, toAddress: string, amount: string): Promise<{ txHash: string }> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const txHash = await this.blockchainService.transfer(wallet.blockchainAddress, toAddress, amount);
    return { txHash };
  }

  async getRewards(): Promise<{ rewards: number }> {
    return { rewards: 0 };
  }
}