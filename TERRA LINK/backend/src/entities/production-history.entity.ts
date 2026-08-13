import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Plot } from './plot.entity';

@Entity('production_history')
export class ProductionHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  plot_id!: number;

  @Column({ nullable: true })
  tenant_id!: number;

  @Column()
  year!: number;

  @Column({ length: 100, nullable: true })
  crop_type!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  yield_kg!: number;

  @Column({ nullable: true })
  quality_score!: number;

  @CreateDateColumn()
  recorded_at!: Date;

  @ManyToOne(() => Plot, plot => plot.productionHistory)
  @JoinColumn({ name: 'plot_id' })
  plot!: Plot;
}
