import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        nombre: 'New User',
        rol: 'productor',
      };

      const mockResult = {
        user: {
          id: 1,
          email: 'newuser@example.com',
          nombre: 'New User',
          rol: 'productor',
        },
        access_token: 'mock-jwt-token',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockResult);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockResult);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: 1,
          email: 'user@example.com',
          nombre: 'Test User',
          rol: 'productor',
        },
        access_token: 'mock-jwt-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        nombre: 'Test User',
        rol: 'productor',
      };

      const mockRequest = {
        user: { id: 1, email: 'user@example.com' },
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(1, 'user@example.com');
    });
  });
});