# Staging Deploy Guide

This guide prepares PG77-real-core for a safe staging deployment. It does not authorize a real deploy, production database access, live provider mode, real bank rails, real payment rails, or real-money transfer.

Do not paste real database URLs, passwords, tokens, API keys, provider secrets, callback secrets, bearer tokens, or live provider credentials into this file, commits, logs, pull requests, issue trackers, screenshots, or chat output.

## Supported Staging Platforms

PG77-real-core is a Node.js/Express backend API. It must run on backend hosting that supports a long-running Node.js process and outbound PostgreSQL connectivity.

Recommended first staging target:

- Render Web Service using Node.js on branch `main`.

Backup platform options:

- Railway service plus Railway PostgreSQL or another dedicated staging PostgreSQL.
- Fly.io app plus managed PostgreSQL reachable from the app.
- VPS or VM with Node.js 18.18+ and a dedicated staging PostgreSQL.
- Docker-ready host if the image runs `npm run start`, has Node.js 18.18+, receives environment variables from a secret store, and connects only to staging PostgreSQL.

Use `docs/STAGING_RENDER.md` for the recommended Render setup, env checklist, deploy checklist, GO/NO-GO criteria, rollback note, and optional placeholder `render.yaml` template. Use `docs/STAGING_PLATFORM_CHECKLIST.md` for backup platform build/start/env/rollback steps. Use `docs/STAGING_DEPLOY_DECISION.md` for go/no-go approval. Use `docs/STAGING_ROLLBACK.md` for the rollback and incident runbook.

Do not deploy this backend as a static site. Do not use Netlify static hosting for the API process.

## Platform Selection Summary

| Platform | เหมาะกับอะไร | สิ่งที่ต้องเตรียม | Build command | Start command | Health check path | Env secret manager | Rollback method | ข้อควรระวัง |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Render | Managed web service พร้อม deploy history | Web Service, staging PostgreSQL, staging domain, env variables | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | Render Environment Variables/Environment Group | Redeploy previous successful deploy | ห้ามใช้ production DB หรือ live provider env ร่วมกับ staging service |
| Railway | Setup เร็วสำหรับ API + DB ใน project เดียว | Railway service, staging PostgreSQL, public domain, variables | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | Railway Variables | Redeploy previous deployment หรือ pin previous commit | ตรวจ project/env ไม่ reuse production และ domain ไม่ production-like |
| Fly.io | ต้องการ release rollback และ region control | Fly app, staging DB access, secrets, health check config | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | Fly secrets | Rollback to previous release | ตรวจ DB reachability, region, TLS, และไม่ใส่ live credentials |
| VPS | ต้องการควบคุม OS/network/process เอง | Node.js 18.18+, process manager, reverse proxy, staging DB, secret store | `npm ci && npx prisma generate` | `npm run start` | `/api/health` | systemd/PM2/vault outside git | Switch release dir/commit and restart | ต้องดูแล patching, firewall, TLS, logs, backup, restart policy เอง |

## Render Staging Quick Setup

| Render setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node.js |
| Branch | `main` |
| Build command | `npm ci && npx prisma generate` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| ENV storage | Render Environment Variables or Environment Group only |

Do not add real secret values to repository files. Render must hold real staging-only values for `DATABASE_URL`, JWT/admin secrets, and any approved sandbox provider credentials.

## Recommended Architecture

- Backend service: one staging Node.js process running `npm run start`.
- Database: one PostgreSQL database dedicated to staging/test only.
- Environment variables: staging-specific values stored in the platform secret manager, never committed.
- Provider modes: `mock` by default; `sandbox` only after sandbox credentials and callback verification are approved.
- Public access: staging domain only, separate from production.
- Admin access: staging-only admin password and JWT secret.
- Logs: platform logs with secret redaction rules and limited retention.

Strict boundaries:

- Never use production database, production clone, or production read replica.
- Never set provider/payment/bank/SMS/Slip OCR mode to live for staging smoke.
- Never connect real provider/payment/bank rails from staging preparation.
- Never run real-money transfer, auto settlement, or live payout from staging.

