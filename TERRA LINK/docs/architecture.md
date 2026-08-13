# Arquitectura TERRA LINK

## Visión general

TERRA LINK será una plataforma integrada de tokenización agrícola que convierte un lote en un NFT financiero sólido, respaldado por geolocalización, auditorías y datos dinámicos. El valor se extiende más allá de un simple certificado: cada NFT es un activo financiero, capaz de servir como garantía para créditos y de adaptarse a cambios de estado en tiempo real.

## Componentes principales

### 1. Backend modular

- NestJS para servicios ordenados, escalables y mantenibles.
- PostgreSQL con PostGIS para:
  - validación de geometrías de lotes
  - trazabilidad espacial
  - consultas geográficas avanzadas
- módulos principales:
  - `nft`: creación, actualización y collateralización de activos.
  - `geo`: validación de parcelas, cálculo de superficie y análisis de riesgos.
  - `credit`: evaluación de garantías y propuesta de financiamiento.

### 2. Blockchain Layer

- Polygon para bajos costos y compatibilidad EVM.
- Solidity para smart contracts robustos:
  - metadatos extendidos
  - estado dinámico
  - bloqueo/collateralización
  - preparación para tokenización fraccional futura

### 3. Infraestructura Cloud

- AWS EKS para despliegue de microservicios.
- Terraform para infraestructura como código.
- RDS / Aurora PostgreSQL para base de datos resiliente.

### 4. Integración de negocio

- TERRA GO: marketplace para lotes certificados.
- TERRA X CHANGE: gateway para transacciones y financiamiento.
- AG TECH EC: plataforma que cobra fees por validaciones, listing y servicios premium.

## Flujo de valor

1. Productor solicita validación del lote.
2. Backend valida geoespacialmente con PostGIS.
3. Se emite el NFT en Polygon con metadatos extendidos.
4. Banco o cooperativa evalúa el NFT como garantía.
5. Si se aprueba, el NFT se marca como collateralizable o bloqueado.
6. El productor usa el crédito y el marketplace puede vender fracciones certificadas.

## Principios de diseño

- NFT como activo financiero dinámico, no solo como certificado.
- Separación clara entre datos on-chain y datos off-chain.
- Servicios reutilizables y extensibles para futuras integraciones IA / satélite.
- Enfoque en seguridad, trazabilidad y compatibilidad con regulaciones.

## Diagrama de arquitectura optimizado

- [Diagrama optimizado de TERRA LINK](https://copilot.microsoft.com/th/id/BCO.dfa38011-b11e-4503-b9e4-f1e7bf328978.png)

## Arquitectura optimizada detallada

### Agricultural Validation Platform

- Satélites + IoT: capturan datos de ubicación y producción en tiempo real.
- AI Analytics: interpreta imágenes satelitales y métricas de sostenibilidad para generar scores de riesgo y valor.
- Audit & Compliance: produce reportes regulatorios EUDR, orgánico y comercio justo.
- PostGIS: almacena geodatos y permite validaciones geoespaciales avanzadas.
- NFT Minting Engine (Solidity): genera NFTs dinámicos con metadatos robustos y soporte para collateralización.

### Cloud Infrastructure

- AWS EKS + S3: infraestructura escalable y resiliente para APIs y documentos.
- API Gateway + Security: control de acceso, autentificación y auditoría de transacciones.
- IPFS: almacenamiento inmutable de certificados, auditores y documentos de cumplimiento.

### Blockchain Layer

- Polygon Network: emisión y gestión de NFTs agrícolas con bajos costos.
- Dynamic NFT Collateral: los NFTs actúan como colateral financiero y actualizan su valor según validaciones.

### Financial Partners

- Bancos y Cooperativas: usan NFTs como garantía digital para créditos.
- Créditos y préstamos: regulados con smart contracts y flujos de aprobación de riesgo.

### Terra X Exchange Ecosystem

- Terra GO Marketplace: plataforma para compra/venta de lotes certificados.
- Terra X Wallet: pagos, staking y recompensas dentro del ecosistema.
- Terra LINK Dashboard: monitoreo de KPIs, estado de activos y reportes financieros.

## Valor estratégico

Este rediseño asegura que:

- El NFT agrícola sea un activo financiero sólido y atractivo para bancos.
- El ecosistema esté integrado y escalable, desde validación hasta crédito.
- AG TECH EC se posicione como proveedor de infraestructura financiera agrícola descentralizada.

## Arquitectura propuesta

- Consulta el [diagrama C4 nivel 2](./architecture-c4-level2.md) para ver cómo se integran los módulos nuevos (Satellite, Blockchain Mint, Compliance, Audit/ESG) con la arquitectura actual.
