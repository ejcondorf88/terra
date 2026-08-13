import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 255, nullable: true })
  domain?: string;

  @Column({ length: 255, nullable: true })
  sector?: string;

  @Column({ length: 255, nullable: true })
  contactEmail?: string;

  @CreateDateColumn()
  created_at!: Date;
}
