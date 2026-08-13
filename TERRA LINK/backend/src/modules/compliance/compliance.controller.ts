import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { RegisterEudrDto } from './dto/register-eudr.dto';
import { GenerateEsgReportDto } from './dto/generate-esg-report.dto';
import { SatelliteValidationDto } from './dto/satellite-validation.dto';
import { AlertsSummaryDto } from './dto/alerts-summary.dto';

@Controller('compliance')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('certifications')
  @Roles('admin', 'exportador')
  async createCertification(@Body() dto: CreateCertificationDto) {
    return this.complianceService.createCertification(dto);
  }

  @Get('certifications/:id')
  @Roles('admin', 'banco', 'exportador')
  async findCertification(@Param('id', ParseIntPipe) id: number) {
    return this.complianceService.findCertification(id);
  }

  @Get('certifications')
  @Roles('admin')
  async findAllCertifications() {
    return this.complianceService.findAllCertifications();
  }

  @Post('eudr')
  @Roles('admin', 'exportador')
  async registerEudr(@Body() dto: RegisterEudrDto) {
    return this.complianceService.registerEudr(dto);
  }

  @Get('eudr/:traceId')
  @Roles('admin', 'banco', 'exportador')
  async getEudrStatus(@Param('traceId') traceId: string) {
    return this.complianceService.getEudrStatus(traceId);
  }

  @Post('eudr/:traceId/sync')
  @Roles('admin', 'banco', 'exportador')
  async syncEudr(@Param('traceId') traceId: string) {
    return this.complianceService.syncEudr(traceId);
  }

  @Post('satellite-validation')
  @Roles('admin', 'productor')
  async validateSatellite(@Body() dto: SatelliteValidationDto) {
    const validationResult = await this.complianceService.validateSatellite(dto);
    return { validationResult };
  }

  @Post('esg-reports')
  @Roles('admin', 'banco')
  async generateEsgReport(@Body() dto: GenerateEsgReportDto) {
    return this.complianceService.generateEsgReport(dto);
  }

  @Get('alerts-dashboard')
  @Roles('admin', 'banco', 'productor')
  async getAlertsDashboard(@Req() req: Request & { user?: { tenantId?: number } }): Promise<AlertsSummaryDto> {
    const tenantId = req.user?.tenantId;
    return this.complianceService.buildAlertsDashboard(tenantId);
  }

  @Get('esg-reports/:id')
  @Roles('admin', 'banco', 'exportador')
  async findEsgReport(@Param('id', ParseIntPipe) id: number) {
    return this.complianceService.findEsgReport(id);
  }
}
