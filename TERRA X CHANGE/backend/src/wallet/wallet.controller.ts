import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';

@Controller('api/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create')
  async createWallet(@Body() body: { userId: string }) {
    return this.walletService.createWallet(body.userId);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.walletService.getWalletBalance(id);
  }

  @Post(':id/transfer')
  async transfer(@Param('id') id: string, @Body() body: { toAddress: string; amount: string }) {
    return this.walletService.transfer(id, body.toAddress, body.amount);
  }

  @Post('stake')
  async stake(@Body() body: any) {
    return { message: 'Staking initiated' };
  }

  @Get('rewards')
  async getRewards() {
    return this.walletService.getRewards();
  }

  @Post('fiat-convert')
  async convertFiat(@Body() body: any) {
    return { message: 'Conversion initiated' };
  }
}