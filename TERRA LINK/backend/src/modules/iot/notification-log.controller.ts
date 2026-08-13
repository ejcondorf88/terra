import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { NotificationLogService } from './notification-log.service';

@Controller('iot/notifications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class NotificationLogController {
  constructor(private readonly logService: NotificationLogService) {}

  @Get('logs')
  @Roles('admin', 'banco', 'productor', 'exportador')
  async getLogs(@Req() req: { user?: { tenantId?: number } }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return [];
    }

    return this.logService.findByTenant(tenantId);
  }
}
