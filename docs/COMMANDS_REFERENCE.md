# TERRA Monitoring Commands Reference

Quick copy-paste guide for common monitoring tasks.

## 🚀 Stack Startup

### One Command (Recommended)

```bash
# Linux/macOS
./setup-monitoring.sh

# Windows PowerShell
.\setup-monitoring.ps1
```

### Manual Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.e2e.yml up -d

# Start specific services only
docker-compose -f docker-compose.e2e.yml up -d prometheus alertmanager grafana

# View logs
docker-compose -f docker-compose.e2e.yml logs -f prometheus

# Stop all
docker-compose -f docker-compose.e2e.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.e2e.yml down -v
```

## 📊 Access Services

```bash
# Grafana (visualization)
http://localhost:3000
# Username: admin
# Password: admin

# Prometheus (metrics database)
http://localhost:9090

# Alertmanager (alert routing)
http://localhost:9093

# Backend metrics endpoint
http://localhost:3002/metrics
```

## 📈 Prometheus Queries

Use these in Prometheus UI (http://localhost:9090):

### Credit Metrics

```promql
# Total approved credits
credit_approved_total

# Total requested credits
credit_requested_total

# Approval rate (%)
(credit_approved_total / credit_requested_total) * 100

# Rejected credits
credit_rejected_total
```

### Performance Metrics

```promql
# P99 latency (SLO: 500ms)
endpoint_latency_ms_p99

# P50 latency
endpoint_latency_ms_p50

# Average latency
endpoint_latency_ms_avg

# Login-specific latency
login_latency_ms_p99
```

### User Metrics

```promql
# Total onboarded users
user_onboarded_total

# Onboarding rate per minute
rate(user_onboarded_total[1m])

# Users onboarded in last 24 hours
increase(user_onboarded_total[24h])
```

### Staking Metrics

```promql
# Total stakes created
stake_created_total

# Staking rate per hour
rate(stake_created_total[1h])

# Total staked amount
sum(stake_amount)
```

## 🧪 E2E Tests with Metrics

### Run Performance Test

```bash
# Default thresholds
npm run test:e2e:perf

# Custom thresholds
npm run test:e2e:perf -- \
  --loginThreshold=500 \
  --protectedThreshold=250 \
  --totalThreshold=800

# Via environment variables (PowerShell)
$env:PERF_LOGIN_THRESHOLD_MS=500
npm run test:e2e:perf
```

### Run Wallet Login-Stake Flow

```bash
# Standard execution
npm run test:e2e:wallet-login-stake

# Custom user ID
npm run test:e2e:wallet-login-stake -- --userId=custom-user-id

# Custom login URL
npm run test:e2e:wallet-login-stake -- --loginUrl=http://custom-backend:3000/auth/login
```

### Run Unit Tests with Metrics

```bash
# Wallet finance tests
npm run test:wallet-finance

# All workspace tests
npm run test

# With coverage
npm run test:coverage
```

## 🔔 Alert Management

### View Active Alerts

```bash
# Via Alertmanager UI
http://localhost:9093

# Via API
curl http://localhost:9093/api/v1/alerts | jq
```

### Trigger Test Alert

```bash
# This will fire a test alert in Prometheus
# Go to Prometheus → Alerts → search for any alert rule
# Or create a test rule in alert_rules.yml
```

### Check Alert Rules

```bash
# Via Prometheus UI
http://localhost:9090/rules

# Check specific rule
curl 'http://localhost:9090/api/v1/rules?type=alert' | jq '.data.groups[]'
```

## 📊 Import Grafana Dashboards

### Via API (Recommended for Automation)

```bash
# Get Grafana API token first (Admin → API Tokens)
GRAFANA_TOKEN="YOUR_TOKEN_HERE"

# Import all dashboards
for dashboard in docs/grafana-dashboard-*.json; do
  echo "Importing $dashboard..."
  curl -X POST http://localhost:3000/api/dashboards/db \
    -H "Authorization: Bearer $GRAFANA_TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$dashboard"
done
```

### Via UI (Manual)

```
1. Open http://localhost:3000 (admin/admin)
2. Click Dashboards
3. Click Import
4. Click "Import via panel JSON"
5. Copy-paste content from docs/grafana-dashboard-*.json
6. Select "Prometheus" as data source
7. Click Import
```

## 🔗 Slack/Teams Integration

### Enable Slack Notifications

```bash
# 1. Get webhook URL from Slack
# Go to your workspace → Apps → Create New App
# Search "Incoming Webhook" → Add to workspace → Copy URL

# 2. Start stack with webhook
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
./setup-monitoring.sh

# 3. Verify routing
curl http://localhost:9093/api/v1/status | jq '.config'
```

### Send Test Alert to Slack

```bash
# Manually post to webhook to verify it works
curl -X POST "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" \
  -H 'Content-type: application/json' \
  -d '{
    "text": "Test alert from TERRA monitoring",
    "attachments": [
      {
        "color": "danger",
        "title": "Credit Approval Rate Low",
        "text": "Current: 65% | SLO: 85%"
      }
    ]
  }'
```

## 🛠️ Troubleshooting Commands

### Check Service Health

```bash
# Prometheus health
curl http://localhost:9090/-/healthy

# Alertmanager health
curl http://localhost:9093/-/healthy

# Grafana health
curl http://localhost:3000/api/health

