import { Body, Controller, Delete, Get, Param, Post, UseGuards, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Roles, RbacGuard, TenantId } from '@terra/shared/auth';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

class CreateTenantDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sector?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;
}

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async createTenant(@Body() body: CreateTenantDto) {
    const { name, domain, sector, contactEmail } = body;
    if (!name) {
      throw new BadRequestException('Tenant name is required');
    }
    return this.tenantService.createTenant(name, domain, sector, contactEmail);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles('admin')
  async getTenant(@TenantId() tenantId: number, @Param('id') id: string) {
    const requestedId = parseInt(id, 10);
    if (Number.isNaN(requestedId)) {
      throw new BadRequestException('Invalid tenant ID');
    }
    if (tenantId !== requestedId) {
      throw new ForbiddenException('Access denied to tenant data');
    }
    return this.tenantService.findTenantById(requestedId);
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles('admin')
  async deleteTenant(@TenantId() tenantId: number, @Param('id') id: string) {
    const requestedId = parseInt(id, 10);
    if (Number.isNaN(requestedId)) {
      throw new BadRequestException('Invalid tenant ID');
    }
    if (tenantId !== requestedId) {
      throw new ForbiddenException('Access denied to tenant data');
    }
    await this.tenantService.deleteTenant(requestedId);
    return { success: true };
  }
}
