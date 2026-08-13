import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Tenant } from './tenant.entity';
import { IoTAlert } from '../modules/iot/entities/iot-alert.entity';

export type NotificationChannel = 'slack' | 'teams' | 'email' | 'sms';
export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  tenant!: Tenant | null;

  @Index()
  @ManyToOne(() => IoTAlert, { onDelete: 'SET NULL', nullable: true })
  alert!: IoTAlert | null;

  @Column({ type: 'varchar', length: 20 })
  channel!: NotificationChannel;

  @Column({ type: 'varchar', length: 20 })
  severity!: NotificationSeverity;

  @Column({ type: 'text' })
  target!: string;

  @Column({ type: 'boolean', default: true })
  success!: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ type: 'datetime' })
  sentAt!: Date;
}
