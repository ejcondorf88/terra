E2E scaffold for JWT + RBAC flows

This folder contains a simple scaffold and example for end-to-end tests validating authentication and RBAC flows across the ecosystem.

Concept:
- Start backend services (locally or in CI) on their default ports.
- Use the login endpoint to obtain a JWT.
- Call a protected endpoint with the JWT and assert role-based access.

Example test template (Node + fetch): see `jwt-rbac.example.ts`.

Environment variables supported by `jwt-rbac.example.ts`:

- `E2E_LOGIN_URL` (default: `http://localhost:3000/auth/login`)
- `E2E_PROTECTED_URL` (default: `http://localhost:3000/users`)
- `E2E_EMAIL` (default: `admin@example.com`)
- `E2E_PASSWORD` (default: `password`)

Usage examples:

Bash / WSL:

```bash
E2E_LOGIN_URL=http://localhost:3000/auth/login E2E_EMAIL=admin@example.com E2E_PASSWORD=password node tests/e2e/jwt-rbac.example.ts
```

PowerShell:

```powershell
$env:E2E_LOGIN_URL = 'http://localhost:3000/auth/login'
$env:E2E_PROTECTED_URL = 'http://localhost:3000/users'
$env:E2E_EMAIL = 'admin@example.com'
$env:E2E_PASSWORD = 'password'
node tests/e2e/jwt-rbac.example.ts
```

Direct CLI args (cross-platform):

```bash
node tests/e2e/jwt-rbac.example.ts --loginUrl=http://localhost:3000/auth/login --protectedUrl=http://localhost:3000/users --email=admin@example.com --password=password
```
### Performance test

El script `tests/e2e/performance.example.ts` mide la latencia de login y el endpoint protegido, con umbrales configurables.

```bash
node tests/e2e/performance.example.ts --loginUrl=http://localhost:3000/auth/login --protectedUrl=http://localhost:3000/users --email=admin@example.com --password=password
```

Se pueden ajustar los umbrales con variables de entorno o CLI:

```bash
node tests/e2e/performance.example.ts --loginThreshold=500 --protectedThreshold=250 --totalThreshold=800
```

Variables disponibles:

- `PERF_LOGIN_URL`
- `PERF_PROTECTED_URL`
- `PERF_EMAIL`
- `PERF_PASSWORD`
- `PERF_LOGIN_THRESHOLD_MS`
- `PERF_PROTECTED_THRESHOLD_MS`
- `PERF_TOTAL_THRESHOLD_MS`
## How to run (manual)

### Option 1: Start services locally from source

1. Start each backend individually:
   ```bash
   # Terminal 1: TERRA GO backend
   cd "TERRA GO/backend"
   npm run start:dev

   # Terminal 2: TERRA LINK backend
   cd "TERRA LINK/backend"
   npm run start:dev

   # Terminal 3: TERRA X CHANGE backend
   cd "TERRA X CHANGE/backend"
   npm run start:dev
   ```

2. Run the E2E test with Node or your test runner (see usage examples above).

### Option 2: Start infrastructure with Docker Compose (recommended for E2E)

1. Start PostgreSQL and Redis:
   ```bash
   docker-compose -f docker-compose.e2e.yml up -d postgres redis
   ```

2. Start backend services manually (as Option 1 above), or build and run them in containers:
   ```bash
   docker-compose -f docker-compose.e2e.yml up -d
   ```
   (Uncomment backend services in `docker-compose.e2e.yml` and configure Dockerfile paths as needed.)

3. Run the E2E test:
   ```bash
   node tests/e2e/jwt-rbac.example.ts --loginUrl=http://localhost:3000/auth/login ...
   ```

4. Cleanup:
   ```bash
   docker-compose -f docker-compose.e2e.yml down -v
   ```

## CI Integration

- CI runs tests in a matrix or sequential job.
- Start infrastructure: `docker-compose -f docker-compose.e2e.yml up -d postgres redis`.
- Run backends (either via npm or Docker), then execute E2E tests.
- Upload results as artifacts.
- Cleanup: `docker-compose -f docker-compose.e2e.yml down -v`.

## Notes

- This is a scaffold — adapt endpoints, ports and credentials to your environment.
- For CI, consider uncommenting the backend services in `docker-compose.e2e.yml` and configuring Dockerfile paths.
- E2E tests can be extended with additional scenarios (multi-tenant flows, RBAC matrix, etc.).
