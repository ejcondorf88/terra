import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ComplianceController } from '../../src/modules/compliance/compliance.controller';
import { ComplianceService } from '../../src/modules/compliance/compliance.service';
import { TraceService } from '../../src/modules/compliance/services/trace.service';
import { SatelliteAdapterService } from '../../src/modules/compliance/services/satellite.adapter';
import { Certification } from '../../src/entities/certification.entity';
import { EudrRegistry } from '../../src/entities/eudr-registry.entity';
import { EsgReport } from '../../src/entities/esg-report.entity';
import { Plot } from '../../src/entities/plot.entity';
import { SatelliteValidation } from '../../src/entities/satellite-validation.entity';
import { TestPlot } from '../entities/test-plot.entity';
import { TestSatelliteValidation } from '../entities/test-satellite-validation.entity';
import { JwtAuthGuard, RbacGuard } from '@terra/shared/auth';
import { IoTModule } from '../../src/modules/iot/iot.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestPlot, TestSatelliteValidation]), IoTModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    {
      provide: getRepositoryToken(Plot),
      useFactory: (connection: Connection) => connection.getRepository(TestPlot),
      inject: [Connection],
    },
    {
      provide: getRepositoryToken(SatelliteValidation),
      useFactory: (connection: Connection) => connection.getRepository(TestSatelliteValidation),
      inject: [Connection],
    },
    {
      provide: getRepositoryToken(Certification),
      useValue: {
        create: jest.fn().mockImplementation((payload) => ({ id: 1, ...payload })),
        save: jest.fn().mockImplementation((entity) => ({ id: 1, ...entity })),
        findOne: jest.fn(),
      },
    },
    {
      provide: getRepositoryToken(EudrRegistry),
      useValue: {
        create: jest.fn().mockImplementation((payload) => ({ id: 1, ...payload })),
        save: jest.fn().mockImplementation((entity) => ({ id: 1, ...entity })),
        findOne: jest.fn(),
      },
    },
    {
      provide: getRepositoryToken(EsgReport),
      useValue: {
        create: jest.fn().mockImplementation((payload) => ({ id: 1, ...payload })),
        save: jest.fn().mockImplementation((entity) => ({ id: 1, ...entity })),
        findOne: jest.fn(),
      },
    },
    {
      provide: TraceService,
      useValue: {
        registerOperatorEudr: jest.fn().mockResolvedValue({
          trace_id: 'T-1',
          registry_number: 'EUDR-1',
          plot_id: 1,
          validationDetails: 'ok',
        }),
        getTraceComplianceStatus: jest.fn(),
        syncWithTraces: jest.fn().mockResolvedValue({ synced: true }),
      },
    },
    {
      provide: SatelliteAdapterService,
      useValue: {
        validatePlot: async () => ({
          plotId: '1',
          ndvi: 0.85,
          forestCoverPercentage: 92.5,
          recentDeforestationDetected: false,
          source: 'sentinel',
          details: 'Satellite validation OK',
        }),
      },
    },
    {
      provide: JwtAuthGuard,
      useClass: JwtAuthGuard,
    },
    {
      provide: RbacGuard,
      useClass: RbacGuard,
    },
  ],
})
export class TestComplianceModule {}
