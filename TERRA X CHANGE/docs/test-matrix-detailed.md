# Matriz de Casos de Prueba Detallada – TERRA X CHANGE

## Introducción
Este documento define los casos de prueba detallados por módulo, incluyendo los inputs, outputs esperados y métricas clave. Está diseñado para ser ejecutado en cada sprint y en CI/CD.

---

## 1. AUTHENTICACIÓN (Auth Module)

### AUTH-01 | Registro exitoso
- Input:
  - email: `user@test.com`
  - password: `Pass123!`
- Output esperado:
  - Status: `201`
  - Body: `{ user: { id, email, role }, token }`
- Métrica:
  - Tiempo de respuesta < 300ms
  - Token valido JWT con expiración de 24h
- Tipo: Unit / Integration

### AUTH-02 | Registro con email duplicado
- Input:
  - email: `existing@test.com`
  - password: `Pass123!`
- Output esperado:
  - Status: `409`
  - Body: `{ message: 'Email ya existe' }`
- Métrica:
  - Error claro y consistente
- Tipo: Unit

### AUTH-03 | Registro con contraseña débil
- Input:
  - email: `test@test.com`
  - password: `123`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Contraseña demasiado débil' }`
- Métrica:
  - Validación de longitud mínima y complejidad
- Tipo: Unit

### AUTH-04 | Login correcto
- Input:
  - email: `user@test.com`
  - password: `Pass123!`
- Output esperado:
  - Status: `200`
  - Body: `{ token }`
- Métrica:
  - Token JWT válido con `userId` y `email`
  - Tiempo < 250ms
- Tipo: Unit

### AUTH-05 | Login con credenciales incorrectas
- Input:
  - email: `user@test.com`
  - password: `wrong`
- Output esperado:
  - Status: `401`
  - Body: `{ message: 'Credenciales inválidas' }`
- Métrica:
  - No exponer información sensible
- Tipo: Unit

### AUTH-06 | Configurar MFA
- Input:
  - userId: `uuid-001`
- Output esperado:
  - Status: `200`
  - Body: `{ secret, qrCode }`
- Métrica:
  - Secret guardado en DB
  - `qrCode` con formato `otpauth://`
- Tipo: Unit

### AUTH-07 | Verificar MFA válido
- Input:
  - userId: `uuid-001`
  - token: `123456` (TOTP válido)
- Output esperado:
  - Status: `200`
  - Body: `{ verified: true }`
- Métrica:
  - Verificación con `speakeasy` correcta
- Tipo: Unit

### AUTH-08 | Verificar MFA inválido
- Input:
  - userId: `uuid-001`
  - token: `000000`
- Output esperado:
  - Status: `401`
  - Body: `{ message: 'Token TOTP inválido' }`
- Métrica:
  - No permitir acceso con token incorrecto
- Tipo: Unit

### AUTH-09 | Login con MFA obligatorio
- Input:
  - email/password correctos + MFA requerido
- Output esperado:
  - Status: `403`
  - Body: `{ message: 'MFA requerido' }`
- Métrica:
  - Forzar segundo factor cuando está habilitado
- Tipo: Integration

### AUTH-10 | JWT expirado
- Input:
  - Token JWT con `exp` pasado
- Output esperado:
  - Status: `401`
  - Body: `{ message: 'Token expirado' }`
- Métrica:
  - Rechazo correcto de token viejo
- Tipo: Unit

---

## 2. WALLET (Wallet Module)

### WALLET-01 | Crear wallet exitoso
- Input:
  - userId: `uuid-001`
- Output esperado:
  - Status: `201`
  - Body: `{ id, userId, blockchainAddress, xCoinBalance: '0', stablecoinBalance: '0' }`
- Métrica:
  - `blockchainAddress` es dirección Ethereum válida
  - Respuesta < 300ms
- Tipo: Unit / Integration

### WALLET-02 | Crear wallet existente
- Input:
  - same userId repeated
- Output esperado:
  - Status: `409` o comportamiento definido según lógica
  - Body: `{ message: 'Wallet ya existe' }`
- Métrica:
  - Evita duplicados en DB
- Tipo: Unit

### WALLET-03 | Obtener balance X Coin válido
- Input:
  - walletId existente
- Output esperado:
  - Status: `200`
  - Body: `{ id, xCoinBalance: '100.5', stablecoinBalance: '50.25' }`
