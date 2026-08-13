# Metrics

Este módulo centraliza la captura de eventos de negocio para medir KPIs del ecosistema TERRA.

## Schema

- `MetricEventType`: enumeración de tipos de eventos (login, credit_requested, stake_created, etc.).
- `MetricEvent`: estructura de un evento con timestamp, tipo, valor y labels contextuales.
- `MetricsEmitter`: clase simple para emitir eventos (stub para integración con Prometheus).

## Uso en servicios

```typescript
import { MetricsEmitter, MetricEventType } from '@terra/shared'

export class FinanceService {
  private metrics = new MetricsEmitter()

  async stake(userId: string, poolId: string, amount: number) {
    const startTime = Date.now()
    const stake = await this.repo.create({ /* ... */ })
    const duration = Date.now() - startTime

    // Emitir evento de negocio
    this.metrics.emit({
      eventType: MetricEventType.STAKE_CREATED,
      value: amount,
      labels: { userId, poolId, status: 'success' },
    })

    // Emitir métrica de performance
    this.metrics.emit({
      eventType: MetricEventType.ENDPOINT_LATENCY_MS,
      value: duration,
      labels: { endpoint: '/wallet/finance/stake' },
    })

    return stake
  }
}
```

## Integración con Prometheus

A futuro, `MetricsEmitter.emit()` enviará eventos a un Prometheus client, que exposdrá las métricas en formato Prometheus para scraping.

## Dashboard en Grafana

Las métricas se visualizarán en Grafana con:
- Gráficos de tiempo real de créditos aprobados.
- Latencia de endpoints críticos.
- Tasa de aprobación de staking.
- Intentos de acceso bloqueados.

## Próximos pasos

1. Integrar `prom-client` en backends para exponer `/metrics` endpoint.
2. Configurar Prometheus para scrapear en staging/prod.
3. Crear dashboards iniciales.
4. Configurar alertas cuando KPIs se degradan.
