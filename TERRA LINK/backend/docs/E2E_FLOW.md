# 📑 Flujo End-to-End EUDR Token Wallet - Implementación Completa

## 🎯 Descripción General

Backend TERRA LINK implementa un flujo E2E completo de tokenización agrícola con seguridad RBAC e **integración con TRACES (Sistema de Regulación Europea EUDR)**:

```
┌─────────────┐    ┌──────────┐    ┌─────────┐    ┌───────────────┐    ┌─────────────────┐
│ Productor   │───>│ Crear    │───>│ Mint    │───>│ Registrar EUDR│───>│ TRACES API      │
│ (Plot)      │    │ NFT      │    │ en      │    │ + ESG Report  │    │ (Validación)    │
│             │    │ (IPFS +  │    │ Polygon │    │               │    │                 │
│             │    │ Metadata)│    │         │    │               │    │                 │
└─────────────┘    └──────────┘    └─────────┘    └───────────────┘    └─────────────────┘
        ↓
  GeoValidation
  (Satélite)
```

---

## 🔐 Matriz de Roles y Acceso RBAC

| Endpoint | Método | Rol Requerido | Función |
|----------|--------|---------------|---------|
| `/plots` | POST | `productor`, `admin` | Crear lote con validación satelital |
| `/plots/:id` | GET | `productor`, `admin`, `exportador`, `banco` | Consultar lote |
| `/geo/validate` | POST | `productor`, `admin` | Validar geometría GeoJSON |
| `/nfts` | POST | `productor`, `admin` | Mint NFT en Polygon + IPFS |
| `/nfts/:id` | GET | `productor`, `admin`, `banco`, `exportador` | Consultar NFT y metadata |
| `/nfts/:id/collateralize` | PATCH | `banco`, `admin` | Collateralizar NFT |
| `/compliance/eudr` | POST | `exportador`, `admin` | Registrar en EUDR/TRACES |
| `/compliance/eudr/:traceId` | GET | `admin`, `banco`, `exportador` | Consultar status EUDR |
| `/compliance/esg-reports` | POST | `banco`, `admin` | Generar reporte ESG |
| `/compliance/esg-reports/:id` | GET | `admin`, `banco`, `exportador` | Consultar reporte ESG |
| `/compliance/certifications` | POST | `admin`, `exportador` | Crear certificación |
| `/compliance/certifications` | GET | `admin` | Listar certificaciones |

---

## 🌍 Integración TRACES Real (Fase 1 - COMPLETADA)

### ¿Qué es TRACES?

**TRACES** (Trade and Reference System) es el sistema oficial de la Unión Europea para cumplimiento regulatorio EUDR (European Deforestation Regulation - Regulación EU 2023/1115).

### Arquitectura TRACES Integration

**TraceAdapter** → Consumidor HTTP de TRACES API
- Validación de `traceId` contra sistema oficial
- Registración de nuevos traces
- Obtención de historial de cambios
- Validación de `eoriNumber` (European Operator Registration ID)

**TraceService** → Lógica de negocio EUDR
- Enriquecimiento de registros con datos TRACES
- Evaluación automática de riesgos de cumplimiento
- Sincronización periódica con estado oficial
- Gestión de certificaciones (GlobalGAP, Organic, etc.)

### Ejemplo: Registrar con TRACES

**Endpoint:** `POST /compliance/eudr`

```json
{
  "trace_id": "550e8400-e29b-41d4-a716-446655440000",
  "registry_number": "EUDR-2026-001",
  "plot_id": 42,
  "compliance_status": "pending",
  "source": "TRACES System",
  "eori_number": "ES1234567890AB",  // Validado automáticamente
  "tenant_id": 1
}
```

**Respuesta (201):**
```json
{
  "id": 100,
  "trace_id": "550e8400-e29b-41d4-a716-446655440000",
  "registry_number": "EUDR-2026-001",
  "plot_id": 42,
  "compliance_status": "verified",              // ✅ Enriquecido por TRACES
  "issues": [],                                  // ✅ Validado por TRACES
  "trace_url": "https://traces.ec.europa.eu/...",
  "eori_number": "ES1234567890AB",
  "operator_name": "Agro Operator S.L.",
  "is_valid": true,
  "risk_level": "low",
  "trace_registered_date": "2026-06-23T00:00:00Z",
  "trace_last_updated": "2026-06-23T12:00:00Z",
  "created_at": "2026-06-23T12:00:00Z",
  "tracesValidation": {                         // ✅ Nuevo
    "traceId": "550e8400-e29b-41d4-a716-446655440000",
    "isValid": true,
    "complianceStatus": "verified",
    "operatorName": "Agro Operator S.L.",
    "riskLevel": "low"
  },
  "riskAssessment": {                           // ✅ Nuevo
    "level": "low",
    "issues": []
  }
}
```

