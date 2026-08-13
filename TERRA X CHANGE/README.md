# TERRA X CHANGE 🌾💰

**Wallet agrícola descentralizada** para almacenar, transferir y comercializar activos digitales (X Coin, stablecoins y NFTs agrícolas). Puente financiero entre **TERRA LINK** (compliance) y **TERRA GO** (marketplace).

> 📱 App móvil (Expo/React Native) con soporte **Android, iOS y Web** desde el mismo código.

| Capa | Tecnología | Puerto |
|---|---|---|
| Backend | NestJS 11 + TypeORM + PostgreSQL | `3000` |
| Cache | Redis | `6379` |
| Frontend móvil | React Native 0.81.5 + Expo SDK 54 + React 19.1.0 | Expo dev (`8081`) |
| Frontend web | Mismo código (react-native-web) | `expo start --web` |
| Blockchain | Polygon (ERC-20 X Coin, ERC-721/1155 NFTs) | RPC público |

---

## ⚡ ARRANQUE RÁPIDO — comandos copia y pega (PowerShell)

> ⚠️ **TERRA X CHANGE es independiente del monorepo** — instala SOLO sus dependencias. NO corras `npm install` desde la raíz del monorepo.
> Todos los comandos desde la raíz: `C:\Users\usuario\Desktop\TERRA EUDR_TOKEN_WALLET (1)\TERRA EUDR_TOKEN_WALLET`

### Paso 0 — Preparar paquete compartido (solo la primera vez)

```powershell
cd packages\shared
npm install
npm run build
```

### Paso 1 — Levantar dependencias externas

> X CHANGE **no tiene docker-compose**: PostgreSQL y Redis deben estar corriendo por tu cuenta (Docker, servicio local, etc.).

**Con Docker** (si lo tenés):

```powershell
docker run -d --name terra-xchange-pg -e POSTGRES_DB=terra_x_change -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:16
docker run -d --name terra-xchange-redis -p 6379:6379 redis:7
```

### Paso 2 — Instalar y levantar backend (Terminal 1)

```powershell
cd "TERRA X CHANGE\backend"
npm install
Copy-Item .env.example .env   # si el .env.example existe; si no, crealo con las vars de abajo
npm run start:dev
```

✅ Backend en `http://localhost:3000`

**Variables de entorno** del backend (crea `.env` en `TERRA X CHANGE\backend\`):

| Variable | Default | Uso |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL |
| `DB_PORT` | `5432` | PostgreSQL |
| `DB_USERNAME` | `postgres` | PostgreSQL (NOTA: es `DB_USERNAME`, no `DB_USER`) |
| `DB_PASSWORD` | `password` | PostgreSQL |
| `DB_NAME` | `terra_x_change` | PostgreSQL |
| `PORT` | `3000` | Puerto HTTP |
| `JWT_SECRET` | `your-secret-key` | Firma JWT (cambiar en produção) |
| `ETH_RPC_URL` | `https://polygon-rpc.com/` | RPC Polygon |
| `X_COIN_ADDRESS` | `0x0000...0000` | Contrato X Coin |
| `PRIVATE_KEY` | *(vacío)* | Clave wallet (¡nunca a git!) |
| `WALLET_ENCRYPTION_KEY` | `terra-xchange-dev-key` | Cifrado claves wallet |

### Paso 3 — Instalar y levantar frontend móvil (Terminal 2)

```powershell
cd "TERRA X CHANGE\frontend"
npm install
npx expo start
```

Verás un **QR**. Escanéalo con **Expo Go** (Play Store/App Store) — el teléfono debe estar en la MISMA red Wi-Fi que tu PC. Atajos de teclado:

| Tecla | Acción |
|---|---|
| `a` | Abrir en emulador Android |
| `i` | Abrir en simulador iOS (solo macOS) |
| `w` | Abrir en navegador web |
| `r` | Recargar la app |
| `m` | Menú del dev menu |

### Scripts del frontend

```powershell
npm run start     # expo start (QR)
npm run android   # expo start --android
npm run ios       # expo start --ios
npm run web       # expo start --web
npm test          # jest --watchAll=false
```

---

## 🔌 CONECTAR FRONTEND ⇄ BACKEND (IMPORTANTE)

> ⚠️ La URL del backend está **HARDCODEADA** en el frontend. Si tu backend no está en `localhost:3000`, cámbiala:

| Archivo | Constante | Línea |
|---|---|---|
| `src\screens\LoginScreen.tsx` | `API_BASE = 'http://localhost:3000/api/auth'` | 7 |
| `src\screens\RegisterScreen.tsx` | `API_BASE = 'http://localhost:3000/api/auth'` | 5 |
| `src\screens\WalletScreen.tsx` | `API_BASE = 'http://localhost:3000/api/wallet'` | 6 |

**Cómo saber qué IP usar:**

| Dónde corre la app | URL que debes poner |
|---|---|
| Navegador Web (mismo PC) | `http://localhost:3000/api/...` |
| Simulador iOS | `http://localhost:3000/api/...` |
| Emulador Android | `http://10.0.2.2:3000/api/...` |
| Teléfono físico | `http://IP-DE-TU-PC:3000/api/...` (ver con `ipconfig`; misma Wi-Fi) |

---

## ⚠️ CORS EN MODO WEB

El backend de X CHANGE **no tiene `enableCors()`**. Esto NO afecta Android/iOS, pero **bloquea `expo start --web`** (fetch desde `8081` → `3000`).

**Fix (si querés web)** en `TERRA X CHANGE\backend\src\main.ts`:

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });   // ← AGREGAR ESTA LÍNEA
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## 🧪 Tests

