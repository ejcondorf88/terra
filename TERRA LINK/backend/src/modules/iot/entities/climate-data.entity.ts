import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('climate_data')
export class ClimateData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  plotId!: number | null;

  @Index()
  @Column({ type: 'int', nullable: true })
  tenantId!: number | null;

  @Column({ type: 'varchar', length: 100 })
  provider!: string;

  @Column({ type: 'datetime', nullable: false })
  timestamp!: Date;

  @Column({ type: 'simple-json', nullable: false })
  data: any;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
