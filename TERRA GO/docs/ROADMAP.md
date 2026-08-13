# 🚀 Roadmap Técnico – Terra GO Marketplace

## 📅 Fase 1 – Fundamentos (Semanas 1–2) ✅ COMPLETADO
- [x] Configuración del entorno en VS Code (frontend, backend, contratos)
- [x] Instalación de dependencias iniciales (React/Next.js, NestJS, Hardhat, PostgreSQL)
- [x] Configuración de Docker y docker-compose para desarrollo local
- [x] Estructura del proyecto definida

**Entregable**: Proyecto inicial funcionando en local con estructura definida.

---

## 📅 Fase 2 – Onboarding y autenticación (Semanas 3–4) 🚧 EN PROGRESO
- [ ] Registro y login de usuarios (productores, inversionistas)
- [ ] Integración de KYC/AML básico
- [ ] Dashboard inicial de perfil con datos de usuario
- [ ] JWT tokens para autenticación
- [ ] Validación de emails

**Tareas**:
- Backend: User entity, Auth service, Auth controller (login, register, profile)
- Frontend: Login page, Register page, Profile dashboard
- Database: user_roles tabla para tipos de usuario

**Entregable**: Usuarios pueden registrarse y acceder a su perfil.

---

## 📅 Fase 3 – Gestión de lotes y certificación (Semanas 5–6)
- [ ] Formulario para registrar lotes certificados EUDR
- [ ] Validación automática de certificación
- [ ] API para importar datos satelitales/IoT
- [ ] CRUD de lotes en backend

**Tareas**:
- Backend: Lote entity, LotesService, LotesController
- Frontend: Formulario de creación de lotes, dashboard de lotes
- Database: lotes, certificaciones tablas

**Entregable**: Lotes certificados registrados en la base de datos.

---

## 📅 Fase 4 – Tokenización y NFTs (Semanas 7–9)
- [ ] Smart contracts para tokenización (ERC-721/1155)
- [ ] Generación de NFTs con metadatos verificables
- [ ] Integración con wallets (Metamask, WalletConnect)
- [ ] Función de minteo de NFTs

**Tareas**:
- Contracts: AgroNFT (ERC-721), TokenizedLote (ERC-1155)
- Backend: NFT metadata service, mint endpoint
- Frontend: Wallet connection, mint button, NFT gallery

**Entregable**: Lotes convertidos en NFTs agrícolas únicos.

---

## 📅 Fase 5 – Marketplace Agro-DeFi (Semanas 10–12)
- [ ] Catálogo de tokens/NFTs con filtros y buscador
- [ ] Módulo de trading P2P
- [ ] Integración de stablecoins (USDC/DAI)
- [ ] Órdenes de compra/venta

**Tareas**:
- Backend: Marketplace service, trading endpoints
- Frontend: NFT listing, search, filters, buy/sell interface
- Database: orders, trades tablas

**Entregable**: Marketplace funcional con compra/venta de activos digitales.

---

## 📅 Fase 6 – Pagos y liquidez (Semanas 13–14)
- [ ] Smart contracts de pagos
- [ ] Pasarela fiat ↔ cripto
- [ ] Auditoría de seguridad en transacciones
- [ ] Liquidación de pagos

**Tareas**:
- Contracts: PaymentGateway, escrow contract
- Backend: Payment service, fiat gateway integration
- Frontend: Payment interface, transaction history

**Entregable**: Pagos habilitados con criptodivisa propia y stablecoins.

---

## 📅 Fase 7 – Storytelling e impacto social (Semanas 15–16)
- [ ] Página de storytelling con datos del productor
- [ ] Integración multimedia (fotos, videos, testimonios)
- [ ] Certificado digital descargable
- [ ] Dashboard de impacto

**Tareas**:
- Backend: Producer profile enrichment, impact metrics
- Frontend: Storytelling page, media gallery, certificates
- Database: media, certificates tablas

**Entregable**: Tokens/NFTs con narrativa de impacto social y trazabilidad.

---

## 🎯 Resultado esperado (16 semanas / 4 meses)
- MVP completo del Marketplace Terra GO
- Integración de certificación EUDR, tokenización, NFTs y pagos
- Ecosistema listo para pruebas piloto con productores e inversionistas
