# Staging and UAT Boundary Runbook

This runbook defines the boundary between local smoke tests, staging checks, controlled live testing, and production operation. It is a safety document only. It does not enable real providers, real bank rails, real payment rails, auto transfer, or production database access.

Never paste real tokens, passwords, API keys, provider secrets, callback secrets, or real database URLs into this document, commit history, logs, issue trackers, tickets, screenshots, or chat output.

## Environment Levels

| Level | Purpose | Database | Provider modes | Money movement |
| --- | --- | --- | --- | --- |
| `local` | Developer workstation checks and local smoke tests | Local PostgreSQL only | `mock` only, or `sandbox` when explicitly needed | No real money |
| `staging` | Hosted non-production verification | Dedicated staging/test PostgreSQL only | `mock` or provider sandbox only | No real money |
| `controlled-live` | Small, manually approved real-provider proof after staging approval | Dedicated non-production or approved controlled-live database, never production by accident | One approved live provider line at a time | Very small test amounts only |
| `production` | Real customer operation | Production PostgreSQL only | Approved production provider modes | Real money with production controls |

## Boundary Rules

- Local smoke tests are allowed only against `local`, `staging`, or `test` targets.
- Production databases, production clones, production read replicas, and production-like database names or hosts are forbidden for local smoke, seed, and DB-backed safety flows.
- Provider live mode is forbidden in smoke. Game, payment, bank statement, SMS, and Slip OCR modes must remain unset, `mock`, `sandbox`, or `disabled`.
- Demo seed is allowed only for local/staging/test use and must never run against production.
- Production migration, seed, smoke, and provider integration commands must not be run from a local checkout.
- Auto transfer must stay disabled before any controlled-live test.
- A separate test bank account and separate test provider accounts must be used for controlled-live. Do not reuse operational production settlement accounts.
- Controlled-live testing must use a very small amount, agreed before the test, and must stay within daily and per-transaction limits.
- No real token, password, provider secret, API key, callback secret, or real database URL may be committed, logged, or pasted into docs.

## Existing Guard Coverage

- `prisma/seed.js` blocks missing or non-PostgreSQL database targets, production-like target markers, non-local targets without local/staging/test markers, and `NODE_ENV=production`.
- `src/db-safety-tests/dbSafetyGuard.js` blocks `NODE_ENV=production`, production-like database targets, database targets without explicit staging/test markers, and provider modes outside `mock`, `sandbox`, or `disabled`.
- `src/local-smoke-tests/stagingPreflight.js` checks `APP_ENV=staging` or `local-test`, blocks production-like database/API targets, blocks live external modes, validates the safe health contract, and scans health responses or the local dry-run fixture for secret leaks.
- `src/local-smoke-tests/stagingSmoke.js` requires `BASE_URL`, blocks production-like API hosts, checks `GET /api/health`, verifies external modes are `mock`, `sandbox`, or `disabled`, calls admin auth as a negative leak check, and scans responses for secret-shaped values.
- `src/staging-scripts/stagingDbCheck.js` connects to a confirmed staging/test PostgreSQL target, verifies required schema tables, verifies demo site/admin/member fixtures, and prints only safe labels/counts.
- `src/staging-scripts/stagingDbSeed.js` runs the demo seed behind the staging safety guard. It requires a staging-only admin password env for `APP_ENV=staging` and never prints password values.
- `src/staging-scripts/stagingUatSmoke.js` targets the Render staging API by default, skips safely with exit `0` when staging demo admin password env is absent, verifies health/database/modes when env is present, checks admin auth leak behavior, and reads admin schedule/audit/security endpoints.
- `src/local-smoke-tests/adminAuditSecuritySmoke.js` checks the audit/security report UI contract and API responses against local/staging/test targets only, including permission guard, filters, empty responses, masked IP, omitted raw user-agent, and response leak scan.
- `src/local-smoke-tests/runAllLocalSmoke.js` blocks unsafe `NODE_ENV`, missing required local credentials, unsafe database targets, production-like API base URLs, embedded URL credentials, and provider modes outside `mock` or `sandbox` before running the smoke suite.
- Individual local smoke scripts also perform their own safety checks for production-like database/API targets and non-mock provider modes before creating fixtures or calling API flows.

