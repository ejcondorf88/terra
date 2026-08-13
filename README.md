# TERRA Ecosistema

Este repositorio agrupa tres proyectos principales que juntos forman el ecosistema TERRA:

- `TERRA GO` — marketplace blockchain y tokenización agrícola.
- `TERRA LINK` — plataforma de tokenización agrícola, backend modular y dashboard de seguimiento.
- `TERRA X CHANGE` — exchange/app móvil y backend de operaciones.

## Objetivo

Armonizar las bases y automatizar la entrega para que el ecosistema pueda evolucionar de forma coordinada, con:

- estándares comunes de desarrollo
- scripts de prueba y despliegue armonizados
- integración continua centralizada
- documentación compartida y comandos raíz

## Estructura del directorio

```
TERRA/
├── TERRA GO/
├── TERRA LINK/
├── TERRA X CHANGE/
├── packages/
│   └── shared/
└── .github/
    └── workflows/
        └── ecosystem-ci.yml
```

## Workspace y unificación

Se agregó un workspace de npm en la raíz con:

- `package.json` central
- `tsconfig.base.json` para configuración TypeScript común
- `packages/shared` como librería común inicial
- `docs/ARCHITECTURE.md` y `docs/PROCESSES.md` para documentación centralizada

## Comandos recomendados

### Instalar todas las dependencias
```bash
npm run bootstrap
```

### Ejecutar pruebas del ecosistema
```bash
npm test
```

### Ejecutar pruebas específicas
```bash
npm run test:terra-go
npm run test:terra-link
npm run test:terra-x-change
```

### Ejecutar cobertura del ecosistema
```bash
npm run test:coverage
```

### Ejecutar el scaffold E2E compartido
```bash
npm run test:e2e
```

## Documentación consolidada

- `docs/ARCHITECTURE.md` — arquitectura y límites del ecosistema.
- `docs/PROCESSES.md` — procesos de desarrollo y entrega (PR, changelog, versionado).

## Validación local del ecosistema

Después de cambios arquitectónicos, validar que todo funciona:

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar el paquete shared
npm run -w @terra/shared build

# 3. Ejecutar todas las pruebas unitarias
npm run test

# 4. Ejecutar pruebas con cobertura
npm run test:coverage

# 5. Revisar reportes de cobertura (combinar si procede)
# Los reportes están en cada workspace: TERRA GO/backend/coverage, etc.
# CI intenta consolidarlos en coverage/combined/html/

# 6. Ejecutar E2E scaffold (requiere servicios corriendo)
npm run test:e2e
```

## Infraestructura para E2E

Para ejecutar E2E en local o en CI con servicios compartidos (PostgreSQL, Redis):

```bash
# Levantar infraestructura
docker-compose -f docker-compose.e2e.yml up -d postgres redis

# Iniciar backends (en terminales separadas o en contenedores)
# Luego ejecutar E2E
node tests/e2e/jwt-rbac.example.ts --loginUrl=http://localhost:3000/auth/login

# Ejecutar métricas de performance
npm run test:e2e:perf

# Limpiar
docker-compose -f docker-compose.e2e.yml down -v
```

Ver `tests/e2e/README.md` para opciones detalladas.

## Monitoreo de Métricas de Negocio

El ecosistema emite métricas de negocio (créditos aprobados, latencia, staking, etc.) a través de `@terra/shared/metrics`:

### Stack Completo (Prometheus + Alertmanager + Grafana)

```bash
# Iniciar stack completo (30 segundos)
# En macOS/Linux:
chmod +x setup-monitoring.sh
./setup-monitoring.sh

# En Windows PowerShell:
.\setup-monitoring.ps1
```

### Acceso rápido

- **Grafana**: http://localhost:3000 (admin / admin)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Métricas**: http://localhost:3002/metrics

### Dashboards por rol

Importar en Grafana desde `docs/`:
- `grafana-dashboard.json` — Todas las métricas
- `grafana-dashboard-ceo.json` — KPIs financieros
- `grafana-dashboard-cto.json` — Performance & SLA
- `grafana-dashboard-product.json` — Growth & Adoption

Ver [docs/MONITORING_QUICKSTART.md](docs/MONITORING_QUICKSTART.md) para setup completo y alertas Slack/Teams.

## Visualización Local con Prometheus + Grafana

```bash
# 1. Levantar Prometheus
docker run -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus

# 2. Levantar Grafana (en otra terminal)
docker run -p 3000:3000 grafana/grafana

# 3. Abrir dashboard
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090

# 4. Importar dashboard
# Ir a Dashboards → Import → copiar contenido de docs/grafana-dashboard.json
```

### Métricas Disponibles

- **Créditos**: total solicitados, aprobados, rechazados
- **Usuarios**: onboardeados, intentos de login
- **Staking**: stakes creados, APR realizado
- **Performance**: latencia P50/P99 de endpoints críticos

Ver `docs/BUSINESS_METRICS.md` y `docs/PROMETHEUS_GRAFANA_SETUP.md` para detalles completos.

## Cobertura publicada en GitHub Pages

El workflow de CI (`coverage-consolidated.yml`) publica el reporte HTML consolidado cuando se ejecuta en `main` y se genera `coverage/combined/html/index.html`.

- `docs/coverage.md` explica cómo se genera y dónde revisar el reporte.
- Si la publicación falla, el reporte HTML sigue disponible como artefacto de workflow (`coverage-report-html`).

## Almacenamiento de artefactos en CI

El workflow de CI (`coverage-consolidated.yml`):
- Ejecuta pruebas en todos los workspaces.
- Intenta combinar reportes de cobertura con `istanbul-combine`.
- Sube reportes individuales **y** reporte combinado como artefactos.
- Para descargar: ir a la ejecución del workflow en GitHub Actions y descargar `coverage-report-html` para revisar métricas globales.

## Siguiente paso

1. Compartir utilidades reutilizables en `packages/shared`.
2. Actualizar los subproyectos para ampliar el uso de la configuración raíz.
3. Extender la pipeline a cobertura y validaciones de seguridad.
4. Mantener la documentación central como referencia principal del ecosistema.
5. Versionar `@terra/shared` con semver interno: breaking changes mayor, nuevas utilidades menor, fixes patch.

