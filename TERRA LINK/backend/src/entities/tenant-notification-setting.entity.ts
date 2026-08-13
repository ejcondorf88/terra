import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type NotificationChannel = 'slack' | 'teams' | 'email';
export type NotificationSeverityThreshold = 'low' | 'medium' | 'high' | 'critical';

@Entity('tenant_notification_settings')
export class TenantNotificationSetting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'int' })
  tenantId!: number;

  @Column({ type: 'varchar', length: 20, default: 'slack' })
  channel!: NotificationChannel;

  @Column({ type: 'varchar', length: 20, default: 'high' })
  severityThreshold!: NotificationSeverityThreshold;

  @Column({ type: 'varchar', length: 512, nullable: true })
  target?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
