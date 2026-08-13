import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Plot } from './plot.entity';

@Entity('eudr_registry')
export class EudrRegistry {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  tenant_id!: number;

  @Column()
  plot_id!: number;

  @Column({ length: 100, nullable: true })
  registry_number!: string;

  @Column({ length: 50, nullable: true })
  compliance_status!: string;

  @Column({ length: 100, nullable: true })
  source!: string;

  @Column({ length: 100, nullable: true })
  trace_id!: string;

  @Column({ length: 50, nullable: true })
  eori_number?: string;

  @Column({ length: 150, nullable: true })
  operator_name?: string;

  @Column({ nullable: true })
  is_valid?: boolean;

  @Column({ length: 20, nullable: true })
  risk_level?: string;

  @Column({ type: 'timestamp', nullable: true })
  trace_registered_date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  trace_last_updated?: Date;

  @Column({ type: 'text', nullable: true })
  trace_url!: string;

  @Column({ type: 'text', nullable: true })
  issues!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Plot, plot => plot.eudrRegistries)
  @JoinColumn({ name: 'plot_id' })
  plot!: Plot;
}