## Staging Checklist

- Confirm the target environment is `staging` or `test`, not production.
- Confirm `NODE_ENV` and `APP_ENV` are explicit staging/test labels.
- Confirm the database is a dedicated staging/test PostgreSQL instance and not a production clone or read replica.
- Confirm the database host, database name, or username includes an explicit staging/test marker.
- Confirm provider/payment/bank modes are unset, `mock`, `sandbox`, or `disabled`; live is forbidden.
- Confirm no live provider credentials are present in the staging shell, hosting dashboard, CI variables, or `.env` file.
- Confirm CORS and public base URL values point only at staging frontend/admin/API hosts.
- Confirm `GET /api/health` returns `success: true`, `data.ok: true`, boolean `data.databaseConnected`, and safe external mode labels without secrets.
- Confirm `npm run check` passes before any smoke command.
- Confirm `BASE_URL` is set to the staging API and `npm run smoke:staging` passes.
- Confirm `npm run smoke:admin-work-schedule` passes before validating admin schedule UI behavior in staging.
- Confirm `npm run smoke:admin-work-schedule-ui` passes before UAT on `/admin/work-schedules`.
- Confirm `npm run smoke:admin-audit-security` passes before UAT on `/admin/audit-security` when a safe DB-backed staging/local target is available.
- Confirm local smoke commands are run only after the backend is pointed at the approved safe target.
- Confirm logs redact database URLs, JWTs, tokens, API keys, callback secrets, provider payloads, passwords, and raw authorization headers.
- Confirm `npm run staging:preflight` passes before deploy handoff and again after deploy when `BASE_URL` points at staging.
- Confirm migrations ran through `npm run db:migrate:staging`, not raw Prisma deploy, after the staging DB target was confirmed.
- Confirm demo seed ran through `npm run staging:db:seed` only if demo data was missing.
- Confirm `npm run staging:db:check` passes with required schema and demo fixtures.
- Confirm `npm run smoke:staging-uat` passes against the Render staging API when staging demo admin env is present. Without that env, the command must return the documented SKIP-SAFE output and exit `0`.

## UAT Handoff Checklist

Use this checklist when handing staging to testers. It authorizes staging UAT only, with no production database, no live provider/payment/bank/SMS/Slip OCR mode, and no real-money flow.

- Staging URL: `https://fling-stukuto-staging-api.onrender.com`.
- API base URL for smoke commands: `https://fling-stukuto-staging-api.onrender.com/api`.
- Health check path: `GET /api/health`.
- Health check must show `success: true`, `data.ok: true`, `data.databaseConnected: true`, and external modes only as `mock`, `sandbox`, or `disabled`.
- Smoke commands before handoff:
  - `npm run check`
  - `npm run staging:preflight`
  - `npm run staging:db:check`
  - `npm run smoke:staging`
  - `npm run smoke:staging-uat`
- Login test scope: staging demo admin/member only, with credentials supplied through the secret manager or another approved out-of-repo channel.
- Safe negative login test: invalid admin login must return a controlled JSON failure such as `401`/auth failure and must not return `500`, token values, password hints, stack traces, or secret-shaped data.
- Admin schedule UI scope: testers may verify schedule list/read/update behavior, emergency override behavior, schedule-blocked login behavior, and masked audit history for staging demo admins only.
- Audit/security UI scope: testers may verify audit log filters, security event filters, summary counts, empty states, masked IP values, and safe detail modals only.
- Rollback condition: stop handoff and roll back or disable staging access if health fails, DB disconnects, smoke fails, an invalid login returns `500`, any secret-shaped value appears, any external mode is `live`, or any real-money/provider/bank path is reachable.
- NO live money/provider mode: game provider, payment, bank statement, SMS, and Slip OCR must stay `mock`, `sandbox`, or `disabled`; live mode is not approved for this handoff.
- Demo credentials must live in Render Environment/Secrets, a password manager, or another approved secret manager only. Do not write them into docs, logs, commits, screenshots, issue trackers, or chat.
- If any credential was exposed outside the approved secret channel, rotate it before tester handoff.
- Do not screenshot Render ENV, database settings, shell output, request headers, or any page that shows raw secret values.

