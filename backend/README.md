# Magnus Compliance Engine Backend

## Modes
- DEMO: Simulated data, no real analysis, safe for demos.
- REAL: Real backend, persistence, JWT auth, no simulation fallback.

## Env Vars
- APP_MODE=demo|real
- DATABASE_URL=sqlite:///./db.sqlite3 (or postgres://...)
- JWT_SECRET=your-secret
- GEMINI_API_KEY=your-gemini-key (optional, only for REAL mode)

## Run (Demo)
```sh
export APP_MODE=demo
export DATABASE_URL=sqlite:///./db.sqlite3
export JWT_SECRET=dev-secret
uvicorn backend.app.main:app --reload
```

## Run (Real)
```sh
export APP_MODE=real
export DATABASE_URL=sqlite:///./db.sqlite3
export JWT_SECRET=prod-secret
export GEMINI_API_KEY=your-gemini-key
uvicorn backend.app.main:app --reload
```

## Migrations
- Tables auto-create on boot (SQLAlchemy).
- For production, use Alembic.

## Generate Report
- POST /api/reports with analysisId, then GET /api/reports/{reportId}/download

## Healthcheck
- GET /api/health

## JWT Auth
- POST /api/auth/login (email+password)
- Use returned JWT for protected endpoints.

## Ingestion
- POST /api/ingestion/irs990 (stub, returns jobId + status)

## Audit Log
- POST/GET /api/audit/events

## Gemini Proxy
- POST /api/ai/gemini/summary (REAL mode only, JWT required)
