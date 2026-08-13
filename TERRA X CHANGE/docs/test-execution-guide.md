# Guía de Ejecución de Pruebas – TERRA X CHANGE

## Configuración Previa

### 1. Instalar herramientas necesarias

```bash
# En raíz del proyecto

# Backend (NestJS)
cd backend && npm install --save-dev supertest @types/supertest

# Frontend (React Native)
cd ../frontend && npm install --save-dev @testing-library/react-native

# Performance testing
npm install --save-dev artillery locust

# Security scanning
npm install --save-dev snyk

# Contract testing (si tenemos Hardhat)
npm install --save-dev hardhat ethers
```

### 2. Configurar bases de datos de prueba

```bash
# PostgreSQL
createdb terra_x_change_test

# Redis
redis-cli
> SELECT 1  # Base de datos 1 para tests
```

---

## 1. EJECUTAR PRUEBAS UNITARIAS

### Backend (Jest)

```bash
cd backend

# Todas las pruebas
npm test

# Suite específica
npm test wallet.service.spec.ts

# Con cobertura
npm test -- --coverage

# Watch mode (desarrollo)
npm test -- --watch

# Actualizar snapshots
npm test -- -u
```

**Output esperado:**
```
PASS  src/wallet/wallet.service.spec.ts
  WalletService
    ✓ should create a wallet
    ✓ should get wallet balance
    ✓ should throw error if wallet not found
  
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Coverage:    85% statements
```

### Frontend (Jest + React Native)

```bash
cd frontend

# Todas las pruebas
npm test

# Suite específica
npm test -- HomeScreen.test.tsx

# Con coverage
npm test -- --coverage

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 2. EJECUTAR PRUEBAS DE INTEGRACIÓN

### API Tests (Supertest + NestJS)

```bash
# Backend
cd backend

# Tests E2E
npm run test:e2e

# Suite específica
npm run test:e2e -- wallet.e2e-spec.ts

# Con timeout extendido (para DB lenta)
npm run test:e2e -- --testTimeout=30000

# Generar reporte HTML
npm run test:e2e -- --reporters=html
```

**Verificar:**
- ✅ Endpoints HTTP responden correctamente
- ✅ Base de datos se actualiza
- ✅ Errores se lanzan apropiadamente

### Frontend E2E (Playwright)

```bash
# Raíz del proyecto
npx playwright test

# Suite específica
npx playwright test wallet.spec.ts

# Con UI (navegador visual)
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Generar reporte HTML
npx playwright show-report
```

**Archivos de salida:**
```
playwright-report/index.html  → Reporte completo
test-results/                 → Videos y screenshots
```

---

## 3. PRUEBAS DE CONTRATOS INTELIGENTES

### Hardhat (si tenemos contrato X Coin)

```bash
cd blockchain  # o donde estén los contratos

# Instalar Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Compilar
npx hardhat compile

# Ejecutar tests
npx hardhat test

# Con reporte de gas
REPORT_GAS=true npx hardhat test

# Coverage de contratos
npx hardhat coverage
```

**Casos a validar:**
```solidity
// test/XCoin.test.js
describe("XCoin Contract", () => {
  it("should transfer tokens", async () => { /* ... */ });
  it("should prevent reentrancy", async () => { /* ... */ });
  it("should enforce approval workflow", async () => { /* ... */ });
});
```

---

## 4. PRUEBAS DE SEGURIDAD

### OWASP ZAP (escaneo automático)

```bash
# Instalar ZAP (https://www.zaproxy.org/)

# Lanzar el backend primero
cd backend && npm run start:dev

# En otra terminal, ejecutar ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r zap-report.html
```

### Snyk (vulnerabilidades de dependencias)

```bash
# Autenticarse
snyk auth

# Verificar vulnerabilidades
snyk test

# Corregir automáticamente
snyk fix

# Monitoreo continuo
snyk monitor
```

### Validación Manual

```bash
# 1. SQL Injection test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test'"'"' OR '"'"'1'"'"'='"'"'1","password":"x"}'
# Debería rechazarse ✓

# 2. CSRF test
curl -X POST http://localhost:3000/api/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"uuid"}'
# Sin CSRF token debería fallar ✓

# 3. Rate limiting test
for i in {1..150}; do
  curl http://localhost:3000/api/health
done
# Después de 100 debería retornar 429 ✓
```

---

## 5. PRUEBAS DE PERFORMANCE

### Artillery (carga HTTP)

```bash
# Instalar
npm install --save-dev artillery

