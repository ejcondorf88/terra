# 🧩 TERRA LINK – Documentación Técnica

## 1. Descripción General
TERRA LINK es el módulo de **validación agrícola y tokenización** del ecosistema AG TECH EC.  
Su propósito es generar **NFTs agrícolas dinámicos** que funcionen como **garantías financieras** para créditos descentralizados.

---

## 2. Arquitectura del Sistema

### Backend
- **Framework:** NestJS  
- **Base de datos:** PostgreSQL + PostGIS  
- **Servicios:** Validación satelital, IoT, auditoría y compliance  
- **API Gateway:** Autenticación JWT + MFA  
- **Integraciones:** TERRA GO, TERRA X CHANGE, bancos/cooperativas  

### Blockchain Layer
- **Red:** Polygon  
- **Contratos:** Solidity  
- **Tipo de NFT:** Dynamic Agricultural NFT  
- **Metadatos:**  
  - Geolocalización  
  - Certificaciones (EUDR, orgánico, comercio justo)  
  - Historial de producción  
  - Valoración económica  
  - Estado de garantía (activo, liquidado, fraccionado)  

### Cloud Infrastructure
- **Proveedor:** AWS (EKS, S3, CloudFront)  
- **Infraestructura como código:** Terraform  
- **Almacenamiento descentralizado:** IPFS  
- **Monitoreo:** CloudWatch + Prometheus  

---

## 3. Flujo de Datos

1. **Productor** envía datos satelitales e IoT → Backend valida y genera NFT.  
2. **NFT** se almacena en Polygon → vinculado a wallet del productor.  
3. **Banco/Cooperativa** consulta NFT → lo usa como garantía para crédito.  
4. **Comerciante** compra lote certificado → transacción registrada en blockchain.  
5. **AG TECH EC** cobra fees y gestiona trazabilidad.  

---

## 4. Endpoints Principales

| Endpoint | Método | Descripción |
|-----------|---------|-------------|
| `/api/validation/start` | POST | Inicia validación satelital e IoT |
| `/api/nft/mint` | POST | Genera NFT agrícola dinámico |
| `/api/nft/update` | PUT | Actualiza metadatos del NFT |
| `/api/nft/value` | GET | Consulta valoración económica |
| `/api/nft/collateral` | POST | Marca NFT como garantía de crédito |
| `/api/report/compliance` | GET | Genera reporte normativo |

---

## 5. Integraciones

- **TERRA GO:** Marketplace de lotes certificados.  
- **TERRA X CHANGE:** Wallet y pagos en X Coin.  
- **Bancos/Cooperativas:** Créditos AgroDeFi respaldados por NFTs.  
- **IoT Devices:** Actualización automática de metadatos.  

---

## 6. Seguridad

- MFA + biométricos para acceso administrativo.  
- Auditoría inmutable de validaciones.  
- Encriptación AES-256 para datos sensibles.  
- Logs de trazabilidad y control de acceso.  

---

## 7. Roadmap Técnico

| Fase | Objetivo | Entregables |
|------|-----------|-------------|
| Fase 1 | Reestructuración backend + NFT dinámico | NestJS + Solidity + PostGIS |
| Fase 2 | Integración con bancos y wallet | APIs + contratos de crédito |
| Fase 3 | Escalabilidad y gobernanza DAO | Terraform + votaciones en blockchain |

---

## 8. Repositorios

- `backend/` → NestJS + PostGIS + API Gateway  
- `contracts/` → Solidity + Hardhat  
- `docs/` → Arquitectura, API Reference, Compliance  
- `infra/` → Terraform + AWS Config  

---

## 9. Variables de Entorno (.env)

```env
DATABASE_URL=postgres://user:pass@host:5432/terralink
POLYGON_RPC_URL=https://polygon-rpc.com
IPFS_GATEWAY=https://ipfs.io
JWT_SECRET=your_secret_key
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

---

## 10. Ejemplo de Contrato NFT (Solidity)

```solidity
pragma solidity ^0.8.20;

contract TerraLinkNFT {
    struct Metadata {
        string geoLocation;
        string certification;
        string productionHistory;
        uint256 valuation;
        bool collateralActive;
    }

    mapping(uint256 => Metadata) public nftData;

    function mintNFT(uint256 tokenId, Metadata memory data) public {
        nftData[tokenId] = data;
    }

    function updateValuation(uint256 tokenId, uint256 newValue) public {
        nftData[tokenId].valuation = newValue;
    }

    function setCollateral(uint256 tokenId, bool status) public {
        nftData[tokenId].collateralActive = status;
    }
}
```

---

## 11. Documentación Complementaria
- `architecture.md` → Diagrama general del ecosistema.  
- `architecture-c4-level2.md` → Diagrama C4 con módulos propuestos (Satellite, Blockchain Mint, Compliance, Audit/ESG).
- `roadmap-implementation.md` → Plan de desarrollo en sprints con issues priorizados.
- `api-reference.md` → Endpoints y ejemplos de uso.  
- `development-guide.md` → Guía para desarrolladores VS Code.  
- `security.md` → Políticas de seguridad y auditoría.  

---

## ✅ Objetivo Final
TERRA LINK debe ser el **núcleo de validación y tokenización** del ecosistema AG TECH EC, generando NFTs agrícolas que sirvan como **garantías financieras confiables** para bancos y cooperativas, integrados con TERRA GO y TERRA X CHANGE.
