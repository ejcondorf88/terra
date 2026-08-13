import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plots')
export class TestPlot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column()
  owner_id!: number;

  @Column({ length: 50, nullable: true })
  certification!: string;

  @Column('text')
  geom!: string; // Store as WKT string for testing

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  valuation!: number;

  @Column({ length: 255, nullable: true })
  nft_token!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
