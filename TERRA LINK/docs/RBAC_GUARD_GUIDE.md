# RBAC Guards & @TenantId Decorator Guide

## Overview
TERRA LINK implementa **Role-Based Access Control (RBAC)** usando NestJS Guards y decoradores personalizados. Cada endpoint está protegido por:
- **Validación de JWT** (token debe estar presente y válido)
- **Verificación de rol** (usuario debe tener el rol requerido)
- **Aislamiento de tenant** (automático vía `@TenantId()`)

---

## Components

### 1. Decorador `@TenantId()`
Extrae el `tenant_id` del request automáticamente desde:
- Header HTTP: `x-tenant-id: 1`
- Property del request (añadido por middleware)

**Ubicación**: `src/common/decorators/tenant-id.decorator.ts`

### 2. Decorador `@Roles()`
Define qué roles pueden acceder a un endpoint.

**Ubicación**: `src/common/decorators/roles.decorator.ts`

### 3. Guard `RbacGuard`
Valida JWT token y verifica que el rol esté en la lista de roles permitidos.

**Ubicación**: `src/common/guards/rbac.guard.ts`

---

## Usage Pattern

### Step 1: Apply `@UseGuards()` al Controlador

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { RbacGuard } from 'src/common/guards';

@Controller('plots')
@UseGuards(RbacGuard)  // ← Apply guard globally
export class PlotController {
  // ...
}
```

### Step 2: Specify Roles en Endpoints

```typescript
import { Get, Roles, TenantId } from 'src/common/decorators';

@Get()
@Roles('admin', 'producer')  // ← Solo admin o producer
async getPlots(@TenantId() tenantId: number) {
  return this.plotService.getByTenant(tenantId);
}
```

### Step 3: Use `@TenantId()` en Endpoints

```typescript
@Post()
@Roles('admin', 'producer')
async createPlot(@TenantId() tenantId: number, @Body() body: CreatePlotDto) {
  return this.plotService.create(tenantId, body);
}

@Delete(':plotId')
@Roles('admin', 'producer')
async deletePlot(@TenantId() tenantId: number, @Param('plotId') plotId: number) {
  return this.plotService.delete(tenantId, plotId);
}
```

---

## Roles Available

| Role | Description |
|------|-------------|
| `admin` | Full access to tenant data and settings |
| `producer` | Create/edit plots, NFTs, production history |
| `bank` | View credit proposals, approve/reject |
| `merchant` | Limited access to view products/credits |
| `user` | Read-only access to assigned resources |

---

## Complete Example

```typescript
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TenantId, Roles } from 'src/common/decorators';
import { RbacGuard } from 'src/common/guards';
import { PlotService } from './plot.service';

@Controller('plots')
@UseGuards(RbacGuard)
export class PlotController {
  constructor(private readonly plotService: PlotService) {}

  // Anyone with JWT and (admin OR producer) role
  @Get()
  @Roles('admin', 'producer')
  async list(@TenantId() tenantId: number) {
    return this.plotService.findByTenant(tenantId);
  }

  // Only admin
  @Post()
  @Roles('admin')
  async create(@TenantId() tenantId: number, @Body() body: CreatePlotDto) {
    return this.plotService.create(tenantId, body);
  }

  // Admin or producer can delete their own plots
  @Delete(':plotId')
  @Roles('admin', 'producer')
  async delete(@TenantId() tenantId: number, @Param('plotId') plotId: number) {
    return this.plotService.delete(tenantId, plotId);
  }

  // Public endpoint (no roles required, no guard needed)
  @Get('public')
  async getPublicData() {
    return { message: 'This is public' };
  }
}
```

---

## How It Works

### Request Flow

1. **Middleware** (`TenantMiddleware`) → Adds `req.tenantId` from header or subdomain
2. **JWT Validation** → `RbacGuard` extracts and verifies JWT token
3. **Role Check** → Guard compares `payload.role` with `@Roles()` decorator
4. **Tenant Extraction** → `@TenantId()` decorator extracts tenant ID
5. **Handler Execution** → Controller method runs with tenant ID

### Error Handling

| Error | HTTP Code | Reason |
|-------|-----------|--------|
| `UnauthorizedException` | 401 | Missing or invalid JWT token |
| `ForbiddenException` | 403 | User role not in required roles |
| `BadRequestException` | 400 | Invalid tenant ID format |

### Examples

**Missing Auth Header**:
```bash
curl http://localhost:3000/plots
# Response: 401 Unauthorized - Missing authorization header
```

**Invalid Token**:
```bash
curl -H "Authorization: Bearer invalid.token" http://localhost:3000/plots
# Response: 401 Unauthorized - Invalid or expired token
```

**Insufficient Permissions**:
```bash
curl -H "Authorization: Bearer <user-token>" http://localhost:3000/plots
# (user role not in ['admin', 'producer'])
# Response: 403 Forbidden - User role 'user' does not have access
```

**Valid Request**:
```bash
curl -H "Authorization: Bearer <admin-token>" \
     -H "X-Tenant-ID: 1" \
     http://localhost:3000/plots
# Response: 200 OK - Plot list for tenant 1
```

---

## Testing RBAC

### Using Postman/cURL

1. **Get JWT Token**:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": 1,
    "username": "admin_user",
    "password": "secure_password"
  }'
# Response: { "access_token": "jwt_token..." }
```

2. **Call Protected Endpoint**:
```bash
curl -H "Authorization: Bearer jwt_token" \
     -H "X-Tenant-ID: 1" \
     http://localhost:3000/plots
```

### Unit Tests

```typescript
describe('PlotController', () => {
  let controller: PlotController;
  let service: PlotService;

  beforeEach(async () => {
    // Setup...
  });

  it('should list plots for admin', async () => {
    const result = ['plot1', 'plot2'];
    service.findByTenant = jest.fn().mockResolvedValue(result);

    const plots = await controller.list(1);
    expect(plots).toEqual(result);
  });
});
```

---

## Key Security Points

✅ **What's Protected**:
- JWT token is validated on every protected endpoint
- Role is checked against `@Roles()` decorator
- Tenant ID is automatically isolated

⚠️ **What Still Needs Implementation**:
- Service layer should verify `tenant_id` on all DB queries to prevent tenant leakage
- Add `@TenantId()` validation in each service method
- Implement rate limiting per tenant
- Add audit logging for sensitive operations

---

## Deployment Checklist

Before deploying to production:
- [ ] Ensure `JWT_SECRET` is set in environment (not committed to git)
- [ ] Test all endpoints with valid and invalid tokens
- [ ] Verify role assignments match business requirements
- [ ] Add rate limiting on `/auth/login`
- [ ] Enable HTTPS only for JWT transmission
- [ ] Implement audit logging for role-based access changes
- [ ] Add monitoring for 401/403 error spikes

---

## Next Steps

- [ ] Apply `@UseGuards(RbacGuard)` and `@Roles()` to all existing Controller endpoints
- [ ] Update PlotController, NftController, CreditController with RBAC
- [ ] Implement service-layer tenant isolation checks
- [ ] Add request logging for audit trails
