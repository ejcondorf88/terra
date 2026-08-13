# Terra GO Marketplace

## Descripción del Proyecto
Terra GO es un marketplace blockchain para productos agrícolas, enfocándose en trazabilidad, tokenización y cumplimiento regulatorio utilizando NFTs y contratos inteligentes.

## Stack Tecnológico
- **Frontend**: React + Next.js + TailwindCSS
- **Backend**: Node.js + NestJS/Express
- **Blockchain**: Ethereum/Polygon con contratos inteligentes en Solidity
- **Base de datos**: PostgreSQL + Redis
- **Infraestructura**: Docker + Kubernetes
- **Integraciones**: Wallets (Metamask, WalletConnect), pasarela fiat ↔ cripto, APIs satelitales/IoT

## Estructura del Proyecto
```
terra-go/
├── frontend/        # React/Next.js con TailwindCSS
├── backend/         # NestJS con JWT auth, TypeORM
├── contracts/       # Smart contracts en Solidity con Hardhat
├── database/        # Esquemas SQL y migraciones
├── docs/            # Documentación técnica
├── docker/          # Configuración de contenedores
├── docker-compose.yml
├── .github/
│   └── copilot-instructions.md
└── .env.example
```

## Instrucciones de Instalación

### Requisitos previos
- Node.js 18+
- npm o yarn
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd terra-go
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

### 3. Instalar dependencias

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

**Contracts:**
```bash
cd contracts
npm install
```

### 4. Iniciar servicios con Docker
```bash
docker-compose up -d
```

Este comando levanta:
- PostgreSQL en puerto 5432
- Backend en puerto 3000

### 5. Ejecutar en desarrollo

**Frontend:**
```bash
cd frontend
npm run dev
# Accede a http://localhost:3000
```

**Backend:**
```bash
cd backend
npm run start:dev
# API en http://localhost:3000/api
```

**Contracts (Hardhat node local):**
```bash
cd contracts
npx hardhat node
# Blockchain local en http://localhost:8545
```

## Fase Actual
**Fase 2: Onboarding y Autenticación** ✅ COMPLETADO

### Características implementadas:
- ✅ Endpoint de registro con contraseña hasheada
- ✅ Endpoint de login con JWT
- ✅ Autenticación basada en tokens
- ✅ Verificación de identidad del usuario
- ✅ Dashboard de perfil de usuario
- ✅ Componentes UI de login/registro
- ✅ Autenticación en frontend con Context API
- ✅ Almacenamiento seguro de tokens

### Próximas fases:
- Fase 3: Gestión de lotes y certificación EUDR
- Fase 4: Tokenización y NFTs
- Fase 5: Marketplace Agro-DeFi
- Fase 6: Pagos y liquidez
- Fase 7: Storytelling e impacto social

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users/:id` - Obtener perfil de usuario
- `GET /api/users` - Listar todos los usuarios (requiere auth)

### Lotes (Próxima fase)
- `POST /api/lotes` - Crear nuevo lote
- `GET /api/lotes` - Listar lotes
- `GET /api/lotes/:id` - Obtener lote específico
- `PUT /api/lotes/:id` - Actualizar lote
- `DELETE /api/lotes/:id` - Eliminar lote

Para más detalles, ver [docs/API.md](docs/API.md)

## Roadmap
Ver [docs/ROADMAP.md](docs/ROADMAP.md) para el roadmap técnico completo de 16 semanas.

## Contribución
1. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
2. Commit tus cambios: `git commit -m 'Add mi feature'`
3. Push a la rama: `git push origin feature/mi-feature`
4. Abre un Pull Request

## Licencia
MIT License - 2026