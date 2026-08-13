# Arquitectura del Ecosistema TERRA

## Objetivo

Este documento describe la arquitectura global y los límites de los proyectos dentro del ecosistema.

## Componentes principales

- `TERRA GO` — marketplace blockchain con frontend Next.js, backend NestJS y contratos Solidity.
- `TERRA LINK` — plataforma de tokenización agrícola con dashboard React/Vite, backend NestJS y pruebas Hardhat.
- `TERRA X CHANGE` — backend de operaciones y app móvil Expo React Native.

## División de responsabilidades

- `frontend`: UI de usuario, interacción Web3/Wallets, dashboards y experiencias móviles.
- `backend`: APIs, autenticación, integraciones con bases de datos, orquestación de negocio.
- `contracts`: lógica financiera y tokenización on-chain.
- `packages/shared`: lógica compartida, utilidades y tipos comunes para futuros avances.

## Estrategia de armonización

1. Unificar versiones de Node.js, TypeScript y dependencias comunes.
2. Establecer un workspace monorepo para que todas las piezas compartan configuración base.
3. Mantener documentación centralizada en `docs/` para arquitectura, procesos y rutas de despliegue.
4. Diferenciar claramente las responsabilidades de cada subproyecto.

## Flujo de desarrollo recomendado

1. Ejecutar `npm run bootstrap` desde la raíz.
2. Trabajar en el subproyecto correspondiente.
3. Usar `npm run test` desde la raíz para validar integración básica.
4. Añadir librerías compartidas en `packages/shared` cuando la lógica sea reutilizable.
5. Para validaciones de seguridad completas, usar `npm run test:coverage` desde la raíz.
6. Ejecutar `npm run test:e2e` para el scaffold de JWT+RBAC cuando los servicios estén levantados.

## Monorepo y pruebas consolidadas

- `packages/shared` actúa como la capa de contrato común. Todo guard, tipo y utilidad debe ser publicado aquí antes de que lo use cualquier backend.
- La raíz expone scripts de alto nivel para el ecosistema:
  - `npm run bootstrap` — instala workspaces y prepara `@terra/shared`.
  - `npm run test` — ejecuta tests unitarios básicos en GO, LINK y X CHANGE.
  - `npm run test:coverage` — ejecuta los tests de cobertura relevantes en cada subproyecto.
  - `npm run test:e2e` — corre el scaffold E2E compartido de JWT/RBAC.
- En CI, la cobertura se consolida subiendo artefactos desde todos los workspaces; esto permite generar una vista global de las pruebas.

## Roadmap de Wallets para TERRA X CHANGE

La integración de wallets en TERRA X CHANGE sigue un roadmap en cuatro fases alineado con el negocio agrícola:

### Fase 1 — Seguridad y core wallet

- Implementar MFA y biometría en la autenticación de wallet.
- Añadir social recovery con contactos de confianza.
- Evaluar MPC para custodia sin llaves.
- Integrar soporte para hardware wallets (Ledger/Trezor).
- Documentar política de claves y recuperación en el repositorio.

### Fase 2 — Funcionalidades financieras

- Integrar fiat ↔ crypto con bancos y cooperativas agrícolas.
- Añadir staking flexible con pools y plazos variables.
- Soportar stablecoins como USDC/DAI para referencia de valor.
- Diseñar AgroDeFi loans respaldados por NFTs agrícolas.
- Crear compliance agroexportador para auditoría y trazabilidad.

### Fase 3 — Experiencia de usuario

- Onboarding simplificado sin seed phrase, con email y biometría.
- Dashboard con balances, recompensas y KPIs agrícolas en tiempo real.
- Multi-idioma (ES/EN/FR) para importadores europeos.
- Soporte offline-first para zonas rurales con baja conectividad.
- Integración con Terra GO para marketplace de productos certificados.

### Fase 4 — Integraciones estratégicas

- DAO Governance para votaciones sobre tarifas e incentivos.
- IoT triggers que disparan pagos automáticos.
- Marketplace integrado con Terra GO.
- Economía completa: pagos, créditos, staking, marketplace y gobernanza.

## Estructura de carpetas recomendada

Para iniciar desarrollo de wallet en `TERRA X CHANGE`, crear el catálogo de módulos:

- `TERRA X CHANGE/wallet/auth`
- `TERRA X CHANGE/wallet/finance`
- `TERRA X CHANGE/wallet/ui`
- `TERRA X CHANGE/wallet/integration`

Cada módulo debe documentar su propio alcance y APIs en un `README.md` interno.

## Versionado de `@terra/shared`

Para mantener la librería compartida estable, el equipo seguirá estas reglas de versionado internas:

1. Cambios breaking en `@terra/shared` deben ir con un bump mayor (`1.x.x -> 2.0.0`).
2. Nuevas utilidades, guards o decoradores sin romper compatibilidad deben ir con un bump menor (`1.1.0`).
3. Correcciones de bugs y mejoras internas sin cambio de API deben ir en patch (`1.0.1`).
4. Siempre documentar cambios en un changelog o en el release note del workspace compartido.

Recomendación:

- Antes de introducir nuevos exports en `@terra/shared`, agrega un ejemplo de uso en `docs/ARCHITECTURE.md` o en `README.md`.
- Mantén un backlog de breaking changes planeados para evitar versiones incompatibles en los subproyectos.
- Usa el paquete local `@terra/shared` como el contrato de la plataforma: cada backend debe validar que sus imports siguen el barrel `@terra/shared/auth` en lugar de rutas relativas internas.

## Auth centralizado

La autenticación y utilidades JWT están centralizadas en el paquete `@terra/shared/auth`.

- Importar el guard y tipos desde el barrel compartido:

```ts
import { JwtAuthGuard, TerraJwtPayload } from '@terra/shared/auth';
```

- Ventajas:
	- Evita duplicación de guards y validaciones en cada backend.
	- Permite evolucionar la política de tokens (campos, expiración, multi-tenant) en un único lugar.
	- Facilita pruebas y mocks compartidos.

- Recomendación: todos los backends deben usar `@terra/shared/auth` en lugar de guards locales. Mantener en `packages/shared` las utilidades: `jwt.ts`, `guards/jwt.guard.ts`, `types/index.ts`.

### RBAC (Role-Based Access Control)

La lógica RBAC también está centralizada y disponible como `RbacGuard` y el decorador `Roles` en `@terra/shared/auth`.

Ejemplo de uso:

```ts
import { RbacGuard, Roles, TenantId } from '@terra/shared/auth';

@UseGuards(RbacGuard)
@Roles('admin')
async function handler(@TenantId() tenantId: number) { /* ... */ }
```

Recomendación: mover validaciones comunes de roles y extracción de `tenantId` al paquete `shared` para mantener coherencia entre proyectos.

