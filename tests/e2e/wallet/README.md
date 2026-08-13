# Wallet E2E Tests

Este directorio contendrá pruebas E2E específicas para las mejoras de wallet en TERRA X CHANGE.

## Objetivos iniciales

- Validar login y MFA.
- Verificar staking flexible y acceso a pools.
- Probar flujos de préstamos agroDeFi.
- Medir performance básica de los endpoints críticos.

## Estructura recomendada

- `login/` — pruebas de autenticación y MFA.
- `staking/` — pruebas de abrir/cerrar posiciones.
- `loans/` — pruebas de solicitud y pago de créditos.
- `performance/` — pruebas de latencia y tiempos de respuesta.

## Cómo usar

Agregar scripts E2E en `tests/e2e/wallet/` y ejecutar desde la raíz:

```bash
npm run test:e2e:perf
```

A futuro, estos tests pueden integrarse con Playwright o Cypress para validar flows de UI y backend.
