import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common'
import { Request } from 'express'

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { tenantId?: number }>()
    const tenantId = request.tenantId || (request.headers['x-tenant-id'] as string)
    
    if (!tenantId) {
      throw new BadRequestException('No tenant ID found in request')
    }
    
    const parsed = typeof tenantId === 'number' ? tenantId : parseInt(tenantId as string, 10)
    if (Number.isNaN(parsed)) {
      throw new BadRequestException('Invalid tenant ID format')
    }
    
    return parsed
  },
)
