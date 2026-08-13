# 🌍 AG TECH EC – Plataforma TERRA Ecosystem

## 1. Descripción General
El ecosistema TERRA integra:
- **TERRA LINK** → Validación agrícola + emisión de NFTs dinámicos como garantías financieras.
- **TERRA GO** → Marketplace para compra/venta de lotes certificados.
- **TERRA X CHANGE** → Wallet con pagos, staking y créditos AgroDeFi.
- **X Coin** → Criptomoneda nativa para transacciones, créditos y recompensas.

---

## 2. Arquitectura General

### Backend
- **Framework:** NestJS
- **Base de datos:** PostgreSQL + PostGIS
- **Servicios:** Validación satelital, IoT, auditoría, compliance
- **Autenticación:** JWT + MFA + biométricos
- **Integraciones:** Bancos, cooperativas, marketplace, wallet

### Frontend
- **Framework:** React Native (Expo)
- **Pantallas:** Login, Registro, Dashboard, Marketplace, Wallet
- **Dependencias clave:** axios, expo-local-authentication
- **Navegación:** React Navigation

### Blockchain
- **Red:** Polygon
- **Contratos:** Solidity + Hardhat
- **NFTs:** Dynamic Agricultural NFTs
- **Token nativo:** X Coin (ERC-20)

### Cloud
- **Proveedor:** AWS (EKS, S3, CloudFront)
- **Infraestructura como código:** Terraform
- **Almacenamiento descentralizado:** IPFS
- **Monitoreo:** Prometheus + Grafana

---

## 3. Flujo de Datos

1. Productor → envía datos satelitales/IoT → Backend valida.  
2. Backend → genera NFT dinámico en Polygon.  
3. NFT → se vincula a wallet del productor.  
4. Banco → usa NFT como garantía de crédito en X Coin.  
5. Comerciante → compra lote certificado en TERRA GO.  
6. AG TECH EC → cobra fees y gestiona trazabilidad.

---

## 4. Endpoints Principales (API Reference)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/register` | POST | Registro de usuario con MFA |
| `/api/auth/login` | POST | Login con email/password + biométricos |
| `/api/validation/start` | POST | Inicia validación satelital/IoT |
| `/api/nft/mint` | POST | Genera NFT agrícola dinámico |
| `/api/nft/update` | PUT | Actualiza metadatos y valoración |
| `/api/nft/collateral` | POST | Marca NFT como garantía de crédito |
| `/api/report/compliance` | GET | Genera reporte normativo |

---

## 5. Guía de Desarrollo (VS Code)

### Instalación
```bash
# Backend
cd backend
npm install
npm run build
npm run start:dev

# Frontend
cd frontend
npm install
npm start
```

### Tareas VS Code
- `Ctrl+Shift+B` → Compila backend
- `F5` → Ejecuta entorno de pruebas
- `tasks.json` → Scripts de validación y despliegue

---

## 6. Seguridad

- 🔐 MFA + biométricos (huella, FaceID)
- 🔐 JWT con roles RBAC
- 🔐 Logs inmutables en AWS CloudWatch
- 🔐 Encriptación AES-256 + TLS 1.3

---

## 7. Modelo PostGIS (Ejemplo)

```sql
CREATE TABLE plots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  owner_id INT,
  certification VARCHAR(50),
  geom GEOMETRY(POLYGON, 4326),
  valuation NUMERIC,
  nft_token VARCHAR(255)
);
```

---

## 8. Roadmap Técnico

| Fase | Objetivo | Entregables |
|------|-----------|-------------|
| Fase 1 | Backend + NFT dinámico | NestJS + Solidity + PostGIS |
| Fase 2 | Integración con bancos y wallet | APIs + contratos de crédito |
| Fase 3 | Escalabilidad y gobernanza DAO | Terraform + votaciones en blockchain |

---

## 9. Repositorios

- `backend/` → NestJS + PostGIS + API Gateway
- `frontend/` → React Native + Expo
- `contracts/` → Solidity + Hardhat
- `docs/` → Documentación técnica
- `infra/` → Terraform + AWS Config

## 10. Referencias de arquitectura y desarrollo

- `docs/architecture-c4-level2.md` → Diagrama C4 nivel 2 con módulos propuestos (Satellite, Blockchain Mint, Compliance, Audit/ESG)
- `docs/roadmap-implementation.md` → Plan de desarrollo en sprints con issues priorizados
- `docs/api-cost-model.md` → APIs clave, costos operativos y planes comerciales de TERRA LINK

---

## ✅ Objetivo Final
La plataforma TERRA debe ser el **hub financiero agrícola descentralizado**, donde los NFTs agrícolas funcionan como **garantías sólidas para créditos**, integrados con marketplace, wallet y bancos/cooperativas.
