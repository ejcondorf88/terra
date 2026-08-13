# API Reference - TERRA X CHANGE

## Autenticación (Auth Module)

### Registro
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "jwt_token"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token"
}
```

### Configurar MFA
```
POST /api/auth/{userId}/mfa/setup
Authorization: Bearer {token}

Response:
{
  "secret": "base32_secret",
  "qrCode": "otpauth_url"
}
```

### Verificar MFA
```
POST /api/auth/{userId}/mfa/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "token": "123456"  // Código TOTP
}

Response:
{
  "verified": true
}
```

---

## Wallet (Wallet Module)

### Crear Wallet
```
POST /api/wallet/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "uuid"
}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "blockchainAddress": "0x...",
  "xCoinBalance": "0",
  "stablecoinBalance": "0"
}
```

### Obtener Balance
```
GET /api/wallet/{walletId}/balance
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "blockchainAddress": "0x...",
  "xCoinBalance": "100.5",
  "stablecoinBalance": "50.25"
}
```

### Transferir X Coin
```
POST /api/wallet/{walletId}/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "toAddress": "0x...",
  "amount": "10.5"
}

Response:
{
  "txHash": "0x...",
  "status": "pending"
}
```

---

## Staking (Staking Module)

### Crear Stake
```
POST /api/staking/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletId": "uuid",
  "amount": "100"
}

Response:
{
  "id": "uuid",
  "walletId": "uuid",
  "amount": "100",
  "rewards": "0",
  "status": "active"
}
```

### Obtener Stakes
```
GET /api/staking/{walletId}/stakes
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "amount": "100",
    "rewards": "0",
    "status": "active"
  }
]
```

### Calcular Recompensas
```
GET /api/staking/{stakeId}/rewards
Authorization: Bearer {token}

Response:
{
  "rewards": "10.5"
}
```

### Unstake (Retirar)
```
POST /api/staking/{stakeId}/unstake
Authorization: Bearer {token}

Response:
{
  "id": "uuid",
  "status": "withdrawn"
}
```