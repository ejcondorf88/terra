import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nft_metadata')
export class TestNftMetadata {
  @PrimaryColumn({ length: 255 })
  token_id!: string;

  @Column({ nullable: true })
  plot_id!: number;

  @Column({ type: 'text', nullable: true })
  geolocation!: string;

  @Column('text', { array: true, nullable: true })
  certifications!: string[];

  @Column({ type: 'text', nullable: true })
  production_history_uri!: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  valuation!: number;

  @Column({ nullable: true })
  risk_score!: number;

  @Column({ default: 1 })
  fraction_count!: number;

  @Column({ default: false })
  collateralized!: boolean;

  @UpdateDateColumn()
  last_updated!: Date;
}