### Validaciones Automáticas TRACES

**EORI Number Format:**
- Formato: `CC` + 12 caracteres (ej: `ES1234567890AB`)
- Validación de país real EU
- Integración con registro oficial EORI

**Compliance Status Mapping:**
- `verified` → Cumplimiento comprobado en TRACES ✅
- `pending` → En proceso de verificación ⏳
- `rejected` → No cumple regulaciones ❌
- `unknown` → TRACES API no disponible (fallback seguro)

### Configuración TRACES (Producción)

```bash
# .env
TRACES_API_URL=https://traces.ec.europa.eu/api/v1
TRACES_API_KEY=your-oauth2-token-here  # OAuth2 en producción
```

### Reintentos Automáticos

Si TRACES está temporalmente indisponible:
- Estado se marca como `unknown`
- Registro se guarda como `provisional`
- Sincronización automática cada 24 horas
- Alertas para administradores si falla validación

---

### 1️⃣ Crear Lote (Plot)

**Endpoint:** `POST /plots`

**Roles Permitidos:** `productor`, `admin`

**Solicitud:**
```json
{
  "name": "Farm Lote A",
  "owner_id": 123,
  "geom": {
    "type": "Polygon",
    "coordinates": [[
      [-73.97, 40.77],
      [-73.97, 40.78],
      [-73.96, 40.78],
      [-73.96, 40.77],
      [-73.97, 40.77]
    ]]
  },
  "tenant_id": 1,
  "certification": "GlobalGAP"
}
```

**Respuesta (201):**
```json
{
  "id": 42,
  "name": "Farm Lote A",
  "owner_id": 123,
  "geom": "SRID=4326;POLYGON(...)",
  "tenant_id": 1,
  "certification": "GlobalGAP",
  "created_at": "2026-06-23T12:00:00Z"
}
```

**Validaciones:**
- Geometría GeoJSON valida (Polygon)
- Mínimo 4 coordenadas
- Cálculo automático de área (hectáreas)

---

### 2️⃣ Mint NFT en Polygon

**Endpoint:** `POST /nfts`

**Roles Permitidos:** `productor`, `admin`

**Solicitud:**
```json
{
  "plotId": 42,
  "metadata": {
    "name": "Agricultural NFT - Lote A",
    "description": "Tokenized plot with compliance metadata",
    "certifications": ["GlobalGAP", "EUDR-Compliant"],
    "riskScore": 15,
    "valuation": 50000
  }
}
```

**Respuesta (201):**
```json
{
  "token_id": "0x1234567890abcdef...",
  "token_uri": "ipfs://QmXxxx...",
  "metadata_uri": "ipfs://QmYyyy...",
  "transaction_hash": "0xabcd1234...",
  "plot_id": 42,
  "minted_at": "2026-06-23T12:05:00Z"
}
```

**Proceso Interno:**
1. Valida que el plot exista
2. Sube metadata a IPFS
3. Mint NFT en contrato Polygon (AgriculturalNFT)
4. Registra `token_uri`, `metadata_uri`, `transaction_hash` en BD

---

### 3️⃣ Registrar en EUDR/TRACES

**Endpoint:** `POST /compliance/eudr`

**Roles Permitidos:** `exportador`, `admin`

**Solicitud:**
```json
{
  "trace_id": "TRACE-2026-000042",
  "registry_number": "EUDR-CERT-42",
  "plot_id": 42,
  "compliance_status": "verified",
  "source": "TRACES System",
  "tenant_id": 1
}
```

**Respuesta (201):**
```json
{
  "id": 100,
  "trace_id": "TRACE-2026-000042",
  "registry_number": "EUDR-CERT-42",
  "plot_id": 42,
  "compliance_status": "verified",
  "source": "TRACES System",
  "created_at": "2026-06-23T12:10:00Z"
}
```

**Consultar Status:**
```bash
GET /compliance/eudr/TRACE-2026-000042
```

---

### 4️⃣ Generar Reporte ESG

**Endpoint:** `POST /compliance/esg-reports`

**Roles Permitidos:** `banco`, `admin`

**Solicitud:**
```json
{
  "plot_id": 42,
  "category": "water_management",
  "score": 85,
  "report_date": "2026-06-23",
  "details": "Sustainable water usage, drip irrigation system",
  "tenant_id": 1
}
```

