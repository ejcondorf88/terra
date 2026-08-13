import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../src/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should register a user', async () => {
    const mockUser = { id: '1', email: 'test@example.com', password: 'hashed', role: 'user' };
    jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
    jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);

    const result = await service.register('test@example.com', 'password');
    expect(result.user).toEqual(mockUser);
    expect(result.token).toBe('token');
    expect(await bcrypt.compare('password', result.user.password)).toBe(true);
  });

  it('should login a user', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    const mockUser = { id: '1', email: 'test@example.com', password: hashedPassword, role: 'user' };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

    const result = await service.login('test@example.com', 'password');
    expect(result.token).toBe('token');
  });

  it('should throw error on invalid credentials', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
  });
});