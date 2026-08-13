# 📋 Documentación de API – Terra GO

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Autenticación (Fase 2)

### Registro de usuario
**POST** `/auth/register`

```json
{
  "email": "productor@example.com",
  "password": "micontraseña123",
  "nombre": "Juan Pérez",
  "rol": "productor"
}
```

**Response (201)**:
```json
{
  "user": {
    "id": 1,
    "email": "productor@example.com",
    "nombre": "Juan Pérez",
    "rol": "productor"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login
**POST** `/auth/login`

```json
{
  "email": "productor@example.com",
  "password": "micontraseña123"
}
```

**Response (200)**:
```json
{
  "user": {
    "id": 1,
    "email": "productor@example.com",
    "nombre": "Juan Pérez",
    "rol": "productor"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 Usuarios

### Obtener perfil de usuario
**GET** `/users/:id`

**Response (200)**:
```json
{
  "id": 1,
  "email": "productor@example.com",
  "nombre": "Juan Pérez",
  "rol": "productor"
}
```

---

### Obtener todos los usuarios (requiere autenticación)
**GET** `/users`

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200)**:
```json
[
  {
    "id": 1,
    "email": "productor@example.com",
    "nombre": "Juan Pérez",
    "rol": "productor"
  }
]
```

---

## 📦 Lotes (Fase 3 - Próxima)

### Obtener todos los lotes
**GET** `/app/lotes`

**Response (200)**:
```json
[
  {
    "id": 1,
    "productor_id": 1,
    "certificacion": "EUDR",
    "ubicacion": "Campo 1, Provincia de X",
    "volumen": 100.5
  }
]
```

---

## 🪙 NFTs (Fase 4 - Próxima)

Endpoints para mintear, transferir y consultar NFTs agrícolas.

---

## 💱 Marketplace (Fase 5 - Próxima)

Endpoints para trading P2P, órdenes de compra/venta.

---

## 💳 Pagos (Fase 6 - Próxima)

Endpoints para procesamiento de pagos fiat ↔ cripto.

---

## 🎯 Autenticación

Todos los endpoints protegidos requieren:
```
Authorization: Bearer <access_token>
```

Token válido por 24 horas. Se obtiene al login o registro.

---

## 📝 Códigos de Error

- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error
