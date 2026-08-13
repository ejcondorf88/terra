# Guía de Desarrollo - TERRA X CHANGE

## Requisitos Previos

- Node.js >= 20.13.1
- npm >= 10.5.2
- PostgreSQL 12+
- Redis 6+
- Expo CLI (para mobile)

## Configuración Inicial

### 1. Clonar y instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar variables de entorno

```bash
# En la raíz del proyecto
cp .env.example .env
```

Editar `.env` con valores reales:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=terra_x_change
X_COIN_ADDRESS=0x... # Dirección del contrato ERC-20
PRIVATE_KEY=0x... # Clave privada del wallet (solo dev)
JWT_SECRET=your-secret-key
```

### 3. Crear base de datos

```bash
# Conectarse a PostgreSQL
psql -U postgres -c "CREATE DATABASE terra_x_change;"
```

### 4. Iniciar servicios

```bash
# Terminal 1: Backend
cd backend
npm run start:dev
# Puerto: 3000

# Terminal 2: Frontend
cd frontend
npx expo start
# Scan QR para abrir en dispositivo/emulador
```

---

## Desarrollo

### Backend

**Estructura:**
- `src/auth/` - Autenticación, JWT, MFA
- `src/wallet/` - Gestión de wallets, blockchain
- `src/staking/` - Staking, rewards
- `src/entities/` - Modelos ORM

**Crear nuevo módulo:**

```bash
npx @nestjs/cli generate resource nombre_modulo
```

**Pruebas:**

```bash
# Unitarias y de integración
npm test

# E2E
npm run test:e2e

# Con cobertura
npm run test:cov
```

### Frontend

**Estructura:**
- `src/screens/` - Componentes principales
- `src/services/` - Llamadas a API
- `__tests__/` - Pruebas

**Agregar dependencia:**

```bash
npm install package-name
# o con legacy peer deps si hay conflictos
npm install package-name --legacy-peer-deps
```

**Pruebas:**

```bash
npm test
```

---

## Pruebas E2E

```bash
# Desde raíz del proyecto
# Asegurar que backend está corriendo en localhost:3000
npx playwright test

# Con interfaz UI
npx playwright test --ui
```

---

## CI/CD

GitHub Actions ejecuta automáticamente:
- Pruebas backend `npm test`
- Pruebas frontend `npm test`
- Pruebas E2E `npx playwright test`

En cada push a `main` o pull request.

---

## Seguridad (Producción)

- [ ] Usar HashiCorp Vault para claves privadas
- [ ] Configurar HTTPS/TLS 1.3
- [ ] Habilitar CORS selectivamente
- [ ] Rate limiting en endpoints
- [ ] Audit logging para transacciones
- [ ] KYC/AML integración
- [ ] Encriptación en reposo: AES-256

---

## Roadmap

**Fase 1 (Actual):** Wallet básica, X Coin, Staking, Auth
**Fase 2:** Integración TERRA LINK/GO, QR Payments
**Fase 3:** DAO Governance, IoT, Expansión Internacional