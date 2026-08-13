import { Body, Controller, Post, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { ComplianceService } from './compliance.service';
import { GenerateEsgReportDto } from './dto/generate-esg-report.dto';

@Controller('esg-reports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class EsgReportController {
  constructor(private readonly service: ComplianceService) {}

  @Post()
  @Roles('admin', 'banco')
  generate(@Body() dto: GenerateEsgReportDto) {
    return this.service.generateEsgReport(dto as any);
  }

  @Get(':id')
  @Roles('admin', 'banco', 'exportador')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findEsgReport(id);
  }
}
