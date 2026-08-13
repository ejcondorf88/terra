import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('stakes')
export class Stake {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletId!: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount!: string;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  rewards!: string;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}