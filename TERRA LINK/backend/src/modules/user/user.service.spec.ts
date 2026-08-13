import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should create a user with hashed password', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue({
      tenant_id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashed',
      role: 'user',
      is_active: true,
    });
    mockRepository.save.mockResolvedValue({
      id: 1,
      tenant_id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    });

    const result = await service.createUser(1, 'testuser', 'test@example.com', 'password123', 'user');
    expect(result.username).toBe('testuser');
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw error if user exists', async () => {
    mockRepository.findOne.mockResolvedValue({
      id: 1,
      username: 'testuser',
      tenant_id: 1,
    });

    await expect(
      service.createUser(1, 'testuser', 'test@example.com', 'password', 'user'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should validate password correctly', async () => {
    // Mock: user has password_hash that matches the hashed password
    const password = 'test_password_123';
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user = {
      id: 1,
      username: 'testuser',
      password_hash: passwordHash,
    } as User;
    const isValid = await service.validatePassword(user, password);
    expect(isValid).toBe(true);
  });

  it('should find user by username and tenant', async () => {
    const user = {
      id: 1,
      username: 'testuser',
      tenant_id: 1,
    };
    mockRepository.findOne.mockResolvedValue(user);

    const result = await service.findByUsernameAndTenant(1, 'testuser');
    expect(result).toEqual(user);
  });

  it('should deactivate user', async () => {
    const user = {
      id: 1,
      username: 'testuser',
      tenant_id: 1,
      is_active: true,
    } as User;
    mockRepository.findOne.mockResolvedValue(user);
    mockRepository.save.mockResolvedValue({ ...user, is_active: false });

    const result = await service.deactivateUser(1, 1);
    expect(result.is_active).toBe(false);
  });
});