- Métrica:
  - Balance sincronizado desde blockchain
  - Llamada RPC < 500ms
- Tipo: Integration

### WALLET-04 | Transferir X Coin válido
- Input:
  - walletId: `uuid-001`
  - toAddress: `0xAbc...`
  - amount: `10.5`
- Output esperado:
  - Status: `201`
  - Body: `{ txHash, status: 'pending' }`
- Métrica:
  - TX persistida en DB
  - Dirección destino valida
- Tipo: Unit

### WALLET-05 | Transferencia con saldo insuficiente
- Input:
  - amount: `1000`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Saldo insuficiente' }`
- Métrica:
  - Validación de balance antes de la transferencia
- Tipo: Unit

### WALLET-06 | Transferencia a dirección inválida
- Input:
  - toAddress: `invalid`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Dirección Ethereum inválida' }`
- Métrica:
  - Validación de formato de dirección
- Tipo: Unit

### WALLET-07 | Transferencia monto negativo
- Input:
  - amount: `-5`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Monto debe ser positivo' }`
- Métrica:
  - Validación de monto > 0
- Tipo: Unit

### WALLET-08 | Consultar estado de transacción
- Input:
  - txHash: `0xTxHash123...`
- Output esperado:
  - Status: `200`
  - Body: `{ status: 'confirmed' | 'failed' | 'pending' }`
- Métrica:
  - Confirmación real desde RPC
- Tipo: Integration

### WALLET-09 | Importar wallet existente
- Input:
  - blockchainAddress: `0xAbc...`
- Output esperado:
  - Status: `200`
  - Body: `{ walletId, blockchainAddress }`
- Métrica:
  - Balance consultable tras importación
- Tipo: Integration

### WALLET-10 | Balance bajo carga
- Input:
  - 100 consultas simultáneas a `/balance`
- Output esperado:
  - Todas responden `200`
- Métrica:
  - P95 < 350ms
  - Error rate < 1%
- Tipo: Performance

---

## 3. STAKING (Staking Module)

### STAKING-01 | Crear stake exitoso
- Input:
  - walletId: `uuid-001`
  - amount: `100`
- Output esperado:
  - Status: `201`
  - Body: `{ id, walletId, amount: '100', rewards: '0', status: 'active' }`
- Métrica:
  - Stake guardado en DB
- Tipo: Unit

### STAKING-02 | Stake sin saldo suficiente
- Input:
  - walletId con balance 50
  - amount: `100`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Saldo insuficiente' }`
- Métrica:
  - No crear stake si no hay fondos
- Tipo: Unit

### STAKING-03 | Crear stake mínimo válido
- Input:
  - amount: `1`
- Output esperado:
  - Status: `201`
- Métrica:
  - Acepta montos mínimos
- Tipo: Unit

### STAKING-04 | Obtener stakes activos
- Input:
  - walletId: `uuid-001`
- Output esperado:
  - Status: `200`
  - Body: `[{ id, amount, status: 'active' }]`
- Métrica:
  - Solo stakes `active`
- Tipo: Unit

### STAKING-05 | Calcular rewards 1 año
- Input:
  - stakeId creado hace 1 año
- Output esperado:
  - `{ rewards: '10.0' }`
- Métrica:
  - 10% anual exacto
- Tipo: Unit

### STAKING-06 | Calcular rewards 6 meses
- Input:
  - stakeId creado hace 6 meses
- Output esperado:
  - `{ rewards: '5.0' }`
- Métrica:
  - Proporción correcta
- Tipo: Unit

### STAKING-07 | Unstake correcto
- Input:
  - stakeId activo
- Output esperado:
  - Status: `200`
  - Body: `{ status: 'withdrawn' }`
- Métrica:
  - Cambio de estado en DB
- Tipo: Unit

### STAKING-08 | Unstake no existente
- Input:
  - stakeId: `invalid`
- Output esperado:
  - Status: `404`
  - Body: `{ message: 'Stake no encontrado' }`
- Métrica:
  - Manejo correcto de errores
- Tipo: Unit

### STAKING-09 | Stakes simultáneos
- Input:
  - 5 requests `createStake` simultáneos
- Output esperado:
  - 5 stakes activos sin conflicto
- Métrica:
  - Sin condiciones de carrera
- Tipo: Unit / Performance

### STAKING-10 | Unstake bajo carga
- Input:
  - 50 requests de `unstake` simultáneos
