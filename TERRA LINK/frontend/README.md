# Terra Link Dashboard (frontend)

Simple React + Vite dashboard that connects to the backend WebSocket gateway and displays financial metrics in real time.

Quick start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and ensure the backend is running (`cd backend && npm run start:dev`).

Environment

- `VITE_BACKEND_URL` optional environment variable to point to the backend (e.g. `http://localhost:3000`).

Socket namespace

- Client connects to the backend namespace `/credit` and listens to events: `credit:metrics`, `credit:collateralized`, `credit:riskLimit`.

Files

- `src/Dashboard.tsx` — main chart + socket integration.
