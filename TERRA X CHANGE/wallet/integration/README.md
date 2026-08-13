# Wallet Integrations

Este módulo define las integraciones estratégicas para wallets en TERRA X CHANGE.

## Objetivos iniciales

- DAO Governance para votaciones de tarifas e incentivos.
- IoT triggers que disparan pagos automáticos.
- Marketplace integrado con Terra GO.
- Economía completa: pagos, créditos, staking, marketplace y gobernanza.

## Componentes

- `dao/` — mecanismos de votación y gobernanza.
- `iot/` — eventos de sensores agrícolas y disparadores financieros.
- `marketplace/` — rutas para conectar con Terra GO.
- `economic/` — reglas de tokenomics y modelos de incentivos.

## Integración

- Las integraciones deben diseñarse como APIs y eventos reutilizables.
- El backend y frontend deben compartir los contratos de datos en `packages/shared` cuando sea posible.
