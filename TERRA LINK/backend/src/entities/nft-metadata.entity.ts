import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Plot } from './plot.entity';

@Entity('nft_metadata')
export class NftMetadata {
  @PrimaryColumn({ length: 255 })
  token_id!: string;

  @Column({ nullable: true })
  tenant_id!: number;

  @Column({ nullable: true })
  plot_id!: number;

  @Column({ type: 'text', nullable: true })
  geolocation!: string;

  @Column('text', { array: true, nullable: true })
  certifications!: string[];

  @Column({ type: 'text', nullable: true })
  production_history_uri!: string;

  @Column({ type: 'text', nullable: true })
  token_uri!: string;

  @Column({ type: 'text', nullable: true })
  metadata_uri!: string;

  @Column({ length: 255, nullable: true })
  trace_id!: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  valuation!: number;

  @Column({ nullable: true })
  risk_score!: number;

  @Column({ default: 1 })
  fraction_count!: number;

  @Column({ default: false })
  collateralized!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  minted_at!: Date;

  @Column({ length: 255, nullable: true })
  transaction_hash!: string;

  @UpdateDateColumn()
  last_updated!: Date;

  @ManyToOne(() => Plot)
  @JoinColumn({ name: 'plot_id' })
  plot!: Plot;
}
