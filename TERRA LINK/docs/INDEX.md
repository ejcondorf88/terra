# Índice de Documentación – TERRA LINK

**Bienvenido a TERRA LINK.** Esta es tu guía para encontrar la documentación correcta según tu rol y necesidad.

---

## 🎯 Por rol / necesidad

### Si eres **Product Manager o Stakeholder**
Lee en este orden:
1. [engineering-analysis.md](./engineering-analysis.md) – Estado actual, brechas, oportunidades
2. [api-cost-model.md](./api-cost-model.md) – Modelos de negocio, planes, pricing
3. [roadmap-implementation.md](./roadmap-implementation.md) – Timeline y sprints

### Si eres **Arquitecto o Tech Lead**
Lee en este orden:
1. [architecture.md](./architecture.md) – Visión general del ecosistema
2. [architecture-c4-level2.md](./architecture-c4-level2.md) – Diagrama C4 con módulos propuestos
3. [engineering-analysis.md](./engineering-analysis.md) – Análisis detallado de fortalezas y brechas
4. [terra-link-technical.md](./terra-link-technical.md) – Documentación técnica detallada
5. [roadmap-implementation.md](./roadmap-implementation.md) – Plan de desarrollo y sprints

### Si eres **Backend Developer**
Lee en este orden:
1. [terra-link-technical.md](./terra-link-technical.md) – Endpoints, módulos, entities
2. [architecture-c4-level2.md](./architecture-c4-level2.md) – Cómo se integran los módulos
3. [development-guide.md](./development-guide.md) – Instalación y setup local
4. [roadmap-implementation.md](./roadmap-implementation.md) – Qué construir y en qué orden
5. [RBAC_GUARD_GUIDE.md](./RBAC_GUARD_GUIDE.md) – Seguridad y control de acceso
6. [MULTI_TENANT_AUTH_GUIDE.md](./MULTI_TENANT_AUTH_GUIDE.md) – Multi-tenancy

### Si eres **QA / Test Engineer**
Lee en este orden:
1. [qa-test-plan.md](./qa-test-plan.md) – Casos de prueba detallados
2. [testing-guide.md](./testing-guide.md) – Guía práctica de pruebas
3. [qa-guide.md](./qa-guide.md) – Estrategia de QA
4. [terra-link-technical.md](./terra-link-technical.md) – Endpoints a probar

### Si eres **DevOps / Infrastructure**
Lee en este orden:
1. [architecture-c4-level2.md](./architecture-c4-level2.md) – Visión general del stack
2. [terra-link-technical.md](./terra-link-technical.md) – Variables de entorno necesarias
3. [engineering-analysis.md](./engineering-analysis.md) – Planes de despliegue en Fase 3

### Si eres **Security / Compliance**
Lee en este orden:
1. [security.md](./security.md) – Políticas de seguridad
2. [RBAC_GUARD_GUIDE.md](./RBAC_GUARD_GUIDE.md) – Control de acceso basado en roles
3. [engineering-analysis.md](./engineering-analysis.md) – Brechas de seguridad identificadas
4. [architecture-c4-level2.md](./architecture-c4-level2.md) – Módulo de Audit & ESG

---

## 📚 Por tema

### Análisis y Planificación
| Documento | Propósito |
|-----------|-----------|
| [engineering-analysis.md](./engineering-analysis.md) | Análisis completo: estado actual, brechas, oportunidades, timeline |
| [roadmap-implementation.md](./roadmap-implementation.md) | Plan de desarrollo por sprints con issues priorizados |
| [ROADMAP.md](./ROADMAP.md) | Roadmap general de las 3 plataformas TERRA |

### Arquitectura y Diseño
| Documento | Propósito |
|-----------|-----------|
| [architecture.md](./architecture.md) | Arquitectura general del ecosistema TERRA LINK |
| [architecture-c4-level2.md](./architecture-c4-level2.md) | Diagrama C4 nivel 2 con nuevos módulos propuestos |
| [terra-ecosystem.md](./terra-ecosystem.md) | Descripción del ecosistema TERRA completo (LINK, GO, X CHANGE) |

