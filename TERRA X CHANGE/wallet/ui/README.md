# Wallet UI

Este módulo recoge las piezas de experiencia de usuario para wallets en TERRA X CHANGE.

## Objetivos iniciales

- Onboarding simplificado con email y biometría.
- Dashboard de balances, recompensas y KPIs agrícolas.
- Multi-idioma (ES/EN/FR).
- Soporte offline-first para zonas rurales.
- Integración con Terra GO para productos certificados.

## Componentes

- `onboarding/` — flujos de registro y portafolio.
- `dashboard/` — indicadores, balance y actividad.
- `translations/` — archivos de idioma y localización.
- `offline/` — cache y sync para conectividad intermitente.

## Integración

- El frontend debe consumir los servicios de wallet desde el backend.
- El UI debe priorizar claridad y simplicidad para usuarios agrícolas.
