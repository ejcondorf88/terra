import { Controller, Post, Body, BadRequestException, Get, UseGuards, Request, ValidationPipe, HttpException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService, LoginDto } from './auth.service';
import { CreateUserDto } from '../users/users.service';
import { JwtAuthGuard } from '@terra/shared/auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body(new ValidationPipe({ whitelist: true, transform: true })) createUserDto: CreateUserDto) {
    try {
      return await this.authService.register(createUserDto);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error?.message ?? 'Invalid request');
    }
  }

  @Post('login')
  async login(@Body(new ValidationPipe({ whitelist: true, transform: true })) loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error?.message ?? 'Invalid request');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: ExpressRequest) {
    return this.authService.validateUser(req.user.id, req.user.email);
  }
}
