# Checklist de Ejecución – TERRA X CHANGE

## Objetivo
Guía rápida para el equipo sobre qué ejecutar antes de mergear un PR o desplegar a staging/producción.

## 1. Revisión previa al PR
- [ ] Revisar `docs/test-matrix-detailed.md`.
- [ ] Confirmar que todos los casos críticos aplicables están cubiertos.
- [ ] Revisar que no existan secretos en el código.
- [ ] Confirmar consistencia de endpoints y rutas antes de probar.

## 2. Ejecución local de validaciones
### Backend
- [ ] `cd backend && npm ci`
- [ ] `cd backend && npm test`
- [ ] `cd backend && npm run build`

### Frontend
- [ ] `cd frontend && npm ci`
- [ ] `cd frontend && npm test`

### E2E
- [ ] `npx playwright test`

## 3. Pruebas de seguridad básicas
- [ ] `snyk test` o herramienta equivalente
- [ ] Revisar el reporte de OWASP ZAP o similar
- [ ] Confirmar que se aplican validaciones de inputs y tokens

## 4. Performance rápida
- [ ] Verificar latencia de endpoints críticos con `artillery` o `locust`
- [ ] Confirmar cache hit rate en Redis para consultas frecuentes
- [ ] Revisar uso de CPU y memoria en backend bajo carga ligera

## 5. Smoke tests post-despliegue
- [ ] `GET /health` responde `200`
- [ ] `GET /api/wallet/{id}/balance` responde correctamente
- [ ] `GET /api/staking/{walletId}/stakes` funciona
- [ ] `POST /api/auth/login` retorna JWT válido
- [ ] Blockchain RPC responde balance

## 6. Referencias importantes
- Caso de prueba detallado: `docs/test-matrix-detailed.md`
- API Reference: `docs/api-reference.md`
- Guía de desarrollo: `docs/development-guide.md`
- Arquitectura: `docs/architecture.md`
