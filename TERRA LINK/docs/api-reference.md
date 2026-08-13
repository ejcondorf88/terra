# API Reference – Terra Link

## Autenticación

Todos los endpoints protegidos requieren un header `Authorization: Bearer <token>`.

- **JWT** con roles: `producer`, `bank`, `admin`.
- Token debe expirar en un período corto (ej. 15 minutos) y renovarse con refresh token.


## Validación Satelital

### POST /api/validation/start
Inicia la validación de datos satelitales e IoT para un lote.

#### Request
Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Body:
```json
{
  "plotId": 123,
  "producerId": 456,
  "satelliteDataUri": "https://s3.amazonaws.com/terra-link/satellite/123.json",
  "iotPayload": {
    "humidity": 38,
    "temperature": 24,
    "soilPh": 6.8
  },
  "geoJson": {
    "type": "Polygon",
    "coordinates": [[[ -79.4, -2.1 ], [ -79.3, -2.1 ], [ -79.3, -2.0 ], [ -79.4, -2.0 ], [ -79.4, -2.1 ]]]
  }
}
```

#### Response 200
```json
{
  "validationId": "val-9876",
  "status": "pending",
  "message": "Validation workflow started",
  "estimatedCompletion": "2026-05-11T18:30:00Z"
}
```


## NFT

### POST /api/nft/mint
Genera un NFT agrícola dinámico en la plataforma.

#### Request
Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Body:
```json
{
  "plotId": 123,
  "ownerWallet": "0xAbC123...",
  "tokenUri": "ipfs://Qm...",
  "geolocation": "POINT(-79.35 -2.05)",
  "certifications": ["EUDR", "orgánico", "comercio justo"],
  "productionHistoryUri": "https://ipfs.io/ipfs/QmHistory",
  "valuation": 450000,
  "riskScore": 12,
  "fractionCount": 10
}
```

#### Response 201
```json
{
  "tokenId": 789,
  "status": "minted",
  "message": "NFT agrícola dinámico generado",
  "tokenUri": "ipfs://Qm..."
}
```


### PUT /api/nft/update
Actualiza metadatos, valoración o estado de un NFT.

#### Request
Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Body:
```json
{
  "tokenId": 789,
  "valuation": 470000,
  "riskScore": 10,
  "status": "active",
  "certifications": ["EUDR", "orgánico", "comercio justo", "carbono neutral"]
}
```

#### Response 200
```json
{
  "tokenId": 789,
  "updated": true,
  "message": "Metadatos NFT actualizados"
}
```


### POST /api/nft/collateral
Marca el NFT como garantía de crédito y bloquea su transferencia si es necesario.

#### Request
Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Body:
```json
{
  "tokenId": 789,
  "loanId": "loan-654",
  "collateralStatus": true,
  "collateralValue": 380000
}
```

#### Response 200
```json
{
  "tokenId": 789,
  "collateralized": true,
  "message": "NFT marcado como garantía de crédito"
}
```


## Reportes

### GET /api/report/compliance
Genera un reporte de cumplimiento normativo EUDR y certificaciones.

#### Request
Headers:
- `Authorization: Bearer <token>`

Query parameters:
- `plotId` (required)
- `period` (optional, formato `YYYY-MM`)

Ejemplo:
`GET /api/report/compliance?plotId=123&period=2026-05`

#### Response 200
```json
{
  "plotId": 123,
  "reportUri": "https://s3.amazonaws.com/terra-link/reports/compliance-123-2026-05.pdf",
  "status": "compliant",
  "certifications": ["EUDR", "orgánico", "comercio justo"],
  "generatedAt": "2026-05-11T15:22:10Z"
}
```


## Crédito

### POST /api/credit/proposal
Crea una propuesta de crédito basada en un NFT como colateral.

#### Request
Headers:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Body:
```json
{
  "tokenId": 789,
  "borrowerId": 456,
  "requestedAmount": 300000,
  "durationMonths": 12,
  "interestRate": 7.5
}
```

#### Response 201
```json
{
  "proposalId": "prop-321",
  "status": "underReview",
  "approvedAmount": 0,
  "message": "Propuesta de crédito creada y en revisión"
}
```


## Error handling

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden: insufficient role permissions"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["tokenId must be a positive integer", "valuation must be a number"]
}
```

---

## Notas

- Los endpoints deben estar soportados por validaciones DTO en NestJS.
- El flujo de tokenización real debe sincronizar el backend con el contrato de Polygon.
- Los certificados e historial deben almacenarse en IPFS/S3 y referenciarse desde los metadatos del NFT.
