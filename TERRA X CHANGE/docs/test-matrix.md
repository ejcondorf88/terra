# Matriz de Casos de Prueba – TERRA X CHANGE

## 1. AUTENTICACIÓN (Auth Module)

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| AUTH-01 | Registro exitoso | email: "user@test.com", password: "Pass123!" | User ID + JWT Token | Status 201, token válido | Unit |
| AUTH-02 | Registro con email duplicado | email: "existing@test.com" | Error 409 | Mensaje "Email ya existe" | Unit |
| AUTH-03 | Registro con password débil | email: "test@test.com", password: "123" | Error 400 | Validar longitud mínima | Unit |
| AUTH-04 | Login correcto | email: "user@test.com", password: "Pass123!" | JWT Token | Token válido y decodeable | Unit |
| AUTH-05 | Login con credenciales incorrectas | email: "user@test.com", password: "wrong" | Error 401 | "Credenciales inválidas" | Unit |
| AUTH-06 | Setup MFA | userId: "uuid-001" | QR Code + Secret base32 | Secret almacenado en DB | Unit |
| AUTH-07 | Verificar MFA válido | userId, token TOTP correcto | { verified: true } | Status 200 | Unit |
| AUTH-08 | Verificar MFA inválido | userId, token TOTP incorrecto | Error 401 | "Token TOTP inválido" | Unit |
| AUTH-09 | Login sin MFA cuando está habilitado | usuario con MFA | Error 403 | Requerir MFA | Integration |
| AUTH-10 | JWT expire timeout | Token antiguo (>24h) | Error 401 | "Token expirado" | Unit |

---

## 2. WALLET (Wallet Module)

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| WALLET-01 | Crear wallet exitosamente | userId: "uuid-001" | { id, blockchainAddress, xCoinBalance: 0 } | Dirección válida Ethereum | Unit |
| WALLET-02 | Crear múltiples wallets | userId + 3 intentos | Solo 1 wallet activo | Error si intenta crear 2da | Unit |
| WALLET-03 | Obtener balance X Coin | walletId | { xCoinBalance: "100.5" } | Balance sincronizado blockchain | Unit |
| WALLET-04 | Obtener balance stablecoins | walletId | { stablecoinBalance: "50.25" } | Balance actualizado | Unit |
| WALLET-05 | Transferir X Coin válido | toAddress, amount: "10.5" | { txHash, status: "pending" } | TX guardada en DB | Unit |
| WALLET-06 | Transferir sin saldo suficiente | toAddress, amount: "1000" | Error 400 | "Saldo insuficiente" | Unit |
| WALLET-07 | Transferir a dirección inválida | toAddress: "invalid" | Error 400 | "Dirección Ethereum inválida" | Unit |
| WALLET-08 | Transferir monto negativo | toAddress, amount: "-5" | Error 400 | "Monto debe ser positivo" | Unit |
| WALLET-09 | Sincronizar balance blockchain | walletId | Balance actualizado real | Llamada a RPC exitosa | Integration |
| WALLET-10 | Rastrear transacción | txHash | { status: "confirmed/failed/pending" } | Status actual en Polygon | Integration |
| WALLET-11 | Importar wallet existente | blockchainAddress | Wallet vinculado a user | Puede ver balance | Integration |
| WALLET-12 | Transferencia bajo carga (100 TX/s) | Múltiples transferencias | Todas quedan en DB | <500ms latencia promedio | Performance |

---

## 3. STAKING (Staking Module)

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| STAKING-01 | Crear stake exitoso | walletId, amount: "100" | { id, status: "active", rewards: "0" } | Stake guardado en DB | Unit |
| STAKING-02 | Crear stake sin saldo | walletId, amount: "9999" | Error 400 | "Saldo insuficiente" | Unit |
| STAKING-03 | Crear stake monto mínimo | walletId, amount: "1" | Éxito | Validar mínimo | Unit |
| STAKING-04 | Obtener stakes activos | walletId | [{ id, amount, status: "active" }] | Solo activos devueltos | Unit |
| STAKING-05 | Calcular rewards (1 año) | stakeId, period: "1 year" | { rewards: "10.0" } | 10% anual exacto | Unit |
| STAKING-06 | Calcular rewards (6 meses) | stakeId, period: "6 months" | { rewards: "5.0" } | 50% del reward anual | Unit |
| STAKING-07 | Unstake exitoso | stakeId | { status: "withdrawn" } | Fondos liberados | Unit |
| STAKING-08 | Unstake no existe | stakeId: "invalid" | Error 404 | "Stake no encontrado" | Unit |
| STAKING-09 | Múltiples stakes simultáneos | walletId, 5 stakes | Todos activos | Sin conflictos | Unit |
| STAKING-10 | Retiro de rewards automático | stakeId | Rewards trasferidos a wallet | Balance incrementado | Integration |
| STAKING-11 | Staking bajo carga (50 operaciones) | Múltiples stakes | Todos ejecutados | <1s por operación | Performance |

---

## 4. INTEGRACIÓN TERRA LINK (Validaciones Agrícolas)

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| LINK-01 | Pago de validación | userId, amount: "50", validationId | { txHash, status: "pending" } | Débito de X Coin | Integration |
| LINK-02 | Validación rechazada | validationId | Error 400 | "Validación no disponible" | Integration |
| LINK-03 | Webhook TERRA LINK recibido | { validationId, status: "approved" } | Certificado NFT emitido | NFT en wallet | Integration |
| LINK-04 | Sincronización certificados | userId | [{{ certificateId, cropType }}] | Certificados visibles | Integration |