### Documentación Técnica
| Documento | Propósito |
|-----------|-----------|
| [terra-link-technical.md](./terra-link-technical.md) | Documentación técnica principal: endpoints, módulos, setup |
| [api-reference.md](./api-reference.md) | Referencia de API REST: endpoints, ejemplos, response codes |
| [development-guide.md](./development-guide.md) | Guía de desarrollo: instalación, tareas VS Code, comandos |

### Seguridad y Compliance
| Documento | Propósito |
|-----------|-----------|
| [security.md](./security.md) | Políticas de seguridad, encriptación, auditoría |
| [RBAC_GUARD_GUIDE.md](./RBAC_GUARD_GUIDE.md) | Role-Based Access Control y guards NestJS |
| [MULTI_TENANT_AUTH_GUIDE.md](./MULTI_TENANT_AUTH_GUIDE.md) | Multi-tenancy y aislamiento de datos |

### Modelo de Negocio y Costos
| Documento | Propósito |
|-----------|-----------|
| [api-cost-model.md](./api-cost-model.md) | APIs clave, costos operativos, planes y pricing |

### Testing y QA
| Documento | Propósito |
|-----------|-----------|
| [testing-guide.md](./testing-guide.md) | Guía práctica de pruebas (unitarias, integración, e2e) |
| [qa-guide.md](./qa-guide.md) | Estrategia de QA y plan de aseguramiento de calidad |
| [qa-test-plan.md](./qa-test-plan.md) | Casos de prueba detallados con inputs/outputs esperados |

### Implementación Específica
| Documento | Propósito |
|-----------|-----------|
| [terra-link-vscode-improvements.md](./terra-link-vscode-improvements.md) | Mejoras técnicas propuestas con detalles de implementación |

---

## 🚀 Quick Start para diferentes flujos

### Quiero entender el estado actual
1. Leer [engineering-analysis.md](./engineering-analysis.md) (15 min)
2. Ver diagrama en [architecture-c4-level2.md](./architecture-c4-level2.md) (5 min)

### Quiero empezar a desarrollar
1. [development-guide.md](./development-guide.md) – setup local (30 min)
2. [terra-link-technical.md](./terra-link-technical.md) – endpoints y módulos (20 min)
3. [roadmap-implementation.md](./roadmap-implementation.md) – qué construir primero (10 min)

### Quiero escribir tests
1. [testing-guide.md](./testing-guide.md) – tipos de pruebas (20 min)
2. [qa-test-plan.md](./qa-test-plan.md) – casos específicos (30 min)

### Quiero presentar a stakeholders
1. [engineering-analysis.md](./engineering-analysis.md) – estado y oportunidades (20 min)
2. [architecture-c4-level2.md](./architecture-c4-level2.md) – diagrama visual (10 min)
3. [roadmap-implementation.md](./roadmap-implementation.md) – timeline y esfuerzo (15 min)

### Quiero asegurar seguridad
1. [security.md](./security.md) – políticas (15 min)
2. [RBAC_GUARD_GUIDE.md](./RBAC_GUARD_GUIDE.md) – implementación (20 min)
3. [engineering-analysis.md](./engineering-analysis.md) – sección 3 (brechas de seguridad) (10 min)

---

## 📋 Matriz de documentación