## Required ENV Checklist

Use `.env.staging.example` as the placeholder template. Set real staging values only in the hosting platform secret manager or a local ignored `.env` file. Keep the real values out of source control and logs.

Core keys:

- `NODE_ENV`
- `APP_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `PUBLIC_API_BASE_URL`
- `LOCAL_ADMIN_PASSWORD`

Provider and external boundary keys:

- `GAME_PROVIDER_MODE`
- `GAME_PROVIDER_API_BASE_URL`
- `GAME_PROVIDER_AGENT_CODE`
- `GAME_PROVIDER_API_KEY`
- `GAME_PROVIDER_SECRET`
- `PAYMENT_PROVIDER_MODE`
- `PAYMENT_API_BASE_URL`
- `PAYMENT_MERCHANT_ID`
- `PAYMENT_API_KEY`
- `PAYMENT_SECRET`
- `BANK_STATEMENT_MODE`
- `BANK_API_BASE_URL`
- `BANK_API_KEY`
- `SMS_PROVIDER_MODE`
- `SMS_API_BASE_URL`
- `SMS_API_KEY`
- `SLIP_OCR_MODE`
- `SLIP_OCR_API_BASE_URL`
- `SLIP_OCR_API_KEY`

## Staging ENV Mapping

All real values must be set only in the selected platform secret manager or an ignored local `.env` file. The repo may contain placeholders only.

| Group | ENV keys | Required value style | Notes |
| --- | --- | --- | --- |
| App runtime | `NODE_ENV`, `APP_ENV`, `PORT` | Render may use `production`; `APP_ENV` must be `staging`; platform port value | Runtime optimization is separate from environment boundary. Safety checks use `APP_ENV`, DB target markers, and provider modes. |
| Database staging/test only | `DATABASE_URL` | `<staging-database-url>` in secret manager | Must point to dedicated staging/test PostgreSQL, never production or production clone. |
| Admin/session/auth | `JWT_SECRET`, `JWT_EXPIRES_IN`, `LOCAL_ADMIN_PASSWORD` | `<set-in-render-environment>`, `7d`, `<set-in-render-environment>` | Rotate if printed, pasted, committed, screenshotted, or shared outside secret manager. |
| Provider/game mock/sandbox/disabled | `GAME_PROVIDER_MODE`, `GAME_PROVIDER_API_BASE_URL`, `GAME_PROVIDER_AGENT_CODE`, `GAME_PROVIDER_API_KEY`, `GAME_PROVIDER_SECRET` | `mock`, `sandbox`, or `disabled`; credentials as placeholders only | Keep credentials empty in mock mode; no live provider mode. |
| Payment mock/sandbox/disabled | `PAYMENT_PROVIDER_MODE`, `PAYMENT_API_BASE_URL`, `PAYMENT_MERCHANT_ID`, `PAYMENT_API_KEY`, `PAYMENT_SECRET` | `mock`, `sandbox`, or `disabled`; credentials as placeholders only | No live payment rails, no real-money transfer. |
| Bank/statement mock/sandbox/disabled | `BANK_STATEMENT_MODE`, `BANK_API_BASE_URL`, `BANK_API_KEY` | `mock`, `sandbox`, or `disabled`; credentials as placeholders only | No live bank rails or production statement feeds. |
| SMS mock/sandbox/disabled | `SMS_PROVIDER_MODE`, `SMS_API_BASE_URL`, `SMS_API_KEY` | `mock`, `sandbox`, or `disabled`; credentials as placeholders only | No live SMS sending from staging preparation. |
| Slip OCR mock/sandbox/disabled | `SLIP_OCR_MODE`, `SLIP_OCR_API_BASE_URL`, `SLIP_OCR_API_KEY` | `mock`, `sandbox`, or `disabled`; credentials as placeholders only | No live OCR provider connection in this phase. |
| CORS/base URL | `CORS_ORIGIN`, `PUBLIC_API_BASE_URL`, `BASE_URL` for smoke runner | `<staging-origin>`, `<staging-domain>`, `https://<staging-domain>/api` | Keep staging/test only and never embed credentials in URLs. |

