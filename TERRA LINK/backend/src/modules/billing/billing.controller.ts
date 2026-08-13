import { Body, Controller, Get, Post, Headers, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { TenantId, Roles, RbacGuard } from '@terra/shared/auth';

class SubscribeDto {
  email!: string;
  payment_method_id?: string;
  price_id?: string;
}

class ChargeDto {
  amount!: number;
  currency?: string;
  description?: string;
}

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('subscribe')
  @UseGuards(RbacGuard)
  @Roles('admin')
  async subscribe(@TenantId() tenantId: number, @Body() body: SubscribeDto) {
    const { email, payment_method_id, price_id } = body;
    if (!email) {
      throw new BadRequestException('Email is required for subscription');
    }
    return this.billingService.createSubscription(tenantId, email, payment_method_id, price_id);
  }

  @Post('charge')
  @UseGuards(RbacGuard)
  @Roles('admin')
  async charge(@TenantId() tenantId: number, @Body() body: ChargeDto) {
    const { amount, currency, description } = body;
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    return this.billingService.chargeTenant(tenantId, amount, currency || 'usd', description);
  }

  @Get('account')
  @UseGuards(RbacGuard)
  @Roles('admin', 'merchant', 'producer', 'bank')
  async account(@TenantId() tenantId: number) {
    return this.billingService.getBillingAccount(tenantId);
  }

  @Get('invoices')
  @UseGuards(RbacGuard)
  @Roles('admin', 'merchant', 'producer', 'bank')
  async invoices(@TenantId() tenantId: number) {
    return this.billingService.listInvoices(tenantId);
  }

  @Post('cancel')
  @UseGuards(RbacGuard)
  @Roles('admin')
  async cancelSubscription(@TenantId() tenantId: number) {
    return this.billingService.cancelSubscription(tenantId);
  }

  @Post('webhook')
  async webhook(@Headers('stripe-signature') signature: string, @Req() req: any) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }
    const payload = req.rawBody || req.body;
    const bodyBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload));
    return this.billingService.handleWebhook(signature, bodyBuffer);
  }
}
