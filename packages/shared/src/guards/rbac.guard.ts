import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { extractBearerToken } from '../utils'
import type { TerraJwtPayload } from '../types'
import { Request } from 'express'
import { ROLES_KEY } from '../decorators/roles.decorator'

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
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const token = extractBearerToken(request.headers.authorization as unknown as string)
    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization header')
    }

    try {
      const payload = this.jwtService.verify<TerraJwtPayload>(token)
      if (!payload.role) {
        throw new ForbiddenException('No role in JWT token')
      }

      const userRole = payload.role as string
      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          `User role '${userRole}' does not have access. Required roles: ${requiredRoles.join(', ')}`,
        )
      }

      ;(request as any).user = payload
      return true
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
