# Arquitectura de TERRA X CHANGE

## Estructura del Proyecto

```
TERRA X CHANGE/
├── backend/
│   ├── src/
│   │   ├── auth/                 # Módulo de autenticación
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts   # Servicios: login, registro, MFA
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.spec.ts
│   │   │
│   │   ├── wallet/               # Módulo de wallet
│   │   │   ├── wallet.module.ts
│   │   │   ├── wallet.service.ts # Creación, balance, etc.
│   │   │   ├── wallet.controller.ts
│   │   │   ├── blockchain.service.ts  # Interacción con Polygon
│   │   │   ├── wallet.service.spec.ts
│   │   │   └── wallet.controller.spec.ts
│   │   │
│   │   ├── staking/              # Módulo de staking
│   │   │   ├── staking.module.ts
│   │   │   ├── staking.service.ts # Staking, rewards, unstake
│   │   │   ├── staking.controller.ts
│   │   │   └── staking.service.spec.ts
│   │   │
│   │   ├── entities/             # Modelos ORM
│   │   │   ├── user.entity.ts
│   │   │   ├── wallet.entity.ts
│   │   │   ├── transaction.entity.ts
│   │   │   ├── nft.entity.ts
│   │   │   └── stake.entity.ts
│   │   │
│   │   ├── app.module.ts         # Módulo principal
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   │
│   ├── test/                     # Pruebas E2E
│   │   ├── jest-e2e.json
│   │   └── app.e2e-spec.ts
│   │
│   ├── package.json              # Dependencias backend
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/
│   ├── src/
│   │   ├── screens/              # Pantallas React Native
│   │   │   ├── HomeScreen.tsx
│   │   │   └── WalletScreen.tsx
│   │   └── services/             # Servicios de API
│   │
│   ├── __tests__/                # Pruebas unitarias
│   │   └── HomeScreen.test.tsx
│   │
│   ├── App.tsx                   # Componente raíz
│   ├── app.json
│   ├── package.json
│   ├── jest.config.js
│   ├── jest.setup.js
│   └── tsconfig.json
│
├── tests/                        # Pruebas E2E con Playwright
│   └── wallet.spec.ts
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml                # CI/CD pipeline
│   └── copilot-instructions.md
│
├── docs/                         # Documentación
│   └── architecture.md
│
├── .env.example                  # Configuración de ejemplo
├── playwright.config.ts
└── README.md