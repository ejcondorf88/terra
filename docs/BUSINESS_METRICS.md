# Business Metrics Integration

Este documento describe la estrategia de integrar métricas de negocio en el ecosistema TERRA para medir impacto directo en el modelo agrícola y financiero.

## Objetivo

Conectar la capa técnica (CI/CD, tests, deployments) con KPIs de negocio reales, permitiendo:
- Validar que cada cambio mejora o mantiene el desempeño del negocio.
- Alertar cuando las métricas se degradan.
- Comunicar transparencia al equipo sobre impacto real.

## Métricas iniciales prioritarias

### Créditos y Finanzas
- **Tiempo promedio de aprobación de crédito**: meta <5 min (login + evaluación colateral + decisión).
- **Tasa de aprobación de créditos agrícolas**: meta >85%.
- **Volumen diario de créditos otorgados**: KPI de crecimiento.
- **% de staking activo**: mide adhesión a productos de ahorro.

### Performance y Confiabilidad
- **Latencia de transacciones**: meta <200ms (login, approve, stake, loan).
- **Disponibilidad de servicios**: meta 99.5%.
- **Tiempo de recuperación (MTTR)**: cuando hay caída, volver en <30 min.

### Seguridad y Cumplimiento
- **Transacciones auditadas**: 100% de transacciones registradas.
- **Intentos de acceso bloqueados**: monitoreo de ataques.
- **Cumplimiento normativo**: checklist agroexportador/trazabilidad.

### Adopción y Experiencia
- **Usuarios onboardeados**: crecimiento semanal.
- **Tasa de retención**: usuarios activos 7d / usuarios onboardeados 7d atrás.
- **NPS (Net Promoter Score)**: encuestas de satisfacción.

## Arquitectura de captura

```
┌─────────────────┐
│  Application    │  (auth, finance, wallet)
├─────────────────┤
│  Metrics Layer  │  (define + emit metrics)
├─────────────────┤
│  Prometheus     │  (scrape + store)
├─────────────────┤
│  Grafana        │  (visualize)
├─────────────────┤
│  Alerts         │  (Slack/Teams when thresholds)
└─────────────────┘
```

## Implementación esperada

1. **Fase 1**: Definir schema de métricas en `packages/shared/metrics`.
2. **Fase 2**: Instrumentar backends (auth, finance) para emitir eventos.
3. **Fase 3**: Integrar Prometheus exporter en CI/CD.
4. **Fase 4**: Crear dashboards en Grafana (local + hosted).
5. **Fase 5**: Configurar alertas en Slack/Teams cuando KPIs se degradan.

## Integración con CI/CD

- Los E2E tests no solo validan latencia, sino también capturan métricas de negocio (ej. crédito aprobado en X ms).
- Los dashboards se actualizan en tiempo real con datos de staging/prod.
- Alerts bloquean merges si las métricas predichas violarían SLAs.

## Responsables

- **Product**: definir KPIs y metas por trimestre.
- **Backend**: instrumentar code para emitir métricas.
- **DevOps/SRE**: mantener Prometheus, Grafana, alertas.
- **QA**: validar que E2E tests capturen métricas correctamente.

## Siguientes pasos

1. Crear `packages/shared/metrics/schema.ts` con tipos de eventos.
2. Añadir ejemplos de uso en servicios (auth, finance).
3. Integrar Prometheus client en `TERRA X CHANGE/backend`.
4. Crear dashboard inicial en Grafana.
