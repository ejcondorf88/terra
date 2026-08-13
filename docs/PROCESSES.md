# Procesos y rutas de cambio

Este documento describe el flujo requerido para introducir cambios en `packages/shared` (`@terra/shared`) y la política de releases internos, además de pasos recomendados para consolidar cobertura y ejecutar E2E en CI.

## Objetivo

Garantizar que cualquier cambio en `packages/shared` se revise, versione y despliegue siguiendo una política clara que minimice rupturas en los consumidores (GO, LINK, X CHANGE).

## Reglas generales

- Todo cambio en `packages/shared` debe abrirse mediante Pull Request en el repositorio monorepo.
- Los PRs que cambien exports públicos deben incluir:
	- Descripción de la motivación.
	- Lista de archivos afectados y nuevos exports.
	- Changelog entry (en `packages/shared/CHANGELOG.md` o en la descripción del release).
	- Tests unitarios nuevos o actualizados donde apliquen.

## Clasificación de cambios y versionado

- Breaking change: requiere bump de versión mayor. Debe marcarse explícitamente en el PR y documentar el plan de migración.
- Nueva funcionalidad compatible: bump menor; incluir ejemplos de uso en `docs/ARCHITECTURE.md` o en `packages/shared/README.md`.
- Fix/patch: bump patch.

Uso recomendado: mantener un `CHANGELOG.md` en `packages/shared` con entradas agrupadas por versión.

## Flujo de Pull Request (para `@terra/shared`)

1. Crear rama descriptiva: `shared/<feature>-short-description`.
2. Añadir cambios y tests. Ejecutar `npm run -w @terra/shared build` y pruebas unitarias locales del paquete.
3. Actualizar `packages/shared/CHANGELOG.md` (nueva entrada draft).
4. Abrir PR a `main` con la plantilla `shared/CHANGELOG` rellenada (impacto, versión sugerida, notas de migración si aplica).
5. Revisión requerida: al menos 2 revisores, uno del equipo backend (para validar compatibilidad) y otro del equipo de infra/CI (para validar efectos en pipelines).
6. Merge cuando pasen checks y revisiones.
7. Crear release interno (tag) con la versión acordada. Actualizar la política de versión si procede.

## Despliegue y consumo

- Los backends deben apuntar a `@terra/shared` como `workspace:*` en `package.json` durante desarrollo.
- Para despliegues en entornos compartidos, publicar un paquete interno (opcional) o usar el artefacto del pipeline que construye `packages/shared/dist`.

## Consolidación de cobertura en CI

- CI ejecuta pruebas en cada workspace y sube artefactos `coverage`.
- Paso adicional: intentar combinar los `lcov.info` encontrados usando `istanbul-combine` para producir un reporte consolidado en `coverage/combined`.
- Si `istanbul-combine` no está disponible, CI no debe fallar: la combinación es optativa.

## E2E en CI (opcional)

- Recomendación: crear un job aparte (matrix) que levante los servicios necesarios (Postgres, Redis) via `docker-compose` y arranque los backends para ejecutar los tests E2E desde `tests/e2e`.
- Mantener un `docker-compose.e2e.yml` mínimo que contenga:
	- Postgres (DB de pruebas)
	- Redis (si se usa)
	- Un contenedor por backend (opcional, o arrancar en host usando `npm run start:prod`)

## Checklist pre-merge para cambios en `shared`

- [ ] Tests unitarios actualizados y pasan.
- [ ] Changelog entry añadida.
- [ ] PR tiene al menos 2 revisores y aprobaciones.
- [ ] No imports relativos a `shared` en los backends (usar `@terra/shared/*`).
- [ ] Si es breaking change: plan de migración incluido.

## Roadmap y governance de Wallets en TERRA X CHANGE

Los cambios de wallet deben seguir fases claras y alinearse con la estrategia agrícola.

1. Documentar la funcionalidad objetivo antes de implementar: seguridad, finanzas, UX e integraciones.
2. Crear el árbol de carpetas `TERRA X CHANGE/wallet/` con los submódulos `auth`, `finance`, `ui` e `integration`.
3. Cada cambio relevante debe incluir:
	- un README del módulo explicando las APIs y el flujo.
	- un test E2E nuevo o actualizado en `tests/e2e/wallet/`.
	- una nota de cumplimiento/agroexportación si aplica.
4. Las mejoras de seguridad (MFA, social recovery, MPC, hardware wallets) deben revisarse con el equipo de seguridad y los productos legales.
5. Las funciones financieras (staking, loans, stablecoins) deben incluir un análisis de riesgo agrícola y un plan de compliance.

## Criterios para avanzar de fase

- Fase 1 completada: wallet básico seguro, recuperación y claves documentadas.
- Fase 2 completada: flujos financieros esenciales disponibles y validados.
- Fase 3 completada: onboarding y dashboard listos para usuarios agrícolas.
- Fase 4 completada: integraciones estratégicas desplegadas y auditadas.

## Responsables

- Autores del cambio: quien abre el PR.
- Revisión técnica: equipo de backend correspondiente.
- Revisión de CI y release: equipo de infra/DevOps.

---

Mantener este documento actualizado conforme evolucionen los equipos y las necesidades del ecosistema.
# Procesos de Desarrollo y Entrega

## Principios de trabajo

- Mantener la consistencia entre proyectos.
- Priorizar pruebas automatizadas y documentación.
- Evitar duplicar lógica; mover comportamientos comunes a `packages/shared`.

## Comandos raíz

- `npm run bootstrap` — instala dependencias para todo el workspace.
- `npm run test` — ejecuta pruebas de los tres proyectos.
- `npm run test:terra-go` — ejecuta pruebas de `TERRA GO`.
- `npm run test:terra-link` — ejecuta pruebas de `TERRA LINK`.
- `npm run test:terra-x-change` — ejecuta pruebas de `TERRA X CHANGE`.

## GitHub Actions

La pipeline central debe ejecutar:

1. Instalación de dependencias en la raíz.
2. Tests de backend y frontend de `TERRA GO`.
3. Tests de backend y Hardhat de `TERRA LINK`.
4. Tests de backend de `TERRA X CHANGE`.

## Estructura de actualizaciones

- Los cambios de infraestructura y dependencias comunes se hacen en la raíz.
- Las mejoras funcionales se implementan dentro del subproyecto correspondiente.
- Los cambios de contratos deben revisarse contra la documentación de `TERRA GO/contracts` y `TERRA LINK`.

## Librerías compartidas

- Crear nuevas utilidades comunes en `packages/shared`.
- Exportar tipos y funciones reutilizables allí.
- Consumirlas desde paquetes que necesitan la misma lógica.
