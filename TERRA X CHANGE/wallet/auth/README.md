# Wallet Auth

Este módulo centraliza las capacidades de seguridad de wallet para TERRA X CHANGE.

## Objetivos iniciales

- MFA + biometría.
- Social recovery con contactos de confianza.
- Exploración de MPC para custodia sin llave.
- Integración de hardware wallets (Ledger/Trezor).

## Componentes

- `mfa/` — classes o servicios para OTP y autenticación biométrica.
- `recovery/` — flujos de recuperación con contactos confiables.
- `mpc/` — pruebas de concepto de firma distribuida.
- `hardware/` — adaptadores para hardware wallets.

## Integración

- Este módulo debe exponer una API que el backend pueda usar desde `TERRA X CHANGE/backend`.
- Las reglas de clave y recuperación deben documentarse en `docs/ARCHITECTURE.md`.
