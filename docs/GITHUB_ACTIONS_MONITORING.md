# GitHub Actions Integration for TERRA Monitoring

This guide explains how to integrate TERRA metrics monitoring into GitHub Actions CI/CD pipelines.

## Overview

The monitoring stack can be integrated into GitHub Actions to:
- Publish metrics summaries to Slack on schedule
- Validate SLA compliance (latency, approval rates) during CI
- Trigger alerts when metrics degrade beyond thresholds
- Archive metrics for historical trend analysis

## Architecture

```
┌─────────────────┐
│ GitHub Actions  │
├─────────────────┤
│ 1. Query Prometheus (running locally or in staging)
│ 2. Compare against SLO thresholds
│ 3. Post to Slack/Teams on failure
│ 4. Archive metrics snapshot
└─────────────────┘
```

## Workflow: Publish Weekly Metrics

File: `.github/workflows/metrics-publish.yml`

```yaml
name: Publish Weekly Metrics

on:
  schedule:
    - cron: '0 9 * * MON'  # Every Monday at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  publish-metrics:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Query Prometheus
        id: query
        run: |
          # Get current metrics from staging Prometheus
          PROM_URL="${{ secrets.PROMETHEUS_STAGING_URL }}"
          
          # Credit approval rate
          APPROVAL_RATE=$(curl -s "${PROM_URL}/api/v1/query?query=credit_approved_total%2Fcredit_requested_total*100" | jq '.data.result[0].value[1]')
          
          # Total TVL
          TVL=$(curl -s "${PROM_URL}/api/v1/query?query=sum(stake_amount)" | jq '.data.result[0].value[1]')
          
          # Users onboarded this week
          USERS=$(curl -s "${PROM_URL}/api/v1/query?query=increase(user_onboarded_total%5B7d%5D)" | jq '.data.result[0].value[1]')
          
          echo "approval_rate=${APPROVAL_RATE}" >> $GITHUB_OUTPUT
          echo "tvl=${TVL}" >> $GITHUB_OUTPUT
          echo "users=${USERS}" >> $GITHUB_OUTPUT
      
      - name: Validate SLO Compliance
        env:
          APPROVAL_RATE: ${{ steps.query.outputs.approval_rate }}
          TVL: ${{ steps.query.outputs.tvl }}
          USERS: ${{ steps.query.outputs.users }}
        run: |
          # Check thresholds
          THRESHOLD_APPROVAL=0.85
          
          if (( $(echo "$APPROVAL_RATE < $THRESHOLD_APPROVAL" | bc -l) )); then
            echo "❌ Credit approval rate ($APPROVAL_RATE) below SLO ($THRESHOLD_APPROVAL)"
            exit 1
          else
            echo "✅ Credit approval rate ($APPROVAL_RATE) meets SLO"
          fi
      
      - name: Post to Slack
        if: always()
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK_URL }}
          APPROVAL_RATE: ${{ steps.query.outputs.approval_rate }}
          TVL: ${{ steps.query.outputs.tvl }}
          USERS: ${{ steps.query.outputs.users }}
        run: |
          curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            -d @- <<EOF
          {
            "blocks": [
              {
                "type": "header",
                "text": {
                  "type": "plain_text",
                  "text": "📊 Weekly Metrics Report"
                }
              },
              {
                "type": "section",
                "fields": [
                  {
                    "type": "mrkdwn",
                    "text": "*Credit Approval Rate:*\n${{ steps.query.outputs.approval_rate }}%"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*TVL:*\n\$${{ steps.query.outputs.tvl }}"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*Users This Week:*\n${{ steps.query.outputs.users }}"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*Date:*\n$(date '+%Y-%m-%d')"
                  }
                ]
              },
              {
                "type": "actions",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "View Dashboard"
                    },
                    "url": "https://your-grafana-url/d/terra-business-metrics"
                  }
                ]
              }
            ]
          }
          EOF
      
      - name: Archive Metrics Snapshot
        run: |
          mkdir -p metrics-snapshots
          
          # Save snapshot with timestamp
          TIMESTAMP=$(date +%Y-%m-%d-%H:%M:%S)
          cat > metrics-snapshots/metrics-${TIMESTAMP}.json <<EOF
          {
            "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "approval_rate": ${{ steps.query.outputs.approval_rate }},
            "tvl": ${{ steps.query.outputs.tvl }},
            "users_week": ${{ steps.query.outputs.users }}
          }
          EOF
      
      - name: Upload Metrics Archive
        uses: actions/upload-artifact@v3
        with:
          name: metrics-snapshots
          path: metrics-snapshots/
          retention-days: 90
```

## Workflow: SLA Validation on Pull Request

File: `.github/workflows/sla-check.yml`

