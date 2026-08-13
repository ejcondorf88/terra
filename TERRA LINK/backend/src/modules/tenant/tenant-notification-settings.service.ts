import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantNotificationSetting } from '../../entities/tenant-notification-setting.entity';
import { UpdateTenantNotificationSettingsDto } from './dto/update-tenant-notification-settings.dto';

@Injectable()
export class TenantNotificationSettingsService {
  constructor(
    @InjectRepository(TenantNotificationSetting)
    private readonly notificationSettingsRepo: Repository<TenantNotificationSetting>,
  ) {}

  async findByTenantId(tenantId: number): Promise<TenantNotificationSetting | null> {
    return this.notificationSettingsRepo.findOne({ where: { tenantId } });
  }

  async upsertSettings(
    tenantId: number,
    dto: UpdateTenantNotificationSettingsDto,
  ): Promise<TenantNotificationSetting> {
    let settings = await this.findByTenantId(tenantId);
    if (!settings) {
      settings = this.notificationSettingsRepo.create({
        tenantId,
        channel: dto.channel ?? 'slack',
        severityThreshold: dto.severityThreshold ?? 'high',
        target: dto.target ?? undefined,
      });
    } else {
      settings.channel = dto.channel ?? settings.channel;
      settings.severityThreshold = dto.severityThreshold ?? settings.severityThreshold;
      settings.target = dto.target ?? settings.target;
    }
    return this.notificationSettingsRepo.save(settings);
  }
}
