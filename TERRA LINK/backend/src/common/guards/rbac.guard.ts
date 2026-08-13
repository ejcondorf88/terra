import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Local type definition
type JwtPayload = { sub: number; role: string };

// Helper function to extract bearer token
function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (!payload.role) {
        throw new ForbiddenException('No role in JWT token');
      }

      const userRole = payload.role as string;
      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          `User role '${userRole}' does not have access. Required roles: ${requiredRoles.join(', ')}`,
        );
      }

      // Attach user info to request for later use
      (request as any).user = payload;
      return true;
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
