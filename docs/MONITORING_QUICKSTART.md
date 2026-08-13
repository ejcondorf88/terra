# TERRA Monitoring Quick Start

Complete guide to running the TERRA monitoring stack locally and in production.

## What's Included

- **Prometheus**: Metrics collection and alerting
- **Alertmanager**: Alert routing and notifications (Slack/Teams)
- **Grafana**: Visualization and dashboards
- **3 Role-Based Dashboards**:
  - CEO: Financial KPIs (TVL, credit approval rate, volume)
  - CTO: Performance & SLA (latency P99, throughput, login attempts)
  - Product: Growth & Adoption (users onboarded, staking participation)

## Quick Start (30 seconds)

### On macOS/Linux

```bash
# Make script executable
chmod +x setup-monitoring.sh

# Run setup
./setup-monitoring.sh
```

### On Windows (PowerShell)

```powershell
# Run setup script
.\setup-monitoring.ps1

# Optional: With Slack webhook
.\setup-monitoring.ps1 -SlackWebhookUrl "https://hooks.slack.com/..."
```

### Manual Start (any OS)

```bash
docker-compose -f docker-compose.e2e.yml up -d \
    postgres redis \
    backend_go backend_link backend_xchange \
    prometheus alertmanager grafana
```

## Access Services

Once running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9090 | (none) |
| **Alertmanager** | http://localhost:9093 | (none) |
| **Backend X CHANGE /metrics** | http://localhost:3002/metrics | (Prometheus text format) |

## Import Dashboards

### Via Grafana UI

1. Open http://localhost:3000
2. Click **Dashboards** → **Import**
3. Select **Import via panel JSON**
4. Paste content from one of:
   - `docs/grafana-dashboard.json` (all metrics)
   - `docs/grafana-dashboard-ceo.json` (financial)
   - `docs/grafana-dashboard-cto.json` (performance)
   - `docs/grafana-dashboard-product.json` (adoption)

### Via Grafana API

```bash
# Create API token in Grafana UI first (Admin → API Tokens)
GRAFANA_TOKEN="YOUR_API_TOKEN"

# Import dashboard
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -H "Content-Type: application/json" \
  -d @docs/grafana-dashboard-ceo.json
```

## Enable Slack/Teams Alerts

### Slack Setup

