import { Test, TestingModule } from '@nestjs/testing';
import { RbacGuard } from './rbac.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

// Local type definition for JWT payload
type JwtPayload = { sub: number; role: string };

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RbacGuard>(RbacGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no roles required', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as any;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(null);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException when no auth header', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    } as any;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when user role not in required roles', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer valid.token.here',
          },
        }),
      }),
    } as any;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const fakePayload: JwtPayload = { sub: 2, role: 'user' };
    (jwtService.verify as jest.Mock).mockReturnValue(fakePayload);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should allow access when user role is in required roles', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid.token.here',
      },
    };

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin', 'user']);
    const goodPayload: JwtPayload = { sub: 1, role: 'admin' };
    (jwtService.verify as jest.Mock).mockReturnValue(goodPayload);

    expect(guard.canActivate(mockContext)).toBe(true);
    expect(mockRequest).toHaveProperty('user');
  });
});
