import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        nombre: 'New User',
        rol: 'productor' as const,
      };

      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        nombre: 'New User',
        rol: 'productor',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(undefined);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.user).toEqual(mockUser);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw error if user already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        nombre: 'Existing User',
        rol: 'productor' as const,
      };

      const existingUser = {
        id: 1,
        email: 'existing@example.com',
        password: 'hashedpassword',
        nombre: 'Existing User',
        rol: 'productor',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(existingUser);

      await expect(service.register(createUserDto)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'correctpassword',
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedpassword',
        nombre: 'Test User',
        rol: 'productor',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUserResponse = {
        id: 1,
        email: 'user@example.com',
        nombre: 'Test User',
        rol: 'productor',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.user).toMatchObject(mockUserResponse);
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('should throw error for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for incorrect password', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedpassword',
        nombre: 'Test User',
        rol: 'productor',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        nombre: 'Test User',
        rol: 'productor',
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const result = await service.validateUser(1, 'user@example.com');

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error for invalid user', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(undefined);

      await expect(service.validateUser(1, 'user@example.com')).rejects.toThrow('Invalid user');
    });

    it('should throw error for email mismatch', async () => {
      const mockUser = {
        id: 1,
        email: 'different@example.com',
        nombre: 'Test User',
        rol: 'productor',
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      await expect(service.validateUser(1, 'user@example.com')).rejects.toThrow('Invalid user');
    });
  });
});