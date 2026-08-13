# TERRA LINK

Plataforma de **tokenización agrícola con NFTs financieros** y cumplimiento EUDR. Conecta trazabilidad de campo (IoT + satélite) con crédito, billing (Stripe) y alertas ESG.

| Capa | Tecnología | Puerto |
|---|---|---|
| Backend | NestJS 11 + TypeORM + PostgreSQL/PostGIS | `3000` |
| Frontend (dashboard web) | Vite 5 + React 18 + Chart.js + Socket.IO | `5173` (dev) / `8080` (Docker) |
| Base de datos | postgis/postgis:15-3.3 (Docker) | `5432` |
| WebSocket | Socket.IO namespace `/credit` | `3000` |

---

## ⚡ ARRANQUE RÁPIDO — comandos copia y pega (PowerShell)

> Todos los comandos se corren desde la raíz del monorepo:
> `C:\Users\usuario\Desktop\TERRA EUDR_TOKEN_WALLET (1)\TERRA EUDR_TOKEN_WALLET`

### Paso 1 — Base de datos (Docker)

```powershell
cd "TERRA LINK"
docker-compose up -d postgres
```

### Paso 2 — Instalar dependencias

```powershell
# 2a. Paquete compartido @terra/shared (OBLIGATORIO: el backend depende de su dist/)
cd packages\shared
npm install
npm run build

# 2b. Backend
cd ..\..\TERRA LINK\backend
npm install
Copy-Item .env.example .env   # crear .env (valores por defecto funcionan)
npm run migration:run         # crear las tablas (synchronize:false = las tablas NO se crean solas)

# 2c. Frontend (dashboard)
cd ..\frontend
npm install
```

### Paso 3 — Levantar backend (Terminal 1)

```powershell
cd "TERRA LINK\backend"
npm run start:dev
```

✅ Backend en `http://localhost:3000` · WebSocket en `ws://localhost:3000/credit`

### Paso 4 — Levantar dashboard (Terminal 2)

```powershell
cd "TERRA LINK\frontend"
npm run dev
```

✅ Dashboard en `http://localhost:5173`

### Paso 5 — Crear usuario de login (el dashboard NO arranca sin esto)

El `init.sql` solo siembra plots y certificaciones — **NO crea tenants ni users**. El login verifica el password con SHA-256. Ejecuta esto en una terminal:

```powershell
docker exec -it terra-link-db psql -U postgres -d terra_link
```

Y pega dentro de psql:

```sql
INSERT INTO tenants (name, domain, sector, contact_email, created_at, updated_at)
VALUES ('Demo Agro', 'demo.terra.com', 'Agricultura', 'admin@demo.com', NOW(), NOW());

INSERT INTO users (tenant_id, username, email, password_hash, role, is_active, created_at, updated_at)
VALUES (1, 'admin', 'admin@demo.com',
        '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',  -- "admin123"
        'admin', true, NOW(), NOW());
```

Luego en el dashboard: **Tenant ID `1` · Usuario `admin` · Contraseña `admin123`**

> ¿Otro password? Genera el hash: `node -e "console.log(require('crypto').createHash('sha256').update('tuPassword').digest('hex'))"`

---

## ⚠️ BLOQUEANTE DE DESARROLLO: CORS

El backend **NO tiene `enableCors()`**. El dashboard en `5173` llama al backend en `3000` con `fetch` → **el navegador bloquea TODAS las llamadas HTTP** (login incluido).

**Fix (1 línea)** en `TERRA LINK\backend\src\main.ts`:

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });   // ← AGREGAR ESTA LÍNEA
  app.use(bodyParser.json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
}
```

> Alternativa sin tocar backend: definir `VITE_BACKEND_URL` y configurar proxy en `vite.config.ts`. Pero como el código usa la URL absoluta `BACKEND` en ~15 llamadas, `enableCors` es el cambio mínimo.

---

## 🐳 Arranque con Docker (backend manual + frontend en nginx)

```powershell
cd "TERRA LINK"
docker-compose up -d