- Output esperado:
  - Todos completados con status 200
- Métrica:
  - P95 < 500ms
- Tipo: Performance

---

## 4. INTEGRACIÓN TERRA LINK

### LINK-01 | Pago de validación exitoso
- Input:
  - userId: `uuid-001`
  - amount: `50`
  - validationId: `link-123`
- Output esperado:
  - Status: `201`
  - Body: `{ txHash, status: 'pending' }`
- Métrica:
  - Débito correcto de X Coin
- Tipo: Integration

### LINK-02 | Validación no existente
- Input:
  - validationId: `invalid`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Validación no disponible' }`
- Métrica:
  - Error controlado
- Tipo: Integration

### LINK-03 | Webhook de aprobación
- Input:
  - body: `{ validationId: 'link-123', status: 'approved' }`
- Output esperado:
  - Status: `200`
  - NFT emitido a usuario
- Métrica:
  - NFT creado en DB
- Tipo: Integration

### LINK-04 | Sincronizar certificados
- Input:
  - userId: `uuid-001`
- Output esperado:
  - Lista de certificados validos
- Métrica:
  - Datos consistentes con TERRA LINK
- Tipo: Integration

---

## 5. INTEGRACIÓN TERRA GO

### GO-01 | Listar lote en venta
- Input:
  - walletId: `uuid-001`
  - nftId: `nft-123`
  - price: `1000`
- Output esperado:
  - Status: `201`
  - Body: `{ listingId, status: 'active' }`
- Métrica:
  - Lote visible en marketplace
- Tipo: Integration

### GO-02 | Comprar lote
- Input:
  - buyerId: `uuid-002`
  - listingId: `list-123`
  - amount: `1000`
- Output esperado:
  - Status: `200`
  - Body: `{ txHash, ownership: 'uuid-002' }`
- Métrica:
  - Transferencia de NFT completada
- Tipo: Integration

### GO-03 | Actualizar precio
- Input:
  - sellerId: `uuid-001`
  - listingId: `list-123`
  - newPrice: `950`
- Output esperado:
  - Status: `200`
  - Body: `{ price: '950', status: 'active' }`
- Métrica:
  - Precio actualizado en marketplace
- Tipo: Integration

### GO-04 | Cancelar venta
- Input:
  - sellerId: `uuid-001`
  - listingId: `list-123`
- Output esperado:
  - Status: `200`
  - Body: `{ status: 'cancelled' }`
- Métrica:
  - Lote removido de catálogo
- Tipo: Integration

---

## 6. CONVERSIÓN FIAT ↔ X COIN

### FIAT-01 | USD → X Coin
- Input:
  - amount: `100`
  - rate: `0.8`
- Output esperado:
  - `{ xCoinAmount: '80.00' }`
- Métrica:
  - Cálculo correcto a 2 decimales
- Tipo: Unit

### FIAT-02 | X Coin → USD
- Input:
  - amount: `50`
  - rate: `1.25`
- Output esperado:
  - `{ usdAmount: '62.50' }`
- Métrica:
  - Cálculo uniforme
- Tipo: Unit

### FIAT-03 | Conversión con fee
- Input:
  - amount: `100`
  - fee: `0.02`
- Output esperado:
  - `{ netAmount: '98.00', fee: '2.00' }`
- Métrica:
  - Fee deducido correctamente
- Tipo: Unit

### FIAT-04 | Monto mínimo no válido
- Input:
  - amount: `5`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Monto mínimo 10 USD' }`
- Métrica:
  - Validación clara de límites
- Tipo: Unit

### FIAT-05 | Pago Stripe
- Input:
  - amount: `100`
- Output esperado:
  - Status: `201`
  - Body: `{ paymentIntentId, status: 'pending' }`
- Métrica:
  - Integración con Stripe simulada en sandbox
- Tipo: Integration

---

## 7. SEGURIDAD

### SEC-01 | SQL Injection
- Input:
  - email: `' OR '1'='1`
- Output esperado:
  - Status: `400`
  - Body: `{ message: 'Input inválido' }`
- Métrica:
  - Sin inyección SQL ejecutada
- Tipo: Security

### SEC-02 | XSS en balance display
- Input:
  - payload: `<script>alert(1)</script>`
- Output esperado:
  - Campo escapado, script no ejecutado
- Métrica:
  - No hay ejecución de script