```powershell
# Backend (Jest + Supertest)
cd "TERRA X CHANGE\backend"
npm test

# Frontend (Jest + Testing Library RN)
cd "TERRA X CHANGE\frontend"
npm test
```

---

## 📦 Módulos implementados

- ✅ **Auth** — registro/login JWT + bcrypt, MFA TOTP (Google Authenticator), biométricos (huella/FaceID; en web se desactiva por no existir API de biométricos)
- ✅ **Wallet** — wallets Polygon, balance X Coin/stablecoins, transferencias, conversión fiat, integración ethers
- ✅ **Staking** — lock X Coin, rewards 10% anual, unstake/retiro
- ✅ **Métricas** — `/metrics` y `/metrics/summary` (telemetría)
- 🚀 Próximas — NFTs, integración TERRA LINK/GO, pagos QR

---

## 📡 API Endpoints (backend `localhost:3000`)

### Auth (`/api/auth`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/:userId/mfa/setup` | Configurar MFA (secreto TOTP) |
| POST | `/api/auth/:userId/mfa/verify` | Verificar MFA |

### Wallet (`/api/wallet`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/wallet/create` | Crear wallet |
| GET | `/api/wallet/:id/balance` | Balance |
| POST | `/api/wallet/:id/transfer` | Transferir X Coin |
| POST | `/api/wallet/stake` | Staking desde wallet |
| GET | `/api/wallet/rewards` | Recompensas |
| POST | `/api/wallet/fiat-convert` | Fiat ↔ crypto |

### Staking (`/api/staking`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/staking/create` | Crear stake |
| GET | `/api/staking/:walletId/stakes` | Stakes de wallet |
| GET | `/api/staking/:stakeId/rewards` | Recompensas |
| POST | `/api/staking/:stakeId/unstake` | Retirar |

### Métricas (`/metrics`) y Health
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/metrics` · `/metrics/summary` | Métricas |
| GET | `/` | Health check |

---

## 🛠️ Troubleshooting

| Problema | Causa | Solución |
|---|---|---|
| `ECONNREFUSED :5432` | PostgreSQL apagado | Levantar Postgres (Paso 1) y revisar `DB_*` |
| `ECONNREFUSED :6379` | Redis apagado | Levantar Redis (Paso 1) |
| App no conecta al backend | `localhost` apunta al teléfono | Usar IP local del PC (tabla de IPs) |
| `Network request failed` (emulador Android) | `localhost` no resuelve | Usar `10.0.2.2` |
| Error CORS en web | Backend sin enableCors | Ver sección ⚠️ CORS |
| `expo-local-authentication` falla en web | API no existe en navegador | Ya está protegida (guard en LoginScreen.tsx:98) |
| `Cannot find module '@terra/shared'` | Shared sin compilar | `cd packages\shared; npm run build` |
| Versión react/react-dom | Deben coincidir | Verificar `react: 19.1.0` = `react-dom: 19.1.0` |

---

## 📚 Documentación

- [Arquitectura](docs/architecture.md) · [API Reference](docs/api-reference.md)
- [Development Guide](docs/development-guide.md) · [Matriz de Tests](docs/test-matrix-detailed.md)

## 🔐 Seguridad

- JWT + MFA (TOTP) + biométricos · bcrypt para passwords
- Claves de wallet cifradas (`WALLET_ENCRYPTION_KEY`)
- `PRIVATE_KEY` y `JWT_SECRET` nunca en git
- Logs de auditoría · objetivo GDPR/ISO 27001

## 🛣️ Roadmap

- **Fase 1** (actual): Wallet básica, X Coin, Staking
- **Fase 2**: Integración TERRA LINK/GO, Pagos QR
- **Fase 3**: DAO Governance, IoT Payments, Expansión global

## 📞 Contacto

Mario - Tu Ecosistema TERRA

**Desarrollado con ❤️ para la economía agrícola descentralizada**