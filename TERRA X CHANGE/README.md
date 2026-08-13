# TERRA X CHANGE 🌾💰

**Wallet agrícola descentralizada** para almacenar, transferir y comercializar activos digitales (X Coin, stablecoins y NFTs agrícolas).

Es el puente financiero entre **TERRA LINK** (compliance) y **TERRA GO** (marketplace).

## 🎯 Visión

TERRA X CHANGE convierte la trazabilidad agrícola en economía real. Es la wallet que permite a productores, comerciantes e importadores interactuar con X Coin, NFTs y stablecoins en un entorno seguro, transparente y escalable.

## 🏗️ Arquitectura

- **Backend**: NestJS (TypeScript) con PostgreSQL y Redis
- **Frontend**: React Native + Expo
- **Blockchain**: Polygon mainnet (ERC-20 X Coin, ERC-721/1155 NFTs)
- **Seguridad**: JWT + MFA, HashiCorp Vault (producción)

## 📦 Módulos Implementados

### ✅ Autenticación (`auth/`)
- Registro y login con JWT
- MFA (TOTP/Google Authenticator) + Biométricos (huella/FaceID)
- Social recovery (roadmap)

### ✅ Wallet (`wallet/`)
- Creación de wallets Polygon
- Balance de X Coin y stablecoins
- Transferencias (roadmap: QR Payments)
- Integración blockchain

### ✅ Staking (`staking/`)
- Lock X Coin y recibir rewards
- Cálculo de recompensas (10% anual)
- Unstake/Retiro

### 🚀 Próximas
- Pagos Fiat ↔ Crypto
- NFT Management
- TERRA LINK integration
- TERRA GO integration

## 🚀 Quick Start

### Requisitos
- Node.js >= 20.13.1
- PostgreSQL 12+
- Redis 6+

### Backend
```bash
cd backend
npm install
npm run start:dev    # localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npx expo start
# Incluye pantallas de login/register con MFA y biométricos
```

### Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E
npx playwright test
```

> Usa `docs/test-matrix-detailed.md` como guía de casos de prueba para cada sprint.

## 📚 Documentación

- [Arquitectura](docs/architecture.md) - Estructura del proyecto
- [API Reference](docs/api-reference.md) - Endpoints disponibles
- [Development Guide](docs/development-guide.md) - Guía de desarrollo
- [Matriz de Casos de Prueba](docs/test-matrix-detailed.md) - Inputs, outputs y métricas por módulo

## 📋 API Endpoints

### Auth
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Login
- `POST /api/auth/{userId}/mfa/setup` - Configurar MFA
- `POST /api/auth/{userId}/mfa/verify` - Verificar MFA

### Wallet
- `POST /api/wallet/create` - Crear wallet
- `GET /api/wallet/{id}/balance` - Balance
- `POST /api/wallet/{id}/transfer` - Transferir X Coin
- `POST /api/wallet/{id}/stake` - Iniciar staking

### Staking
- `POST /api/staking/create` - Crear stake
- `GET /api/staking/{walletId}/stakes` - Ver stakes
- `GET /api/staking/{stakeId}/rewards` - Calcular recompensas
- `POST /api/staking/{stakeId}/unstake` - Retirar stake

## 🧪 Testing

- **Jest**: Pruebas unitarias (backend + frontend)
- **Supertest**: Pruebas de integración (API)
- **Playwright**: Pruebas E2E
- **GitHub Actions**: CI/CD automático

## 🔐 Seguridad

- AES-256 en reposo, TLS 1.3 en tránsito
- JWT + MFA para autenticación
- Logs de auditoría para todas las transacciones
- Cumplimiento GDPR, ISO 27001

## 🛣️ Roadmap

- **Fase 1** (actual): Wallet básica, X Coin, Staking
- **Fase 2**: Integración TERRA LINK/GO, Pagos QR
- **Fase 3**: DAO Governance, IoT Payments, Expansión global

## 📞 Contacto

Mario - Tu Ecosistema TERRA

---

**Desarrollado con ❤️ para la economía agrícola descentralizada**