import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Plot } from './plot.entity';

@Entity('certifications')
export class Certification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 50 })
  standard!: string;

  @Column({ length: 100, nullable: true })
  issuer!: string;

  @Column({ type: 'date', nullable: true })
  valid_from!: Date;

  @Column({ type: 'date', nullable: true })
  valid_until!: Date;

  @Column()
  plot_id!: number;

  @Column({ nullable: true })
  tenant_id!: number;

  @ManyToOne(() => Plot, plot => plot.certifications)
  @JoinColumn({ name: 'plot_id' })
  plot!: Plot;
}