# Crear archivo de configuración
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up"
    - duration: 120
      arrivalRate: 50
      name: "Sustain"
scenarios:
  - name: "Wallet Flow"
    flow:
      - post:
          url: "/api/wallet/create"
          json:
            userId: "test-user-123"
      - get:
          url: "/api/wallet/test-wallet-123/balance"
EOF

# Ejecutar
artillery run load-test.yml

# Resultado esperado:
# Latency: p95 < 500ms
# Error rate < 1%
```

### JMeter (alternativa visual)

```bash
# Descargar desde https://jmeter.apache.org/

# Configurar:
# 1. Thread Group: 100 usuarios
# 2. Ramp-up: 10s
# 3. HTTP Sampler: POST /api/wallet/create
# 4. Assertion: response code = 201
# 5. Listener: View Results Tree

jmeter -n -t test-plan.jmx -l results.jtl -j jmeter.log
```

---

## 6. PRUEBAS DE STRESS

### Locust (simulación de usuarios)

```bash
pip install locust

cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class TerraUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def create_wallet(self):
        self.client.post("/api/wallet/create", json={"userId": "user-123"})
    
    @task
    def get_balance(self):
        self.client.get("/api/wallet/wallet-123/balance")
EOF

# Ejecutar (UI web en localhost:8089)
locust -f locustfile.py --host http://localhost:3000
```

**Configurar:**
- Number of users: 1000
- Spawn rate: 100 users/sec
- Run time: 5 min

**Métricas a validar:**
```
✓ P95 latency < 1000ms
✓ Error rate < 0.5%
✓ Throughput > 1000 req/sec
```

---

## 7. EJECUTAR CI/CD LOCALMENTE

### Simular GitHub Actions

```bash
# Instalar act (simula GH Actions)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

# Ejecutar workflow localmente
act push -j test-backend

# Ver logs
act -l  # Listar workflows
act --verbose
```

### O ejecutar manually

```bash
# 1. Linting
cd backend && npm run lint
cd ../frontend && npm run lint

# 2. Build
cd backend && npm run build
cd ../frontend && npm run build

# 3. Unit tests
cd backend && npm test
cd ../frontend && npm test

# 4. Integration tests
npm run test:e2e

# 5. E2E
npx playwright test

# 6. Security scans
snyk test

# 7. Reporte final
echo "✅ All tests passed"
```

---

## 8. GENERAR REPORTES

### Coverage Report

```bash
# Backend
cd backend
npm test -- --coverage --coveragePathIgnorePatterns=node_modules

# Abrir en navegador
open coverage/index.html
```

**Métricas:**
```
Statements   : 85.3%
Branches     : 78.2%
Functions    : 82.1%
Lines        : 85.9%
```

### Test Report (Playwright)

```bash
npx playwright show-report
# Abre en localhost:3000
```

---

## 9. CHECKLIST PRE-DESPLIEGUE

```bash
#!/bin/bash
set -e

echo "🔍 Checklist Pre-Despliegue"
echo "=========================="

# 1. Linting
echo "✅ Verificando estilos..."
cd backend && npm run lint
cd ../frontend && npm run lint

# 2. Tests
echo "✅ Ejecutando pruebas unitarias..."
cd backend && npm test -- --coverage
cd ../frontend && npm test

# 3. E2E
echo "✅ Ejecutando pruebas E2E..."
npx playwright test

# 4. Security
echo "✅ Escaneo de seguridad..."
snyk test

# 5. Build
echo "✅ Compilando..."
cd backend && npm run build
cd ../frontend && npm run tsc

# 6. Performance
echo "✅ Verificando performance..."
# (ejecutar load test si es crítico)

echo ""
echo "✅ TODO OK - Listo para despliegue"
```

---

## 10. SCRIPTS EN package.json

Agregar a `backend/package.json` y `frontend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "security:check": "snyk test",
    "perf:load": "artillery run load-test.yml",
    "perf:report": "artillery report artillery-report.json"
  }
}
```

---

## Tabla Resumen de Ejecución

| Tipo | Comando | Tiempo | Frecuencia | Éxito |
|---|---|---|---|---|
| Unit | `npm test` | 30s | Cada commit | |
| Integration | `npm run test:e2e` | 2min | Cada PR | |
| E2E | `npx playwright test` | 5min | Antes de deploy | |
| Security | `snyk test` | 1min | Nightly | |
| Performance | `artillery run` | 10min | Weekly | |
| Smoke | Manual/Script | 5min | Post-deploy | |