## Render Staging UAT Flow

Use this flow only after the Render Web Service, Render staging PostgreSQL database, and Render dashboard env values are configured for mock/sandbox staging.

1. Open the Render staging URL in a browser and confirm it is the staging service, not production.
2. Check `GET /api/health` at `https://<render-staging-domain>/api/health`.
3. Run staging preflight from a safe local shell:

```powershell
$env:BASE_URL = "https://<render-staging-domain>/api"
npm run staging:preflight
```

4. Run UAT smoke:

```powershell
npm run smoke:staging-uat
```

5. Check Lucky Wheel member config through `GET /api/member/wheel/config` using staging member auth only.
6. Check Lucky Wheel spin through `POST /api/member/wheel/spin` with only `campaignId`; this must stay mock/sandbox and backend-selected.
7. Check member wheel history and my rewards through `/api/member/wheel/history` and `/api/member/wheel/my-rewards`.
8. Check admin Lucky Wheel config, rewards, spins, reports, and audit through staging admin auth only.
9. Confirm no real money movement, no real payout, and no production ledger action occurred.
10. Confirm game provider, payment, bank statement, SMS, and Slip OCR are not live.
11. Run the local secret-shaped scan before reporting handoff results.
12. Record the Safe CI Run ID, commit hash, Render deploy ID or timestamp, and staging URL. Do not record secret values, DB URLs, request headers, passwords, tokens, or provider credentials.

Stop UAT immediately if health fails, `databaseConnected` is not `true`, an external mode is `live`, a response leaks secret-shaped data, or any real-money/provider/bank path becomes reachable.

## Admin Lucky Wheel UAT Checklist

Use this checklist only with approved staging/mock admin and member accounts. Do not use production DB, live provider/payment/bank/SMS/Slip OCR modes, real money, or real payout flows.

### Lucky Wheel Runtime UAT Checklist

- Preflight safety: run `npm run staging:preflight` with `BASE_URL` pointed at the staging API only.
- ENV boundary: `NODE_ENV` must be non-production for this mock/sandbox preflight; `APP_ENV` must be `staging` or another explicit staging/test label; `STAGING_MODE` must be `mock`, `sandbox`, or `staging`.
- External modes: game provider, payment, bank statement, SMS, and Slip OCR must be `mock`, `sandbox`, or `disabled`; `live` is not approved.
- Member config check: `GET /api/member/wheel/config` must return `campaignId`, cost fields, remaining spin data, and a public `rewards` array without probability or stock internals.
- Member spin check: `POST /api/member/wheel/spin` must send only `campaignId`; response must include backend-selected `spinId`, `rewardId`, `prizeIndex`, and reward summary.
- Unsafe spin payload check: requests containing frontend-selected `rewardId`, `prizeIndex`, probability, or reward value fields must fail safely and must not let the client choose a prize.
- History check: `GET /api/member/wheel/history` must return sanitized rows or an empty array, with no secret-shaped values or raw internal errors.
- My rewards check: `GET /api/member/wheel/my-rewards` must return sanitized rows or an empty array; no real payout or claim payout is part of this phase.
- Admin campaign config check: `GET /api/admin/wheel/config` must show the campaign config and summary through staging admin auth only.
- Admin rewards check: admin config must expose reward management fields for staging/mock administration only; reward writes still require `reason`.
- Admin spin history check: `GET /api/admin/wheel/spins` must return sanitized rows with masked IP values.
- Admin reports check: the Admin Lucky Wheel reports tab must derive only from admin config/spins and must show `0`, `0 %`, or `ไม่พบข้อมูล` instead of `NaN` or `undefined`.
- Audit history check: audit history must come from the existing admin audit endpoint and show safe action, actor, site code, reason, before/after, and created time summaries only.
- Secret leak check: responses, UI details, docs, logs, and smoke output must not expose raw tokens, auth headers, passwords, provider secrets, database URLs, raw stack traces, or raw unmasked IPs.
- Rollback note: if any Lucky Wheel check fails, disable staging tester access or roll back the staging deploy; keep provider modes mock/sandbox and do not switch to production DB as a workaround.

