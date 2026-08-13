import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    tenantId: number,
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'producer' | 'bank' | 'merchant' | 'user' = 'user',
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { tenant_id: tenantId, username },
        { tenant_id: tenantId, email },
      ],
    });
    if (existingUser) {
      throw new BadRequestException('User already exists in this tenant');
    }
    const passwordHash = this.hashPassword(password);
    const user = this.userRepository.create({
      tenant_id: tenantId,
      username,
      email,
      password_hash: passwordHash,
      role,
      is_active: true,
    });
    return this.userRepository.save(user);
  }

  async findByUsernameAndTenant(tenantId: number, username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { tenant_id: tenantId, username },
    });
  }

  async findByEmailAndTenant(tenantId: number, email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { tenant_id: tenantId, email },
    });
  }

  async findById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    const hash = this.hashPassword(password);
    return hash === user.password_hash;
  }

  async listUsersByTenant(tenantId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { tenant_id: tenantId },
      select: ['id', 'username', 'email', 'role', 'is_active', 'created_at', 'updated_at'],
    });
  }

  async updateUserRole(tenantId: number, userId: number, role: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found in this tenant');
    }
    user.role = role as any;
    return this.userRepository.save(user);
  }

  async deactivateUser(tenantId: number, userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (!user || user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found in this tenant');
    }
    user.is_active = false;
    return this.userRepository.save(user);
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
