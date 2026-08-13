# TERRA E2E Tests with Metrics

End-to-end tests that validate both functionality and business metrics.

## Test Suite Overview

| Test | Purpose | Metrics Captured |
|------|---------|------------------|
| `jwt-rbac.example.ts` | Auth flow validation | login_latency, endpoint_latency |
| `performance.example.ts` | Latency SLA validation | endpoint_latency_p50/p99 |
| `wallet/login-stake.example.ts` | Complete user flow | login→stake latency, stakeId |
| `test:wallet-finance` | Repository unit tests | stake persistence |

## Running Tests Locally

### Setup Backends Locally (npm)

```bash
# Terminal 1: TERRA X CHANGE backend
cd "TERRA X CHANGE/backend"
npm install
npm run start

# Terminal 2: Run E2E tests
npm run test:e2e -- --loginUrl=http://localhost:3002/wallet/auth/login
```

### Setup Backends via Docker Compose

```bash
# Start services
docker-compose -f docker-compose.e2e.yml up -d \
    postgres redis \
    backend_go backend_link backend_xchange

# Wait for healthchecks
sleep 30

# Run E2E tests
npm run test:e2e

# Optional: Start monitoring
docker-compose -f docker-compose.e2e.yml up -d prometheus alertmanager grafana
```

### PowerShell on Windows

```powershell
# Quick start with monitoring
.\setup-monitoring.ps1

# Run specific test
npm run test:e2e:wallet-login-stake

# Stop all
docker-compose -f docker-compose.e2e.yml down
```

## Test Parameters

### Performance Test Thresholds

```bash
npm run test:e2e:perf -- \
  --loginThreshold=500 \
  --protectedThreshold=250 \
  --totalThreshold=800

# Or via environment variables
$env:PERF_LOGIN_THRESHOLD_MS=500
$env:PERF_PROTECTED_THRESHOLD_MS=250
$env:PERF_TOTAL_THRESHOLD_MS=800
npm run test:e2e:perf
```

### Wallet Login-Stake Flow

```bash
npm run test:e2e:wallet-login-stake -- \
  --loginUrl=http://localhost:3002/wallet/auth/login \
  --userId=test-user-$(Get-Random)

# Expected output:
# ✅ Login successful
# ✅ Token received
# ✅ Protected endpoint accessible
# ✅ Stake created: stake-xxxxx
```

## Metrics Collection

Each E2E test emits metrics to `PrometheusExporter`:

### JWT+RBAC Test Metrics

```
login_latency_ms:          123ms
endpoint_latency_ms:       45ms (protected endpoint)
```

### Performance Test Metrics

```
endpoint_latency_ms_p50:   120ms
endpoint_latency_ms_p99:   450ms
endpoint_latency_ms_avg:   180ms
```

### Wallet Login-Stake Metrics

```
user_login:                triggered
login_latency_ms:          234ms
credit_requested:          N/A (stub)
stake_created:             triggered
stake_latency_ms:          189ms
```

## Exit Codes

### Performance Tests

- `0`: All thresholds met ✅
- `6`: Login latency exceeded ❌
- `7`: Protected endpoint latency exceeded ❌
- `8`: Total flow latency exceeded ❌

### Wallet Tests

- `0`: Success ✅
- `3`: Login failed ❌
- `4`: No token received ❌
- `5`: Protected endpoint failed ❌
- `6`: Stake creation failed ❌
- `7`: No stakeId in response ❌

## Integration with CI/CD

### GitHub Actions: Run E2E on PR

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: password
      redis:
        image: redis:7-alpine
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Start backends
        run: |
          docker-compose -f docker-compose.e2e.yml up -d backend_xchange
          sleep 10
      
      - name: Run E2E tests
        run: npm run test:e2e:perf
        env:
          PERF_LOGIN_THRESHOLD_MS: 500
          PERF_PROTECTED_THRESHOLD_MS: 250
          PERF_TOTAL_THRESHOLD_MS: 800
      
      - name: Upload metrics
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-metrics
          path: tests/e2e/metrics/
```

### Prometheus Integration

If Prometheus is running locally:

```bash
# Query metrics after test run
curl 'http://localhost:9090/api/v1/query?query=endpoint_latency_ms_p99'
```

## Expected Output Examples

### Successful Login-Stake Flow

```
🔐 TERRA E2E: Login → Stake Flow
📡 Login URL: http://localhost:3002/wallet/auth/login

[1/4] Logging in...
✅ Login successful (email: user@test.com)
⏱️  Latency: 234ms

[2/4] Extracting token...
✅ Token received: eyJhbGc...

[3/4] Accessing protected endpoint...
✅ Protected endpoint accessible
⏱️  Latency: 89ms

[4/4] Creating stake...
✅ Stake created
   Stake ID: stake-12345
   Pool ID: pool-1
   Amount: 1000
   Status: active
⏱️  Latency: 189ms

🎉 E2E Test Completed Successfully!
📊 Total time: 512ms
```

### Performance Test Output

```
🔍 TERRA E2E: Performance Test
📡 Testing: http://localhost:3002

Thresholds:
  Login: 500ms
  Protected: 250ms
  Total: 800ms

Results:
  Login latency (P50): 120ms ✅
  Login latency (P99): 450ms ✅
  Protected latency (P50): 45ms ✅
  Protected latency (P99): 180ms ✅
  Total latency: 630ms ✅

🎉 All thresholds met!
```

### Failed Performance Test

```
❌ CRITICAL: Login P99 latency exceeded
   Expected: ≤500ms
   Actual: 678ms
   Exit code: 6
```

## Debugging

### Enable verbose logging

```bash
DEBUG=terra:* npm run test:e2e
```

### Check backend metrics endpoint

```bash
curl http://localhost:3002/metrics
```

Expected output:

```
# HELP login_total Total login attempts
# TYPE login_total counter
login_total 5

# HELP endpoint_latency_ms Latency in milliseconds
# TYPE endpoint_latency_ms histogram
endpoint_latency_ms_p50 120
endpoint_latency_ms_p99 450
endpoint_latency_ms_avg 234.50
```

### View Prometheus queries in Grafana

1. Open http://localhost:3000 (admin/admin)
2. Explore → Select Prometheus data source
3. Enter query: `endpoint_latency_ms_p99`

## Best Practices

1. **Run before PR merge**: Tests validate SLA compliance
2. **CI integration**: Archive metrics for trend analysis
3. **Baseline setting**: Set thresholds based on historical data
4. **Regression detection**: Monitor for latency degradation
5. **Capacity planning**: Use metrics to predict scaling needs

## Troubleshooting

### Test timeout

```
Error: Timeout waiting for response
```

Solution: Increase Docker startup time or check backend logs

### Connection refused

```
Error: connect ECONNREFUSED 127.0.0.1:3002
```

Solution: Ensure backend is running: `curl http://localhost:3002/health`

### No metrics in Prometheus

Solution: Check backend `/metrics` endpoint is exposing data

## Next Steps

1. **Historical Tracking**: Archive E2E metrics for trend analysis
2. **Anomaly Detection**: ML models to detect performance regressions
3. **Load Testing**: k6 integration for sustained load tests
4. **Security E2E**: OWASP compliance tests
