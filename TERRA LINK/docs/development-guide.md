# Guía de Desarrollo – Terra Link

## Instalación

### Backend
```bash
cd backend
npm install
npm run build
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Estructura del proyecto

- `backend/` → NestJS + PostGIS + API Gateway
- `contracts/` → Solidity + Hardhat
- `docs/` → Documentación técnica
- `infra/` → Terraform + AWS Config

## Tareas VS Code

- `Ctrl+Shift+B` → Compila el backend
- `F5` → Ejecuta entorno de depuración
- `tasks.json` → Scripts de desarrollo y despliegue

## Comandos principales

- `npm run build` → Compila el backend
- `npm run start:dev` → Inicia el backend en modo desarrollo
- `npm run lint` → Valida estilo y calidad del código

## Recomendaciones VS Code

- Instalar extensiones: ESLint, Prettier, Docker, Solidity
- Configurar `settings.json` con formateo automático y linting al guardar
- Usar `launch.json` para depurar el backend Node/NestJS