### Lucky Wheel Staging Preflight Checklist

- Member wheel config: verify `GET /api/member/wheel/config` returns public campaign/reward fields only.
- Member wheel spin: verify `POST /api/member/wheel/spin` sends only `campaignId` and receives a backend-selected result.
- Member wheel history: verify `GET /api/member/wheel/history` returns sanitized rows or an empty array.
- Member my rewards: verify `GET /api/member/wheel/my-rewards` returns sanitized pending/claimed/expired rows or an empty array.
- Admin wheel campaign config: verify `GET /api/admin/wheel/config` and campaign edits require staging admin auth plus non-empty `reason`.
- Admin rewards: verify create/edit reward uses staging/mock data only and rejects empty `reason`.
- Admin spin history: verify `GET /api/admin/wheel/spins` returns sanitized rows and masked IP values only.
- Admin reports: verify reports render zero states safely and never show `NaN`, `undefined`, or real-money payout data.
- Audit history: verify wheel audit rows show safe action, actor, site code, reason, before/after summaries, and created time only.
- Secret leak scan: verify smoke output, API responses, docs, logs, and UI details do not expose DB URLs, tokens, passwords, auth headers, provider secrets, raw stacks, or raw IPs.
- Rollback note: if any item fails, stop UAT, keep external modes mock/sandbox/disabled, disable staging tester access or roll back the staging deploy, and never point staging at production DB.

- Open `/admin/lucky-wheel/` and confirm the page shows `Staging / Mock Admin Console` and `No real money / no live provider`.
- Confirm Campaign settings loads through `GET /api/admin/wheel/config` or shows a safe error state.
- Confirm Save campaign without `reason` fails before API submission.
- Confirm Save campaign with `reason` uses only approved staging/mock data and writes audit context.
- Confirm Create/Edit reward opens the modal and rejects empty `reason`.
- Confirm reward payloads do not include `stockUsed`, `rewardId`, `prizeIndex`, or member spin result fields.
- Confirm Spin history loads sanitized rows or `ไม่พบข้อมูล`, shows masked IP only, and detail modal does not expose raw IP, user-agent, token, password, secret, authorization header, or database URL.
- Confirm Reports derive from admin config/spins only and never show `NaN` or `undefined`; zero-spin state must render `0`, `0 %`, `ไม่จำกัด`, or `ไม่พบข้อมูล`.
- Confirm Audit history shows existing wheel actions from `/api/admin/audit-logs` or the safe placeholder when the audit endpoint is unavailable.
- Confirm `401`, `403`, and `404` responses show the safe Admin Lucky Wheel messages documented in `docs/API.md`.
- Confirm the member wheel API and local `lucky-wheel-game` bridge remain backend-selected and reject frontend-submitted reward result fields.

## Staging DB Schema and Demo Seed Verification

This phase is for UAT readiness only. It does not authorize production DB access, live provider mode, live bank/payment rails, SMS sending, Slip OCR live calls, or real-money transactions.

Run migrations only after the staging DB is confirmed in the platform secret manager or a safe ignored shell:

```bash
npm run db:migrate:staging
```

Seed only if the DB check reports missing demo data. Use staging-only demo values in env and do not print them:

```bash
npm run staging:db:seed
```

Verify schema and fixtures:

```bash
npm run staging:db:check
```

Verify hosted UAT readiness against Render:

```bash
BASE_URL=https://fling-stukuto-staging-api.onrender.com/api npm run smoke:staging-uat
```

PowerShell equivalent:

```powershell
$env:BASE_URL = "https://fling-stukuto-staging-api.onrender.com/api"
npm run smoke:staging-uat
```

Required env values must live only in Render Environment/Secrets or an ignored local shell. Do not commit or paste `DATABASE_URL`, admin password, JWT secret, tokens, provider keys, callback secrets, or bearer values.

## UAT GO / NO-GO

GO for staging UAT only when all items are true:

