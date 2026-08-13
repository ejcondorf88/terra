import { Controller, Get, Param, Patch, Post, Body, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { IoTService } from './iot.service';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { CreateIoTAlertDto } from './dto/create-iot-alert.dto';
import type { TerraJwtPayload } from '@terra/shared/auth';
import type { Request } from 'express';

@Controller('iot/alerts')
@UseGuards(JwtAuthGuard, RbacGuard)
export class IoTAlertController {
  constructor(private readonly iotService: IoTService) {}

  @Get()
  @Roles('admin', 'productor', 'banco')
  async findAll(
    @Req() req: Request & { user?: TerraJwtPayload },
    @Query('plotId') plotIdStr?: string,
    @Query('tenantId') tenantIdStr?: string,
    @Query('unresolvedOnly') unresolvedOnly = 'true',
  ) {
    const plotId = plotIdStr ? Number.parseInt(plotIdStr, 10) : undefined;
    let tenantId = tenantIdStr ? Number.parseInt(tenantIdStr, 10) : undefined;
    const onlyUnresolved = unresolvedOnly === 'true';

    // If the request carries an authenticated user with tenantId, enforce tenant scoping
    const userTenant = req.user?.tenantId;
    const userRole = req.user?.role || (req.user as any)?.rol;
    if (userTenant && userRole !== 'admin') {
      tenantId = userTenant;
    }

    return this.iotService.getAlerts({ plotId, tenantId, unresolvedOnly: onlyUnresolved });
  }

  @Get(':id')
  @Roles('admin', 'productor')
  async findOne(@Req() req: Request & { user?: TerraJwtPayload }, @Param('id') id: string) {
    const alertId = Number.parseInt(id, 10);
    const alert = await this.iotService.findAlertById(alertId);
    const userTenant = req.user?.tenantId;
    const userRole = req.user?.role || (req.user as any)?.rol;
    if (userTenant && userRole !== 'admin' && alert.tenantId && alert.tenantId !== userTenant) {
      throw new ForbiddenException('Access to this alert is forbidden');
    }
    return alert;
  }

  @Post()
  @Roles('admin', 'productor')
  async create(@Body() dto: CreateIoTAlertDto) {
    return this.iotService.createAlert(dto);
  }

  @Patch(':id/resolve')
  @Roles('admin', 'productor')
  async resolve(@Req() req: Request & { user?: TerraJwtPayload }, @Param('id') id: string) {
    const alertId = Number.parseInt(id, 10);
    const alert = await this.iotService.findAlertById(alertId);
    const userTenant = req.user?.tenantId;
    const userRole = req.user?.role || (req.user as any)?.rol;
    if (userTenant && userRole !== 'admin' && alert.tenantId && alert.tenantId !== userTenant) {
      throw new ForbiddenException('Access to resolve this alert is forbidden');
    }
    return this.iotService.resolveAlert(alertId);
  }
}
