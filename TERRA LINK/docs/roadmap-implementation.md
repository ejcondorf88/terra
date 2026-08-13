# Plan de Desarrollo – TERRA LINK

Este plan convierte el análisis actual en un conjunto de sprints con tareas concretas y una lista priorizada de issues. Está diseñado para iniciar el desarrollo de las mejoras esenciales del ecosistema TERRA LINK.

## Objetivo
Construir la primera versión productiva de TERRA LINK con:
- validación satelital y geoespacial
- tokenización real en Polygon + IPFS
- cumplimiento EUDR y reportes ESG
- colateralización de NFTs para créditos
- facturación de planes
- seguridad y auditoría robusta

---

## Roadmap de Sprints

### Sprint 1 – Fundamentos y estabilización (2 semanas)
Objetivo: establecer la infraestructura técnica y el modelo de datos necesarios para el desarrollo posterior.

#### Tareas
1. Refactorizar el modelo de datos
   - Extender `Plot` con campos de `certification_type`, `eudr_status`, `audit_status`, `esg_score`.
   - Extender `NftMetadata` con `ipfs_uri`, `blockchain_token_id`, `eudr_registration_id`, `esg_report_id`, `source_satellite`.
   - Agregar entidad `EsgReport` y `EudrRegistry`.
2. Implementar servicio de blockchain real
   - Crear `BlockchainMintService`/`BlockchainModule` para minting de NFTs en Polygon.
   - Configurar `AGRICULTURAL_NFT_ADDRESS`, `POLYGON_RPC_URL`, `BLOCKCHAIN_PRIVATE_KEY`.
   - Habilitar subida de metadata a IPFS.
3. Crear flujo inicial de validación geoespacial
   - Extender `GeoService` para aceptar datos satelitales y geodatos.
   - Agregar servicio stub `SatelliteService` para integraciones Copernicus/Sentinel.
4. Mejorar facturación y planes
   - Ajustar `BillingService` para soportar precios y planes `básico`, `pro`, `enterprise`, `institucional`.
   - Crear endpoint para consultar planes disponibles.
5. Documentación de sprint
   - Añadir documentación de la arquitectura del nuevo flujo NFT/Polygon/IPFS.

#### Entregables
- Base de datos extendida
- Servicio de minting en blockchain
- Endpoints `geo/validate`, `nfts`, `billing/plans`
- Documento `docs/roadmap-implementation.md`

---

### Sprint 2 – Integraciones y compliance (3 semanas)
Objetivo: implementar las integraciones externas clave y los flujos regulatorios principales.

#### Tareas
1. Integrar Copernicus / Sentinel Hub
   - Crear `SatelliteService` real o stub con la arquitectura para futuros endpoints.
   - Generar validación de superficie y score de cobertura usando capas satelitales.
   - Guardar resultados en entidad `Plot` y metadatos del NFT.
2. Implementar tokenización y IPFS
   - Completar `NftService` para minting on-chain y registro de `ipfs_uri`.
   - Validar que el backend persiste `blockchain_token_id` y `token_uri`.
3. Diseñar módulo TRACES / EUDR
   - Crear entidad `EudrRegistry` para registrar y almacenar `eori_partner`, `registration_status`, `documents_uri`.
   - Agregar endpoints para iniciar/consultar registro EUDR.
4. Auditoría ESG
   - Crear `EsgReport` y endpoint `esg/reports`.
   - Agregar status de auditoría en `Plot` y `NftMetadata`.
5. Flujo comercial
   - Asociar planes `enterprise` e `institucional` con acceso a TRACES y ESG.
   - Ajustar `BillingService` y `tenant` para habilitar servicios premium.

#### Entregables
- `SatelliteService` y `geo` enriquecido
- Minting de NFT + IPFS metadata funcional
- Módulo TRACES/EUDR básico
- Módulo ESG básico
- Tarifas y planes ligados a servicios premium

---

### Sprint 3 – Crédtios, seguridad y QA (3 semanas)
Objetivo: finalizar el flujo de crédito, endurecer seguridad y preparar el producto para pruebas.

#### Tareas
1. Completar flujo de crédito
   - Integrar `CreditService` con `BlockchainService` para colateralización on-chain.
   - Añadir `CreditSmartContractService` para release/unlock y métricas.
   - Agregar endpoint para simulación de límite de crédito y propuesta financiable.
2. Seguridad y RBAC
   - Implementar guards RBAC en endpoints críticos (`nfts`, `credit`, `billing`, `geo`).
   - Añadir MFA real en `AuthService` o placeholder detallado.
   - Añadir auditoría de eventos en DB y/o IPFS.
