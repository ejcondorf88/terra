import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('iot_alerts')
export class IoTAlert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  plotId!: number | null;

  @Index()
  @Column({ type: 'int', nullable: true })
  tenantId!: number | null;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  message!: string;

  @Column({ type: 'double precision', nullable: true })
  value?: number;

  @Column({ type: 'double precision', nullable: true })
  threshold?: number;

  @Column({ type: 'varchar', length: 20, default: 'low' })
  severity!: string;

  @Column({ type: 'boolean', default: false })
  resolved!: boolean;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
