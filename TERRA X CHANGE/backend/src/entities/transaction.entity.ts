import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletId!: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;

  @Column()
  type!: string; // transfer, stake, etc.

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount!: string;

  @Column({ nullable: true })
  toAddress?: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  txHash?: string;

  @CreateDateColumn()
  createdAt!: Date;
}