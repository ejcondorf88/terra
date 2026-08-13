import 'reflect-metadata';
import { DataSource } from 'typeorm';
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
import { IoTReading } from './modules/iot/entities/iot-reading.entity';
import { ClimateData } from './modules/iot/entities/climate-data.entity';
import { IoTAlert } from './modules/iot/entities/iot-alert.entity';
import { TenantNotificationSetting } from './entities/tenant-notification-setting.entity';
import { NotificationLog } from './entities/notification-log.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'terra_link',
  entities: [Plot, Certification, ProductionHistory, NftMetadata, CreditProposal, Tenant, User, BillingAccount, EudrRegistry, EsgReport, IoTReading, ClimateData, IoTAlert, TenantNotificationSetting, NotificationLog],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
