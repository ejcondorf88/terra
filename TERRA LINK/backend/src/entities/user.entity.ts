import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('users')
@Index(['tenant_id', 'username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tenant_id!: number;

  @Column({ length: 100 })
  username!: string;

  @Column({ length: 255 })
  email!: string;

  @Column({ length: 255 })
  password_hash!: string;

  @Column({ length: 50, default: 'user' })
  role!: 'admin' | 'producer' | 'bank' | 'merchant' | 'user';

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}
