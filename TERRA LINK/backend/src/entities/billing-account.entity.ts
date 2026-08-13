import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('billing_accounts')
export class BillingAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tenant_id!: number;

  @Column({ length: 255 })
  stripe_customer_id!: string;

  @Column({ length: 255, nullable: true })
  stripe_subscription_id!: string;

  @Column({ length: 50, default: 'pending' })
  status!: string;

  @Column({ length: 255, nullable: true })
  price_id?: string;

  @Column({ type: 'timestamptz', nullable: true })
  current_period_end?: Date;

  @Column({ length: 255, nullable: true })
  latest_invoice_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
