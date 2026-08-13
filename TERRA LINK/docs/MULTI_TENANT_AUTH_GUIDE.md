# Multi-Tenant Authentication Guide

## Overview
TERRA LINK ahora soporta múltiples tenants con aislamiento completo de datos. Cada usuario está vinculado a un tenant específico y solo puede acceder a sus propios datos.

---

## Architecture

### Entities
- **Tenant**: Representa una organización (cooperativa, banco, etc.)
  - `id`: ID único
  - `name`: Nombre de la organización
  - `domain`: Dominio personalizado (ej. `1.terra-link.com`)
  - `created_at`: Timestamp

- **User**: Representa un usuario dentro de un tenant
  - `id`: ID único
  - `tenant_id`: FK a Tenant
  - `username`: Nombre único dentro del tenant
  - `email`: Email único dentro del tenant
  - `password_hash`: SHA256 hash de contraseña
  - `role`: `admin` | `producer` | `bank` | `merchant` | `user`
  - `is_active`: Flag para desactivar usuarios
  - `created_at`, `updated_at`: Timestamps

### Middleware: TenantMiddleware
- Detecta `tenant_id` desde:
  1. Header HTTP: `x-tenant-id: 1`
  2. Subdominio: `1.terra-link.com` → tenant_id=1
- Adjunta `req.tenantId` para ser usado en servicios

### JWT Claims
Token JWT incluye:
```json
{
  "sub": 1,                 // user_id
  "username": "producer_1",
  "tenantId": 1,
  "role": "producer",
  "iat": 1684000000,
  "exp": 1684900000
}
```

---

## API Endpoints

### 1. User Management

#### Create User
```bash
POST /users
Content-Type: application/json

{
  "username": "producer_1",
  "email": "producer@cooperativa.com",
  "password": "secure_password_123",
  "role": "producer"
}
```

**Response (201)**:
```json
{
  "id": 1,
  "tenant_id": 1,
  "username": "producer_1",
  "email": "producer@cooperativa.com",
  "role": "producer",
  "is_active": true,
  "created_at": "2026-05-18T20:30:00Z"
}
```

#### List Users by Tenant
```bash
GET /users/1
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: 1
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "username": "producer_1",
    "email": "producer@cooperativa.com",
    "role": "producer",
    "is_active": true,
    "created_at": "2026-05-18T20:00:00Z"
  },
  {
    "id": 2,
    "username": "admin_coop",
    "email": "admin@cooperativa.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-05-18T20:05:00Z"
  }
]
```

#### Update User Role
```bash
PATCH /users/1/1/role
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: 1
Content-Type: application/json

{
  "role": "admin"
}
```

#### Deactivate User
```bash
DELETE /users/1/1
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: 1
```

---

### 2. Authentication

#### Login (Multi-Tenant)
```bash
POST /auth/login
Content-Type: application/json

{
  "tenant_id": 1,
  "username": "producer_1",
  "password": "secure_password_123"
}
```

**Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "producer_1",
    "role": "producer",
    "tenantId": 1
  }
}
```

**Error Cases**:
- `400 Bad Request`: Missing fields
- `401 Unauthorized`: Invalid credentials or inactive user

---

## Usage Flows

### Flow 1: Onboarding de Nuevo Tenant

1. **Crear Tenant** (via admin API, no expuesto aún):
   ```
   POST /tenants
   { "name": "Cooperativa Agrícola XYZ", "domain": "coop-xyz.terra-link.com" }
   ```

2. **Crear Usuario Admin para Tenant**:
   ```bash
   POST /users
   {
     "username": "admin_xyz",
     "email": "admin@coop-xyz.com",
     "password": "strong_pass",
     "role": "admin"
   }
   X-Tenant-ID: 1
   ```

3. **Login del Admin**:
   ```bash
   POST /auth/login
   
   {
     "tenant_id": 1,
     "username": "admin_xyz",
     "password": "strong_pass"
   }
   ```
   Recibe JWT token.

4. **Admin crea usuarios adicionales** (productores, bancos, etc.):
   ```bash
   POST /users
   {
     "username": "producer_1",
     "email": "producer@coop-xyz.com",
     "password": "...",
     "role": "producer"
   }
   Authorization: Bearer <JWT>
   X-Tenant-ID: 1
   ```

### Flow 2: WebSocket Connection (Dashboard)
1. Usuario obtiene JWT token vía `/auth/login`.
2. Frontend conecta a WebSocket con token:
   ```javascript
   const socket = io('http://backend:3000', {
     namespace: '/credit',
     auth: {
       token: jwtToken
     }
   });
   ```
3. Gateway `CreditSmartContractGateway` valida JWT; si es inválido, desconecta.
4. Una vez conectado, recibe eventos:
   - `credit:metrics`
   - `credit:collateralized`
   - `credit:riskLimit`

---

## Security Considerations

### Datos Isolated by Tenant
- **Middleware**: `TenantMiddleware` adjunta `tenantId` a cada request.
- **Servicios**: Cada query debe filtrar por `tenant_id` para evitar fuga de datos.
- **Base de datos**: Índices compuestos `(tenant_id, field)` garantizan aislamiento.

### Password Security
- Se guarda como hash SHA256 (mejorable: bcrypt en producción).
- Nunca se devuelve en respuestas de API.

### JWT Validation
- Token incluye `tenantId`; puede validarse en servicios críticos.
- TTL: 15 minutos (configurable vía `JWT_EXPIRES_IN`).
- Secreto: Guardar en variables de entorno (`JWT_SECRET`).

### Roles (Role-Based Access Control)
- `admin`: Acceso total a recursos del tenant.
- `producer`: Crea plots, NFTs.
- `bank`: Revisa proposals, aprueba créditos.
- `merchant`: Acceso restringido.
- `user`: Acceso de solo lectura.

*(Implementar autorización en controladores en próxima fase)*

---

## Environment Variables

```bash
# Backend
JWT_SECRET=your-super-secret-key-change-in-prod
JWT_EXPIRES_IN=15m
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=terra_link
```

---

## Next Steps
- [ ] Implementar Role-Based Access Control (RBAC) guards en controladores.
- [ ] Añadir endpoint `POST /tenants` protegido para super-admin.
- [ ] Integrar facturación Stripe vinculada a tenants.
- [ ] Soporte para SSO (OAuth2 / OpenID Connect).