```
NIVEL 1: Strategic & Business
├── engineering-analysis.md (5 – 10 min)
├── roadmap-implementation.md (5 – 10 min)
└── api-cost-model.md (5 min)

NIVEL 2: Architectural
├── architecture.md (10 – 15 min)
├── architecture-c4-level2.md (10 min + diagram)
└── terra-ecosystem.md (10 min)

NIVEL 3: Technical Deep Dive
├── terra-link-technical.md (20 – 30 min)
├── api-reference.md (15 – 20 min)
├── development-guide.md (10 – 15 min)
└── terra-link-vscode-improvements.md (15 – 20 min)

NIVEL 4: Implementation Details
├── RBAC_GUARD_GUIDE.md (10 – 15 min)
├── MULTI_TENANT_AUTH_GUIDE.md (10 – 15 min)
└── security.md (10 – 15 min)

NIVEL 5: Quality & Testing
├── testing-guide.md (20 – 30 min)
├── qa-guide.md (15 – 20 min)
└── qa-test-plan.md (20 – 30 min)
```

---

## 🔍 Búsqueda rápida por tema

### Blockchain / NFT
- [architecture-c4-level2.md](./architecture-c4-level2.md) – arquitectura de módulo Blockchain Mint
- [terra-link-technical.md](./terra-link-technical.md) – contrato NFT y endpoints
- [roadmap-implementation.md](./roadmap-implementation.md) – TLINK-1 (implementar minting)

### Crédito y Colateralización
- [architecture.md](./architecture.md) – flujo de valor
- [architecture-c4-level2.md](./architecture-c4-level2.md) – flujo de crédito
- [terra-link-technical.md](./terra-link-technical.md) – endpoints de crédito

### Cumplimiento EUDR / TRACES
- [engineering-analysis.md](./engineering-analysis.md) – sección 4.C
- [architecture-c4-level2.md](./architecture-c4-level2.md) – módulo Compliance
- [roadmap-implementation.md](./roadmap-implementation.md) – TLINK-7 (módulo TRACES)

### ESG y Auditoría
- [engineering-analysis.md](./engineering-analysis.md) – sección 4.D
- [architecture-c4-level2.md](./architecture-c4-level2.md) – módulo Audit & ESG
- [roadmap-implementation.md](./roadmap-implementation.md) – TLINK-8 (auditoría)

### Seguridad
- [security.md](./security.md) – políticas completas
- [RBAC_GUARD_GUIDE.md](./RBAC_GUARD_GUIDE.md) – implementación de guards
- [engineering-analysis.md](./engineering-analysis.md) – brechas de seguridad (sección 3)

### Multi-tenancy
- [MULTI_TENANT_AUTH_GUIDE.md](./MULTI_TENANT_AUTH_GUIDE.md) – implementación
- [terra-link-technical.md](./terra-link-technical.md) – endpoints por tenant
- [architecture.md](./architecture.md) – integración de negocio

### Billing y Planes
- [api-cost-model.md](./api-cost-model.md) – precios y planes
- [terra-link-technical.md](./terra-link-technical.md) – endpoints de billing
- [terra-ecosystem.md](./terra-ecosystem.md) – modelos comerciales

---

## 📞 Contacto y soporte

- **Preguntas sobre arquitectura?** → Referencia [architecture-c4-level2.md](./architecture-c4-level2.md)
- **Preguntas sobre desarrollo?** → Referencia [terra-link-technical.md](./terra-link-technical.md)
- **Preguntas sobre roadmap?** → Referencia [roadmap-implementation.md](./roadmap-implementation.md)
- **Preguntas sobre negocio/pricing?** → Referencia [api-cost-model.md](./api-cost-model.md)
- **Preguntas sobre seguridad?** → Referencia [security.md](./security.md)

---

## 📈 Cómo mantener esta documentación actualizada

1. Cuando hagas cambios arquitectónicos → actualiza [architecture-c4-level2.md](./architecture-c4-level2.md)
2. Cuando añadas un nuevo módulo → actualiza [terra-link-technical.md](./terra-link-technical.md)
3. Cuando cierres un issue → actualiza [roadmap-implementation.md](./roadmap-implementation.md)
4. Cuando hagas cambios de seguridad → actualiza [security.md](./security.md)
5. Cuando definas nuevos tests → actualiza [qa-test-plan.md](./qa-test-plan.md)

---

**Última actualización:** 2026-06-23  
**Versión:** 1.0