- Tipo: Security

### SEC-03 | CSRF protection
- Input:
  - request POST sin CSRF token
- Output esperado:
  - Status: `403`
- Métrica:
  - Rechazo seguro de la petición
- Tipo: Security

### SEC-04 | Rate limiting
- Input:
  - 150 requests en 1 minuto a `/api/auth/login`
- Output esperado:
  - Al menos 50 requests devuelven `429`
- Métrica:
  - Límite aplicado correctamente
- Tipo: Security

### SEC-05 | Acceso no autorizado
- Input:
  - Usuario A consulta wallet de Usuario B
- Output esperado:
  - Status: `403`
  - Body: `{ message: 'Acceso denegado' }`
- Métrica:
  - Aislamiento de datos por usuario
- Tipo: Security

### SEC-06 | TLS enforcement
- Input:
  - request HTTP plano en producción
- Output esperado:
  - Redirección o bloqueo
- Métrica:
  - HTTPS obligatorio
- Tipo: Security

### SEC-07 | JWT manipulado
- Input:
  - Token alterado en header
- Output esperado:
  - Status: `401`
- Métrica:
  - Firma JWT verificada
- Tipo: Security

### SEC-08 | Datos encriptados en reposo
- Input:
  - Inspección de DB
- Output esperado:
  - Secretos no almacenados en texto claro
- Métrica:
  - AES-256 aplicado en datos sensibles
- Tipo: Security

---

## 8. PERFORMANCE

### PERF-01 | Balance rápido
- Input:
  - walletId con cache activada
- Output esperado:
  - Respuesta P95 < 200ms
- Métrica:
  - P95 latency < 200ms
- Tipo: Performance

### PERF-02 | Listar stakes extensos
- Input:
  - walletId con 100 stakes
- Output esperado:
  - Respuesta P95 < 300ms
- Métrica:
  - P95 < 300ms
- Tipo: Performance

### PERF-03 | Transferencia rápida
- Input:
  - request `POST /api/wallet/:id/transfer`
- Output esperado:
  - Respuesta < 500ms
- Métrica:
  - P95 < 500ms
- Tipo: Performance

### PERF-04 | Login eficiente
- Input:
  - login válido
- Output esperado:
  - Respuesta < 400ms
- Métrica:
  - P95 < 400ms
- Tipo: Performance

### PERF-05 | Throughput alto
- Input:
  - 1000 requests/min
- Output esperado:
  - Error rate < 1%
- Métrica:
  - Throughput > 1000 req/min
- Tipo: Performance

### PERF-06 | Redis hit rate
- Input:
  - 100 consultas repetidas
- Output esperado:
  - Cache hit rate > 90%
- Métrica:
  - >90% hits
- Tipo: Performance

### PERF-07 | CPU DB bajo carga
- Input:
  - 500 usuarios simultáneos
- Output esperado:
  - CPU DB < 80%
- Métrica:
  - Sin degradación de respuesta
- Tipo: Performance

---

## 9. SMOKE TESTS PRE-DESPLIEGUE

### SMOKE-01 | Health check API
- Input:
  - `GET /health`
- Output esperado:
  - Status: `200`
  - Body: `{ status: 'ok' }`
- Métrica:
  - Servicio disponible
- Tipo: Smoke

### SMOKE-02 | DB conectada
- Input:
  - query simple `SELECT 1`
- Output esperado:
  - `1`
- Métrica:
  - DB activa
- Tipo: Smoke

### SMOKE-03 | Redis conectado
- Input:
  - `PING`
- Output esperado:
  - `PONG`
- Métrica:
  - Cache disponible
- Tipo: Smoke

### SMOKE-04 | Blockchain RPC accesible
- Input:
  - `balanceOf` call
- Output esperado:
  - Valor numérico
- Métrica:
  - Conexión Polygon válida
- Tipo: Smoke

### SMOKE-05 | Auth funcional
- Input:
  - login válido
- Output esperado:
  - token JWT
- Métrica:
  - Sistema auth activo
- Tipo: Smoke

---

## 10. Resumen de Métricas de Éxito

- Cobertura de código: > 80%
- Latencia P95 en transacciones: < 500ms
- Disponibilidad: > 99.5%
- Vulnerabilidades críticas: 0
- Error rate en carga: < 1%
- Redis hit rate: > 90%
- Todos los casos críticos deben pasar en CI/CD
