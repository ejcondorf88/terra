import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Plot } from './plot.entity';

@Entity('esg_reports')
export class EsgReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  tenant_id!: number;

  @Column()
  plot_id!: number;

  @Column({ type: 'date', nullable: true })
  report_date!: Date;

  @Column({ type: 'int', nullable: true })
  score!: number;

  @Column({ length: 50, nullable: true })
  category!: string;

  @Column({ type: 'text', nullable: true })
  details!: string;

  @Column({ type: 'text', nullable: true })
  report_uri!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Plot, plot => plot.esgReports)
  @JoinColumn({ name: 'plot_id' })
  plot!: Plot;
}
