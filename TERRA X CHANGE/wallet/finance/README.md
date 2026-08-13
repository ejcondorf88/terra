# Wallet Finance

Este módulo agrupa los servicios financieros de wallet para TERRA X CHANGE.

## Objetivos iniciales

- Staking flexible con pools y plazos variables.
- Integración de stablecoins (USDC, DAI).
- AgroDeFi loans respaldados por NFTs agrícolas.
- Compliance agroexportador para auditoría y trazabilidad.

## Componentes

- `staking/` — servicios para crear, calcular y liquidar posiciones.
- `loans/` — flujos de créditos y pagos con colateral NFT.
- `stablecoins/` — soporte para monedas de referencia y conversión.
- `compliance/` — auditoría de transacciones y trazabilidad agroexportadora.

## Integración

- Este módulo debe exponer APIs consumibles desde el backend y el frontend.
- El diseño debe incluir reglas de validación de negocio agrícola.
