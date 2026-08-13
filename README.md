# TERRA Ecosistema 🌾

Plataforma agrícola descentralizada que une **trazabilidad, crédito y comercio** mediante blockchain (Polygon), IoT y cumplimiento EUDR. Tres productos integrados sobre un monorepo npm con paquete compartido.

| Proyecto | Qué es | Stack | Arranque |
|---|---|---|---|
| [**TERRA GO**](./TERRA%20GO/README.md) | Marketplace blockchain y tokenización agrícola | Next.js + NestJS + Solidity | [README](./TERRA%20GO/README.md) |
| [**TERRA LINK**](./TERRA%20LINK/README.md) | Tokenización agrícola + NFTs financieros, crédito, billing Stripe, alertas ESG | NestJS 11 + Vite/React 18 + PostgreSQL/PostGIS + Socket.IO | [🚀 Guía completa](./TERRA%20LINK/README.md) |
| [**TERRA X CHANGE**](./TERRA%20X%20CHANGE/README.md) | Wallet/exchange agrícola móvil (Android/iOS/Web) | NestJS 11 + Expo SDK 54 + PostgreSQL + Redis + Polygon | [🚀 Guía completa](./TERRA%20X%20CHANGE/README.md) |

---

## 📋 Índice

- [🚀 Arranque rápido](#-arranque-rápido)
- [📁 Estructura del repositorio](#-estructura-del-repositorio)
- [🛠️ Workspace npm y scripts raíz](#️-workspace-npm-y-scripts-raíz)
- [✅ Validación local del ecosistema](#-validación-local-del-ecosistema)
- [🧪 Infraestructura para E2E](#-infraestructura-para-e2e)
- [📈 Monitoreo de métricas de negocio](#-monitoreo-de-métricas-de-negocio)
- [📊 Cobertura publicada en GitHub Pages](#-cobertura-publicada-en-github-pages)
- [🔗 Documentación consolidada](#-documentación-consolidada)
- [🔜 Siguiente paso](#-siguiente-paso)

---

## 🚀 Arranque rápido

### TERRA LINK (tokenización + dashboard web)

```bash
# 1. Base de datos (PostGIS)
cd "TERRA LINK"
docker-compose up -d postgres

# 2. Paquete compartido (obligatorio)
cd packages/shared && npm install && npm run build

# 3. Backend (Terminal 1)
cd ../TERRA LINK/backend
npm install
cp .env.example .env        # Windows: Copy-Item .env.example .env
npm run migration:run       # crear tablas (synchronize:false)
npm run start:dev           # → http://localhost:3000

# 4. Dashboard (Terminal 2)
cd ../frontend
npm install
npm run dev                 # → http://localhost:5173
```

> ⚠️ El login necesita un usuario en BD (no hay seeds): ver [Paso 5 en el README de TERRA LINK](./TERRA%20LINK/README.md). El backend requiere `enableCors()` para el dashboard en dev — detalle en la sección ⚠️ CORS del README.

**👉 [Guía completa con todos los comandos, endpoints y troubleshooting](./TERRA%20LINK/README.md)**

### TERRA X CHANGE (wallet móvil)

```bash
# 1. Paquete compartido (obligatorio)
cd packages/shared && npm install && npm run build

# 2. Backend (Terminal 1)
cd "TERRA X CHANGE/backend"
npm install && npm run start:dev     # → http://localhost:3000

# 3. App móvil (Terminal 2)
cd ../frontend
npm install
npx expo start                        # escanear QR con Expo Go
```

> ⚠️ X CHANGE es **independiente** del monorepo (instala sus propias deps). El frontend usa `API_BASE` hardcodeado en 3 pantallas — ver tabla de IPs (emulador Android = `10.0.2.2`). Postgres y Redis corren por tu cuenta (no hay compose propio).

**👉 [Guía completa con IPs, endpoints y troubleshooting](./TERRA%20X%20CHANGE/README.md)**

### TERRA GO (marketplace)

```bash
# Ver guía detallada en su README
cd "TERRA GO"
```

**👉 [Guía completa de TERRA GO](./TERRA%20GO/README.md)**

---

## 📁 Estructura del repositorio

```
TERRA/
├── TERRA GO/               # Marketplace blockchain + tokenización
│   ├── backend/            #   NestJS API
│   ├── frontend/           #   Next.js
│   └── contracts/          #   Solidity (Hardhat)
├── TERRA LINK/             # Tokenización agrícola + NFTs financieros
│   ├── backend/            #   NestJS 11 + TypeORM + PostGIS + WebSocket
│   ├── frontend/           #   Dashboard Vite + React 18 (Chart.js + Socket.IO)
│   └── contracts/          #   NFTs Solidity + Terraform
├── TERRA X CHANGE/         # Wallet/exchange móvil (INDEPENDIENTE del monorepo)
│   ├── backend/            #   NestJS 11 + MFA + Wallet Polygon
│   └── frontend/           #   Expo SDK 54 (Android/iOS/Web)
├── packages/
│   └── shared/             # @terra/shared: tipos, auth, métricas compartidas
├── tests/
│   └── e2e/                # Scaffold E2E compartido (JWT RBAC, performance)
├── docs/                   # Documentación central del ecosistema
└── .github/
    └── workflows/          # CI (ecosystem-ci, coverage-consolidated)
```

---

## 🛠️ Workspace npm y scripts raíz

Metaworkspace npm (`package.json` raíz) que agrupa **7 workspaces** y centraliza scripts:

| Script | Qué hace |
|---|---|
| `npm run bootstrap` | Instalar todas las dependencias (`npm install`) |
| `npm test` | Unit tests de TERRA GO + TERRA LINK |
| `npm run test:terra-go` | Tests de GO (backend, frontend, contracts) |
| `npm run test:terra-link` | Tests de LINK (backend, dashboard, hardhat) |
| `npm run test:coverage` | Cobertura de GO + LINK |
| `npm run test:e2e` | Scaffold E2E compartido (JWT RBAC) |
| `npm run test:e2e:perf` | Métricas de performance E2E |
| `npm run test:e2e:wallet-login-stake` | E2E wallet (login + stake) |
| `npm run lint` | Lint del ecosistema |

> **Nota**: TERRA X CHANGE **no** es workspace del monorepo root (se independizó). Sus tests se corren desde su propia carpeta: `cd "TERRA X CHANGE/backend" && npm test`.

`tsconfig.base.json` — configuración TypeScript común.
`packages/shared` — librería compartida (`@terra/shared`), se compila en `postinstall`.

<details>
<summary>📦 Workspaces del monorepo root</summary>

```json
"workspaces": [
  "TERRA GO/backend",
  "TERRA GO/frontend",
  "TERRA GO/contracts",
  "TERRA LINK",
  "TERRA LINK/backend",
  "TERRA LINK/frontend",
  "packages/shared"
]
```

</details>

---

## ✅ Validación local del ecosistema

Después de cambios arquitectónicos, validar que todo funciona:

```bash
# 1. Instalar dependencias (builds @terra/shared automáticamente)
npm install

# 2. Compilar el paquete shared (si se omitió el postinstall)
npm run -w @terra/shared build

# 3. Ejecutar todas las pruebas unitarias
npm test

# 4. Ejecutar pruebas con cobertura
npm run test:coverage

# 5. Revisar reportes de cobertura
# P.ej. TERRA LINK/backend/coverage/, TERRA GO/backend/coverage/, etc.
# CI intenta consolidarlos en coverage/combined/html/

# 6. Ejecutar E2E scaffold (requiere servicios corriendo)
npm run test:e2e
```

---

## 🧪 Infraestructura para E2E

Para ejecutar E2E en local o en CI con servicios compartidos (PostgreSQL, Redis):

```bash
# Levantar infraestructura compartida
docker-compose -f docker-compose.e2e.yml up -d postgres redis

# Ejecutar las pruebas E2E
node tests/e2e/jwt-rbac.example.ts --loginUrl=http://localhost:3000/auth/login

# Ejecutar métricas de performance
npm run test:e2e:perf

# Limpiar
docker-compose -f docker-compose.e2e.yml down -v
```

Ver [tests/e2e/README.md](./tests/e2e/README.md) para opciones detalladas.

---

## 📈 Monitoreo de métricas de negocio

El ecosistema emite métricas (créditos aprobados, latencia, staking, etc.) vía `@terra/shared/metrics`.

### Stack completo (Prometheus + Alertmanager + Grafana)

```bash
# macOS/Linux:
chmod +x setup-monitoring.sh && ./setup-monitoring.sh

# Windows PowerShell:
.\setup-monitoring.ps1
```

### Acceso rápido

| Servicio | URL | Credenciales |
|---|---|---|
| **Grafana** | http://localhost:3000 | `admin` / `admin` |
| **Prometheus** | http://localhost:9090 | — |
| **Alertmanager** | http://localhost:9093 | — |
| **Métricas** | http://localhost:3002/metrics | — |

### Dashboards por rol (importar en Grafana desde `docs/`)

- `grafana-dashboard.json` — Todas las métricas
- `grafana-dashboard-ceo.json` — KPIs financieros
- `grafana-dashboard-cto.json` — Performance & SLA
- `grafana-dashboard-product.json` — Growth & Adoption

Ver [docs/MONITORING_QUICKSTART.md](./docs/MONITORING_QUICKSTART.md) para setup completo y alertas Slack/Teams.

### Métricas disponibles

- **Créditos**: total solicitados, aprobados, rechazados
- **Usuarios**: onboardeados, intentos de login
- **Staking**: stakes creados, APR realizado
- **Performance**: latencia P50/P99 de endpoints críticos

Ver [docs/BUSINESS_METRICS.md](./docs/BUSINESS_METRICS.md) y [docs/PROMETHEUS_GRAFANA_SETUP.md](./docs/PROMETHEUS_GRAFANA_SETUP.md).

---

## 📊 Cobertura publicada en GitHub Pages

El workflow de CI (`coverage-consolidated.yml`) publica el reporte HTML consolidado cuando corre en `main` y se genera `coverage/combined/html/index.html`.

- [docs/coverage.md](./docs/coverage.md) — cómo se genera y dónde revisar el reporte.
- Si la publicación falla, el reporte HTML sigue disponible como artefacto del workflow (`coverage-report-html`).

El workflow de CI además:
- Ejecuta pruebas en todos los workspaces.
- Combina reportes con `istanbul-combine`.
- Sube reportes individuales y combinado como artefactos.

---

## 🔗 Documentación consolidada

| Documento | Contenido |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura y límites del ecosistema |
| [docs/PROCESSES.md](./docs/PROCESSES.md) | Procesos de desarrollo y entrega (PR, changelog, versionado) |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Roadmap del ecosistema |
| [docs/COMMANDS_REFERENCE.md](./docs/COMMANDS_REFERENCE.md) | Referencia de comandos |
| [docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md) | Resumen de implementación |
| [tests/e2e/README.md](./tests/e2e/README.md) | Opciones E2E |

---

## 🔜 Siguiente paso

1. Compartir utilidades reutilizables en `packages/shared`.
2. Actualizar los subproyectos para ampliar el uso de la configuración raíz.
3. Extender la pipeline a cobertura y validaciones de seguridad.
4. Mantener la documentación central como referencia principal del ecosistema.
5. Versionar `@terra/shared` con semver interno: breaking changes mayor, nuevas utilidades menor, fixes patch.