**Respuesta (201):**
```json
{
  "id": 200,
  "plot_id": 42,
  "category": "water_management",
  "score": 85,
  "report_date": "2026-06-23",
  "details": "Sustainable water usage, drip irrigation system",
  "created_at": "2026-06-23T12:15:00Z"
}
```

---

## 🔐 Seguridad y Autenticación

### Headers Requeridos

Todos los endpoints (excepto `POST /auth/login`) requieren:

```bash
Authorization: Bearer <JWT_TOKEN>
```

### Ejemplo cURL - Crear Lote

```bash
curl -X POST http://localhost:3000/plots \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Farm A",
    "owner_id": 123,
    "geom": {...},
    "tenant_id": 1
  }'
```

### Ejemplo cURL - Mint NFT

```bash
curl -X POST http://localhost:3000/nfts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "plotId": 42,
    "metadata": {
      "name": "Agricultural NFT",
      "certifications": ["GlobalGAP"],
      "riskScore": 15,
      "valuation": 50000
    }
  }'
```

---

## 🧪 Pruebas de Autorización (Jest)

**Archivo:** `src/modules/compliance/compliance-rbac.spec.ts`

Valida que:
- ✅ `productor` puede crear plots y NFTs
- ✅ `exportador` puede registrar EUDR
- ✅ `banco` puede generar reportes ESG y collateralizar
- ✅ `admin` tiene acceso total
- ❌ Roles incorrectos son rechazados con 403

**Ejecutar tests:**
```bash
npm test -- compliance-rbac.spec.ts
```

---

## 📊 Arquitectura de Datos

### Flujo de Entidades

```
Plot (lote)
  ├── NftMetadata (metadata IPFS + on-chain)
  ├── Certification (certificaciones)
  ├── EudrRegistry (registro EUDR/TRACES)
  └── EsgReport (reportes ESG)
```

### Campos Persistidos en `eudr_registry`

- `trace_id` → Identificador TRACES / EUDR asociado al operador o lote
- `eori_number` → Número EORI validado por TRACES
- `operator_name` → Nombre del operador registrado en TRACES
- `is_valid` → Estado de validación del trace según TRACES
- `risk_level` → Nivel de riesgo calculado por TRACES (`low`/`medium`/`high`)
- `trace_registered_date` → Fecha de registro TRACES
- `trace_last_updated` → Última actualización de TRACES
- `trace_url` → Enlace público hacia el registro TRACES
- `issues` → Problemas o alertas devueltas por TRACES

### Tablas Base de Datos

| Tabla | Descripción |
|-------|------------|
| `plots` | Lotes/parcelas con geometría PostGIS |
| `nft_metadata` | Metadata IPFS, token_uri, transaction_hash |
| `certifications` | Certificaciones (GlobalGAP, organic, etc) |
| `eudr_registry` | Registros de cumplimiento EUDR/TRACES con metadatos TRACES persistidos |
| `esg_reports` | Reportes ambientales/sociales |

---

## 🚀 Próximos Pasos

### Funcionalidades Futuras

1. **Collateralización Dinámica**
   - Ajuste automático de límites de crédito basado en risk_score
   - Integration con Smart Contracts de crédito

2. **Dashboard Monitoreo**
   - Métricas de compliance en tiempo real
   - Alertas de vencimiento de certificaciones

3. **Integración TRACES Real**
   - API REST a sistema TRACES oficial
   - Sincronización automática de registros

4. **Reportes Avanzados**
   - Export PDF de certificados
   - Auditoría completa de cadena de custodia

---

## 📝 Notas de Desarrollo

### Módulos Principales

- **PlotModule** → Crear/leer lotes con validación satelital
- **NftModule** → Mint NFTs + IPFS + Polygon
- **GeoModule** → Validación geométrica PostGIS
- **ComplianceModule** → EUDR + ESG + Certifications
- **AuthModule** → JWT + RBAC guards

### Dependencias

- `ethers.js` → Interacción Polygon
- `ipfs-http-client` → Upload metadata a IPFS
- `typeorm` → ORM + migrations
- `class-validator` → DTO validation
- `@nestjs/jwt` → Token generation/verification

---

## ✅ Checklist E2E

- [x] PlotController con RBAC (productor, admin)
- [x] NftController con RBAC (productor, admin)
- [x] GeoController con RBAC (productor, admin)
- [x] ComplianceController EUDR (exportador, admin)
- [x] ComplianceController ESG (banco, admin)
- [x] Tests de autorización RBAC
- [x] DTOs con validación
- [x] AuthModule inyectado en todos los módulos
- [x] Documentación endpoint

---

## 📞 Soporte

Para issues o preguntas:
- Review: [TERRA LINK README](../README.md)
- Architecture: [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- Migrations: `npm run migration:run`
