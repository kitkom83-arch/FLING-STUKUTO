# Lucky Wheel E2E Local Runbook

## Scope

Phase Y verifies Lucky Wheel end-to-end behavior in a local-only runtime. It covers admin campaign/reward reads and writes, audit reasons, member wheel config, backend-selected spins, spin history, report summaries, and the static Admin Wheel UI contract.

## Safety Boundary

- Local or staging/test-labeled PostgreSQL only.
- No production DB, remote live DB, real money, live payout, live provider, live payment, live bank, live SMS, or live Slip OCR.
- No deploy, no commit, no push, and no Prisma migration.
- Frontend must not decide rewards. Member spin requests send only `campaignId`; backend returns `rewardId`, `prizeIndex`, and result data.
- Do not print or paste secret-shaped values, passwords, tokens, or connection strings.

## Local-Only Requirements

- Backend running against local API, normally `http://localhost:4000/api`.
- `NODE_ENV=development-local` or `NODE_ENV=test`.
- Provider/payment/bank/SMS/Slip OCR modes set to `mock` or `sandbox`.
- PostgreSQL target must be loopback or explicitly local/test/staging/sandbox labeled.

## ENV

Required for DB-backed runtime smoke:

- `DATABASE_URL`
- `JWT_SECRET`
- `LOCAL_ADMIN_USERNAME`
- `LOCAL_ADMIN_PASSWORD`
- `LOCAL_MEMBER_PASSWORD`

Optional:

- `BASE_URL` or `CORE_API_BASE_URL`
- `LOCAL_SMOKE_SITE_CODE`

## Run Steps

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\run-local-smoke.ps1
```

```powershell
npm run smoke:admin-wheel-ui
npm run smoke:admin-wheel-runtime
npm run smoke:all-local
```

## What The Smoke Checks

- Admin auth/local fixture and member demo/local fixture are available or skip safely.
- Admin reads wheel config with campaign and rewards.
- Admin campaign update requires and writes `reason`.
- Reward create/update/status writes require and write `reason`.
- Audit lookup is bounded by `dateFrom`/`dateTo` and verifies `reason` plus `metadata.reason`.
- Member reads wheel config with campaign and rewards.
- Member spin posts only `{ "campaignId": "wheel_main" }`.
- Spin response includes backend-selected `spinId`, `rewardId`, `prizeIndex`, safe reward data, and safe `remainingSpinsToday`.
- Admin spin history includes the latest backend-created spin.
- Report summary inputs calculate finite values without `NaN`, `undefined`, or `Infinity`.
- Audit history endpoint returns wheel audit rows that can render reason metadata.
- Admin Wheel UI static smoke confirms five tabs, reason fields, safe formatting, empty states, permission markers, no secret-shaped values, and no frontend prize decision markers.

## Mock/Static Items

- Admin Wheel reports are client-side summaries built from local admin wheel config, spin history, and member reward reads.
- UI smokes are static source contract checks and do not open a browser.
- Provider, payment, bank, SMS, and Slip OCR integrations remain mock/sandbox boundaries.

## Forbidden Before Production

- Do not point these smokes at production or live DB targets.
- Do not enable live payout, live provider, live payment, live bank, live SMS, or live Slip OCR.
- Do not deploy from this phase.
- Do not create Prisma migrations from this phase.
- Do not weaken auth, permission, or audit guards.
- Do not add frontend reward selection, `rewardId`, or `prizeIndex` to member spin payloads.

## Troubleshooting

- PostgreSQL service: confirm local PostgreSQL is running and reachable from `DATABASE_URL`.
- Prisma DB: run `npx prisma validate`; do not create a migration for this phase.
- `LOCAL_ADMIN_PASSWORD`: required for DB-backed admin login smoke; never print it.
- `LOCAL_MEMBER_PASSWORD`: required for demo/local member login smoke; never print it.
- `NODE_ENV development-local`: use `NODE_ENV=development-local` or `NODE_ENV=test` so safety guards do not skip or block.
- API URL: keep `BASE_URL` local/test/staging-labeled and include `/api` or let the smoke append it.
