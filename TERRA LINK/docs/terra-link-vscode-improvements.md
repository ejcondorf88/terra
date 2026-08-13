# 🧩 Documentación Técnica – Mejoras TERRA LINK

## 1. Objetivo
Implementar las mejoras del roadmap técnico para consolidar TERRA LINK como el **núcleo de la banca descentralizada**, optimizando su arquitectura, seguridad y funcionalidades financieras.

---

## 2. Alcance
Esta documentación cubre:
- Refactorización del backend NestJS.
- Extensión del modelo de datos PostGIS.
- Integración de contratos inteligentes en Polygon.
- Automatización de despliegue en AWS EKS.
- Implementación de auditoría y trazabilidad IPFS.

---

## 3. Arquitectura Base
**Stack tecnológico:**
| Capa | Tecnología | Propósito |
|------|-------------|------------|
| Backend | NestJS | API Gateway y lógica de negocio |
| Base de datos | PostgreSQL + PostGIS | Validaciones geoespaciales y datos agrícolas |
| Blockchain | Solidity + Hardhat (Polygon) | NFTs dinámicos y contratos de crédito |
| Cloud | AWS EKS + S3 + Terraform | Infraestructura escalable y segura |
| Auditoría | IPFS + CloudWatch | Trazabilidad y cumplimiento normativo |

---

## 4. Mejoras Técnicas por Fase

### 🔹 Fase 1 – Fundamentos (Meses 1–3)
- Refactorizar entidades `plot`, `certification`, `production-history`, `nft-metadata`, `credit-proposal`.
- Implementar validaciones satelitales y IoT en `geo.service.ts`.
- Extender API REST con endpoints seguros (JWT + MFA).
- Integrar auditoría inmutable con IPFS y logs firmados.

### 🔹 Fase 2 – Funcionalidades Financieras (Meses 4–6)
- Crear módulo `credit-smart-contract` para colateralización automática.
- Integrar contratos Solidity con backend vía `ethers.js`.
- Añadir soporte para stablecoins (USDC/DAI).
- Desarrollar dashboard financiero con métricas de riesgo y liquidez.

### 🔹 Fase 3 – Escalabilidad y Gobernanza (Meses 7–12)
- Desplegar infraestructura en AWS EKS con Terraform.
- Implementar DAO Governance para decisiones transparentes.
- Integrar interoperabilidad con otros ecosistemas DeFi.
- Configurar auditorías externas y monitoreo avanzado (Prometheus + Grafana).

---

## 5. Configuración de Entorno

### Variables `.env`
```env
DATABASE_URL=postgres://user:pass@localhost:5432/terralink
POLYGON_RPC_URL=https://polygon-rpc.com
AGRICULTURAL_NFT_ADDRESS=0xYourContractAddress
BLOCKCHAIN_PRIVATE_KEY=your_private_key
IPFS_GATEWAY=https://ipfs.io
JWT_SECRET=your_secret_key
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Comandos de desarrollo
```bash
npm install
npm run build
npm run start:dev
npm run test:all
```

---

## 6. Pruebas y QA
- Ejecutar `npm run test:all` para validar backend + contratos.
- Revisar cobertura combinada en `coverage/combined`.
- Validar flujo NFT → crédito → liquidación.
- Reportar métricas de rendimiento y seguridad.

---

## 7. Entregables
- Código fuente actualizado en `src/modules/*`.
- Contratos Solidity auditados.
- Documentación actualizada en `docs/`.
- Reportes de cobertura y auditoría.

---

## ✅ Resultado Esperado
TERRA LINK debe operar como una **plataforma financiera descentralizada confiable**, donde los NFTs agrícolas funcionan como **garantías verificables** para créditos, integrados con bancos, cooperativas y el ecosistema TERRA X.
