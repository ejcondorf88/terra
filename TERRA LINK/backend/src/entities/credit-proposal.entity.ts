import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NftMetadata } from './nft-metadata.entity';

@Entity('credit_proposals')
export class CreditProposal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  tenant_id!: number;

  @Column({ length: 255 })
  token_id!: string;

  @Column()
  borrower_id!: number;

  @Column('decimal', { precision: 15, scale: 2 })
  requested_amount!: number;

  @Column({ nullable: true })
  duration_months!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  interest_rate!: number;

  @Column({ length: 20, default: 'USDC' })
  stablecoin!: string;

  @Column({ length: 20, default: 'draft' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => NftMetadata)
  @JoinColumn({ name: 'token_id' })
  nft!: NftMetadata;
}
