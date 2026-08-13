# TERRA Monitoring & Metrics Documentation Index

Quick navigation to all monitoring-related documentation.

## 🚀 Getting Started

**New to TERRA monitoring?**

1. Start here: [MONITORING_QUICKSTART.md](MONITORING_QUICKSTART.md) (5 min read)
2. Run setup: `./setup-monitoring.sh` or `.\setup-monitoring.ps1`
3. Access Grafana: http://localhost:3000 (admin/admin)

## 📚 Core Documentation

### Strategy & Planning
- [**BUSINESS_METRICS.md**](BUSINESS_METRICS.md) — Define KPIs, metric strategy, architecture
- [**IMPLEMENTATION_SUMMARY.md**](IMPLEMENTATION_SUMMARY.md) — Project completion overview, lessons learned

### Setup & Configuration
- [**MONITORING_QUICKSTART.md**](MONITORING_QUICKSTART.md) — 30-second setup, dashboard import, Slack integration
- [**PROMETHEUS_GRAFANA_SETUP.md**](PROMETHEUS_GRAFANA_SETUP.md) — Detailed setup, alert rules, troubleshooting
- [**GITHUB_ACTIONS_MONITORING.md**](GITHUB_ACTIONS_MONITORING.md) — CI/CD workflows, SLA validation, metrics archival

### Testing & Validation
- [**tests/e2e/README-METRICS.md**](../tests/e2e/README-METRICS.md) — E2E test execution, metrics capture, exit codes

## 🎯 For Each Role

### 👔 Finance / CEO
**Goal**: Track business metrics and financial health

1. Read: [BUSINESS_METRICS.md](BUSINESS_METRICS.md) - "Créditos y Finanzas" section
2. Dashboard: Import `grafana-dashboard-ceo.json`
3. Monitor: Credit approval rate, TVL, credit volume
4. Alert: Weekly Slack report (configured in GitHub Actions)

**Key Questions Answered**:
- What's our credit approval rate this week?
- How much is locked in staking?
- Are we hitting revenue targets?

### 🔧 Engineering / CTO
**Goal**: Ensure system performance and reliability

1. Read: [PROMETHEUS_GRAFANA_SETUP.md](PROMETHEUS_GRAFANA_SETUP.md)
2. Dashboard: Import `grafana-dashboard-cto.json`
3. Monitor: Latency P99, endpoint health, login attempts
4. Alert: Automatic PR comments on SLA violations

**Key Questions Answered**:
- Is latency within SLOs?
- Are there performance regressions?
- Is the system under attack?

### 🚀 Product Manager
**Goal**: Track adoption and user growth

1. Read: [BUSINESS_METRICS.md](BUSINESS_METRICS.md) - "Adopción y Experiencia" section
2. Dashboard: Import `grafana-dashboard-product.json`
3. Monitor: Users onboarded, staking participation, onboarding rate
4. Analyze: Trends and forecasts for product roadmap

**Key Questions Answered**:
- How many users did we onboard this week?
- What's our staking participation rate?
- Is the onboarding funnel healthy?

### 🏢 DevOps / SRE
**Goal**: Maintain observability infrastructure

1. Read: [PROMETHEUS_GRAFANA_SETUP.md](PROMETHEUS_GRAFANA_SETUP.md) - Full setup section
2. Dashboard: Import `grafana-dashboard.json` (general)
3. Configure: Alertmanager routing, Slack/Teams webhooks
4. Monitor: Prometheus health, alert firing rate, data freshness

**Key Questions Answered**:
- Is Prometheus scraping metrics successfully?
- Are alerts routing to the correct channels?
- Do we need to scale storage?

### 👨‍💻 Developers (Backend)
**Goal**: Integrate metrics into services

1. Read: [packages/shared/src/metrics/README.md](../packages/shared/src/metrics/README.md)
2. Instrument: Use `@terra/shared` metrics in your service
3. Expose: Add `/metrics` endpoint (template in TERRAFORM X CHANGE backend)
4. Test: Run E2E tests to capture metrics

**Example: Add to your service**:
```typescript
import { MetricsEmitter, MetricEventType } from '@terra/shared'

const metrics = new MetricsEmitter()

// Emit event
metrics.emit({
  eventType: MetricEventType.STAKE_CREATED,
  value: 1000,
  labels: { userId, poolId },
})
```

### 🧪 QA / Test Engineers
**Goal**: Validate tests capture metrics correctly

1. Read: [tests/e2e/README-METRICS.md](../tests/e2e/README-METRICS.md)
2. Run: `npm run test:e2e:perf` to validate SLAs
3. Capture: Metrics emitted during E2E tests
4. Verify: Metrics appear in Prometheus after test runs

## 📊 Dashboard JSON Files

