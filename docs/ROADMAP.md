# Roadmap del Ecosistema TERRA

Estado orientativo para coordinar mejoras entre `TERRA GO`, `TERRA LINK` y `TERRA X CHANGE`.

## Completado recientemente

- Workspace npm en la raíz con scripts unificados.
- Paquete `@terra/shared` con tipos JWT, utilidades HTTP y guard opcional.
- `@terra/shared` en los tres backends: LINK (`extractBearerToken`, RBAC), GO (auth + Passport JWT), X CHANGE (payload unificado con `sub`).
- Nombres únicos de workspaces (`terra-go-backend`, `terra-xchange-backend`, etc.).
- CI: caché npm, build de shared antes de tests, Node desde `.nvmrc`.

## Quick wins (próximas 1–2 semanas)

| Prioridad | Tarea | Beneficio |
|-----------|--------|-----------|
| Alta | Añadir `npm ci` con `package-lock.json` en la raíz | Instalaciones reproducibles |
| Media | Script `test:terra-xchange-frontend` (Expo/Jest) | Cobertura móvil en CI |
| Media | `lint` unificado en los tres backends | Calidad homogénea |
| Baja | Tests unitarios en `packages/shared` (`extractBearerToken`, `verifyJwt`) | Regresiones en utilidades |

## Mediano plazo

- Alinear NestJS de `TERRA LINK` (v10) con GO/X CHANGE (v11).
- Matriz de CI por subproyecto (fallos aislados, artefactos de cobertura).
- `npm audit` / Dependabot en la raíz.
- Variables de entorno documentadas en `docs/ENV.md` (sin secretos).

## Largo plazo

- Contratos y ABIs compartidos (paquete `@terra/contracts` o similar).
- Observabilidad común (logging estructurado, health checks).
- Despliegue coordinado (compose o Helm por entorno).

## Cómo contribuir

1. `npm run bootstrap` desde la raíz.
2. Cambios en shared: `npm run build:shared`.
3. Validar: `npm test`.
4. Documentar cambios transversales en `docs/ARCHITECTURE.md` o este roadmap.
