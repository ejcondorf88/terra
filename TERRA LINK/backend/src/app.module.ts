import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditModule } from './modules/credit/credit.module';
import { CreditSmartContractModule } from './modules/credit-smart-contract/credit-smart-contract.module';
import { GeoModule } from './modules/geo/geo.module';
import { NftModule } from './modules/nft/nft.module';
import { UserModule } from './modules/user/user.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { BillingModule } from './modules/billing/billing.module';
import { PlotModule } from './modules/plot/plot.module';
import { Plot } from './entities/plot.entity';
import { Certification } from './entities/certification.entity';
import { ProductionHistory } from './entities/production-history.entity';
import { NftMetadata } from './entities/nft-metadata.entity';
import { CreditProposal } from './entities/credit-proposal.entity';
import { Tenant } from './entities/tenant.entity';
import { User } from './entities/user.entity';
import { BillingAccount } from './entities/billing-account.entity';
import { EudrRegistry } from './entities/eudr-registry.entity';
import { EsgReport } from './entities/esg-report.entity';
import { SatelliteValidation } from './entities/satellite-validation.entity';
import { IoTReading } from './modules/iot/entities/iot-reading.entity';
import { ClimateData } from './modules/iot/entities/climate-data.entity';
import { IoTAlert } from './modules/iot/entities/iot-alert.entity';
import { IoTModule } from './modules/iot/iot.module';
import { TenantNotificationSetting } from './entities/tenant-notification-setting.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { ComplianceModule } from './modules/compliance/compliance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'terra_link',
      entities: [
        Plot,
        Certification,
        ProductionHistory,
        NftMetadata,
        CreditProposal,
        Tenant,
        User,
        BillingAccount,
        EudrRegistry,
        EsgReport,
        SatelliteValidation,
        IoTReading,
        ClimateData,
        IoTAlert,
        TenantNotificationSetting,
        NotificationLog,
      ],
      synchronize: false, // Use migrations in production
      logging: true,
    }),
    GeoModule,
    NftModule,
    PlotModule,
    CreditModule,
    CreditSmartContractModule,
    UserModule,
    TenantModule,
    BillingModule,
    ComplianceModule,
    IoTModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Lazy import to avoid circulars
    const { TenantMiddleware } = require('./middleware/tenant.middleware');
    consumer.apply(TenantMiddleware).forRoutes('{*splat}');
  }
}

