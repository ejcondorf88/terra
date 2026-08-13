import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('satellite_validations')
export class TestSatelliteValidation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  plot_id!: number;

  @Column('decimal', { precision: 5, scale: 2 })
  ndvi!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  forest_cover_percentage!: number;

  @Column({ default: false })
  recent_deforestation_detected!: boolean;

  @Column({ type: 'datetime', nullable: true })
  deforestation_review_date?: Date;

  @Column({ length: 50 })
  source!: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'datetime', nullable: true })
  range_start?: Date;

  @Column({ type: 'datetime', nullable: true })
  range_end?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
