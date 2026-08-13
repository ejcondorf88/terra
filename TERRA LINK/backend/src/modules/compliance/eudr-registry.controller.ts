import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RbacGuard } from '@terra/shared/auth';
import { ComplianceService } from './compliance.service';
import { RegisterEudrDto } from './dto/register-eudr.dto';

@Controller('eudr')
@UseGuards(JwtAuthGuard, RbacGuard)
export class EudrRegistryController {
  constructor(private readonly service: ComplianceService) {}

  @Post()
  @Roles('admin', 'exportador')
  register(@Body() dto: RegisterEudrDto) {
    return this.service.registerEudr(dto as any);
  }

  @Get(':traceId')
  @Roles('admin', 'banco', 'exportador')
  getStatus(@Param('traceId') traceId: string) {
    return this.service.getEudrStatus(traceId);
  }
}
