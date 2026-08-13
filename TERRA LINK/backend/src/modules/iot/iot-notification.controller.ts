import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { IoTAlertNotificationService } from './iot-alert-notification.service';

@Controller('iot/notifications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class IoTNotificationController {
  constructor(private readonly notificationService: IoTAlertNotificationService) {}

  @Get('settings')
  @Roles('admin', 'banco', 'productor', 'exportador')
  async getSettings(@Req() req: { user?: { tenantId?: number } }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return { channel: 'slack', severityThreshold: 'high', target: '' };
    }

    return this.notificationService.getSettings(tenantId);
  }

  @Put('settings')
  @Roles('admin', 'banco', 'productor', 'exportador')
  async updateSettings(@Req() req: { user?: { tenantId?: number } }, @Body() body: { channel?: string; severityThreshold?: string; target?: string }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return { saved: false, message: 'tenantId is required' };
    }

    return this.notificationService.saveSettings(tenantId, body);
  }
}
