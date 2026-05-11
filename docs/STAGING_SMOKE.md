# Staging Smoke Guide

This guide defines the safe smoke boundary for a hosted staging backend. It does not enable real-money UAT, production database access, live provider mode, real provider callbacks, real payment rails, or real bank rails.

## Required Confirmation Before Smoke

Before running any staging smoke command, confirm all of the following without printing secret values:

- `BASE_URL` or `PUBLIC_API_BASE_URL` is the staging API URL, not production.
- `DATABASE_URL` targets a dedicated staging/test PostgreSQL database.
- `NODE_ENV` is a safe runtime label. Render may use `production`, but `APP_ENV` must still be `staging`.
- `APP_ENV` is `staging` or another explicit non-production staging/test label.
- `GAME_PROVIDER_MODE` is `mock`, approved `sandbox`, or `disabled`.
- `PAYMENT_PROVIDER_MODE` is `mock`, approved `sandbox`, or `disabled`.
- `BANK_STATEMENT_MODE` is `mock`, approved `sandbox`, or `disabled`.
- `SMS_PROVIDER_MODE` is `mock`, approved `sandbox`, or `disabled`.
- `SLIP_OCR_MODE` is `mock`, approved `sandbox`, or `disabled`.
- `LOCAL_ADMIN_PASSWORD` is set to a staging-only value.
- No live provider credentials are present.

Stop if any value points at production, live provider mode, live bank rails, live payment rails, or a real customer environment.

## Minimum Smoke Order

Start with the lowest-risk checks:

```bash
npm run check
npm run staging:preflight
curl <STAGING_API_BASE_URL>/api/health
BASE_URL=<STAGING_API_BASE_URL>/api npm run smoke:staging
BASE_URL=<STAGING_API_BASE_URL>/api npm run smoke:staging-uat
```

Then verify:

- Health response returns HTTP `200`.
- Health response is JSON.
- Health response has `success: true`, `data.ok: true`, and boolean `data.databaseConnected`.
- Health response shows only safe external mode labels: `mock`, `sandbox`, or `disabled`.
- Staging preflight passes without printing raw `DATABASE_URL`, JWT, API keys, tokens, passwords, or provider secrets.
- The staging smoke admin-auth negative check returns a failed JSON payload without leaking secrets.
- The staging UAT smoke can authenticate the staging demo admin using env-only credentials and can read admin work schedule, audit, and security endpoints.
- No secret-shaped value appears in response or logs.
- Staging logs show normal startup without printing env values.

## Controlled Staging Smoke

Run DB-backed smoke only after the staging backend is running and the staging database is approved.

Use staging URL variables only:

```bash
BASE_URL=<STAGING_API_BASE_URL>/api
PUBLIC_API_BASE_URL=<STAGING_API_BASE_URL>
```

Recommended controlled order:

```bash
npm run staging:preflight
npm run smoke:staging
npm run staging:db:check
npm run smoke:staging-uat
npm run smoke:core-api
npm run smoke:admin-work-schedule
npm run smoke:admin-reports-config
npm run smoke:bank-module
npm run smoke:promotion-claim
npm run smoke:financial-negative
npm run smoke:game-transfer
npm run smoke:money-flow
```

Run `npm run smoke:all-local` only if the runner guard accepts the staging/test target and all required env values are set. If the guard blocks, do not bypass it.

## GitHub Actions Boundary

Current smoke scripts are DB-backed and require a running API plus a safe local/staging/test PostgreSQL database. For that reason, GitHub Actions Safe CI runs syntax/static checks and secret-shaped scans, but it does not run DB-backed smoke commands.

Safe CI coverage remains:

- `npm ci`
- `npx prisma validate`
- `npx prisma generate`
- `npm run check`
- `npm run staging:preflight` in `APP_ENV=local-test` dry-run mode
- direct smoke syntax checks
- secret-shaped value scan

## Real-Money Boundary

Staging smoke must not:

- Use production database.
- Use production customer data.
- Enable live game provider mode.
- Enable live payment provider mode.
- Enable live bank statement mode.
- Connect real SMS or Slip OCR services.
- Approve real customer deposits.
- Mark real withdrawals as paid.
- Run auto transfer or auto settlement.

Real-money UAT is a separate controlled-live process and requires explicit written approval, separate test accounts, separate test bank/provider accounts, tiny pre-approved limits, callback verification, rollback owner, and audit log review. See `docs/STAGING_UAT.md`.

## Smoke Result Format

Use this result format after staging smoke:

```text
Staging smoke result:
- Target: staging URL label only
- Health: PASS/FAIL - note
- Staging smoke script: PASS/FAIL/SKIPPED - note
- Staging DB check: PASS/FAIL/SKIPPED - note
- Staging UAT smoke: PASS/FAIL/SKIPPED - note
- Staging preflight: PASS/FAIL/SKIPPED - note
- npm run check: PASS/FAIL - note
- Core API smoke: PASS/FAIL/SKIPPED - note
- Admin work schedule smoke: PASS/FAIL/SKIPPED - note
- Admin reports/config smoke: PASS/FAIL/SKIPPED - note
- Bank module smoke: PASS/FAIL/SKIPPED - note
- Promotion smoke: PASS/FAIL/SKIPPED - note
- Financial negative smoke: PASS/FAIL/SKIPPED - note
- Game transfer smoke: PASS/FAIL/SKIPPED - note
- Money-flow smoke: PASS/FAIL/SKIPPED - note
- Secret leak check: PASS/FAIL - note
- Real-money boundary: BLOCKED/APPROVED-SEPARATELY
```

Never include raw database URLs, tokens, passwords, API keys, JWTs, provider secrets, callback secrets, or authorization headers in the smoke result.
