import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('credit_proposals')
export class TestCreditProposal {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @Column({ length: 20, default: 'draft' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
