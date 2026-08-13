import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService, UserResponseDto } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<UserResponseDto | undefined> {
    return this.usersService.findById(parseInt(id));
  }

  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }
}
