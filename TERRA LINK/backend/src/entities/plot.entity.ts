import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Certification } from './certification.entity';
import { ProductionHistory } from './production-history.entity';
import { EudrRegistry } from './eudr-registry.entity';
import { EsgReport } from './esg-report.entity';
import { SatelliteValidation } from './satellite-validation.entity';

@Entity('plots')
export class Plot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  tenant_id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column()
  owner_id!: number;

  @Column({ length: 50, nullable: true })
  certification!: string;

  @Column('geometry', { spatialFeatureType: 'Polygon', srid: 4326 })
  geom!: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  valuation!: number;

  @Column({ length: 255, nullable: true })
  nft_token!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Certification, certification => certification.plot)
  certifications!: Certification[];

  @OneToMany(() => ProductionHistory, history => history.plot)
  productionHistory!: ProductionHistory[];

  @OneToMany(() => EudrRegistry, registry => registry.plot)
  eudrRegistries!: EudrRegistry[];

  @OneToMany(() => EsgReport, report => report.plot)
  esgReports!: EsgReport[];

  @OneToMany(() => SatelliteValidation, validation => validation.plot)
  satelliteValidations!: SatelliteValidation[];
}