Required staging values:

- `NODE_ENV` may be `production` on Render, but `APP_ENV` must be `staging`.
- `APP_ENV` must be `staging` or another explicit non-production staging/test label.
- `DATABASE_URL` must target a dedicated staging/test PostgreSQL database.
- `JWT_SECRET`, session secret values, and admin passwords must be generated for staging and set only in the platform secret manager.
- `CORS_ORIGIN` must be the staging frontend/admin origin list, not `*`.
- `PUBLIC_API_BASE_URL` must be the staging API base URL.
- Provider/payment/bank/SMS/Slip OCR modes must be `mock`, approved `sandbox`, or `disabled`.
- Provider API base URLs and credentials must remain empty in mock mode.
- No live provider, payment, bank, SMS, or Slip OCR credential may be present in staging preparation.

Secret manager only values:

- `DATABASE_URL`
- `JWT_SECRET`
- `LOCAL_ADMIN_PASSWORD`
- Provider, payment, bank, SMS, and Slip OCR API keys or secrets when sandbox mode is approved.

Values that may be committed only as placeholders:

- `.env.staging.example` placeholder names.
- Non-secret command examples.
- Staging URL placeholders such as `<STAGING_API_BASE_URL>`.

Values that must be rotated if exposed:

- Database URLs.
- JWT secrets.
- Admin passwords.
- Provider, payment, bank, SMS, and Slip OCR API keys or secrets.
- Callback secrets, bearer tokens, private keys, and any credential copied from a platform dashboard.

## Pre-Deploy Checklist

- Confirm the target platform and staging domain.
- Confirm the staging PostgreSQL database is not production and not a production clone.
- Confirm the staging database name, host label, or user label contains a staging/test marker.
- Confirm no live provider credentials are present in platform env values.
- Confirm provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
- Confirm `CORS_ORIGIN` lists only staging frontend/admin origins and `PUBLIC_API_BASE_URL` points at the staging API.
- Confirm `GET /api/health` returns the safe health contract before any DB-backed smoke.
- Confirm `npm run check` passes locally before deployment handoff.
- Confirm `npm run staging:preflight` passes before deployment handoff. For real staging this requires `APP_ENV=staging` and a dedicated staging `DATABASE_URL` in the platform secret manager. For CI dry-runs it may run as `APP_ENV=local-test` without real secrets.
- Confirm `.env`, logs, and real secret files are not staged for commit.
- Confirm rollback owner and deploy owner are known before any actual deploy.

Render-specific pre-deploy checks:

- Confirm Render service type is Web Service.
- Confirm Render runtime is Node.js.
- Confirm Render branch is `main`.
- Confirm Render build command is `npm ci && npx prisma generate`.
- Confirm Render start command is `npm start`.
- Confirm Render health check path is `/api/health`.
- Confirm all real ENV values are stored in Render Environment/Secrets only.
- Confirm no real secret value is committed in repo files.

## Render Deploy Checklist

Before deploy:

- Confirm Render account/service owner, deploy owner, and rollback owner.
- Confirm staging domain and staging PostgreSQL are ready and non-production.
- Confirm `DATABASE_URL` is a dedicated staging/test database and exists only in Render Environment/Secrets.
- Confirm provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
- Run `npm run check` and `npm run staging:preflight` locally.
- Run secret scan over changed files before handoff.

During deploy:

- Deploy Render Web Service from branch `main`.
- Use build command `npm ci && npx prisma generate`.
- Use start command `npm start`.
- Use health check path `/api/health`.
- Do not paste secrets into deploy logs, comments, docs, screenshots, or chat.
- Do not run live provider/payment/bank/SMS/Slip OCR actions.

After deploy:

- Confirm the Render service reaches healthy state.
- Confirm `GET /api/health` returns `success: true`, `data.ok: true`, and boolean `data.databaseConnected`.
- Confirm external mode labels are `mock`, `sandbox`, or `disabled`.
- Run staging preflight and staging smoke against the Render staging API.
- Run guarded DB migration, demo seed if needed, DB check, and UAT smoke before UAT handoff.

Smoke command template:

```cmd
set BASE_URL=https://<render-staging-domain>/api
npm run staging:preflight
npm run smoke:staging
npm run staging:db:check
npm run smoke:staging-uat
```

Rollback:

- Roll back deployment through the Render dashboard.
- Disable the service immediately if a secret leak is suspected.
- Rotate any exposed secret.
- Rerun `/api/health`, `npm run staging:preflight`, and `npm run smoke:staging` after rollback.

## Staging DB Migration Steps

Run migrations only after the staging database target has been verified without printing the full URL.

1. Set staging env values in the hosting platform or a safe shell.
2. Confirm `NODE_ENV=staging`.
3. Confirm all provider modes are `mock` or `sandbox`.
4. Run the guarded migration command:

```bash
npm run db:migrate:staging
```

Do not run raw `npx prisma migrate deploy` for staging from a local checkout. The guarded command runs `src/db-safety-tests/dbSafetyGuard.js` before Prisma deploys migrations and accepts only staging/test DB targets and `mock`, `sandbox`, or `disabled` external modes. `NODE_ENV=production` is acceptable on Render only when `APP_ENV=staging` and the DB target is non-production.

Stop immediately if the guard blocks. Do not bypass the guard and do not switch to production database credentials.

## Staging Seed Steps

Seed only after migrations pass and the database is confirmed as staging/test.

```bash
npm run staging:db:seed
```

The seed is intended for local/staging/test mock data. Do not seed production. For `APP_ENV=staging`, set staging-only demo admin/member passwords in the platform secret manager or ignored shell; never write them into docs/log/chat. See `docs/DEMO_SEED.md` for the seed runbook, verification checks, safe reset rules, and mock data list.

After seed, verify readiness:

```bash
npm run staging:db:check
```

## Health Check Steps

After the backend starts on staging:

```bash
curl <STAGING_API_BASE_URL>/api/health
```

Expected result:

- HTTP `200`.
- JSON response with `success: true`.
- `data.ok` is `true`.
- `data.status` is `ok`.
- `data.databaseConnected` is a boolean.
- `data.externalModes` shows safe mode labels only: `mock`, `sandbox`, or `disabled`.
- No database URL, JWT, API key, token, password, provider secret, or raw authorization header appears in the response or logs.

## Render GO / NO-GO Criteria

GO is allowed only when all items are true:

- Staging DB is separate from production.
- ENV values are stored in Render Environment/Secrets.
- `/api/health` returns `ok: true`.
- `databaseConnected` is a boolean.
- Provider/payment/bank/SMS/Slip OCR modes are not live.
- `npm run staging:preflight` passes.
- `npm run smoke:staging` passes.
- `npm run staging:db:check` passes.
- `npm run smoke:staging-uat` passes.

NO-GO if any item is true:

- Staging uses production DB, a production clone, or a production read replica.
- Any provider/payment/bank/SMS/Slip OCR mode is live.
- Any secret leaks in response, log, docs, screenshots, tickets, commits, pull requests, or chat.
- `/api/health` fails or returns an unsafe contract.
- `npm run staging:preflight` fails.
- `npm run smoke:staging` fails.
- `npm run staging:db:check` fails.
- `npm run smoke:staging-uat` fails.

## Smoke Testing Steps

Use `docs/STAGING_SMOKE.md` for the staging smoke boundary and command plan.

Minimum staging smoke order:

1. Confirm `BASE_URL` or `PUBLIC_API_BASE_URL` points to the staging API, not production.
2. Confirm staging uses a staging/test PostgreSQL database only.
3. Confirm provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
4. Run `GET /api/health`.
5. Run local static checks with `npm run check`.
6. Run `npm run staging:preflight`.
7. Run `npm run smoke:staging` with `BASE_URL` set to the approved staging API.
8. Run controlled DB-backed staging smoke only after env values and backend access are approved.

Current DB-backed smoke commands are not run in GitHub Actions because they require a running API, safe PostgreSQL target, and staging/local fixtures.

Do not run real-money UAT as part of staging smoke.

Safe staging command example:

```powershell
$env:BASE_URL = "https://your-staging-url.example/api"
npm run staging:preflight
npm run smoke:staging
npm run staging:db:check
npm run smoke:staging-uat
npm run smoke:core-api
npm run smoke:admin-work-schedule
```

Use the same `BASE_URL` only after confirming it is a staging/test URL. Do not paste real secrets into the shell transcript or smoke report.

## Deploy Dry-Run Checklist

This phase does not deploy. Use these commands only as a local or staging-readiness checklist:

```bash
npm run check
npm run staging:preflight
```

After a real staging service exists, set a placeholder-form command in the operator runbook and run smoke:

```powershell
$env:BASE_URL = "https://<staging-domain>/api"
npm run staging:preflight
npm run smoke:staging
```

Do not run a platform deploy command from this phase. Do not paste actual secret values into command history, docs, logs, screenshots, or chat.

## Rollback Checklist

- Revert the backend service to the previous known-good image, release, or commit.
- For Render, roll back to the previous successful deployment through the Render dashboard.
- Disable the Render service if a secret leak is found or suspected.
- Rotate any secret that leaked before re-enabling the service.
- Keep the staging database separate from production; do not point staging at production as a rollback shortcut.
- Revert provider modes to `mock` if any sandbox setting causes unexpected behavior.
- Stop any worker, cron, webhook replay, or queue consumer that was part of the staging test.
- Capture failing health check, app log, migration status, and smoke command output without secrets.
- Confirm no wallet, deposit, withdrawal, or provider data correction is needed.
- Rerun health and smoke after rollback.
- Document the rollback decision, owner, timestamp, and final staging state.

## Logs Checklist

- Confirm platform logs do not print `DATABASE_URL`.
- Confirm logs do not print `Authorization`, bearer tokens, JWTs, passwords, provider secrets, API keys, callback secrets, or raw provider payloads.
- Confirm error responses do not include stack traces in staging handoff output.
- Confirm admin logs exist for tested admin actions.
- Confirm log retention and access are restricted to staging operators.
- Save only non-secret excerpts when reporting issues.

## Security Checklist

- Use platform secret manager or ignored local `.env` only.
- Use a staging-only `JWT_SECRET`.
- Use a staging-only `LOCAL_ADMIN_PASSWORD`.
- Use explicit `CORS_ORIGIN`; do not use wildcard origins.
- Keep provider modes as `mock` or approved `sandbox`.
- Keep provider API keys empty in mock mode.
- Do not connect live bank, payment, game provider, SMS, or Slip OCR services.
- Do not expose Prisma Studio or database admin tools publicly.
- Do not grant staging database access to production service accounts.
- Run secret scans before handoff.

## Secret Rotation Checklist

- Rotate any staging secret that was pasted, printed, committed, screenshotted, or shared outside the approved secret store.
- Rotate staging `JWT_SECRET` before production handoff.
- Rotate staging admin password after shared UAT sessions.
- Rotate sandbox provider credentials before any controlled-live preparation.
- Remove unused staging env keys after provider tests.
- Record rotation owner, date, affected service, and confirmation without recording secret values.

## Deploy Blockers

Do not deploy until the user provides and confirms:

- Staging platform.
- Staging database URL through a secret channel or platform env manager.
- Staging domain.
- Required staging env values.
- Deploy credentials or platform access.
- Rollback owner and deploy owner.

Do not proceed with live providers, production database, production credentials, real bank rails, real payment rails, or real-money transfer from this guide.