All Grafana dashboards are in `docs/`:

| File | Role | Metrics |
|------|------|---------|
| `grafana-dashboard.json` | Admin | All metrics (comprehensive) |
| `grafana-dashboard-ceo.json` | Finance/CEO | TVL, approval rate, volume |
| `grafana-dashboard-cto.json` | Engineering/CTO | Latency, throughput, health |
| `grafana-dashboard-product.json` | Product | Users, staking, adoption |

**Import Instructions**:
1. Open Grafana: http://localhost:3000
2. Dashboards → Import
3. Paste JSON content
4. Select Prometheus data source
5. Click Import

## 🔧 Configuration Files

Essential configuration files:

| File | Purpose |
|------|---------|
| `prometheus.yml` | Prometheus scrape jobs and alert rules path |
| `alert_rules.yml` | 8 alert definitions (critical/warning/info) |
| `alertmanager.yml` | Alert routing (Slack/Teams by team) |
| `docker-compose.e2e.yml` | Prometheus, Alertmanager, Grafana services |

## 📈 Key Metrics Reference

### Business Metrics
```
credit_approved_total        # Total approved credits
credit_requested_total       # Total credit requests
credit_approval_rate         # Derived: approved / requested (%)
user_onboarded_total         # Total users onboarded
stake_created_total          # Total stakes created
```

### Performance Metrics
```
endpoint_latency_ms_p50      # 50th percentile latency
endpoint_latency_ms_p99      # 99th percentile latency (SLO: 500ms)
endpoint_latency_ms_avg      # Average latency
login_latency_ms             # Login endpoint latency
```

## 🚨 Alert Rules

8 alerts defined in `alert_rules.yml`:

| Alert | Severity | Condition |
|-------|----------|-----------|
| LowCreditApprovalRate | warning | approval_rate < 0.7 for 5 min |
| CriticalCreditApprovalRate | critical | approval_rate < 0.5 for 2 min |
| HighEndpointLatency | warning | p99_latency > 500ms for 5 min |
| CriticalEndpointLatency | critical | p99_latency > 1000ms for 2 min |
| LowStakingActivity | info | stake_rate < 0.5/min for 1 hour |
| SlowUserOnboarding | warning | onboard_rate < 1/min for 2 hours |
| HighLoginFailureRate | warning | login_rate > 10/sec for 5 min |
| PrometheusTargetDown | critical | backend offline for 2 min |

## 🔗 Quick Links

| Need | Link |
|------|------|
| Local setup | [MONITORING_QUICKSTART.md](MONITORING_QUICKSTART.md#quick-start-30-seconds) |
| Slack integration | [MONITORING_QUICKSTART.md](MONITORING_QUICKSTART.md#enable-slackteams-alerts) |
| CI/CD workflows | [GITHUB_ACTIONS_MONITORING.md](GITHUB_ACTIONS_MONITORING.md) |
| Troubleshooting | [MONITORING_QUICKSTART.md](MONITORING_QUICKSTART.md#troubleshooting) |
| E2E tests | [tests/e2e/README-METRICS.md](../tests/e2e/README-METRICS.md) |
| Metric definitions | [BUSINESS_METRICS.md](BUSINESS_METRICS.md) |
| Implementation details | [PROMETHEUS_GRAFANA_SETUP.md](PROMETHEUS_GRAFANA_SETUP.md) |

## 💡 Common Tasks

### Import all dashboards at once
```bash
# Use Grafana API
for dashboard in docs/grafana-dashboard-*.json; do
  curl -X POST http://localhost:3000/api/dashboards/db \
    -H "Authorization: Bearer $GRAFANA_TOKEN" \
    -H "Content-Type: application/json" \
    -d @$dashboard
done
```

### Query specific metric in Prometheus
```bash
curl 'http://localhost:9090/api/v1/query?query=credit_approval_rate'
```

### Check alert status
```bash
curl http://localhost:9093/api/v1/alerts
```

### View metrics endpoint directly
```bash
curl http://localhost:3002/metrics | head -20
```

### Run E2E with metrics
```bash
npm run test:e2e:perf -- --loginThreshold=500
```

## 📞 Support & Troubleshooting

**Still having issues?**

1. Check [MONITORING_QUICKSTART.md#troubleshooting](MONITORING_QUICKSTART.md#troubleshooting)
2. Review service logs: `docker-compose logs -f prometheus`
3. Verify Prometheus targets: http://localhost:9090/targets
4. Check alert status: http://localhost:9093

## 🎓 Learning Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Dashboard Design](https://grafana.com/docs/grafana/latest/dashboards/)
- [Alertmanager Best Practices](https://prometheus.io/docs/alerting/latest/overview/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)

---

**Last Updated**: June 2026
**Status**: ✅ Production Ready
