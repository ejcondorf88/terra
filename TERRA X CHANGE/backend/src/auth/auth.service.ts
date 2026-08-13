import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { TerraJwtPayload } from '@terra/shared/auth';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';

function toTokenPayload(user: Pick<User, 'id' | 'email' | 'role'>): TerraJwtPayload {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<{ user: User; token: string }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: 'user',
    });

    const savedUser = await this.userRepository.save(user);
    const token = this.jwtService.sign(toTokenPayload(savedUser));

    return { user: savedUser, token };
  }

  async login(email: string, password: string): Promise<{ token?: string; requiresMFA?: boolean; userId?: string; message?: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    if (user.mfaSecret) {
      return {
        requiresMFA: true,
        userId: user.id,
        message: 'MFA verification required',
      };
    }

    const token = this.jwtService.sign(toTokenPayload(user));
    return { token };
  }

  async setupMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `TERRA X CHANGE (${userId})`,
      issuer: 'TERRA X CHANGE',
      length: 32,
    });

    // Save secret to user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.mfaSecret = secret.base32;
      await this.userRepository.save(user);
    }

    return { secret: secret.base32, qrCode: secret.otpauth_url || '' };
  }

  async verifyMFA(userId: string, token: string): Promise<{ verified: boolean; token?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new Error('MFA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      return { verified: false };
    }

    return { verified: true, token: this.jwtService.sign(toTokenPayload(user)) };
  }
}