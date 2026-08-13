# Seguridad – Terra Link

## Autenticación

- MFA + biométricos (huella digital, FaceID) a través de TERRA X CHANGE
- JWT con expiación corta y roles RBAC (`producer`, `bank`, `admin`)
- Refresh tokens seguros para sesiones prolongadas

## Auditoría

- Logs inmutables en AWS CloudWatch
- Validaciones firmadas digitalmente y almacenadas en IPFS/S3
- Trazabilidad completa de cambios en los metadatos del NFT

## Encriptación

- AES-256 para datos sensibles en reposo
- HTTPS + TLS 1.3 en todas las APIs
- Cifrado de secretos con AWS KMS o Vault

## Buenas prácticas

- Rotación automática de credenciales
- Revisión periódica de permisos RBAC
- Protección de endpoints críticos con WAF y rate limiting
