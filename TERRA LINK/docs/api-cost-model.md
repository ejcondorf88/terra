# API y Modelo de Costos – TERRA LINK

Este documento describe las APIs clave que TERRA LINK consume para validar lotes agrícolas, emitir NFTs de certificación, registrar EUDR y generar reportes ESG. También resume el modelo de costos por usuario y por servicio, alineado con la oferta de producto.

## 1. APIs clave

### Copernicus / Sentinel Hub (Validación Satelital)
- Función: acceso a imágenes satelitales Sentinel-1, Sentinel-2 y Sentinel-3.
- Uso: validación de lotes agrícolas, cálculo de superficie y evidencia geoespacial para certificaciones.
- Costos:
  - Acceso básico a Copernicus: gratuito.
  - Planes comerciales de Sentinel Hub: aproximadamente **€300–€1,200/año por usuario** según volumen de consultas.
- Modelo de cobro:
  - por usuario o por volumen de peticiones (tiles, requests).
  - recomendado usar acceso gratuito para validaciones iniciales y escalar a plan comercial cuando el volumen de tiles y analítica crezca.

### Polygon + IPFS (NFTs de Certificación)
- Función: emisión de NFTs dinámicos con metadatos extendidos y almacenamiento de metadatos/descriptores en IPFS.
- Uso: certificación inmutable de lotes agrícolas, referencias de auditoría y respaldo de historial productivo.
- Costos:
  - Gas fees de Polygon muy bajos: ≈ **$0.01–$0.05 por transacción**.
  - Coste anual estimado: **$1–$2 por NFT emitido** dependiendo del volumen.
- Modelo de cobro:
  - por transacción, no por usuario.
  - la mayor parte del costo es operativo sobre la infraestructura de blockchain e IPFS.

### TRACES (UE – Registro EUDR)
- Función: plataforma oficial de registro de diligencia debida para exportaciones a la UE.
- Uso: validación legal de cadenas de suministro, cumplimiento EUDR y trazabilidad regulatoria.
- Costos:
  - acceso a TRACES: gratuito.
  - requiere un socio europeo con EORI válido.
  - costo indirecto aproximado: **€2,000–€4,000/año por empresa** a través de certificadoras o partners europeos.
- Modelo de cobro:
  - indirecto, ligado a costos de intermediación y servicios de cumplimiento.

### Reportes ESG / Auditoría
- Función: generación de reportes ambientales, sociales y de gobernanza para cooperativas y exportadores.
- Uso: soporte de cumplimiento normativo, acceso a mercados premium y confianza internacional.
- Costos:
  - depende de la certificadora elegida (SGS, Bureau Veritas, Koltiva, etc.).
  - tarifa aproximada: **$3,000–$5,000 por auditoría anual por cooperativa/exportador**.
- Modelo de cobro:
  - por auditoría anual.
  - puede ser incluido como servicio premium o como parte de planes empresariales.

## 2. Modelo de costos por plan

| Plan | Servicios incluidos | Costo anual por usuario |
|------|---------------------|-------------------------|
| Básico | Validación satelital + NFT + score básico | $300 USD |
| Pro | Score avanzado + panel de trazabilidad + soporte técnico | $1,440 USD |
| Enterprise | TRACES + dashboard ESG + API bancos + auditoría | $9,000 USD |
| Institucional | Score global + API crediticia + reportes ESG + soporte dedicado | $30,000 USD |

> Nota: estos valores reflejan la propuesta de precio por valor agregado de TERRA LINK. Los costos operativos de API son relativamente bajos, pero la oferta comercial aumenta con servicios de cumplimiento, crédito y certificación.

## 3. Alineación con el modelo de negocio

- **Base operativa gratuita/bajo costo:** Copernicus y Polygon permiten validar lotes y emitir NFTs con gastos operativos restringidos.
- **Valor diferencial:** TRACES y auditorías ESG generan credibilidad regulatoria y abren mercados europeos, lo que soporta precios premium.
- **Escalar con servicios:** el modelo Premium/Enterprise se apoya en servicios adicionales (dashboard ESG, API de bancos, socios EORI).
- **Monetización:** la mayor parte del ingreso proviene de planes y servicios certificados, no del consumo básico de APIs.

## 4. Recomendaciones para TERRA LINK

- Usar Copernicus/Sentinel para pruebas iniciales y validar la trazabilidad geoespacial gratis.
- Mantener Polygon/IPFS como la capa de tokenización y almacenamiento de datos de certificación.
- Establecer alianzas con socios europeos EORI para habilitar el acceso TRACES y asumir los costos indirectos.
- Ofrecer auditoría ESG como servicio premium, complementando los reportes regulatorios y la certificación de mercado.
- Construir el roadmap de producto alrededor de planes escalables: básico, pro, enterprise e institucional.
