# 🧪 QA Test Plan – TERRA LINK

## 1. Objetivo
Garantizar que el proyecto TERRA LINK se levante correctamente y que sus módulos (Geo, NFT, Créditos) funcionen con calidad, seguridad y rendimiento.

---

## 2. Preparación del Entorno

### Backend
```bash
cd backend
npm install
npm run build
npm run start:dev
```

### Base de Datos
```bash
docker-compose up -d
```
- Contenedor: `postgres + postgis`
- Script inicial: `init.sql`

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 3. Pruebas Unitarias

Ejecutar:
```bash
npm test
```

Validar:
- Registro y login con MFA (`/api/auth/register`, `/api/auth/login`)
- Validación geoespacial (`/api/validation/start`)
- Minting de NFT (`/api/nft/mint`)
- Propuesta de crédito (`/api/credit/proposal`)

---

## 4. Pruebas End-to-End (E2E)

Ejecutar:
```bash
npm run test:e2e
```

Flujo completo:
1. Registro → Crear usuario con MFA.  
2. Validación → Enviar datos satelitales/IoT.  
3. NFT → Generar NFT dinámico con metadatos.  
4. Crédito → Banco usa NFT como garantía.  
5. Marketplace → Comerciante compra lote certificado.  

---

## 5. Pruebas de Seguridad

- Intento de login con MFA inválido → debe rechazar.  
- JWT expirado → acceso denegado.  
- SQL Injection → backend debe bloquear.  
- Auditoría → logs deben registrar eventos en CloudWatch/IPFS.  

---

## 6. Pruebas de Rendimiento

### Herramienta: k6
```bash
k6 run load-test.js
```

Escenarios:
- 1000 transacciones simultáneas en `/api/nft/mint`
- 500 usuarios concurrentes en login MFA
- Tiempo de respuesta promedio < 200ms

---

## 7. Pruebas de Aceptación (UAT)

- Productor puede registrar lote y generar NFT.  
- Banco puede aprobar crédito con NFT como garantía.  
- Comerciante puede comprar lote certificado.  
- Wallet muestra balance y recompensas en tiempo real.  

---

## 8. Scripts de Prueba

### `test-api.js`
Ejecutar:
```bash
node test-api.js
```
Valida endpoints básicos:
- Registro/Login
- Minting NFT
- Propuesta de crédito

---

## 9. Métricas de Calidad
- Cobertura de pruebas ≥ 80%  
- Tiempo de respuesta promedio ≤ 200ms  
- Tasa de error ≤ 1%  
- Seguridad: 0 vulnerabilidades críticas  

---

## ✅ Resultado esperado
- Proyecto levantado sin errores.  
- APIs responden correctamente.  
- NFTs funcionan como garantías financieras.  
- Flujo completo validado: Productor → Banco → Comerciante → Wallet.  


## 9. Automatización

### Scripts Recomendados
- `npm run test:unit` → Pruebas unitarias
- `npm run test:integration` → APIs con Newman
- `npm run test:e2e` → Cypress para frontend
- `npm run test:security` → OWASP ZAP automatizado

### CI/CD
- Ejecutar pruebas en cada PR
- Cobertura mínima 80%
- Bloquear merge si pruebas fallan

---

## ✅ Checklist de Ejecución
- [ ] Ambiente de pruebas configurado
- [ ] Datos de prueba preparados
- [ ] Casos unitarios ejecutados
- [ ] APIs integradas probadas
- [ ] Seguridad validada
- [ ] Rendimiento medido
- [ ] UAT completada
- [ ] Reporte final generado
