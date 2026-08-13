# TERRA LINK

Rediseño de TERRA LINK como plataforma de tokenización agrícola con NFTs financieros robustos. Este repositorio contiene la arquitectura inicial y los componentes clave para backend, contratos inteligentes y despliegue en infraestructura.

## 📖 Índice de documentación

**🗺️ [MAPA DEL PROYECTO (empieza aquí – 5 min)](./docs/PROJECT-MAP.md)** – Vista rápida visual de todo

**Comienza aquí según tu rol:**

1. **[QUICKSTART.md](./docs/QUICKSTART.md)** ← **Acceso rápido por rol (comandos VS Code)**
2. **[INDEX.md](./docs/INDEX.md)** ← **Índice maestro (búsqueda y referencias cruzadas)**

### Para ejecutivos y stakeholders
- **[Resumen ejecutivo (1 página)](./docs/EXECUTIVE-SUMMARY.md)** – Estado, oportunidades, timeline, ROI
- **[Mapa del proyecto (visual)](./docs/PROJECT-MAP.md)** – Vista general en 5 minutos

### Para arquitectos y tech leads
- **[Análisis de ingeniería](./docs/engineering-analysis.md)** – Estado actual, brechas, roadmap técnico
- **[Diagrama C4 nivel 2](./docs/architecture-c4-level2.md)** – Arquitectura con módulos propuestos
- **[Plan de desarrollo](./docs/roadmap-implementation.md)** – 3 sprints, 11 issues priorizados
- **[Mapa del proyecto (visual)](./docs/PROJECT-MAP.md)** – Overview de alto nivel

### Para desarrolladores
- **[Guía de desarrollo](./docs/development-guide.md)** – Setup local, tareas VS Code
- **[Documentación técnica](./docs/terra-link-technical.md)** – Endpoints, módulos, entities
- **[API reference](./docs/api-reference.md)** – Ejemplos de uso
- **[Mapa del proyecto (visual)](./docs/PROJECT-MAP.md)** – Arquitectura en diagrama

- **IoT Alerts API** – Endpoints y ejemplos en [Guía de testing](./docs/testing-guide.md#iot-alerts-api)

### Para QA y testing
- **[Plan de pruebas](./docs/qa-test-plan.md)** – 30+ casos de prueba
- **[Guía de testing](./docs/testing-guide.md)** – Estrategia unitarios/e2e

### Estado de documentación
- **[Estado completo](./docs/DOCUMENTATION-STATUS.md)** – 18 documentos, cobertura 100%
- **[Resumen de completud](./docs/COMPLETION-SUMMARY.md)** – Qué se hizo, qué sigue

### Documentos principales


```bash
# Ejecutar script automatizado
start.bat
```

### Inicio manual
```bash
cd backend
npm install
```

### 2. Levantar la base de datos
```bash
# Desde la raíz del proyecto
docker-compose up -d
```

### 3. Configurar variables de entorno
```bash
cd backend
cp .env.example .env
# Editar .env si es necesario (valores por defecto funcionan)
```

### 4. Ejecutar el backend
```bash
cd backend
npm run start:dev
```

### 5. Verificar funcionamiento
```bash
# Ejecutar pruebas automatizadas
node test-api.js
```

- API disponible en `http://localhost:3000`
- Base de datos en `localhost:5432`
- Datos de prueba incluidos

## Componentes

- `backend/`: NestJS API modular con soporte para geolocalización, NFTs y créditos.
- `contracts/`: Solidity NFT avanzado para tokenización y collateralización.
- `terraform/`: Plantilla inicial para desplegar infraestructura en AWS.
- `docs/engineering-analysis.md`: Análisis completo de ingeniería y arquitectura actual.
- `docs/roadmap-implementation.md`: Plan de desarrollo en sprints con issues priorizados.
- `docs/architecture-c4-level2.md`: Diagrama C4 nivel 2 con módulos propuestos.
- `docs/terra-link-technical.md`: Documentación técnica principal para VS Code.
- `docs/terra-ecosystem.md`: Documentación de plataforma AG TECH EC y arquitectura integrada.
- `docs/api-cost-model.md`: APIs clave, costos y modelo de planes para TERRA LINK.
- `docs/qa-guide.md`: Guía de Quality Assurance y estrategia de pruebas.
- `docs/qa-test-plan.md`: Casos de prueba detallados con inputs/outputs.
- `docs/testing-guide.md`: Guía práctica de pruebas y validación del proyecto.

## Diagrama de arquitectura

- [Ver diagrama optimizado de TERRA LINK](https://copilot.microsoft.com/th/id/BCO.dfa38011-b11e-4503-b9e4-f1e7bf328978.png)
- [C4 Nivel 2 – Arquitectura propuesta con nuevos módulos](./docs/architecture-c4-level2.md)
- [Análisis de Ingeniería y Arquitectura](./docs/engineering-analysis.md)

## Siguientes pasos

1. Implementar validación geoespacial con PostGIS.
2. Completar endpoints de tokenización y flujo de crédito.
3. Desarrollar auditoría dinámica de NFTs con IoT / satélite.
4. Desplegar la infraestructura cloud usando EKS y Terraform.
