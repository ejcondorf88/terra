import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('iot_readings')
export class IoTReading {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int', nullable: true })
  plotId!: number | null;

  @Index()
  @Column({ type: 'int', nullable: true })
  tenantId!: number | null;

  @Column({ type: 'datetime', nullable: false })
  timestamp!: Date;

  @Column({ type: 'float', nullable: true })
  humidity?: number;

  @Column({ type: 'float', nullable: true })
  temperature?: number;

  @Column({ type: 'float', nullable: true })
  ph?: number;

  @Column({ type: 'simple-json', nullable: true })
  pests?: any;

  @Column({ type: 'float', nullable: true })
  ndvi?: number;

  @Column({ type: 'float', nullable: true })
  biomass?: number;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
