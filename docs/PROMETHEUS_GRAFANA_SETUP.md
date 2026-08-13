# Prometheus & Grafana Setup

Este documento describe cómo configurar Prometheus y Grafana para monitorear métricas de negocio del ecosistema TERRA.

## Arquitectura

```
┌─────────────────────┐
│   TERRA Backends    │  (exponen /metrics)
├─────────────────────┤
│   Prometheus        │  (scrape cada 15s)
├─────────────────────┤
│   Grafana           │  (visualiza + alertas)
└─────────────────────┘
```

## Pasos de Setup Local

### 1. Integrar Prometheus Exporter en Backends

En `TERRA X CHANGE/backend/src/app.module.ts`:

```typescript
import { prometheusExporter } from '@terra/shared'
import { Controller, Get } from '@nestjs/common'

@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics() {
    return prometheusExporter.getMetricsText()
  }
}

@Module({
  providers: [MetricsController],
})
export class MetricsModule {}
```

### 2. Agregar dependencia Prometheus (opcional, para prom-client)

```bash
npm install prom-client --workspace=TERRA\ X\ CHANGE
```

Luego reemplazar `PrometheusExporter` con `prom-client` para producción.

### 3. Configurar Prometheus

Crear `prometheus.yml` en la raíz del proyecto:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'terra-xchange'
    static_configs:
      - targets: ['localhost:3002']
    metrics_path: '/metrics'
```

Ejecutar Prometheus (Docker):

```bash
docker run -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

### 4. Configurar Grafana

Ejecutar Grafana (Docker):

```bash
docker run -p 3000:3000 grafana/grafana
```

Luego:
1. Abrir http://localhost:3000 (usuario: admin, contraseña: admin)
2. Ir a Configuration → Data Sources
3. Agregar Prometheus: http://localhost:9090
4. Ir a Dashboards → Import
5. Copiar el contenido de `docs/grafana-dashboard.json` o usar el ID de importación

### 5. Ejemplo: Integración en docker-compose.e2e.yml

Agregar al archivo:

```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - '9090:9090'
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  depends_on:
    - backend_xchange

grafana:
  image: grafana/grafana:latest
  ports:
    - '3000:3000'
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  depends_on:
    - prometheus
```

## Métricas Disponibles

### Counters (totales)
- `login_total`: Total de intentos de login
- `user_onboarded_total`: Total de usuarios onboardeados
- `credit_requested_total`: Total de créditos solicitados
- `credit_approved_total`: Total de créditos aprobados
- `credit_rejected_total`: Total de créditos rechazados
- `stake_created_total`: Total de stakes creados

### Histogramas (latencia)
- `endpoint_latency_ms_p50`: Latencia P50
- `endpoint_latency_ms_p99`: Latencia P99
- `endpoint_latency_ms_avg`: Latencia promedio
- `credit_approval_time_ms`: Tiempo de aprobación de crédito
- `login_latency_ms`: Latencia de login

## Consultas Útiles en Prometheus

```promql
# Tasa de aprobación de créditos
rate(credit_approved_total[5m]) / rate(credit_requested_total[5m])

# Latencia P99 de login
login_latency_ms_p99

# Tasa de onboarding por minuto
rate(user_onboarded_total[1m])

# Usuarios activos (aproximado)
user_onboarded_total - credit_rejected_total
```

## Alertas Sugeridas

Agregar a `prometheus.yml`:

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

rule_files:
  - 'alert_rules.yml'
```

En `alert_rules.yml`:

```yaml
groups:
  - name: business_alerts
    rules:
      - alert: HighCreditRejectionRate
        expr: rate(credit_rejected_total[5m]) > rate(credit_requested_total[5m]) * 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alta tasa de rechazo de créditos"

      - alert: HighEndpointLatency
        expr: endpoint_latency_ms_p99 > 500
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Latencia de endpoint crítica"
```

## Integración con CI/CD

En `.github/workflows/metrics-publish.yml`:

```yaml
name: Publish Metrics
on:
  schedule:
    - cron: '*/30 * * * *'

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Query Prometheus
        run: |
          curl http://localhost:9090/api/v1/query?query=credit_approved_total | jq
      - name: Post to Slack
        run: |
          echo "Credit approval rate: $(curl ...)" | \
            curl -X POST -H 'Content-type: application/json' \
            --data-binary @- ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

- **Prometheus no scrape**: Verificar que `/metrics` endpoint esté accesible
- **Grafana sin datos**: Esperar a que Prometheus scrape (15s default)
- **Latencia alta**: Reducir `scrape_interval` en Prometheus si no hay impacto en performance

## Próximos pasos

- Integrar Alertmanager para notificaciones en Teams/Slack
- Crear dashboards específicos por rol (CEO, CTO, Product Manager)
- Agregar análisis predictivo (ML) para detección de anomalías