3. QA y pruebas
   - Crear pruebas e2e para flujos completos: creación de lote, validación satelital, minting NFT, propuesta de crédito, aprobación de crédito.
   - Generar pruebas unitarias para `BlockchainService`, `CreditService`, `NftService`, `GeoService`.
   - Definir tests de integración con Stripe y con contratos smart contract.
4. Documentación y monitoreo
   - Documentar los nuevos endpoints y el flow de compliance.
   - Preparar métricas clave para monitoreo (transacciones NFT, solicitudes de crédito, tiempo de respuesta).

#### Entregables
- Flujo de crédito seguro y colateralización real
- Guards RBAC y seguridad mejorada
- Pruebas e2e definidas
- Documentación de compliance y QA

---

## Issues priorizados

### Nivel 1 – Críticos
1. `issue/TLINK-1` - Implementar minting de NFT en Polygon + IPFS metadata
   - Descripción: reemplazar el tokenId simulado de `NftService` por minting real on-chain y persistir `ipfs_uri`.
   - Resultado esperado: NFT realmente creado en Polygon, metadata accesible desde IPFS.
2. `issue/TLINK-2` - Extender modelo de datos para EUDR y ESG
   - Descripción: agregar entidades `EudrRegistry`, `EsgReport` y campos de seguimiento en `Plot`/`NftMetadata`.
   - Resultado esperado: datos regulatorios y de auditoría disponibles en la base de datos.
3. `issue/TLINK-3` - Conectar `CreditService` con `BlockchainService` para colateralización on-chain
   - Descripción: aprobar crédito debe ejecutar lock/collateral on-chain y reflejar el estado en DB.
   - Resultado esperado: estado consistente entre DB y blockchain.
4. `issue/TLINK-4` - Configurar Stripe con planes y endpoint de consulta de planes
   - Descripción: habilitar precios `básico`, `pro`, `enterprise`, `institucional` en `billing`.
   - Resultado esperado: planes definidos y consultables por la UI.

### Nivel 2 – Altamente importantes
5. `issue/TLINK-5` - Implementar servicio satelital Copernicus/Sentinel stub
   - Descripción: crear arquitectura de `SatelliteService` y adaptador para futuras APIs.
   - Resultado esperado: flujo de validación satelital definido.
6. `issue/TLINK-6` - Añadir guards RBAC y mejorar auth
   - Descripción: aplicar roles en endpoints clave y expandir auth con MFA/seguridad.
   - Resultado esperado: acceso restringido y roles soportados.
7. `issue/TLINK-7` - Crear módulo TRACES/EUDR básico
   - Descripción: endpoints y modelo de datos para registro EUDR.
   - Resultado esperado: flujo de compliance EUDR disponible.
8. `issue/TLINK-8` - Añadir auditoría de eventos y logs inmutables
   - Descripción: registrar acciones críticas y permitir trazabilidad para auditorías.
   - Resultado esperado: eventos auditables almacenados y accesibles.

### Nivel 3 – Mejoras y refinamientos
9. `issue/TLINK-9` - Documentar roadmap técnico y endpoints nuevos
   - Descripción: actualizar docs para el nuevo flujo de desarrollo.
   - Resultado esperado: documentación alineada con el código.
10. `issue/TLINK-10` - Pruebas e2e para flujo completo de validación y crédito
   - Descripción: crear casos de prueba que cubran desde registro hasta colateralización.
   - Resultado esperado: tests automatizados de flujo integrado.
11. `issue/TLINK-11` - Preparar despliegue Docker/Terraform mínimo
   - Descripción: definir infraestructura base para backend y base de datos.
   - Resultado esperado: contenedores ejecutables y despliegue reproducible.

---

## Plan de entregas rápidas

1. Semana 1-2: `issue/TLINK-1`, `issue/TLINK-2`, `issue/TLINK-4`
2. Semana 3-5: `issue/TLINK-3`, `issue/TLINK-5`, `issue/TLINK-7`
3. Semana 6-8: `issue/TLINK-6`, `issue/TLINK-8`, `issue/TLINK-10`
4. Semana 9-10: `issue/TLINK-9`, `issue/TLINK-11`, estabilización y documentación final.

---

## Recomendación de modo de trabajo

- Trabajar en sprints de 2 semanas.
- Cada sprint debe cerrar con:
  - al menos una integración blockchain funcional
  - un flujo de cumplimiento o facturación operativo
  - pruebas automáticas básicas
- Priorizar primero la consistencia DB/blockchain y luego la experiencia de servicio.

---

## Cómo usar este plan

- Comenzar por crear issues reales en el repositorio con las etiquetas `backend`, `blockchain`, `compliance`, `billing`, `security`.
- Estimar cada tarea con puntos pequeños (2-5 puntos) para mantener el ritmo.
- Revisar el progreso al final de cada sprint y ajustar el siguiente backlog según el avance.
