# Staging Deploy Guide

This guide prepares PG77-real-core for a safe staging deployment. It does not authorize a real deploy, production database access, live provider mode, real bank rails, real payment rails, or real-money transfer.

Do not paste real database URLs, passwords, tokens, API keys, provider secrets, callback secrets, bearer tokens, or live provider credentials into this file, commits, logs, pull requests, issue trackers, screenshots, or chat output.

## Supported Staging Platforms

PG77-real-core is a Node.js/Express backend API. It must run on backend hosting that supports a long-running Node.js process and outbound PostgreSQL connectivity.

Supported platform options:

- Render web service plus Render PostgreSQL or another dedicated staging PostgreSQL.
- Railway service plus Railway PostgreSQL or another dedicated staging PostgreSQL.
- Fly.io app plus managed PostgreSQL reachable from the app.
- VPS or VM with Node.js 18.18+ and a dedicated staging PostgreSQL.
- Docker-ready host if the image runs `npm run start`, has Node.js 18.18+, receives environment variables from a secret store, and connects only to staging PostgreSQL.

Do not deploy this backend as a static site. Do not use Netlify static hosting for the API process.

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

Required staging values:

- `NODE_ENV` must be `staging`.
- `APP_ENV` must be `staging` or another explicit non-production staging/test label.
- `DATABASE_URL` must target a dedicated staging/test PostgreSQL database.
- `JWT_SECRET`, session secret values, and admin passwords must be generated for staging and set only in the platform secret manager.
- `CORS_ORIGIN` must be the staging frontend/admin origin list, not `*`.
- `PUBLIC_API_BASE_URL` must be the staging API base URL.
- Provider/payment/bank/SMS/Slip OCR modes must be `mock`, approved `sandbox`, or `disabled`.
- Provider API base URLs and credentials must remain empty in mock mode.
- No live provider, payment, bank, SMS, or Slip OCR credential may be present in staging preparation.

## Pre-Deploy Checklist

- Confirm the target platform and staging domain.
- Confirm the staging PostgreSQL database is not production and not a production clone.
- Confirm the staging database name, host label, or user label contains a staging/test marker.
- Confirm no live provider credentials are present in platform env values.
- Confirm provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
- Confirm `CORS_ORIGIN` lists only staging frontend/admin origins and `PUBLIC_API_BASE_URL` points at the staging API.
- Confirm `GET /api/health` returns the safe health contract before any DB-backed smoke.
- Confirm `npm run check` passes locally before deployment handoff.
- Confirm `.env`, logs, and real secret files are not staged for commit.
- Confirm rollback owner and deploy owner are known before any actual deploy.

## Staging DB Migration Steps

Run migrations only after the staging database target has been verified without printing the full URL.

1. Set staging env values in the hosting platform or a safe shell.
2. Confirm `NODE_ENV=staging`.
3. Confirm all provider modes are `mock` or `sandbox`.
4. Run the guarded migration command:

```bash
npm run db:migrate:staging
```

Do not run raw `npx prisma migrate deploy` for staging from a local checkout. The guarded command runs `src/db-safety-tests/dbSafetyGuard.js` before Prisma deploys migrations and accepts only `mock`, `sandbox`, or `disabled` external modes.

Stop immediately if the guard blocks. Do not bypass the guard and do not switch to production database credentials.

## Staging Seed Steps

Seed only after migrations pass and the database is confirmed as staging/test.

```bash
npm run seed
```

The seed is intended for local/staging/test mock data. Do not seed production. See `docs/DEMO_SEED.md` for the seed runbook, verification checks, safe reset rules, and mock data list.

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

## Smoke Testing Steps

Use `docs/STAGING_SMOKE.md` for the staging smoke boundary and command plan.

Minimum staging smoke order:

1. Confirm `BASE_URL` or `PUBLIC_API_BASE_URL` points to the staging API, not production.
2. Confirm staging uses a staging/test PostgreSQL database only.
3. Confirm provider/payment/bank/SMS/Slip OCR modes are `mock`, `sandbox`, or `disabled`.
4. Run `GET /api/health`.
5. Run local static checks with `npm run check`.
6. Run `npm run smoke:staging` with `BASE_URL` set to the approved staging API.
7. Run controlled DB-backed staging smoke only after env values and backend access are approved.

Current DB-backed smoke commands are not run in GitHub Actions because they require a running API, safe PostgreSQL target, and staging/local fixtures.

Do not run real-money UAT as part of staging smoke.

Safe staging command example:

```powershell
$env:BASE_URL = "https://your-staging-url.example/api"
npm run smoke:staging
npm run smoke:core-api
npm run smoke:admin-work-schedule
```

Use the same `BASE_URL` only after confirming it is a staging/test URL. Do not paste real secrets into the shell transcript or smoke report.

## Rollback Checklist

- Revert the backend service to the previous known-good image, release, or commit.
- Keep the staging database separate from production; do not point staging at production as a rollback shortcut.
- Revert provider modes to `mock` if any sandbox setting causes unexpected behavior.
- Stop any worker, cron, webhook replay, or queue consumer that was part of the staging test.
- Capture failing health check, app log, migration status, and smoke command output without secrets.
- Confirm no wallet, deposit, withdrawal, or provider data correction is needed.
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
