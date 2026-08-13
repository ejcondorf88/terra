import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantNotificationSettingsController } from './tenant-notification-settings.controller';
import { TenantNotificationSettingsService } from './tenant-notification-settings.service';
import { Tenant } from '../../entities/tenant.entity';
import { TenantNotificationSetting } from '../../entities/tenant-notification-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantNotificationSetting])],
  controllers: [TenantController, TenantNotificationSettingsController],
  providers: [TenantService, TenantNotificationSettingsService],
  exports: [TenantService, TenantNotificationSettingsService],
})
export class TenantModule {}
