import { Body, Controller, ForbiddenException, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { TenantNotificationSettingsService } from './tenant-notification-settings.service';
import { UpdateTenantNotificationSettingsDto } from './dto/update-tenant-notification-settings.dto';
import { TenantId, Roles, RbacGuard } from '@terra/shared/auth';

@Controller('tenants/:tenantId/notification-settings')
@UseGuards(RbacGuard)
export class TenantNotificationSettingsController {
  constructor(
    private readonly settingsService: TenantNotificationSettingsService,
  ) {}

  @Get()
  @Roles('admin')
  async getSettings(@TenantId() tenantId: number, @Param('tenantId') paramTenantId: string) {
    if (tenantId !== Number(paramTenantId)) {
      throw new ForbiddenException('Access denied');
    }
    return this.settingsService.findByTenantId(tenantId);
  }

  @Patch()
  @Roles('admin')
  async updateSettings(
    @TenantId() tenantId: number,
    @Param('tenantId') paramTenantId: string,
    @Body() dto: UpdateTenantNotificationSettingsDto,
  ) {
    if (tenantId !== Number(paramTenantId)) {
      throw new ForbiddenException('Access denied');
    }
    return this.settingsService.upsertSettings(tenantId, dto);
  }
}
