# Render Staging Setup

This runbook prepares PG77-real-core for a future Render staging deploy. It does not authorize a deploy, production database access, live provider mode, live payment rails, live bank rails, live SMS, live Slip OCR, or real-money testing.

Do not paste real database URLs, passwords, tokens, API keys, provider secrets, callback secrets, bearer tokens, or platform credentials into this file, commits, logs, screenshots, issue trackers, pull requests, or chat output.

## Render Service Settings

Create a Render service only after the staging database and secret-manager values are ready.

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node.js |
| Branch | `main` |
| Build command | `npm ci && npx prisma generate` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| Environment/secrets | Render Environment Variables or Environment Group only |

The repository may contain placeholders only. Real `DATABASE_URL`, JWT/admin secrets, provider keys, payment keys, bank keys, SMS keys, Slip OCR keys, and callback secrets must be set only in Render Environment/Secrets.

## Render ENV Checklist

Use `.env.staging.example` as a placeholder reference. Set real staging values only in Render Environment Variables or a Render Environment Group. Do not commit real values.

| Group | ENV keys | Render value style | Notes |
| --- | --- | --- | --- |
| App runtime | `NODE_ENV`, `APP_ENV`, `PORT` | `staging`, `staging`, Render-provided port or `4000` fallback | Keep staging explicit. Do not use production labels for this service. |
| Database staging/test only | `DATABASE_URL` | `<staging-database-url>` | Must be a dedicated staging/test PostgreSQL URL, never production, production clone, or production read replica. |
| Admin/session/auth | `JWT_SECRET`, `JWT_EXPIRES_IN`, `LOCAL_ADMIN_PASSWORD` | `<set-in-render-environment>`, `7d`, `<set-in-render-environment>` | Generate staging-only values and rotate if exposed. |
| Provider/game mode | `GAME_PROVIDER_MODE`, `GAME_PROVIDER_API_BASE_URL`, `GAME_PROVIDER_AGENT_CODE`, `GAME_PROVIDER_API_KEY`, `GAME_PROVIDER_SECRET` | `mock`, `sandbox`, `disabled`, or `<set-in-render-environment>` placeholders | Default to `mock`; no live provider mode. |
| Payment mode | `PAYMENT_PROVIDER_MODE`, `PAYMENT_API_BASE_URL`, `PAYMENT_MERCHANT_ID`, `PAYMENT_API_KEY`, `PAYMENT_SECRET` | `mock`, `sandbox`, `disabled`, or `<set-in-render-environment>` placeholders | No live payment rails and no real-money transfer. |
| Bank/statement mode | `BANK_STATEMENT_MODE`, `BANK_API_BASE_URL`, `BANK_API_KEY` | `mock`, `sandbox`, `disabled`, or `<set-in-render-environment>` placeholders | No live bank rails or production statement feeds. |
| SMS mode | `SMS_PROVIDER_MODE`, `SMS_API_BASE_URL`, `SMS_API_KEY` | `mock`, `sandbox`, `disabled`, or `<set-in-render-environment>` placeholders | No live SMS sending in this phase. |
| Slip OCR mode | `SLIP_OCR_MODE`, `SLIP_OCR_API_BASE_URL`, `SLIP_OCR_API_KEY` | `mock`, `sandbox`, `disabled`, or `<set-in-render-environment>` placeholders | No live OCR provider connection in this phase. |
| CORS/base URL | `CORS_ORIGIN`, `PUBLIC_API_BASE_URL`, smoke-only `BASE_URL` | `<set-in-render-environment>`, `https://<render-staging-domain>`, `https://<render-staging-domain>/api` | Use staging/admin/API origins only. Never embed credentials in URLs. |

Required Render boundaries:

- `DATABASE_URL` must point to a dedicated staging/test PostgreSQL database.
- ENV values must live in Render Environment/Secrets only, not in committed files.
- Provider/payment/bank/SMS/Slip OCR modes must be `mock`, `sandbox`, or `disabled`.
- Live provider/payment/bank/SMS/Slip OCR values are forbidden for this staging preparation phase.
- Health and smoke output must never print secrets.

