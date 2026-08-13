import { Body, Controller, Post, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { ComplianceService } from './compliance.service';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Controller('certifications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class CertificationController {
  constructor(private readonly service: ComplianceService) {}

  @Post()
  @Roles('admin', 'exportador')
  create(@Body() dto: CreateCertificationDto) {
    return this.service.createCertification(dto as any);
  }

  @Get(':id')
  @Roles('admin', 'banco', 'exportador')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findCertification(id);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.service.findAllCertifications();
  }
}