# Backend metrics endpoint
curl http://localhost:3002/metrics | head -10
```

### View Service Logs

```bash
# All services
docker-compose -f docker-compose.e2e.yml logs

# Specific service
docker-compose -f docker-compose.e2e.yml logs prometheus
docker-compose -f docker-compose.e2e.yml logs alertmanager
docker-compose -f docker-compose.e2e.yml logs grafana

# Follow logs in real-time
docker-compose -f docker-compose.e2e.yml logs -f prometheus
```

### Rebuild Containers

```bash
# Remove old containers and rebuild
docker-compose -f docker-compose.e2e.yml down -v
docker-compose -f docker-compose.e2e.yml build --no-cache
docker-compose -f docker-compose.e2e.yml up -d
```

### Check Prometheus Targets

```bash
# Via UI: http://localhost:9090/targets

# Via API
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[]'

# Check if backends are being scraped
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job, state}'
```

### Verify Metrics Flow

```bash
# Step 1: Check backend exposes metrics
curl http://localhost:3002/metrics

# Step 2: Confirm Prometheus scraped it
curl 'http://localhost:9090/api/v1/query?query=up{job="terra-xchange"}' | jq

# Step 3: Run a test query
curl 'http://localhost:9090/api/v1/query?query=credit_approved_total' | jq

# Step 4: Check Grafana has data source
curl http://localhost:3000/api/datasources | jq '.[] | {name, type}'
```

## 🧹 Cleanup Commands

### Remove All Monitoring Data

```bash
# Stop and remove containers, volumes, networks
docker-compose -f docker-compose.e2e.yml down -v

# Remove Prometheus history
docker volume rm terra_prometheus_data_e2e

# Remove Grafana configuration
docker volume rm terra_grafana_data_e2e

# Remove Alertmanager state
docker volume rm terra_alertmanager_data_e2e
```

### Clean Prometheus History Only

```bash
# Stop Prometheus
docker-compose -f docker-compose.e2e.yml stop prometheus

# Remove volume
docker volume rm terra_prometheus_data_e2e

# Restart
docker-compose -f docker-compose.e2e.yml up -d prometheus
```

## 📋 GitHub Actions Commands

### Trigger Metrics Publish Workflow

```bash
# Manual trigger via GitHub CLI
gh workflow run metrics-publish.yml

# Or via API
curl -X POST https://api.github.com/repos/YOUR/REPO/actions/workflows/metrics-publish.yml/dispatches \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ref":"main"}'
```

### Query Workflow Artifacts

```bash
# List artifacts
gh run list --workflow=metrics-publish.yml --limit=5

# Download metrics snapshot
gh run download RUN_ID --name metrics-snapshots
```

## 📊 Dashboard Navigation

### CEO Dashboard (Financial)
- URL: http://localhost:3000/d/terra-ceo-finance
- Metrics: TVL, approval rate, volume, trend

### CTO Dashboard (Performance)
- URL: http://localhost:3000/d/terra-cto-performance
- Metrics: Latency P99, login rate, endpoint health

### Product Dashboard (Adoption)
- URL: http://localhost:3000/d/terra-product-growth
- Metrics: Users, staking rate, 7-day trend

### General Dashboard (All Metrics)
- URL: http://localhost:3000/d/terra-business-metrics
- Metrics: Combined view with all KPIs

## 🔍 Performance Profiling

### Measure Latency of Specific Endpoint

```bash
# Time a single request
time curl http://localhost:3002/wallet/finance/stake

# Run multiple requests and average
for i in {1..10}; do curl -w "%{time_total}\n" -o /dev/null -s http://localhost:3002/wallet/finance/stake; done
```

### Generate Load for Testing

```bash
# Simple load test with curl (10 requests, 5 concurrent)
for i in {1..10}; do
  (curl -s http://localhost:3002/metrics > /dev/null &)
done
wait

# Better: use Apache Bench
ab -n 100 -c 10 http://localhost:3002/metrics
```

## 📝 Documentation Commands

### Print All Available Dashboards

```bash
# List dashboard files
ls -1 docs/grafana-dashboard-*.json

# Show dashboard UIDs
grep -h '"uid"' docs/grafana-dashboard-*.json
```

### Export Current Metrics

```bash
# Export last hour of metrics
curl 'http://localhost:9090/api/v1/query_range?query=up&start='"$(date -d '1 hour ago' '+%s')"'&end='"$(date '+%s')"'&step=60s' | jq > metrics-export.json
```

## 🎯 One-Liners

```bash
# Restart all services
docker-compose -f docker-compose.e2e.yml restart

# Check if all services are healthy
docker-compose -f docker-compose.e2e.yml ps

# Get current approval rate
curl -s 'http://localhost:9090/api/v1/query?query=(credit_approved_total/credit_requested_total)*100' | jq '.data.result[0].value[1]'

# Alert count
curl -s http://localhost:9093/api/v1/alerts | jq '.data | length'

# Total users
curl -s 'http://localhost:9090/api/v1/query?query=user_onboarded_total' | jq '.data.result[0].value[1]'

# P99 latency
curl -s 'http://localhost:9090/api/v1/query?query=endpoint_latency_ms_p99' | jq '.data.result[0].value[1]'
```

---

**Tip**: Bookmark this page for quick copy-paste access!

**Last Updated**: June 2026
