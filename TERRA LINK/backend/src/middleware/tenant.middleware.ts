import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  use(req: Request & { tenantId?: number }, _res: Response, next: NextFunction) {
    try {
      const header = (req.headers['x-tenant-id'] as string) || null;
      let tenantId: number | null = null;
      if (header) {
        const parsed = parseInt(header, 10);
        if (!Number.isNaN(parsed)) tenantId = parsed;
      } else if (req.hostname) {
        // try to parse subdomain as tenant id: {tenant}.example.com
        const host = req.hostname;
        const parts = host.split('.');
        if (parts.length > 2) {
          const sub = parts[0];
          const p = parseInt(sub, 10);
          if (!Number.isNaN(p)) tenantId = p;
        }
      }
      if (tenantId) {
        req.tenantId = tenantId;
        this.logger.log(`Tenant detected: ${tenantId}`);
      } else {
        this.logger.log('No tenant detected in request');
      }
    } catch (err) {
      this.logger.warn(`Tenant middleware error: ${err}`);
    }
    next();
  }
}