# Postgres  -> localhost:5432
# Frontend  -> http://localhost:8080  (nginx con el build de Vite)
```

> El docker-compose NO levanta el backend: solo `postgres` y `frontend`. El backend se corre con `npm run start:dev` desde `backend\`.

---

## 📦 Estructura y comandos por subproyecto

### Backend (`backend\`) — NestJS 11

```powershell
cd "TERRA LINK\backend"
npm install                # instalar deps
npm run start:dev          # dev con watch (localhost:3000)
npm run start              # producción
npm run build              # compilar a dist/
npm run migration:run      # aplicar migraciones TypeORM
npm run migration:revert   # revertir última migración
npm test                   # unitarios (Jest)
npm run test:e2e           # e2e (Supertest)
npm run test:cov           # cobertura
```

**Variables de entorno** (`backend\.env`, copia de `.env.example`):

| Variable | Default | Uso |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `localhost` / `5432` / `postgres` / `postgres` / `terra_link` | PostgreSQL |
| `GUI_API_URL` / `GUI_API_KEY` | AGROCALIDAD sandbox | Compliance |
| `MAG_API_URL` / `MAG_API_TOKEN` | MAG sandbox | Ministerio Agricultura |
| `TRACES_API_URL` / `TRACES_API_KEY` | UE sandbox | Trazabilidad UE |
| `SATELLITE_API_URL` / `SATELLITE_API_KEY` | sandbox | Validación satelital |
| `OPENWEATHER_API_KEY` | *(vacío)* | Datos climáticos |
| `IOT_ALERT_NOTIFICATION_WEBHOOK_URL` / `SLACK_WEBHOOK_URL` | *(vacío)* | Webhooks IoT |
| `IOT_ALERT_NOTIFICATION_MIN_SEVERITY` | `high` | Umbral |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | *(vacío)* | Email |

### Frontend (`frontend\`) — Vite + React 18

```powershell
cd "TERRA LINK\frontend"
npm install            # instalar deps
npm run dev            # dev server → http://localhost:5173
npm run build          # build de producción → dist/
npm run preview        # previsualizar el build
```

El dashboard usa `VITE_BACKEND_URL || 'http://localhost:3000'`. Backend en otro puerto:

```powershell
$env:VITE_BACKEND_URL="http://localhost:3000"; npm run dev
```

---

## 📡 Endpoints principales (backend `localhost:3000`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login `{ tenant_id, username, password }` → JWT |
| POST | `/credit-smart-contract/collateralize` | Colateralizar NFT |
| POST | `/credit-smart-contract/release` | Liberar colateral |
| GET | `/credit-smart-contract/metrics` | Métricas del dashboard |
| GET | `/credit-smart-contract/risk-limit/:tokenId` | Límite de riesgo |
| GET | `/credit/dynamic/:tokenId` | Valoración dinámica |
| POST | `/credit/evaluate/:tokenId` | Evaluar crédito |
| GET | `/credit/proposals/:borrowerId` | Propuestas por deudor |
| PATCH | `/credit/proposal/:id/status` | Estado de propuesta |
| POST | `/tenants` | Crear tenant |
| GET | `/tenants/:id` | Detalle tenant |
| GET/PUT | `/tenants/:tenantId/notification-settings` | Config. notificaciones |
| POST | `/users` | Crear usuario (admin) |
| GET | `/users` · PATCH `/users/:userId/role` · DELETE `/users/:userId` | Gestión usuarios |
| POST | `/billing/subscribe` · `/billing/charge` · `/billing/cancel` · `/billing/webhook` | Stripe |
| GET | `/billing/account` · `/billing/invoices` | Estado y facturas |
| POST | `/compliance/eudr` | Registrar trazabilidad EUDR |
| GET | `/compliance/eudr/:traceId` | Consultar EUDR |
| POST | `/compliance/eudr/:traceId/sync` | Sincronizar |
| POST | `/compliance/satellite-validation` · `/compliance/esg-reports` | Validación / ESG |
| GET | `/compliance/alerts-dashboard` | Alertas ESG (dashboard) |
| POST | `/certifications` · GET `/certifications` · GET `/certifications/:id` | Certificaciones |
| POST | `/iot/readings` · `/iot/drones` | IoT |
| GET | `/iot/alerts` · PATCH `/iot/alerts/:id/resolve` | Alertas IoT |
| GET/PUT | `/iot/notifications/settings` · GET `/iot/notifications/logs` | Notificaciones |
| POST | `/geo/validate` | Validación PostGIS |
| POST | `/plots` · GET `/plots/:id` · GET `/plots/owner/:ownerId` | Parcelas |
| POST | `/nfts` · PATCH `/nfts/:id` · GET `/nfts/:id` · PATCH `/nfts/:id/collateralize` | NFTs |

**WebSocket**: namespace `/credit` (socket.io) — emite métricas en vivo.

---

## 🛠️ Troubleshooting

| Problema | Causa | Solución |
|---|---|---|
| `ECONNREFUSED` puerto 5432 | Postgres apagado | `docker-compose up -d postgres` |
| `relation "users" does not exist` | Migraciones pendientes | `cd backend; npm run migration:run` |
| Login "Invalid credentials" | No creaste el user / hash malo | Ejecutar INSERT del Paso 5 |
| CORS error en dashboard | Backend sin enableCors | Ver sección ⚠️ CORS |
| `Cannot find module '@terra/shared'` | Shared sin compilar | `cd packages\shared; npm run build` |
| Dashboard sin datos de billing | No hay `billing_accounts` | `POST /billing/subscribe` o SQL |
| WebSocket no conecta | Backend apagado / otro puerto | Verificar backend en 3000 |

---

## 📚 Documentación completa

- **🗺️ [MAPA DEL PROYECTO (empieza aquí)](./docs/PROJECT-MAP.md)** — vista rápida
- **[QUICKSTART.md](./docs/QUICKSTART.md)** — acceso por rol (VS Code)
- **[INDEX.md](./docs/INDEX.md)** — índice maestro
- **[Resumen ejecutivo](./docs/EXECUTIVE-SUMMARY.md)** — stakeholders
- **[Análisis de ingeniería](./docs/engineering-analysis.md)** — arquitectos
- **[Diagrama C4 nivel 2](./docs/architecture-c4-level2.md)** — arquitectura
- **[Plan de desarrollo](./docs/roadmap-implementation.md)** — 3 sprints
- **[Guía de desarrollo](./docs/development-guide.md)** — setup local
- **[Documentación técnica](./docs/terra-link-technical.md)** — endpoints/entidades
- **[API reference](./docs/api-reference.md)** — ejemplos
- **[Plan de pruebas](./docs/qa-test-plan.md)** — 30+ casos
- **[Guía de testing](./docs/testing-guide.md)** — estrategia
- **[Estado de documentación](./docs/DOCUMENTATION-STATUS.md)** — 18 docs

## Componentes

- `backend/`: NestJS API modular (auth, tenants, credit, billing, compliance, IoT, geo, NFTs).
- `frontend/`: Dashboard web (Vite + React 18) con login, billing, métricas, alertas ESG y WebSocket.
- `contracts/`: Hardhat + Solidity NFT (tokenización y colateralización).
- `terraform/`: Plantilla AWS.
- `init.sql`: Seed inicial (plots/certificaciones/historial) en el primer arranque de Postgres.

## Siguientes pasos

1. Implementar validación geoespacial con PostGIS.
2. Completar endpoints de tokenización y flujo de crédito.
3. Desarrollar auditoría dinámica de NFTs con IoT / satélite.
4. Desplegar infraestructura cloud con EKS y Terraform.