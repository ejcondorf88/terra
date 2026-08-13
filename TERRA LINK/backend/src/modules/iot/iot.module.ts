import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTService } from './iot.service';
import { IoTController } from './iot.controller';
import { IoTAlertController } from './iot-alert.controller';
import { IoTReading } from './entities/iot-reading.entity';
import { ClimateData } from './entities/climate-data.entity';
import { IoTAlert } from './entities/iot-alert.entity';
import { ClimateApiService } from './adapters/climate-api.service';
import { IoTAlertNotificationService } from './iot-alert-notification.service';
import { IoTNotificationController } from './iot-notification.controller';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';
import { NotificationLog } from '../../entities/notification-log.entity';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([IoTReading, ClimateData, IoTAlert, NotificationLog]), AuthModule, TenantModule],
  controllers: [IoTController, IoTAlertController, IoTNotificationController, NotificationLogController],
  providers: [IoTService, ClimateApiService, IoTAlertNotificationService, NotificationLogService],
  exports: [IoTService, ClimateApiService, IoTAlertNotificationService, NotificationLogService],
})
export class IoTModule {}