- `/api/health` returns HTTP `200`, `APP_ENV=staging`, `databaseConnected=true`, and all external modes are `mock`, `sandbox`, or `disabled`.
- `npm run db:migrate:staging` completed against staging/test DB only.
- `npm run staging:db:check` passes.
- `npm run smoke:staging` passes.
- `npm run smoke:staging-uat` passes with staging demo admin env present. A local SKIP-SAFE result is acceptable only before credentialed UAT handoff.
- Demo admin and demo member exist with staging-only credentials known through a secure channel, not docs/log/chat.
- No secret-shaped values appear in responses, logs, docs, commits, screenshots, or chat.

NO-GO if any item is true:

- Database target is production, a production clone, a production read replica, or production-like by host/name/user.
- Any provider/payment/bank/SMS/Slip OCR mode is `live`.
- Demo admin is missing or cannot authenticate with the staging-only password env.
- Admin work schedule, audit, or security endpoints fail permission/read checks.
- Any secret leaks. Rotate immediately before retrying.

## Real-Money UAT Checklist

Controlled-live testing is not part of local smoke. Use this checklist only after staging has passed and manual approval has been recorded.

- Confirm the exact provider, route, and feature under test.
- Confirm only one live provider line is enabled for the test.
- Confirm the test uses a separate test account and separate test bank account.
- Confirm auto transfer is disabled.
- Confirm daily and per-transaction limits are configured before the test.
- Confirm the test amount is very small and approved in writing before execution.
- Confirm the member account, admin account, provider account, and bank account are test-only.
- Confirm the expected ledger, deposit, withdrawal, callback, and admin log records before running.
- Confirm no production customer account can be selected or affected.
- Confirm no uncontrolled retry, cron, queue, webhook replay, or auto-settlement job can multiply the transaction.

## Manual Approval Checklist

- Approval names the environment level: `staging` or `controlled-live`.
- Approval names the database target by non-secret label only.
- Approval names the provider mode and provider account by non-secret label only.
- Approval names the maximum daily amount and maximum per-transaction amount.
- Approval names the exact operator, reviewer, and rollback owner.
- Approval confirms auto transfer is disabled.
- Approval confirms real secrets were not pasted into the approval record.
- Approval confirms no production database, production customer balance, or production provider account is in scope.

## Audit Log Checklist

- Record who approved the test, who executed it, and when it started and ended.
- Record the non-secret environment label and provider label.
- Record the test amount, currency, and transaction reference.
- Record member/admin test account identifiers only when they are non-sensitive.
- Verify admin logs exist for manual deposit, withdrawal, bank account, provider config, and status changes touched by the test.
- Verify admin work schedule audit history exists for schedule update, enable/disable, emergency override, and schedule-blocked admin login when those controls are touched.
- Verify the admin work schedule UI shows masked IP values only and does not show raw user-agent strings, tokens, passwords, secrets, or database URLs.
- Verify the admin audit/security report lists role, permission, schedule, emergency override, login guard, and security-sensitive events through safe endpoints only.
- Verify the admin audit/security report detail modal shows safe metadata only, masks IP values, omits raw user-agent, and does not show session, token, password, secret, or database URL content.
- Verify provider callbacks or polling results are correlated by reference and are idempotent.
- Verify logs do not contain raw tokens, passwords, API keys, callback secrets, authorization headers, or real database URLs.

## Rollback Checklist

- Disable the tested live provider line.
- Keep auto transfer disabled.
- Revert provider mode to `mock` or `sandbox` unless production launch has a separate approval.
- Stop any worker, cron, webhook replay, or queue consumer involved in the test if behavior is unexpected.
- Reconcile the small test transaction manually with the test bank/provider account.
- Capture the final ledger, deposit, withdrawal, callback, and admin log state.
- Document whether data correction is required and who approved it.
- Do not delete audit records to hide a failed test.

## Secret Handling Checklist

- Use secret managers, hosting environment variables, or local ignored `.env` files only.
- Never commit `.env`, real database URLs, JWT secrets, provider API keys, callback secrets, passwords, or bearer tokens.
- Never paste secrets into docs, pull requests, issue trackers, screenshots, terminal transcripts, or chat.
- Use placeholders such as `<STAGING_DATABASE_URL>` or `<PROVIDER_SANDBOX_KEY>` only when a shape is needed.
- Rotate any secret immediately if it is printed, committed, screenshotted, or shared outside the approved secret store.
- Confirm secret leak scans pass before handoff.
