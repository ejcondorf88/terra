#!/bin/bash

# setup-monitoring.sh
# Quick setup script for TERRA monitoring stack (Prometheus + Alertmanager + Grafana)

set -e

echo "🚀 TERRA Monitoring Stack Setup"
echo "================================"
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"

# Optional: Check for Slack webhook
if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "⚠️  SLACK_WEBHOOK_URL not set. Alerts will use null receiver."
    echo "   To enable Slack notifications: export SLACK_WEBHOOK_URL='https://hooks.slack.com/...'"
else
    echo "✅ Slack webhook configured"
fi

# Start docker-compose services
echo ""
echo "Starting TERRA monitoring stack..."
docker-compose -f docker-compose.e2e.yml up -d \
    postgres redis \
    backend_go backend_link backend_xchange \
    prometheus alertmanager grafana

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo ""
echo "🔍 Checking service health..."

services=(
    "Prometheus:http://localhost:9090"
    "Alertmanager:http://localhost:9093"
    "Grafana:http://localhost:3000"
    "Backend X CHANGE:http://localhost:3002/metrics"
)

for service in "${services[@]}"; do
    name="${service%%:*}"
    url="${service##*:}"
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "✅ $name is running"
    else
        echo "⚠️  $name is not ready yet"
    fi
done

echo ""
echo "✅ TERRA Monitoring Stack is up!"
echo ""
echo "📊 Access points:"
echo "   - Grafana:      http://localhost:3000 (admin / admin)"
echo "   - Prometheus:   http://localhost:9090"
echo "   - Alertmanager: http://localhost:9093"
echo ""
echo "📈 Available dashboards in Grafana:"
echo "   1. General:  All metrics"
echo "   2. CEO:      Financial KPIs (TVL, approval rate, volume)"
echo "   3. CTO:      Performance & SLA (latency, throughput)"
echo "   4. Product:  Growth & Adoption (users, staking)"
echo ""
echo "📝 To import dashboards:"
echo "   1. Open Grafana (http://localhost:3000)"
echo "   2. Go to Dashboards → Import"
echo "   3. Paste JSON from docs/grafana-dashboard-*.json"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.e2e.yml down"