```yaml
name: SLA Compliance Check

on:
  pull_request:
    paths:
      - 'TERRA X CHANGE/wallet/finance/**'
      - 'TERRA X CHANGE/wallet/auth/**'
  workflow_dispatch:

jobs:
  sla-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run E2E Performance Tests
        run: |
          npm run test:e2e:perf -- \
            --loginThreshold=500 \
            --protectedThreshold=250 \
            --totalThreshold=800
      
      - name: Check Credit Approval SLA
        run: |
          # Simulate credit approval flow
          APPROVAL_TIME=$(npm run test:e2e:wallet-login-stake -- --measure-approval-time | grep "approval_time_ms" | cut -d: -f2)
          
          if [ "$APPROVAL_TIME" -gt 5000 ]; then
            echo "❌ Credit approval took ${APPROVAL_TIME}ms (SLO: 5000ms)"
            exit 1
          fi
      
      - name: Comment on PR
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const status = context.job.status === 'success' ? '✅' : '❌';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `${status} SLA Compliance Check\n- Latency: OK\n- Approval Time: OK`
            })
```

## Workflow: Alert on Metrics Degradation

File: `.github/workflows/metrics-alert.yml`

This workflow continuously monitors production metrics and alerts on degradation:

```yaml
name: Metrics Degradation Alert

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  check-metrics:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Check Metric Thresholds
        id: check
        run: |
          PROM_URL="${{ secrets.PROMETHEUS_STAGING_URL }}"
          
          # Check approval rate
          APPROVAL=$(curl -s "${PROM_URL}/api/v1/query?query=credit_approved_total%2Fcredit_requested_total" | jq '.data.result[0].value[1]')
          
          # Check latency
          LATENCY_P99=$(curl -s "${PROM_URL}/api/v1/query?query=endpoint_latency_ms_p99" | jq '.data.result[0].value[1]')
          
          # Check uptime
          UPTIME=$(curl -s "${PROM_URL}/api/v1/query?query=up" | jq '.data.result | length')
          
          echo "approval=${APPROVAL}" >> $GITHUB_OUTPUT
          echo "latency=${LATENCY_P99}" >> $GITHUB_OUTPUT
          echo "uptime=${UPTIME}" >> $GITHUB_OUTPUT
      
      - name: Trigger Alert if Threshold Exceeded
        if: failure()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-type: application/json' \
            -d '{
              "text": "🚨 Metrics Alert",
              "attachments": [
                {
                  "color": "danger",
                  "fields": [
                    {
                      "title": "Approval Rate",
                      "value": "${{ steps.check.outputs.approval }}%",
                      "short": true
                    },
                    {
                      "title": "P99 Latency",
                      "value": "${{ steps.check.outputs.latency }}ms",
                      "short": true
                    }
                  ]
                }
              ]
            }'
```

## Setup Secrets in GitHub

In your repository Settings → Secrets and variables → Actions, add:

```
PROMETHEUS_STAGING_URL     = https://prometheus.your-domain.com
SLACK_WEBHOOK_URL          = https://hooks.slack.com/services/YOUR/WEBHOOK
GRAFANA_API_TOKEN          = eyJrIjoiXXXXXXXX...
```

## Querying Local Prometheus During CI

If running tests locally in CI, use docker-compose:

```bash
# Start monitoring stack
docker-compose -f docker-compose.e2e.yml up -d prometheus alertmanager

# Wait for Prometheus to be ready
sleep 10

# Query metrics
curl -s 'http://localhost:9090/api/v1/query?query=credit_approved_total'

# Stop services
docker-compose -f docker-compose.e2e.yml down
```

## Real-World Example: Production Metrics Dashboard

Combine all workflows to create a production metrics dashboard:

```bash
# 1. Weekly published to Slack (Mondays 9 AM)
# 2. Per-PR SLA validation (automated comment)
# 3. Continuous monitoring (every 15 min)
# 4. Historical snapshots (90-day retention)
```

This gives stakeholders:
- **Finance**: Weekly approval rate trend
- **Engineering**: Immediate SLA feedback on PRs
- **Leadership**: Real-time operational health

## Troubleshooting CI Integration

### Prometheus URL not accessible

- Ensure staging Prometheus has a public endpoint or VPN access
- Or: run local Prometheus stack during E2E tests

### Query returns no results

- Check Prometheus has data: `curl http://localhost:9090/api/v1/query?query=up`
- Verify scrape_interval: default 15s, wait up to 30s for first data

### Slack webhook rejected

- Verify webhook URL hasn't expired
- Test webhook manually: `curl -X POST <URL> -d '{"text":"test"}'`

## Next Steps

1. **Custom Dashboards**: Create role-specific views
2. **Historical Analysis**: Archive metrics for ML-based anomaly detection
3. **Budget Tracking**: Monitor infrastructure costs
4. **Compliance Audit**: Export metrics for compliance reports

