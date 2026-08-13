import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Plot } from './plot.entity';

@Entity('satellite_validations')
export class SatelliteValidation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  plot_id!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ndvi!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  forest_cover_percentage!: number;

  @Column({ nullable: true })
  recent_deforestation_detected!: boolean;

  @Column({ type: 'date', nullable: true })
  deforestation_review_date!: Date;

  @Column({ length: 32 })
  source!: string;

  @Column({ type: 'text', nullable: true })
  details!: string;

  @Column({ type: 'date', nullable: true })
  range_start!: Date;

  @Column({ type: 'date', nullable: true })
  range_end!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Plot, plot => plot.eudrRegistries)
  @JoinColumn({ name: 'plot_id' })
  plot!: Plot;
}
