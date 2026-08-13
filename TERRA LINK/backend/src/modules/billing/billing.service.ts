import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { BillingAccount } from '../../entities/billing-account.entity';

@Injectable()
export class BillingService {
  private stripe: Stripe;
  private defaultPriceId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(BillingAccount)
    private readonly billingRepo: Repository<BillingAccount>,
  ) {
    const secret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secret) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(secret, { apiVersion: '2022-11-15' });
    this.defaultPriceId = this.configService.get<string>('STRIPE_PRICE_ID') || '';
  }

  async createSubscription(tenantId: number, email: string, paymentMethodId?: string, priceId?: string) {
    const resolvedPriceId = priceId || this.defaultPriceId;
    if (!resolvedPriceId) {
      throw new BadRequestException('Stripe price ID is required');
    }

    const existing = await this.billingRepo.findOne({ where: { tenant_id: tenantId } });
    if (existing && existing.stripe_subscription_id) {
      throw new BadRequestException('Tenant already has an active subscription');
    }

    const customer = await this.stripe.customers.create({
      email,
      metadata: { tenant_id: tenantId.toString() },
    });

    if (paymentMethodId) {
      await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
      await this.stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: resolvedPriceId }],
      expand: ['latest_invoice.payment_intent'],
      payment_behavior: 'default_incomplete',
      metadata: { tenant_id: tenantId.toString() },
    });

    const latestInvoiceId = typeof subscription.latest_invoice === 'string'
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id;

    const billingAccount = this.billingRepo.create({
      tenant_id: tenantId,
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      price_id: resolvedPriceId,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000),
      latest_invoice_id: latestInvoiceId,
    });

    await this.billingRepo.save(billingAccount);

    const paymentIntent = typeof subscription.latest_invoice !== 'string' && subscription.latest_invoice?.payment_intent
      ? subscription.latest_invoice.payment_intent
      : undefined;

    const clientSecret = paymentIntent && typeof paymentIntent !== 'string' ? paymentIntent.client_secret : undefined;

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
      priceId: resolvedPriceId,
    };
  }

  async chargeTenant(tenantId: number, amount: number, currency = 'usd', description?: string) {
    const account = await this.billingRepo.findOne({ where: { tenant_id: tenantId } });
    if (!account) {
      throw new NotFoundException('Billing account not found for tenant');
    }
    if (!account.stripe_customer_id) {
      throw new BadRequestException('Stripe customer not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: account.stripe_customer_id,
      description,
      metadata: { tenant_id: tenantId.toString() },
      confirm: false,
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    };
  }

  async listInvoices(tenantId: number) {
    const account = await this.billingRepo.findOne({ where: { tenant_id: tenantId } });
    if (!account) {
      throw new NotFoundException('Billing account not found for tenant');
    }
    return this.stripe.invoices.list({ customer: account.stripe_customer_id, limit: 20 });
  }

  async getBillingAccount(tenantId: number) {
    const account = await this.billingRepo.findOne({ where: { tenant_id: tenantId } });
    if (!account) {
      throw new NotFoundException('Billing account not found for tenant');
    }
    return account;
  }

  async cancelSubscription(tenantId: number) {
    const account = await this.billingRepo.findOne({ where: { tenant_id: tenantId } });
    if (!account || !account.stripe_subscription_id) {
      throw new NotFoundException('Active subscription not found for tenant');
    }

    const canceled = await this.stripe.subscriptions.del(account.stripe_subscription_id);
    account.status = canceled.status;
    account.current_period_end = canceled.current_period_end ? new Date(canceled.current_period_end * 1000) : account.current_period_end;
    await this.billingRepo.save(account);

    return {
      subscriptionId: canceled.id,
      status: canceled.status,
      canceledAt: canceled.canceled_at ? new Date(canceled.canceled_at * 1000) : null,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      throw new BadRequestException(`Stripe webhook signature verification failed: ${err}`);
    }

    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
      case 'customer.subscription.updated':
        await this.updateBillingFromStripeEvent(event);
        break;
      default:
        break;
    }

    return { received: true };
  }

  private async updateBillingFromStripeEvent(event: Stripe.Event) {
    if (event.type === 'customer.subscription.updated') {
      const object = event.data.object as { type?: string };
      if (object?.type === 'subscription') {
        const subscription = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionStatus(subscription);
        return;
      }
    }

    if (event.type.startsWith('invoice.')) {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | undefined;
      if (!subscriptionId) return;
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      await this.updateSubscriptionStatus(subscription);
    }
  }

  private async updateSubscriptionStatus(subscription: Stripe.Subscription) {
    const tenantId = parseInt(subscription.metadata?.tenant_id || '', 10);
    if (Number.isNaN(tenantId)) {
      return;
    }
    const account = await this.billingRepo.findOne({ where: { tenant_id: tenantId } });
    if (!account) {
      return;
    }
    account.status = subscription.status;
    account.current_period_end = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : account.current_period_end;
    account.latest_invoice_id = typeof subscription.latest_invoice === 'string'
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id;
    await this.billingRepo.save(account);
  }
}
