import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private xCoinContract: ethers.Contract;
  private xCoinAddress: string;

  constructor() {
    const rpcUrl = process.env.ETH_RPC_URL || 'https://polygon-rpc.com/';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.xCoinAddress = process.env.X_COIN_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    // ERC20 ABI (minimal)
    const erc20Abi = [
      'function balanceOf(address) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ];
    
    this.xCoinContract = new ethers.Contract(this.xCoinAddress, erc20Abi, this.provider);
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.xCoinContract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  async transfer(fromAddress: string, toAddress: string, amount: string): Promise<string> {
    try {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('PRIVATE_KEY not configured');
      }

      const chainId = (await this.provider.getNetwork()).chainId;
      if (chainId !== 11155111n && chainId !== 80001n && chainId !== 137n) {
        console.warn(`Connected to chain ${chainId}; ensure this is intended for testing.`);
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const tx = await wallet.sendTransaction({
        from: fromAddress,
        to: toAddress,
        value: ethers.parseEther(amount),
      });

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('Transaction receipt not available');
      }

      return receipt.hash;
    } catch (error) {
      console.error('Transfer error:', error);
      throw new Error('Transfer failed');
    }
  }

  async getTransactionStatus(txHash: string): Promise<string> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return 'pending';
      return receipt.status === 1 ? 'confirmed' : 'failed';
    } catch (error) {
      return 'unknown';
    }
  }
}