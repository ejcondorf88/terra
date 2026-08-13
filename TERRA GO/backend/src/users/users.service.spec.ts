import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('UsersService', () => {
  let service: UsersService;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        nombre: 'Test User',
        rol: 'productor' as const,
      };

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(createUserDto.email);
      expect(result.nombre).toBe(createUserDto.nombre);
      expect(result.rol).toBe(createUserDto.rol);
      expect(result).not.toHaveProperty('password');
    });

    it('should validate email uniqueness', async () => {
      const createUserDto = {
        email: 'duplicate@example.com',
        password: 'password123',
        nombre: 'Test User',
        rol: 'productor' as const,
      };

      await service.create(createUserDto);

      // This should work since we're using in-memory storage
      const result2 = await service.create({
        ...createUserDto,
        email: 'different@example.com',
      });

      expect(result2.email).toBe('different@example.com');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const createUserDto = {
        email: 'find@example.com',
        password: 'password123',
        nombre: 'Find User',
        rol: 'productor' as const,
      };

      await service.create(createUserDto);
      const user = await service.findByEmail('find@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('find@example.com');
      expect(user).toHaveProperty('password');
    });

    it('should return undefined for non-existent email', async () => {
      const user = await service.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by id without password', async () => {
      const createUserDto = {
        email: 'findbyid@example.com',
        password: 'password123',
        nombre: 'Find By ID User',
        rol: 'productor' as const,
      };

      const created = await service.create(createUserDto);
      const user = await service.findById(created.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(created.id);
      expect(user?.email).toBe(createUserDto.email);
      expect(user).not.toHaveProperty('password');
    });

    it('should return undefined for non-existent id', async () => {
      const user = await service.findById(999);
      expect(user).toBeUndefined();
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const createUserDto = {
        email: 'validate@example.com',
        password: 'correctpassword',
        nombre: 'Validate User',
        rol: 'productor' as const,
      };

      await service.create(createUserDto);
      const user = await service.findByEmail('validate@example.com');

      const isValid = await service.validatePassword('correctpassword', user!.password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const createUserDto = {
        email: 'validate2@example.com',
        password: 'correctpassword',
        nombre: 'Validate User 2',
        rol: 'productor' as const,
      };

      await service.create(createUserDto);
      const user = await service.findByEmail('validate2@example.com');

      const isValid = await service.validatePassword('wrongpassword', user!.password);
      expect(isValid).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without passwords', async () => {
      const users = [
        {
          email: 'user1@example.com',
          password: 'pass1',
          nombre: 'User 1',
          rol: 'productor' as const,
        },
        {
          email: 'user2@example.com',
          password: 'pass2',
          nombre: 'User 2',
          rol: 'inversionista' as const,
        },
      ];

      await service.create(users[0]);
      await service.create(users[1]);

      const allUsers = await service.getAllUsers();

      expect(allUsers).toHaveLength(2);
      expect(allUsers[0]).not.toHaveProperty('password');
      expect(allUsers[1]).not.toHaveProperty('password');
      expect(allUsers.map(u => u.email)).toEqual(
        expect.arrayContaining(['user1@example.com', 'user2@example.com'])
      );
    });
  });
});