---

## 5. INTEGRACIÓN TERRA GO (Marketplace)

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| GO-01 | Listar lote en venta | walletId, nftId, price: "1000" | { listingId, status: "active" } | Visible en marketplace | Integration |
| GO-02 | Comprar lote | buyerId, listingId, amount: "1000" | { txHash, ownership: buyerId } | NFT transferido | Integration |
| GO-03 | Actualizar precio | sellerId, listingId, newPrice: "950" | { price: "950", status: "active" } | Precio actualizado | Integration |
| GO-04 | Cancelar venta | sellerId, listingId | { status: "cancelled" } | Lote removido del marketplace | Integration |

---

## 6. CONVERSIÓN FIAT ↔ X COIN

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| FIAT-01 | Convertir USD → X Coin | amount: 100 USD, rate: "1 USD = 0.8 XCoin" | { xCoinAmount: "80" } | Cálculo correcto | Unit |
| FIAT-02 | Convertir X Coin → USD | amount: 50 XCoin, rate: "1 XCoin = 1.25 USD" | { usdAmount: "62.50" } | Cálculo correcto | Unit |
| FIAT-03 | Conversión con fees | amount: 100 USD, fee: "2%" | { netAmount: "98", fee: "2" } | Fee deducido | Unit |
| FIAT-04 | Conversión monto bajo | amount: 5 USD | Error 400 | "Mínimo 10 USD" | Unit |
| FIAT-05 | Integración Stripe | amount: 100 USD | { paymentIntentId, status: "pending" } | Stripe invocado | Integration |

---

## 7. SEGURIDAD

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| SEC-01 | SQL Injection en email | email: "' OR '1'='1" | Escapado/Sanitizado | Sin inyección | Security |
| SEC-02 | XSS en balance display | XSS payload | HTML escaped | No ejecuta script | Security |
| SEC-03 | CSRF token validation | Sin CSRF token | Error 403 | Request rechazado | Security |
| SEC-04 | Rate limiting (100 req/min) | 150 requests en 1 min | 50 de 100+ rechazadas | Status 429 | Security |
| SEC-05 | Validación de permisos | User A accede wallet de User B | Error 403 | "Acceso denegado" | Security |
| SEC-06 | TLS 1.3 enforcement | HTTP request | Redirect a HTTPS | Producción solo HTTPS | Security |
| SEC-07 | JWT signature validation | JWT alterado | Error 401 | Token rechazado | Security |
| SEC-08 | Encriptación en reposo | Acceso directo a DB | Datos encriptados | Sin plaintext | Security |

---

## 8. PERFORMANCE

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| PERF-01 | Obtener balance <200ms | walletId (cached) | { xCoinBalance } | P95 <200ms | Performance |
| PERF-02 | Listar stakes <300ms | walletId (100 stakes) | [{ stakes }] | P95 <300ms | Performance |
| PERF-03 | Transferencia <500ms | Crear TX | { txHash } | P95 <500ms | Performance |
| PERF-04 | Login <400ms | email + password | { token } | P95 <400ms | Performance |
| PERF-05 | Throughput 1000 req/min | Alta concurrencia | Todas quedan en queue | Sin errores de timeout | Performance |
| PERF-06 | Redis hit rate >90% | Múltiples accesos al mismo dato | Cache hit | >90% hits | Performance |
| PERF-07 | DB CPU <80% bajo carga | 500 usuarios simultáneos | Respuestas normales | Sin degradación | Performance |

---

## 9. INTEGRACIONES

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| INT-01 | Sincronización web + mobile | Cambio en web | Refleja en mobile | <2s delay | Integration |
| INT-02 | Notificación push (transacción) | TX exitosa | Push recibido | Dentro de 5s | Integration |
| INT-03 | QR Payment generado | walletId, amount | QR válido | Scaneable | Integration |
| INT-04 | Webhook logs auditoría | Cualquier acción sensible | Registrado en logs | Timestamp + User + Acción | Integration |

---

## 10. SMOKE TESTS (Previo a Producción)

| ID | Caso de Prueba | Input | Expected Output | Criterio Aceptación | Tipo |
|---|---|---|---|---|---|
| SMOKE-01 | Health check API | GET /health | { status: "ok" } | Respuesta 200 | Smoke |
| SMOKE-02 | Base de datos conectada | Query simple | Resultado correcto | Conexión activa | Smoke |
| SMOKE-03 | Redis conectado | PING | PONG | Cache disponible | Smoke |
| SMOKE-04 | Blockchain RPC accesible | ETH balance call | Respuesta válida | Polygon conectado | Smoke |
| SMOKE-05 | Autenticación funcional | Login | Token válido | Sistema auth activo | Smoke |

---

## Métrica de Éxito Global

| Métrica | Objetivo | Aceptación |
|---|---|---|
| Cobertura de código | >80% | Líneas críticas al 100% |
| Latencia P95 (transacciones) | <500ms | <1000ms máximo |
| Disponibilidad (uptime) | >99.5% | Max 3.6h downtime/mes |
| Seguridad (vulnerabilidades críticas) | 0 | 0% tolerancia |
| Pruebas fallidas | 0 | 100% deben pasar |
| Performance degradation | <5% vs baseline | <10% bajo carga |