## Before Deploy

- Confirm the Render account, project, and service owner.
- Confirm the staging domain is non-production.
- Confirm the staging PostgreSQL target is separate from production and visibly marked staging/test.
- Confirm Render Environment/Secrets contains placeholders or real staging-only values only.
- Confirm no production database URL, production provider key, live payment key, live bank credential, live SMS key, or live Slip OCR key is present.
- Confirm `CORS_ORIGIN` and `PUBLIC_API_BASE_URL` point only to staging/admin/API hosts.
- Confirm rollback owner and deploy owner are known.
- Run local readiness checks:

```bash
npm run check
npm run staging:preflight
```

## During Deploy

- Use Render Web Service deploy from branch `main`.
- Keep build command as `npm ci && npx prisma generate`.
- Keep start command as `npm start`.
- Keep health check path as `/api/health`.
- Do not run DB migrations until the staging database target is verified and the guarded migration command is approved.
- Do not paste secret values into deploy notes, logs, screenshots, or chat.

## After Deploy

Run smoke only after Render reports the service is live and the domain is confirmed as staging:

Command Prompt template:

```cmd
set BASE_URL=https://<render-staging-domain>/api
npm run staging:preflight
npm run smoke:staging
```

PowerShell equivalent:

```powershell
$env:BASE_URL = "https://<render-staging-domain>/api"
npm run staging:preflight
npm run smoke:staging
```

Expected health contract:

- HTTP `200`.
- JSON response includes `success: true`.
- `data.ok` is `true`.
- `data.status` is `ok`.
- `data.databaseConnected` is a boolean.
- Provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
- No database URL, JWT, token, password, API key, provider secret, or authorization header appears in the response or logs.

## GO Criteria

GO is allowed only when all items are true:

- Staging DB is separate from production.
- ENV values are stored in Render Environment/Secrets.
- `/api/health` returns `ok: true`.
- `databaseConnected` is a boolean.
- Provider/payment/bank/SMS/Slip OCR modes are not live.
- `npm run staging:preflight` passes.
- `npm run smoke:staging` passes.

## NO-GO Criteria

NO-GO if any item is true:

- Staging uses production DB, a production clone, or a production read replica.
- Any provider/payment/bank/SMS/Slip OCR mode is live.
- Any secret leaks in response, log, doc, screenshot, issue, pull request, or chat.
- `/api/health` fails or returns an unsafe contract.
- `npm run staging:preflight` fails.
- `npm run smoke:staging` fails.

## Rollback

- Roll back to the previous successful deployment through the Render dashboard.
- Disable the Render service immediately if a secret leak is suspected.
- Rotate any secret that was exposed in output, logs, screenshots, docs, tickets, commits, or chat.
- Reconfirm Render ENV values point only to staging/test targets.
- Rerun `/api/health`, `npm run staging:preflight`, and `npm run smoke:staging` after rollback.
- Record the rollback owner, timestamp, deployment id or commit label, and final non-secret result.

## Optional render.yaml Template

Do not add a real `render.yaml` until the team decides to manage Render with infrastructure-as-code. If needed later, use a placeholder-only template like this and keep real values in Render Environment/Secrets:

```yaml
services:
  - type: web
    name: pg77-real-core-staging
    runtime: node
    branch: main
    buildCommand: npm ci && npx prisma generate
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: staging
      - key: APP_ENV
        value: staging
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: LOCAL_ADMIN_PASSWORD
        sync: false
      - key: GAME_PROVIDER_MODE
        value: mock
      - key: PAYMENT_PROVIDER_MODE
        value: mock
      - key: BANK_STATEMENT_MODE
        value: mock
      - key: SMS_PROVIDER_MODE
        value: disabled
      - key: SLIP_OCR_MODE
        value: disabled
```

This repository intentionally does not add a real `render.yaml` in this phase because the Render account, staging domain, staging database, and secret values are not confirmed yet.
