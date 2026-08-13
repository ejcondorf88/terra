# 🛠️ Guía de Desarrollo – Terra GO

## Configuración del Entorno

### 1. Clonar y configurar
```bash
git clone <repo-url>
cd terra-go
cp .env.example .env
```

### 2. Docker (recomendado)
```bash
# Levanta PostgreSQL y otros servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### 3. Base de datos
```bash
# Conectar a PostgreSQL (desde dentro del contenedor o un cliente)
psql -U terra -d terrago -h localhost

# Ejecutar esquema
\i database/schema.sql
```

---

## Desarrollo Local

### Terminal 1: Frontend
```bash
cd frontend
npm run dev
# http://localhost:3000
```

### Terminal 2: Backend
```bash
cd backend
npm run start:dev
# http://localhost:3000/api (nota: mismo puerto en dev)
```

### Terminal 3: Blockchain (Hardhat)
```bash
cd contracts
npx hardhat node
# http://localhost:8545
```

---

## Testing

### Backend (NestJS)
```bash
cd backend
npm run test                # Tests unitarios
npm run test:e2e           # Tests E2E
npm run test:cov           # Cobertura
```

### Frontend (Next.js)
```bash
cd frontend
npm run test                # Jest tests
npm run test:watch         # Watch mode
```

### Contracts (Hardhat)
```bash
cd contracts
npx hardhat test            # Tests de contratos
npx hardhat test --coverage # Cobertura
```

---

## Build para Producción

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Contracts
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network polygon-mumbai
```

---

## Estructura de Código

### Backend (NestJS)
```
backend/src/
├── auth/                    # Autenticación JWT
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── strategies/          # Passport strategies
│   └── guards/              # JWT guards
├── users/                   # Gestión de usuarios
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── dto/                 # Data Transfer Objects
│   └── interfaces/          # Type definitions
├── app.module.ts
├── app.controller.ts
└── main.ts
```

### Frontend (Next.js)
```
frontend/src/
├── app/
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   ├── auth/                # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Dashboard pages
│   └── ...
├── components/              # React components
├── lib/                     # Utilities
│   ├── api.ts              # API client
│   └── auth-context.tsx    # Auth context
└── globals.css
```

### Contracts (Solidity)
```
contracts/
├── contracts/
│   ├── AgroNFT.sol         # ERC-721 for agricultural NFTs
│   ├── TokenizedLote.sol   # ERC-1155 (próxima fase)
│   └── PaymentGateway.sol  # Payments (próxima fase)
├── hardhat.config.ts
├── test/
└── scripts/
```

---

## Convenciones de Código

### TypeScript
- Usar `interface` para tipos públicos
- Usar `type` para tipos internos
- Archivos: camelCase.ts
- Clases: PascalCase
- Funciones: camelCase

### Commits
```
feat: agregar nueva funcionalidad
fix: corregir bug
docs: actualizar documentación
style: cambios de formato
refactor: refactorizar código
test: agregar tests
chore: tareas de build/dependencias
```

---

## Herramientas Útiles

### API Testing
```bash
# Usar Postman, Insomnia o curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Database Management
- DBeaver (GUI para PostgreSQL)
- pgAdmin (Web UI)
- `psql` (CLI)

### Debugging
- VS Code Debugger
- Chrome DevTools (Frontend)
- `console.log` / `Logger` (NestJS)

---

## Solución de Problemas

### Puerto en uso
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Limpiar caché
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Resetear base de datos
```bash
docker-compose down -v
docker-compose up -d
# Reimportar schema
```

### Errores de compilación
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Solidity Docs](https://docs.soliditylang.org)
- [Hardhat Docs](https://hardhat.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
