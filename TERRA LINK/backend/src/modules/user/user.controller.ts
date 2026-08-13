import { Controller, Post, Get, Patch, Delete, Body, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TenantId, Roles, RbacGuard } from '@terra/shared/auth';

export class CreateUserDto {
  username!: string;
  email!: string;
  password!: string;
  role?: 'admin' | 'producer' | 'bank' | 'merchant' | 'user';
}

export class UpdateRoleDto {
  role!: string;
}

@Controller('users')
@UseGuards(RbacGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  async createUser(@TenantId() tenantId: number, @Body() body: CreateUserDto) {
    const { username, email, password, role } = body;
    if (!username || !email || !password) {
      throw new BadRequestException('Missing required fields');
    }
    return this.userService.createUser(tenantId, username, email, password, role);
  }

  @Get()
  @Roles('admin', 'user')
  async listUsers(@TenantId() tenantId: number) {
    return this.userService.listUsersByTenant(tenantId);
  }

  @Patch(':userId/role')
  @Roles('admin')
  async updateRole(@TenantId() tenantId: number, @Param('userId') userId: string, @Body() body: UpdateRoleDto) {
    const uid = parseInt(userId, 10);
    if (Number.isNaN(uid)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.userService.updateUserRole(tenantId, uid, body.role);
  }

  @Delete(':userId')
  @Roles('admin')
  async deactivateUser(@TenantId() tenantId: number, @Param('userId') userId: string) {
    const uid = parseInt(userId, 10);
    if (Number.isNaN(uid)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.userService.deactivateUser(tenantId, uid);
  }
}