1. Create Incoming Webhook in Slack workspace
   - Go to your Slack workspace → Apps & integrations → Create New App
   - Choose "From scratch" → Name: "TERRA Alerts"
   - Go to Incoming Webhooks → Add New Webhook to Workspace
   - Select channel (e.g., #terra-alerts)
   - Copy webhook URL

2. Start stack with webhook:

```bash
# macOS/Linux
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
./setup-monitoring.sh

# PowerShell
.\setup-monitoring.ps1 -SlackWebhookUrl "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

3. Verify alerts are routing:
   - Go to http://localhost:9093 (Alertmanager)
   - You should see configured receivers for each team

### Microsoft Teams Setup

If using Teams instead of Slack:

1. Create Incoming Webhook in Teams channel
   - Go to channel → More options (...) → Connectors
   - Search "Incoming Webhook"
   - Configure → Copy webhook URL

2. Edit `alertmanager.yml` to add Teams webhook:

```yaml
receivers:
  - name: 'teams-alerts'
    webhook_configs:
      - url: 'https://outlook.webhook.office.com/webhookb2/YOUR_WEBHOOK_ID'
        send_resolved: true
```

3. Restart Alertmanager:

```bash
docker-compose -f docker-compose.e2e.yml restart alertmanager
```

## Alert Types

### Critical Alerts (ASAP)

| Alert | Threshold | Impact |
|-------|-----------|--------|
| **CriticalCreditApprovalRate** | Approval < 50% | Finance blocked |
| **CriticalEndpointLatency** | P99 > 1000ms | Users affected |
| **PrometheusTargetDown** | Backend offline | Service down |

→ These trigger immediate Slack notification and highlight red in Grafana

### Warning Alerts (investigate)

| Alert | Threshold | Impact |
|-------|-----------|--------|
| **LowCreditApprovalRate** | Approval < 70% | Underwriting issue |
| **HighEndpointLatency** | P99 > 500ms | Performance degradation |
| **SlowUserOnboarding** | < 1 user/min | Funnel issue |

### Info Alerts (track)

| Alert | Threshold | Impact |
|-------|-----------|--------|
| **LowStakingActivity** | < 0.5 stakes/min | Lower engagement |

## Query Examples in Prometheus

Access Prometheus UI at http://localhost:9090

```promql
# Credit approval rate (%)
(credit_approved_total / credit_requested_total) * 100

# Login latency P99
login_latency_ms_p99

# Staking rate per hour
rate(stake_created_total[1h])

# Users onboarded today
increase(user_onboarded_total[24h])

# Error rate by endpoint
rate(endpoint_latency_ms_p99{endpoint!~"health|metrics"}[5m])
```

## Troubleshooting

### Services not starting

```bash
# Check logs
docker-compose -f docker-compose.e2e.yml logs prometheus
docker-compose -f docker-compose.e2e.yml logs alertmanager
docker-compose -f docker-compose.e2e.yml logs grafana

# Recreate volumes
docker-compose -f docker-compose.e2e.yml down -v
docker-compose -f docker-compose.e2e.yml up -d
```

### No metrics in Prometheus

1. Check backends are running: `curl http://localhost:3002/metrics`
2. Verify prometheus.yml points to correct targets (localhost:3002)
3. Refresh Prometheus UI: http://localhost:9090/targets
4. Look for "DOWN" targets and check error message

### Alerts not routing to Slack

1. Check alertmanager logs: `docker logs terra_alertmanager_e2e`
2. Verify webhook URL is correct: `curl -X POST <WEBHOOK_URL> -H 'Content-Type: application/json' -d '{"text":"test"}'`
3. Check alert is firing: http://localhost:9090/alerts
4. Verify alertmanager.yml has correct receiver configuration

### Grafana dashboard data not showing

1. Verify Prometheus data source is added:
   - Configuration → Data Sources → Prometheus
   - URL: http://prometheus:9090 (not localhost)
   - Click "Test" to verify connection

2. Ensure dashboard time range includes data (try "Last 1 hour")

3. Check if metrics exist in Prometheus: run a query at http://localhost:9090

## Stop Stack

```bash
# Stop all services but keep data
docker-compose -f docker-compose.e2e.yml stop

# Stop and remove containers
docker-compose -f docker-compose.e2e.yml down

# Stop and remove all data (clean slate)
docker-compose -f docker-compose.e2e.yml down -v
```

## Integration with CI/CD

### GitHub Actions Example

To publish metrics on schedule:

```yaml
name: Publish Metrics

on:
  schedule:
    - cron: '0 9 * * MON'  # Every Monday at 9 AM

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Query Prometheus
        run: |
          # Query current metrics
          curl -s 'http://localhost:9090/api/v1/query?query=credit_approved_total' | jq
          
      - name: Post to Slack
        run: |
          # Send weekly metrics summary
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-type: application/json' \
            -d '{
              "text": "📊 Weekly Metrics Report",
              "blocks": [...]
            }'
```

## Next Steps

1. **Custom Dashboards**: Create role-specific views for your team
2. **Recording Rules**: Add Prometheus recording rules for common queries
3. **ML Alerts**: Configure anomaly detection based on historical patterns
4. **Cost Tracking**: Add metrics for infrastructure costs (Docker, database)
5. **Custom Exporters**: Instrument third-party services (payment provider, IoT sensors)

## Support

For issues:
1. Check logs: `docker-compose logs -f <service_name>`
2. Review [PROMETHEUS_GRAFANA_SETUP.md](PROMETHEUS_GRAFANA_SETUP.md)
3. Consult [BUSINESS_METRICS.md](BUSINESS_METRICS.md) for metric definitions
