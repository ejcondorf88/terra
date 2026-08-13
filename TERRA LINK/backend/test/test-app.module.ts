import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestPlot } from './entities/test-plot.entity';
import { TestNftMetadata } from './entities/test-nft-metadata.entity';
import { TestCreditProposal } from './entities/test-credit-proposal.entity';
import { TestSatelliteValidation } from './entities/test-satellite-validation.entity';
import { TestGeoModule } from './modules/test-geo.module';
import { TestNftModule } from './modules/test-nft.module';
import { TestCreditModule } from './modules/test-credit.module';
import { TestComplianceModule } from './modules/test-compliance.module';
import { IoTModule } from '../src/modules/iot/iot.module';
import { IoTReading } from '../src/modules/iot/entities/iot-reading.entity';
import { ClimateData } from '../src/modules/iot/entities/climate-data.entity';
import { IoTAlert } from '../src/modules/iot/entities/iot-alert.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [
        TestPlot,
        TestNftMetadata,
        TestCreditProposal,
        TestSatelliteValidation,
        IoTReading,
        ClimateData,
        IoTAlert,
      ],
      synchronize: true,
      dropSchema: true,
      logging: false,
    }),
    TestGeoModule,
    TestNftModule,
    TestCreditModule,
    TestComplianceModule,
    IoTModule,
  ],
})
export class TestAppModule {}
