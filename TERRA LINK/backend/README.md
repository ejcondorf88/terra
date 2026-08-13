# Backend TERRA LINK

Este es el backend de TERRA LINK, construido con NestJS, PostgreSQL + PostGIS y TypeORM.

## Requisitos previos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL con PostGIS

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar base de datos:
   ```bash
   # Desde la raíz del proyecto
   docker-compose up -d
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. Ejecutar migraciones (si es necesario):
   ```bash
   npm run migration:run
   ```

## Ejecución

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Validación Geoespacial
- `POST /geo/validate` - Validar parcela con PostGIS

### NFTs
- `POST /nfts` - Crear NFT agrícola
- `GET /nfts/:id` - Obtener metadatos del NFT
- `PATCH /nfts/:id` - Actualizar NFT
- `PATCH /nfts/:id/collateralize` - Marcar como garantía
- `GET /nfts/plot/:plotId` - NFTs por parcela

### Créditos
- `POST /credit/proposal` - Crear propuesta de crédito
- `POST /credit/evaluate/:tokenId` - Evaluar colateral
- `GET /credit/proposals/:borrowerId` - Propuestas por prestatario
- `PATCH /credit/proposal/:id/status` - Actualizar estado

## Arquitectura

- **Módulos**: geo, nft, credit
- **Entidades**: Plot, Certification, ProductionHistory, NftMetadata, CreditProposal
- **Base de datos**: PostgreSQL con PostGIS para datos geoespaciales
- **ORM**: TypeORM con soporte para consultas espaciales

## IoT alert notifications

The backend can send IoT alert notifications to a Slack or Teams incoming webhook when sensor data crosses thresholds.

Environment variables:

- `IOT_ALERT_NOTIFICATION_WEBHOOK_URL` - webhook URL for alert notifications.
- `SLACK_WEBHOOK_URL` - fallback webhook URL when the dedicated variable is not set.
- `IOT_ALERT_NOTIFICATION_MIN_SEVERITY` - minimum severity to notify: `low`, `medium`, `high`, `critical`. Defaults to `high`.
- Tenant notification settings can be configured dynamically via `/tenants/:tenantId/notification-settings`.

Example:

```bash
export IOT_ALERT_NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
export IOT_ALERT_NOTIFICATION_MIN_SEVERITY=high
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Run only the compliance module E2E tests
npm run test:e2e -- --runInBand test/compliance.e2e-spec.ts

# Coverage
npm run test:cov
```

### Compliance E2E coverage
- `POST /compliance/satellite-validation`
- `POST /compliance/certifications`
- `POST /compliance/eudr`
- `POST /compliance/esg-reports`
