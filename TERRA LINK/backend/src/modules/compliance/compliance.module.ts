import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { CertificationController } from './certification.controller';
import { EudrRegistryController } from './eudr-registry.controller';
import { EsgReportController } from './esg-report.controller';
import { Certification } from '../../entities/certification.entity';
import { EudrRegistry } from '../../entities/eudr-registry.entity';
import { EsgReport } from '../../entities/esg-report.entity';
import { Plot } from '../../entities/plot.entity';
import { SatelliteValidation } from '../../entities/satellite-validation.entity';
import { AuthModule } from '../auth/auth.module';
import { TraceAdapter } from './adapters/trace.adapter';
import { GuiAdapterService } from './adapters/gui.adapter';
import { MagAdapterService } from './adapters/mag.adapter';
import { SatelliteAdapterService } from './services/satellite.adapter';
import { SatelliteValidationService } from './services/satellite-validation.service';
import { TraceService } from './services/trace.service';
import { IoTModule } from '../iot/iot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certification, EudrRegistry, EsgReport, Plot, SatelliteValidation]),
    AuthModule,
    IoTModule,
  ],
  providers: [
    ComplianceService,
    TraceAdapter,
    TraceService,
    GuiAdapterService,
    MagAdapterService,
    SatelliteAdapterService,
    SatelliteValidationService,
  ],
  controllers: [
    ComplianceController,
    CertificationController,
    EudrRegistryController,
    EsgReportController,
  ],
  exports: [
    ComplianceService,
    TraceService,
    GuiAdapterService,
    MagAdapterService,
    SatelliteAdapterService,
    SatelliteValidationService,
  ],
})
export class ComplianceModule {}
