# setup-monitoring.ps1
# Quick setup script for TERRA monitoring stack (Prometheus + Alertmanager + Grafana)
# Usage: .\setup-monitoring.ps1

param(
    [string]$SlackWebhookUrl = ""
)

Write-Host "🚀 TERRA Monitoring Stack Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if docker is installed
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker found" -ForegroundColor Green

# Check for Slack webhook
if ([string]::IsNullOrEmpty($SlackWebhookUrl) -and [string]::IsNullOrEmpty($env:SLACK_WEBHOOK_URL)) {
    Write-Host "⚠️  SLACK_WEBHOOK_URL not set. Alerts will use null receiver." -ForegroundColor Yellow
    Write-Host "   To enable Slack notifications: `$env:SLACK_WEBHOOK_URL='https://hooks.slack.com/...'" -ForegroundColor Yellow
} else {
    Write-Host "✅ Slack webhook configured" -ForegroundColor Green
}

# Set environment variable if provided
if (-not [string]::IsNullOrEmpty($SlackWebhookUrl)) {
    $env:SLACK_WEBHOOK_URL = $SlackWebhookUrl
}

# Start docker-compose services
Write-Host ""
Write-Host "Starting TERRA monitoring stack..." -ForegroundColor Cyan

docker-compose -f docker-compose.e2e.yml up -d `
    postgres redis `
    backend_go backend_link backend_xchange `
    prometheus alertmanager grafana

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check health
Write-Host ""
Write-Host "🔍 Checking service health..." -ForegroundColor Cyan

$services = @(
    @{ Name = "Prometheus"; Url = "http://localhost:9090" },
    @{ Name = "Alertmanager"; Url = "http://localhost:9093" },
    @{ Name = "Grafana"; Url = "http://localhost:3000" },
    @{ Name = "Backend X CHANGE"; Url = "http://localhost:3002/metrics" }
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
            Write-Host ("✅ " + $service.Name + " is running") -ForegroundColor Green
        }
    } catch {
        Write-Host ("⚠️  " + $service.Name + " is not ready yet") -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ TERRA Monitoring Stack is up!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Access points:" -ForegroundColor Cyan
Write-Host "   - Grafana:      http://localhost:3000 (admin / admin)" -ForegroundColor White
Write-Host "   - Prometheus:   http://localhost:9090" -ForegroundColor White
Write-Host "   - Alertmanager: http://localhost:9093" -ForegroundColor White
Write-Host ""
Write-Host "📈 Available dashboards in Grafana:" -ForegroundColor Cyan
Write-Host "   1. General:  All metrics" -ForegroundColor White
Write-Host "   2. CEO:      Financial KPIs (TVL, approval rate, volume)" -ForegroundColor White
Write-Host "   3. CTO:      Performance & SLA (latency, throughput)" -ForegroundColor White
Write-Host "   4. Product:  Growth & Adoption (users, staking)" -ForegroundColor White
Write-Host ""
Write-Host "📝 To import dashboards:" -ForegroundColor Cyan
Write-Host "   1. Open Grafana (http://localhost:3000)" -ForegroundColor White
Write-Host "   2. Go to Dashboards → Import" -ForegroundColor White
Write-Host "   3. Paste JSON from docs/grafana-dashboard-*.json" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop services:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.e2e.yml down" -ForegroundColor White
