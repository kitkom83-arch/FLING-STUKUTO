# Smoke Coverage Index

## 1. Overview

This smoke suite is for local and staging/test safety checks of the PG77-real-core backend. It verifies guarded API behavior against safe local or staging/test PostgreSQL targets and must not be used against production databases.

The smoke suite does not send real money, does not connect real provider/payment/bank rails, and does not use production credentials. Game, payment, and bank boundaries are mock, sandbox, or manual local approval only. SMS and Slip OCR remain mock placeholders.

## Current Staging UAT Result

Latest staging handoff status:

- Phase C Admin Wheel UI Manual QA + Handoff: ready for staging/manual checklist after `adminWheelUiSmoke.js`, safe runtime smoke or SKIP-SAFE, `npm run check`, and `npm run smoke:staging-uat`.
- Render staging deploy: PASS.
- `/api/health`: PASS.
- Staging DB connected: PASS with `databaseConnected=true`.
- `npm run staging:db:check`: PASS.
- `npm run staging:db:seed`: PASS.
- `npm run staging:seed-demo`: PASS when staging demo admin env is present; SKIP-SAFE when it is absent locally.
- `npm run smoke:staging`: PASS.
- `npm run smoke:staging-uat`: PASS when staging demo admin env is present; SKIP-SAFE when it is absent.
- `npm run smoke:staging-role-permission-uat`: PASS when staging demo admin env is present and safe role runtime checks complete; SKIP-SAFE when credentialed staging demo admin env is absent. Phase H requires the limited fixture env and seed so the no-permission negative, valid minimal change, restore, and audit-log sections report PASS with no fixture SKIPPED sections.
- Invalid admin login negative test: PASS, failed closed without returning `500`.
- External modes: mock/sandbox/disabled only.
- Production DB/live money/live provider/payment/bank/SMS/Slip OCR: NOT enabled.

Do not paste raw command output if it contains secrets. Demo credentials must stay in the secret manager or an approved out-of-repo channel. Rotate any credential that was exposed before handoff, and do not screenshot ENV pages that show values.

## 2. Smoke Scripts Summary

| Script | NPM command | Requires local DB? | Requires backend running? | Requires LOCAL_ADMIN_PASSWORD? | Runs in GitHub Actions? | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `moneyFlowSmoke.js` | `npm run smoke:money-flow` | Yes | Yes | Yes | Syntax check only | Manual local money-flow happy path and duplicate approval guards. |
| `coreApiSmoke.js` | `npm run smoke:core-api` | Yes | Yes | Yes | Syntax check only | Core member, wallet, promotion list, mock game launch, and admin read endpoints. |
| `financialNegativeSmoke.js` | `npm run smoke:financial-negative` | Yes | Yes | Yes | Syntax check only | Invalid money inputs, duplicate state transitions, ledger safety, and leak scans. |
| `promotionClaimSmoke.js` | `npm run smoke:promotion-claim` | Yes | Yes | No | Syntax check only | Promotion claim fixture, duplicate guard, count guards, and wallet/ledger effects. |
| `gameTransferSmoke.js` | `npm run smoke:game-transfer` | Yes | Yes | Yes | Syntax check only | Mock transfer-in/out and mock bet-history checks. |
| `adminReportsConfigSmoke.js` | `npm run smoke:admin-reports-config` | Yes | Yes | Yes | Syntax check only | Admin report endpoints and read-only site/config endpoints. |
| `adminPermissionSmoke.js` | `npm run smoke:admin-permission` | Yes | Yes | Yes | Syntax check only | Admin RBAC role/permission guard checks for owner, finance, support, graphic, viewer, unauth, and forbidden access. |
| `adminRoleManagementSmoke.js` | `npm run smoke:admin-role-management` | Yes | Yes | Yes | Syntax check only | Admin role-management checks for permission catalog, role catalog, current/target permissions, owner updates, non-owner `403`, audit log, rollback, and leak scan. |
| `adminBrowserRoutesSmoke.js` | `npm run smoke:admin-browser-routes` | No | No | No | Syntax check plus static HTTP contract | Static browser route contract for `/admin`, `/admin/roles`, `/admin-wheel`, trailing-slash aliases, JS/CSS assets, `/api/*` boundary, required UI markers, no forbidden rendered placeholders, no static secret-shaped values, no owner/super_admin bypass controls, no force reward/spin controls, and no member spin endpoint calls. |
| `adminWorkScheduleSmoke.js` | `npm run smoke:admin-work-schedule` | Yes | Yes | Yes | Syntax check only | Admin work schedule UI/API checks for schedule list/read/update, permission guards, login block/allow, emergency override, expired override, audit history, rollback, and leak scan. |
| `adminWorkScheduleUiSmoke.js` | `npm run smoke:admin-work-schedule-ui` | Yes | Yes | Yes | Syntax check only | Static admin schedule UI route/assets, owner flow, no-permission block, emergency override, masked audit history, and leak scan. |
| `adminAuditSecuritySmoke.js` | `npm run smoke:admin-audit-security` | Yes | Yes | Yes | Syntax check only | Static audit/security UI route/assets, UX markers, report endpoints, filters, permission block, empty response shape, masked IP, raw user-agent omission, and leak scan. |
| `adminWheelUiSmoke.js` | `npm run smoke:admin-wheel-ui` | No | No | No | Syntax check plus static contract | Static Admin Lucky Wheel UI source contract for `/admin-wheel` and `/admin/lucky-wheel/`, title/tabs, permission summary panel, access-denied state, disabled write-action copy, campaign summary, reward modal/table fields, Reward Claims queue fields/actions, detail/status/claim modal selectors, spin empty state, reports/audit fields, endpoint usage, reason validation, 401/403 safe handling, audit placeholder/wiring, report zero guards, rendered-copy placeholder checks, static leak-shape checks, masked IP handling, no member spin endpoint call, and no force reward/spin controls. |
| `adminWheelRuntimeSmoke.js` | `npm run smoke:admin-wheel-runtime` | Yes | Yes | Yes | Syntax check only | Admin Lucky Wheel runtime route/assets, unauth `401`, no-permission `403`, admin config/spins/member-rewards reads, member config/spin/history/my-rewards checks, claim/cancel reason validation, write audit creation, audit read sanitization, and leak scan. Skips safely when local admin/member env is not configured. |
| `wheelSmoke.js` | `npm run smoke:wheel` | Yes | Yes | Yes | Syntax check only | Lucky Wheel mock config/spin/history/rewards, missing auth, invalid campaign, backend result selection, admin reason/audit checks, stock-zero exclusion, fail-safe guards, and leak scan. Skips safely when local runtime env is missing; blocks unsafe targets. |
| `stagingPreflight.js` | `npm run staging:preflight` | No local Prisma access | Optional | No | Runs local-test dry run | Staging readiness guard for env boundary, database/API target labels, external modes, health contract, and response leak scan. |
| `stagingSmoke.js` | `npm run smoke:staging` | No local Prisma access | Yes | No | Syntax check only | Hosted staging health contract, safe external mode labels, admin auth negative leak check, and response leak scan. |
| `stagingReleaseReadinessSmoke.js` | `npm run smoke:staging-release-readiness` | No | No | No | Runs static contract | CI-safe static release readiness guard for package scripts, runbook/docs policy, rollback/incident checklist wording, release gate/full UAT/role UAT command separation, and secret-shaped value scan. It does not call staging. |
| `productionReadinessAuditSmoke.js` | `npm run smoke:production-readiness-audit` | No | No | No | Runs static contract | Phase M static guard for `docs/PRODUCTION_READINESS_GAP_AUDIT.md`, production blocker coverage, mock/sandbox boundary wording, Go/No-Go criteria, P0 checklist, recommended next phases, and secret-shaped value scan. It is a pre-production planning artifact only and does not deploy production. |
| `productionSafetyDryRunSmoke.js` | `npm run smoke:production-safety-dry-run` | No | No | No | Runs static contract | Phase N static guard for `docs/PRODUCTION_SAFETY_DRY_RUN.md`, hard safety boundaries, ENV checklist, dry-run smoke plan, rollback, backup/restore, monitoring/alerting, financial safety, Go/No-Go rehearsal, next phases, and secret-shaped value scan. It is a planning artifact only and does not deploy production. |
| `monitoringBackupRunbookSmoke.js` | `npm run smoke:monitoring-backup-runbook` | No | No | No | Runs static contract | Phase O static guard for `docs/MONITORING_BACKUP_RUNBOOK.md`, monitoring targets, SEV1-SEV4 severity/routing, log retention, backup, restore drill, incident checklist/template, Go/No-Go monitoring criteria, next phases, and secret-shaped value scan. It is a planning artifact only and does not deploy production. |
| `financialLedgerHardeningSmoke.js` | `npm run smoke:financial-ledger-hardening` | No | No | No | Runs static contract | Phase P static guard for `docs/FINANCIAL_LEDGER_HARDENING_PLAN.md`, financial safety boundaries, ledger model requirements, deposit/withdraw hardening, reconciliation, audit trail, dual control, financial Go/No-Go criteria, next phases, and secret-shaped value scan. It is a planning artifact only and does not deploy production. |
| `financialLedgerRuntimeContractSmoke.js` | `npm run smoke:financial-ledger-runtime-contract` | No | No | No | Runs static contract | Phase Q static guard for `docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md`, ledger account model, ledger entry data contract, transaction type contract, API contract draft, idempotency, dual control, reconciliation, audit event, error contract, Phase R Go/No-Go criteria, and secret-shaped value scan. It is docs/static smoke only and does not change runtime money flow. |
| `financialLedgerSchemaDryRunSmoke.js` | `npm run smoke:financial-ledger-schema-dry-run` | No | No | No | Runs static contract | Phase R static guard for `docs/FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md`, proposed schema draft, ledger accounts/entries/transactions, idempotency schema, reconciliation schema, admin adjustment dual-control schema, index/constraint plan, migration dry-run plan, rollback plan, data backfill plan, Phase S Go/No-Go criteria, and secret-shaped value scan. It is docs/static smoke only and does not create a Prisma migration or change `schema.prisma`. |
| `stagingReleaseGateSmoke.js` | `npm run smoke:staging-release-gate` | No local Prisma access | Hosted staging API | Yes | Syntax check only | Non-destructive hosted staging release gate for health/database/modes, admin auth negative, demo admin auth, admin read-only endpoints, browser route contract, demo member auth, member Lucky Wheel read-only config/history/my-rewards, role-permission read-only audit checks, and leak scan. It does not consume member spin and does not PATCH role permissions. |
| `stagingDbCheck.js` | `npm run staging:db:check` | Staging/test DB | No | No | Syntax check only | Staging DB connection, required tables, demo site/admin/member readiness, fixture counts, and safe output. |
| `stagingDemoSeed.js` | `npm run staging:seed-demo` | Staging/test DB | No | `STAGING_DEMO_ADMIN_PASSWORD` | Syntax check only | Staging-safe UAT demo admin upsert from `STAGING_DEMO_ADMIN_EMAIL`, super-admin site access, Lucky Wheel demo member refresh, optional Phase H no-permission admin fixture, optional Phase H safe role/admin fixture, sanitized audit log, SKIP-SAFE on missing local demo admin env, and no credential output. |
| `stagingUatSmoke.js` | `npm run smoke:staging-uat` | No local Prisma access | Hosted staging API | Optional; skips safely if absent | Syntax check only | Render staging health/database/mode contract, admin auth leak checks, admin work schedule read, audit/security read endpoints, Admin Lucky Wheel config/spins/member-rewards, optional member wheel config/spin/history/my-rewards when staging member env exists, and response leak scan. |
| `stagingRolePermissionUatSmoke.js` | `npm run smoke:staging-role-permission-uat` | No local Prisma access | Hosted staging API | Optional; skips safely if absent | Syntax check only | Render staging role-permission runtime UAT for `/admin/permissions/me`, `/admin/permissions/catalog`, `/admin/roles`, `/admin/roles/:role`, protected-role and permission negative paths, optional no-permission admin `403`, valid non-owner role update/restore when safe, `admin.role.permissions.update` audit lookup, and response leak scan. |
| `runAllLocalSmoke.js` | `npm run smoke:all-local` | Yes | Yes | Yes | Syntax check only | Guarded local runner for syntax, project checks, all local smokes, secret grep, and diff check. |

GitHub Actions also scans `src/local-smoke-tests` for secret-shaped values. It does not run DB-backed smoke commands.

## Staging DB/UAT Coverage

- Staging Deploy Mock/Sandbox Preflight covers platform-neutral deploy readiness before any real staging deploy.
- Render Staging Deploy Setup covers the Render Web Service, branch `main`, staging-only service name, Render PostgreSQL staging database, Render dashboard env-only secret handling, build command `npm install && npx prisma generate`, start command `npm start`, health path `/api/health`, manual deploy control, rollback, and log leak checks.
- Local commands before Render deploy: `node --check src/local-smoke-tests/stagingPreflight.js`, `node --check src/staging-scripts/stagingSafety.js`, `node --check src/staging-scripts/stagingDemoSeed.js`, `node --check src/staging-scripts/stagingUatSmoke.js`, `node --check src/staging-scripts/stagingRolePermissionUatSmoke.js`, `npm run staging:preflight`, `npm run smoke:admin-wheel-runtime`, `npm run smoke:wheel`, and `npm run check`.
- Post-Render commands after the service is healthy: set `BASE_URL` to the Render staging API, then run `npm run staging:preflight`, `npm run smoke:staging`, `npm run staging:db:check`, `npm run staging:seed-demo` when demo admin env is set, `npm run smoke:admin-wheel-runtime`, `npm run smoke:wheel`, `npm run smoke:staging-uat`, and `npm run smoke:staging-role-permission-uat`.
- Required preflight commands: `node --check src/staging-scripts/stagingSafety.js`, `node --check src/staging-scripts/stagingDemoSeed.js`, `node --check src/staging-scripts/stagingUatSmoke.js`, `node --check src/staging-scripts/stagingRolePermissionUatSmoke.js`, `npm run staging:preflight`, `npm run staging:seed-demo`, `npm run smoke:staging`, `npm run staging:db:check`, `npm run smoke:admin-wheel-runtime`, `npm run smoke:wheel`, `npm run smoke:staging-uat`, `npm run smoke:staging-role-permission-uat`, and `npm run check`.
- Skip-safe conditions: missing local shell `DATABASE_URL` for staging preflight when no `BASE_URL` is available, missing local/staging demo admin password, missing local wheel runtime env, missing local wheel DB/env for smoke, or absent optional staging member env. These skip with exit `0` only when the target is otherwise safe and no production-like target or live mode is detected.
- Block conditions: production-like DB/API targets, `NODE_ENV` production for mock/sandbox preflight, live provider/payment/bank/SMS/Slip OCR modes, embedded URL credentials, unsafe external mode labels, or secret-shaped values in responses.
- Secret-shaped scan covers database URL shapes, authorization scheme markers, JWT-shaped values, API-key-shaped values, DB assignment text, sensitive response keys, docs, staging scripts, local smoke scripts, controllers, routes, services, middleware, and sensitive env values echoed in output.
- The preflight and UAT smoke must always report no production DB, no real provider/payment/bank/SMS/Slip OCR, and no real money payout for staging UAT and Lucky Wheel smoke paths.
- Render staging remains mock/sandbox only: no production DB, no real money, no live provider, no live payment, no live bank rails, no live SMS, and no live Slip OCR.
- `staging:db:check` blocks production-like DB targets, live external modes, and unsafe app labels before connecting.
- It verifies Prisma migration table plus core application tables exist.
- It verifies the demo site, demo admin, demo member, wallet, bank/account/provider/game/payment/promotion fixtures are present.
- It prints only safe usernames, roles, site codes, currencies, and counts. It does not print `DATABASE_URL`, tokens, passwords, hashes, provider secrets, or encrypted config fields.
- `smoke:staging-uat` defaults to `https://stukuto-real-core-staging.onrender.com/api` when `BASE_URL` is not set.
- It skips safely with exit `0` when the staging demo admin password env is absent, without printing secret values or calling authenticated UAT endpoints.
- When staging demo admin env is present, it verifies `/api/health`, confirms `databaseConnected=true`, confirms all external modes are non-live, verifies admin auth negative leak behavior, logs in without printing the token, reads work schedule/audit/security endpoints, reads Admin Lucky Wheel config/spins, and optionally runs member wheel config/spin/history/my-rewards when staging demo member env is present.
- `smoke:staging-role-permission-uat` defaults to `https://stukuto-real-core-staging.onrender.com/api` when `BASE_URL` is not set and requires an HTTPS staging/QA/sandbox API URL.
- It skips safely with exit `0` when staging demo admin env is absent, without printing secret values or calling authenticated role-management endpoints.
- When staging demo admin env is present, it logs in without printing the token, reads `/api/admin/permissions/me`, `/api/admin/permissions/catalog`, `/api/admin/roles`, and `/api/admin/roles/:role`, verifies required permission catalog keys, checks no-auth/missing-reason/invalid-permission/`admin.manage` forbidden/protected `owner` and `super_admin` failures, checks authenticated no-permission `403` when no-permission admin env exists, performs and restores a valid non-owner role permission update when the safe role/admin fixture env exists, confirms `admin.role.permissions.update` audit rows for successful updates, and scans every response for leaks.
- The no-permission negative and valid role update may report `SKIPPED` only when their fixture env values are absent. For Phase H closure, set the fixture env and run `npm run staging:seed-demo`; the no-permission negative must report `PASS (403)`, the valid update and restore must report PASS, and the audit-log lookup must report PASS. Fixture skips must not lower auth guard, permission guard, staging safety guard, owner/super_admin protection, reason requirements, audit requirements, or response leak scanning.

## 3. smoke:money-flow Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Admin login through the real local API.
- Member register through the real local API.
- Bank account pending status after registration.
- Admin bank account approve.
- Deposit create.
- Deposit approve.
- Duplicate deposit approve guard.
- Withdrawal create.
- Withdrawal approve.
- Duplicate withdrawal approve guard.
- Withdrawal mark-paid.
- Duplicate mark-paid guard.
- Final wallet balance check.
- Wallet ledger row count and amount checks.
- Admin log checks for deposit approve, withdrawal approve, and withdrawal mark-paid.

## 4. smoke:core-api Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Member auth guard for `/me` and `/wallet`.
- Admin auth guard for `/admin/me`.
- Member registration and login flow.
- Member `/me`.
- Wallet summary.
- Points summary.
- Wallet ledger.
- Promotions list.
- Mock game provider list.
- Mock game list.
- Mock game launch.
- Admin login.
- Admin `/me`.
- Admin logs.
- Admin members list.
- Admin deposits list.
- Admin withdrawals list.
- Response leak scan for responses read by the script.

## 5. smoke:financial-negative Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Unauthenticated member protected endpoint guard.
- Unauthenticated admin protected endpoint guard.
- Invalid deposit amount zero.
- Invalid deposit amount negative.
- Invalid withdrawal amount zero.
- Invalid withdrawal amount negative.
- Withdrawal over wallet balance.
- Duplicate deposit approve safety.
- Duplicate withdrawal approve safety.
- Duplicate mark-paid safety.
- Ledger safety, including stable row counts after duplicate/admin-log checks.
- Admin log checks for deposit approve, withdrawal approve, and withdrawal mark-paid.
- Response leak scan, including DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

## 6. smoke:promotion-claim Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Unauthenticated promotion claim guard.
- Promotion list response.
- Local promotion fixture.
- Successful promotion claim.
- Duplicate claim guard.
- Invalid promotion id guard.
- `PromotionClaim` count guard.
- `TurnoverRequirement` count guard.
- Wallet/ledger effect guard.
- Response leak scan.

## 7. smoke:game-transfer Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, and live provider modes.
- `GET /api/health`.
- Auth negative for transfer-in, transfer-out, and bet-history.
- Member login through the real local API.
- Mock game provider and game fixtures.
- Transfer-in wallet debit and ledger row.
- Transfer-out wallet credit and ledger row.
- Final wallet balance after mock transfers.
- Bet-history JSON row shape.
- Response leak scan.

## 8. smoke:admin-reports-config Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- `GET /api/health`.
- Public site config endpoint: `/site/config`.
- Admin auth negative for protected report/config endpoints.
- Admin login through the real local API.
- Report endpoints covered:
  - `/admin/reports/summary`
  - `/admin/reports/deposits`
  - `/admin/reports/withdrawals`
  - `/admin/reports/wallet-ledger`
- Site/config endpoints covered:
  - `/site/config`
  - `/admin/sites`
  - `/admin/sites/current/config`
  - `/admin/sites/:id`
  - `/admin/sites/:id/bank-accounts`
  - `/admin/sites/:id/game-providers`
  - `/admin/sites/:id/payment-configs`
- Read-only safety: coverage calls use GET/read-only endpoints and do not update config.
- Response leak scan, including DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

## 9. smoke:bank-module Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- `GET /api/health`.
- Admin auth negative for bank account, statement mock, and Slip OCR mock endpoints.
- Admin login through the real local API.
- Bank account list through `/admin/sites/:id/bank-accounts`.
- Mock deposit bank account create through `/admin/sites/:id/bank-accounts`.
- Mock withdraw bank account create through `/admin/sites/:id/bank-accounts`.
- Mock bank account update for status, show/hide metadata, balance, and capital fields.
- Safe soft-disable through `DELETE /admin/sites/:id/bank-accounts/:bankAccountId`.
- Deposit statement mock list with date/search filters.
- Withdraw statement mock list with date/search filters.
- Statement empty state returns `[]`.
- Slip OCR mock success and fail responses.
- Response leak scan, including DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

All bank module endpoints covered here are mock/sandbox only. The smoke test does not call real bank rails, real OCR, webhooks, or external file services.

## 10. smoke:admin-permission Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- `GET /api/health`.
- Admin auth negative checks return `401`.
- Owner role lists roles, lists permissions, reads current permissions, assigns a role to another admin, approves a mock deposit, and updates site settings.
- Finance role views deposits/withdrawals, approves mock deposit/withdrawal, and is forbidden from settings updates.
- Support role views and updates members, and is forbidden from deposit approval.
- Graphic role updates website settings/theme and is forbidden from deposit/withdrawal approval.
- Viewer role can view allowed data and is forbidden from create/update/approve actions.
- Site-level empty permission override is forbidden from protected endpoints with `403`.
- Response leak scan, including DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

RBAC smoke uses only local/staging/test PostgreSQL fixtures. It does not call real provider, payment, bank, SMS, or Slip OCR services, and it does not run real-money UAT.

## 11. smoke:admin-role-management Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- `GET /api/health`.
- Unauthenticated role-management endpoints return `401`.
- Owner role lists permissions, lists roles, reads current permissions through `/api/admin/permissions/me`, and reads target admin permissions through `/api/admin/admins/:id/permissions`.
- Static `/admin/roles` UI route renders Role Management, grouped permission matrix, effective permission preview, reason-required save controls, audit shortcut, and no member spin endpoint.
- Owner role reads `GET /api/admin/permissions/catalog` and verifies `wheel.view`, `admin.audit.view`, and `admin.roles.update` metadata.
- Role permission assignment rejects unauthenticated requests, non-owner/no-permission requests, missing reason, invalid keys, owner/super_admin role edits, and `admin.manage` grants through the role matrix.
- Role permission assignment updates and rolls back the local support role through `PATCH /api/admin/roles/support/permissions`, then confirms `admin.role.permissions.update` audit log reason metadata.
- Owner role updates a local target admin through `/api/admin/admins/:id/role`.
- Role assignment rejects empty reason, same-role updates, and self role changes.
- Finance, support, graphic, and viewer are forbidden from role updates with `403`.
- Role assignment checks update the local target admin to support and graphic, then roll back to the original role for idempotency.
- Audit log check confirms `admin.role.update` is present for the target admin.
- Response leak scan checks DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

Role-management smoke uses only local/staging/test PostgreSQL fixtures. It does not call real provider, payment, bank, SMS, or Slip OCR services, and it does not run real-money UAT.

## 12. smoke:admin-browser-routes Coverage

- Starts the Express app on an ephemeral local port without requiring DB-backed local admin credentials.
- Confirms `/admin`, `/admin/`, `/admin/roles`, `/admin/roles/`, `/admin-wheel`, `/admin-wheel/`, `/admin/lucky-wheel`, and `/admin/lucky-wheel/` return `200` HTML without redirect or `404`.
- Confirms Admin UI and Admin Wheel UI JS/CSS asset paths return the expected static content.
- Confirms `/api/*` routes are not swallowed by admin static HTML fallbacks.
- Confirms `/admin` renders the admin shell and Role Management navigation.
- Confirms `/admin/roles` renders the role list/detail shell, permission matrix container, effective permission preview, reason-required save/reset controls, confirm modal, and Role UI source markers for `wheel.view`, `admin.audit.view`, and `admin.roles.update`.
- Confirms `/admin-wheel` renders permission summary, Campaign settings, Rewards management, Spin history, Reports, Audit history, Reward Claims, and reason-required claim/cancel controls.
- Confirms rendered HTML has no `undefined`, `NaN`, `[object Object]`, or sensitive rendered keyword copy.
- Confirms static HTML/JS/CSS do not contain JWT-shaped values, PostgreSQL credential URLs, or secret env assignment markers.
- Confirms Role Management UI does not expose owner/super_admin bypass controls or wildcard permission controls.
- Confirms Admin Wheel UI does not expose force reward, force spin, set-prize-index controls, or member spin endpoint calls.

The admin browser route smoke is static HTTP contract coverage only. It does not run migrations, seed data, call live providers, connect real bank/payment/SMS/Slip OCR systems, or move money.

## 13. smoke:admin-work-schedule Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- `GET /api/health`.
- Unauthenticated schedule list/read/update endpoints return `401`.
- No-permission admin schedule list/update returns `403`.
- Owner lists schedules through `/api/admin/work-schedules`.
- Owner reads and updates a target admin schedule through `/api/admin/work-schedules/:adminId`.
- Invalid schedule time returns `400`.
- Owner enables and disables emergency override through `/api/admin/work-schedules/:adminId/override`.
- Login outside an enabled schedule returns `403` and does not issue a token.
- Login inside an enabled schedule succeeds.
- Active emergency override allows temporary login while the schedule would otherwise block.
- Disabled emergency override restores schedule blocking.
- Expired override does not allow login.
- Overnight shift helper coverage verifies a `18:00` to `02:00` window.
- Cleanup rolls the local target schedule back to disabled so the smoke is idempotent.
- Audit history endpoint `/api/admin/work-schedules/:adminId/audit-logs` confirms `admin.schedule.update`, `admin.schedule.enable`, `admin.schedule.disable`, `admin.schedule.override_enable`, `admin.schedule.override_disable`, and `admin.login.blocked_outside_schedule`.
- Response leak scan checks DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

Work-schedule smoke uses only local/staging/test PostgreSQL fixtures. It does not call real provider, payment, bank, SMS, or Slip OCR services, and it does not run real-money UAT.

## 14. smoke:admin-work-schedule-ui Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- Static route check for `/admin/work-schedules/`.
- Static asset checks for `app.js` and `styles.css`.
- UI script contract checks for permission, schedule list, override, and audit endpoints.
- Owner login through the real local API.
- No-permission schedule list returns `403`.
- Owner schedule list includes the target admin.
- Owner enable/disable schedule flow through `/api/admin/work-schedules/:adminId`.
- Emergency override enable/disable flow through `/api/admin/work-schedules/:adminId/override`.
- Audit history contains schedule update, enable, disable, and override actions.
- Audit response masks IP and redacts user-agent.
- Response leak scan checks DB URL markers, auth values, password/token/secret markers, JWT-like values, and credential-shaped PostgreSQL URLs.

The UI smoke uses only static frontend assets and local/staging/test PostgreSQL fixtures. It does not call real provider, payment, bank, SMS, or Slip OCR services, and it does not run real-money UAT.

## 15. smoke:admin-audit-security Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- Static route check for `/admin/audit-security/`.
- Static asset checks for `app.js` and `styles.css`.
- UI script contract checks for permission, audit log, audit summary, and security event endpoints.
- Static UI marker checks cover `audit-filter-toolbar`, `audit-role-before-after`, `audit-reason-visible`, `audit-work-schedule-events`, `audit-details-modal`, and `audit-secret-redaction`.
- Static UI checks confirm summary cards for total events, role changes, work schedule events, login/security events, blocked/failed actions, and events with reasons.
- Static UI checks confirm filter controls for action type, admin username, target username, date range, site code, and event category.
- Static UI checks confirm the audit/security tables expose time, category, action, actor, target, before, after, reason, site code, status, and details columns.
- Static asset leak checks reject JWT-like static values, credential-shaped PostgreSQL URLs, and configured secret env values if they appear in the rendered UI assets.
- Owner login through the real local API.
- No-permission audit report access returns `403`.
- Owner creates local-only role, schedule, and emergency override audit fixtures through guarded admin APIs.
- `GET /api/admin/audit-logs` returns `{ rows, summary }`.
- `GET /api/admin/audit-logs/summary` returns total, blocked login, emergency override, permission change, role change, schedule change, failed attempt, and high severity counts.
- `GET /api/admin/security-events` and `/summary` return only security-sensitive actions.
- Filters are checked for action, admin ID, target admin ID, date range, severity, module, and result.
- UI-level client filters are statically covered for action type, admin username, target username, date range, site code, and event category.
- Empty result response returns an empty `rows` array and zero summary.
- Response leak scan checks DB URL markers, auth values, password/token/secret markers, JWT-like values, credential-shaped PostgreSQL URLs, raw user-agent content, and unmasked IPv4 addresses.

The audit/security smoke uses only static frontend assets and local/staging/test PostgreSQL fixtures. It does not call real provider, payment, bank, SMS, or Slip OCR services, and it does not run real-money UAT.

## 16. smoke:admin-wheel-ui Coverage

- Static source contract check for `/admin-wheel` and `/admin/lucky-wheel/` route mounts plus `src/admin-wheel-ui` assets.
- Confirms Phase C manual QA markers for Admin > Lucky Wheel, `Lucky Wheel Admin Console`, `Staging / Mock Admin Console`, `No real money / no live provider`, response leak warning, tabs, campaign summary/status/site/last-updated fields, readonly campaign ID, Campaign settings, Rewards management, Spin history, Reports, Audit history, Reward Claims, reason fields, create/edit reward modal, reward status modal, claim/cancel status modal, detail modal selectors, confirm modal, safe loading/empty states, and safe audit placeholder.
- Confirms UI script references wheel/admin endpoints: `/admin/permissions/me`, `/admin/wheel/config`, `/admin/wheel/campaign`, `/admin/wheel/rewards`, `/admin/wheel/rewards/:id`, `/admin/wheel/spins`, `/admin/wheel/member-rewards`, `/admin/wheel/member-rewards/:id/status`, and read-only `/admin/audit-logs`.
- Confirms permission summary markers, granular `wheel.*` permission keys, disabled write buttons with `ไม่มีสิทธิ์ดำเนินการนี้`, and access-denied copy `ไม่มีสิทธิ์เข้าถึง` / `กรุณาติดต่อผู้ดูแลระบบ`.
- Confirms campaign/reward/status and Reward Claims claim/cancel writes validate reason and show a confirm modal before API submission.
- Confirms reward field validation markers for required label/type, non-negative probability weight, `stockLimit >= stockUsed`, and default segment color fallback.
- Confirms source markers for safe `401`, `403`, and `404` handling; config/reward/spin/member-reward adapters; sanitized spin/reward detail summaries; masked IP and user-agent hash handling; audit action filtering including `wheel.reward.status.update` and `wheel.memberReward.status.update`; report zero-division guards; and no visible `NaN`, `undefined`, or `[object Object]` rendered copy.
- Confirms frontend script does not include member spin calls, random reward selection, frontend-submitted spin result fields, or force reward/force spin/set-prize-index button labels.
- Confirms static assets do not contain JWT-like values, PostgreSQL credential URLs, env assignment markers, or sensitive console logging.
- Documents browser-only manual checks in `docs/ADMIN_WHEEL_HANDOFF.md`, including browser Console, visual modal fit, desktop table overflow, empty states, and loading/error states.

The Admin Wheel UI smoke is static/source-only. It does not require a database, does not call a backend, does not use production credentials, and does not create real payout.

## 17. smoke:admin-wheel-runtime Coverage

- Safety guard blocks production-like DB/API targets and live provider/payment/bank/SMS/Slip OCR modes.
- Skips safely when local admin/member env is not configured, without printing env values or failing against a missing local runtime.
- Skip-safe output includes the reason plus `no production DB used`, `no real provider/payment/bank/SMS/Slip OCR used`, and `no real money payout`.
- Static HTTP route check for `/admin/lucky-wheel/`, `/admin/lucky-wheel/app.js`, and `/admin/lucky-wheel/styles.css`.
- Unauthenticated Admin Wheel API access returns `401`.
- Authenticated admin with a site access override containing no permissions returns `403` for Lucky Wheel config, writes, claims update, and audit view.
- Owner/super admin reads `GET /api/admin/wheel/config`, `GET /api/admin/wheel/spins`, and `GET /api/admin/wheel/member-rewards`.
- Member runtime checks cover `GET /api/member/wheel/config`, `POST /api/member/wheel/spin`, `GET /api/member/wheel/history`, and `GET /api/member/wheel/my-rewards`.
- Member runtime checks confirm config campaign/rewards shape, reject unsafe spin payloads containing frontend-selected result fields, reject invalid campaign id safely, and confirm backend-selected `spinId`, `rewardId`, `prizeIndex`, and reward response shape.
- `PATCH /api/admin/wheel/campaign`, `POST /api/admin/wheel/rewards`, `PATCH /api/admin/wheel/rewards/:id`, and `PATCH /api/admin/wheel/member-rewards/:id/status` reject empty `reason`; no-permission write attempts return `403`.
- Successful campaign/reward/reward-claim writes use local/staging-safe fixtures only and create `wheel.campaign.update`, `wheel.reward.create`, `wheel.reward.update`, status-only `wheel.reward.status.update`, and `wheel.memberReward.status.update` audit rows.
- Audit read uses the existing `/api/admin/audit-logs` endpoint and verifies `reason`, actor, site code, sanitized before/after data, masked IP behavior, and no raw user-agent.
- Response leak scan checks DB URL markers, auth values, password/token/secret markers, JWT-like values, credential-shaped PostgreSQL URLs, raw user-agent content, and unmasked IPv4 addresses.

The Admin Wheel runtime smoke uses only local/staging/test PostgreSQL fixtures. It does not call real provider, payment, bank, SMS, or Slip OCR services, does not run real-money UAT, and does not create real payout.

## 18. smoke:wheel Coverage

- Safety guard blocks unsafe environment, production-like DB/API targets, live provider modes, and missing `LOCAL_ADMIN_PASSWORD`.
- Missing local runtime env skips safely with reason and confirms no production DB, no real provider/payment/bank/SMS/Slip OCR, and no real money payout. Production-like DB/API targets and unsafe provider modes remain blocked.
- Creates local/staging-test only site, admin, member, campaign, and reward fixtures.
- Verifies `GET /api/member/wheel/config` returns active campaign data and at least 8 public rewards.
- Confirms missing member auth returns `401` and invalid campaign ids fail safely.
- Confirms member config does not expose `probabilityWeight`.
- Confirms `POST /api/member/wheel/spin` rejects frontend-submitted `rewardId`, `prizeIndex`, `probabilityWeight`, and reward value fields.
- Confirms successful spin returns backend-selected `spinId`, `rewardId`, `prizeIndex`, reward summary, remaining spins, and balance after.
- Confirms stock-zero reward fixtures are not selected even with high probability weight.
- Confirms history includes the created spin.
- Confirms my-rewards includes a pending reward for non-`no_reward` results.
- Confirms daily spin limit is enforced.
- Confirms insufficient points are blocked.
- Confirms inactive campaign is blocked and then restored.
- Confirms admin campaign/reward updates reject empty reason.
- Confirms successful admin reward update writes `wheel.reward.update` audit metadata with the reason.
- Reads admin config and admin spin history.
- Response leak scan checks DB URL markers, auth values, password/token/secret markers, JWT-like values, credential-shaped PostgreSQL URLs, authorization scheme markers, and raw internal stack traces.

Lucky Wheel smoke uses only local/staging/test PostgreSQL fixtures. It does not call real provider, payment, bank, SMS, or Slip OCR services, does not run real-money UAT, and does not create real payout.

## 19. staging:preflight Coverage

`npm run staging:preflight` is a safe deploy readiness guard:

- Requires effective `APP_ENV` to be `staging` or `local-test`.
- Blocks `NODE_ENV` production and production-like API/database targets for staging preparation.
- Allows `DATABASE_URL` to be absent only for local-test/CI dry runs; real staging requires a dedicated staging/test PostgreSQL URL supplied outside git.
- Requires game, payment, bank statement, SMS, and Slip OCR modes to be `mock`, `sandbox`, or `disabled`.
- Validates the `/api/health` contract when `BASE_URL` is set.
- Uses a local health fixture when `BASE_URL` is absent so Safe CI can run without real secrets.
- Scans health payloads for database URLs, JWT-shaped values, authorization headers, unsafe response keys, and sensitive environment values.

## 20. smoke:staging Coverage

`npm run smoke:staging` is an HTTP-only hosted staging readiness smoke:

- Requires `BASE_URL` to be set explicitly.
- Blocks production-like API hosts and embedded URL credentials.
- Allows only local/staging/test/sandbox/QA API hosts.
- Checks provider/payment/bank/SMS/Slip OCR env modes are unset, `mock`, `sandbox`, or `disabled`.
- Calls `GET /api/health` and requires HTTP `200`, `success: true`, `data.ok: true`, boolean `data.databaseConnected`, and safe external mode labels.
- Calls `/api/admin/auth/login` with invalid credentials as a negative admin-auth check.
- Scans health and admin-auth responses for database URLs, JWT-shaped values, authorization headers, token/password/secret keys, API key fields, and sensitive env values.
- Does not create fixtures, import Prisma, run migrations, seed data, call real providers, or move money.

## 21. smoke:all-local Coverage

`npm run smoke:all-local` runs a guarded sequence and stops on the first failure:

- All-local safety guard.
- Backend local health check.
- Syntax checks for:
  - `promotionClaimSmoke.js`
  - `moneyFlowSmoke.js`
  - `coreApiSmoke.js`
  - `gameTransferSmoke.js`
  - `financialNegativeSmoke.js`
  - `adminReportsConfigSmoke.js`
  - `bankModuleSmoke.js`
  - `adminPermissionSmoke.js`
  - `adminRoleManagementSmoke.js`
  - `adminWorkScheduleSmoke.js`
  - `adminWorkScheduleUiSmoke.js`
  - `adminAuditSecuritySmoke.js`
  - `adminWheelUiSmoke.js`
  - `adminWheelRuntimeSmoke.js`
  - `adminBrowserRoutesSmoke.js`
  - `stagingReleaseReadinessSmoke.js`
  - `productionReadinessAuditSmoke.js`
  - `productionSafetyDryRunSmoke.js`
  - `monitoringBackupRunbookSmoke.js`
  - `financialLedgerHardeningSmoke.js`
  - `financialLedgerRuntimeContractSmoke.js`
  - `financialLedgerSchemaDryRunSmoke.js`
  - `wheelSmoke.js`
  - `stagingPreflight.js`
  - `stagingSmoke.js`
- `npm run check`.
- `npm run smoke:promotion-claim`.
- `npm run smoke:money-flow`.
- `npm run smoke:core-api`.
- `npm run smoke:game-transfer`.
- `npm run smoke:financial-negative`.
- `npm run smoke:admin-reports-config`.
- `npm run smoke:bank-module`.
- `npm run smoke:admin-permission`.
- `npm run smoke:admin-role-management`.
- `npm run smoke:admin-work-schedule`.
- `npm run smoke:admin-work-schedule-ui`.
- `npm run smoke:admin-audit-security`.
- `npm run smoke:admin-wheel-ui`.
- `npm run smoke:admin-wheel-runtime`.
- `npm run smoke:admin-browser-routes`.
- `npm run smoke:staging-release-readiness`.
- `npm run smoke:production-readiness-audit`.
- `npm run smoke:production-safety-dry-run`.
- `npm run smoke:monitoring-backup-runbook`.
- `npm run smoke:financial-ledger-hardening`.
- `npm run smoke:financial-ledger-runtime-contract`.
- `npm run smoke:financial-ledger-schema-dry-run`.
- `npm run smoke:wheel`.
- Secret grep over package/docs/README/local-smoke related files.
- `git diff --check`.
- Final PASS/FAIL summary.

## 22. GitHub Actions Safe CI Coverage

`.github/workflows/ci.yml` defines Safe CI for `push` and `pull_request`:

- Checkout.
- Setup Node.js 22 with npm cache.
- `npm ci`.
- `npx prisma validate`.
- `npx prisma generate`.
- `npm run check`.
- `npm run staging:preflight` with local-test CI env and no real secrets.
- `npm run smoke:staging-release-readiness` with no staging secrets and no staging API calls.
- Direct smoke syntax checks for:
  - `stagingPreflight.js`
  - `stagingReleaseReadinessSmoke.js`
  - `moneyFlowSmoke.js`
  - `coreApiSmoke.js`
  - `financialNegativeSmoke.js`
  - `promotionClaimSmoke.js`
  - `gameTransferSmoke.js`
  - `adminReportsConfigSmoke.js`
  - `adminPermissionSmoke.js`
  - `adminWorkScheduleSmoke.js`
  - `adminWorkScheduleUiSmoke.js`
  - `adminAuditSecuritySmoke.js`
  - `adminWheelRuntimeSmoke.js`
  - `wheelSmoke.js`
  - `stagingSmoke.js`
  - `runAllLocalSmoke.js`
- Secret-shaped value scan over `package.json`, `README.md`, `src/local-smoke-tests`, and `.github`.

Safe CI does not run DB-backed smoke commands because those require a running backend, safe local/staging/test PostgreSQL, guarded environment variables, and local fixtures.

## 23. Required Local Runtime

To run local smoke commands, prepare:

- A local or staging/test PostgreSQL database.
- Prisma migrations applied to that database.
- The backend running locally at `http://localhost:4000/api` or another explicitly safe base URL.
- `NODE_ENV` set to `development-local` or `test` for most smoke scripts.
- `LOCAL_ADMIN_PASSWORD` set for admin-backed smoke scripts.
- `JWT_SECRET` set.
- `BASE_URL`, `CORE_API_BASE_URL`, or `PUBLIC_API_BASE_URL`, if set, must target local/staging/test and must not contain embedded credentials or production-like host markers.
- Provider/payment/bank/SMS/Slip OCR mode values must be unset, `mock`, or `sandbox`.

`smoke:staging` requires only `BASE_URL` and a running safe staging/local API. `moneyFlowSmoke.js` also allows `staging` for `NODE_ENV`. Other current DB-backed smoke scripts shown above allow `development-local` or `test`.

## 24. Safe Commands

Run these only after the backend and safe local/staging/test environment are ready:

```bash
npm run smoke:all-local
npm run staging:preflight
npm run smoke:staging
npm run smoke:staging-release-readiness
npm run smoke:production-readiness-audit
npm run smoke:production-safety-dry-run
npm run smoke:monitoring-backup-runbook
npm run smoke:financial-ledger-hardening
npm run smoke:financial-ledger-runtime-contract
npm run smoke:financial-ledger-schema-dry-run
npm run smoke:staging-role-permission-uat
npm run smoke:money-flow
npm run smoke:core-api
npm run smoke:financial-negative
npm run smoke:promotion-claim
npm run smoke:game-transfer
npm run smoke:admin-reports-config
npm run smoke:admin-permission
npm run smoke:admin-work-schedule
npm run smoke:admin-work-schedule-ui
npm run smoke:admin-audit-security
npm run smoke:admin-wheel-ui
npm run smoke:admin-wheel-runtime
npm run smoke:admin-browser-routes
npm run smoke:wheel
npm run check
```

## 25. Mock / Sandbox Boundaries

- Game provider coverage uses mock/local fixtures and `MockGameProviderAdapter` behavior.
- Payment and bank money flow is manual local approval through the API and admin endpoints.
- No real provider API call is made by the current smoke suite.
- No real payment rail or bank rail is used.
- SMS is a mock placeholder.
- Slip OCR is a mock placeholder.
- Admin RBAC smoke uses mock/local admin fixtures and backend permission guards only.
- Admin role permission staging UAT uses the hosted staging API, staging demo credentials from env only, no-permission staging admin credentials from env for the authenticated `403` fixture, and safe role/admin fixture credentials from env for temporary non-owner role permission updates that are restored immediately. No fixture grants `admin.manage`, owner, or super_admin.
- Admin work schedule smoke uses mock/local admin fixtures and backend login guards only.
- Admin work schedule UI smoke uses static local frontend assets and mock/local admin fixtures only.
- Admin audit/security smoke uses static local frontend assets, safe audit rows, and mock/local admin fixtures only.
- Admin Wheel UI smoke uses static local frontend assets only and does not connect to a database.
- Admin Wheel runtime smoke uses local/staging/test fixtures only and skips safely when local admin env is not configured.
- Lucky Wheel smoke uses local/staging mock campaign, reward, spin, and member reward fixtures only. It does not create real payout.
- Production DB targets are forbidden.
- Real provider/payment/bank integrations and production credential flows are outside current smoke coverage.

## 26. Known Coverage Gaps

Confirmed from current docs and scripts:

- Config POST/PUT endpoints are intentionally not covered by `smoke:admin-reports-config` because the smoke is read-only for config safety.
- Real provider integrations are not covered.
- Real payment and bank integrations are not covered.
- Production RBAC integration with an external identity provider is not covered.
- Admin work schedule static frontend is covered by local smoke; browser-rendered visual regression is not covered.
- Admin audit/security static frontend is covered by local smoke; browser-rendered visual regression is not covered.
- Admin Wheel UI static frontend and Admin Wheel API runtime contracts are covered by local smoke; authenticated browser-rendered visual regression is not covered.
- Force-logout of already-active sessions is not covered.
- Production deployment smoke is not covered. `smoke:staging` is only for non-production staging/test hosts.
- Full end-to-end frontend coverage is not covered.
- Lucky Wheel frontend Phaser integration and real reward claiming are not covered.
- docs/API.md still contains older "ต้องตรวจเพิ่ม" notes for some endpoints that are now covered by newer smoke scripts; ต้องตรวจเพิ่ม before using that section as the source of truth.

## 27. How to Add a New Smoke

1. Add the new smoke script under `src/local-smoke-tests`.
2. Reuse the existing local safety guard and response leak scan patterns.
3. Use local/staging/test only; do not connect production DB, real provider, real payment, or real bank systems.
4. Add an npm script in `package.json`.
5. Wire the command into `src/local-smoke-tests/runAllLocalSmoke.js`.
6. Add coverage notes in this file.
7. Run `node --check` for the new file and `runAllLocalSmoke.js`.
8. Run `npm run check`.
9. Run the new smoke and `npm run smoke:all-local` when a safe local runtime is available.
10. Run the secret-shaped value scan.
11. Run `git diff --check`.
12. Do not commit until checks and smokes pass.

## 28. smoke:admin-operator-handoff Coverage

Phase I status: Admin UI End-to-End Manual QA + Operator Handoff Final.

Script:

- `src/local-smoke-tests/adminOperatorHandoffSmoke.js`

Command:

```powershell
npm run smoke:admin-operator-handoff
```

Coverage:

- Confirms `docs/ADMIN_OPERATOR_HANDOFF_FINAL.md` exists.
- Confirms the operator handoff and browser QA docs include `/admin`, `/admin/roles`, `/admin-wheel`, `/admin/audit-security`, and `/admin/work-schedules`.
- Confirms handoff docs include staging/mock/sandbox scope, no real money, no production database, Render Build Command, Render Start Command, and the key audit actions.
- Confirms admin UI route/link/selector markers for Role Management, Lucky Wheel, Audit Security, permission matrix, reason field, and confirm modal.
- Confirms Role Management reason-required copy and protected owner/super_admin guard copy.
- Confirms Admin Wheel Permission summary, tabs, Reward Claims reason field, reason validation, and confirm action markers.
- Confirms no unexpected static placeholder copy and no static secret-shaped values in checked docs/assets.
- Confirms Admin Wheel UI does not expose force reward, force spin, or set-prize-index controls.
- Runs `adminBrowserRoutesSmoke.js` as a dependency so the route contract for the five Phase I browser routes remains covered.

This smoke is static/contract only. It does not log in, run migrations, seed data, connect to production DB, call live provider/payment/bank/SMS/Slip OCR, or move money. DB-backed runtime smoke may still report BLOCKED or SKIPPED by safety guard when the safe local/staging env is absent.

## 29. smoke:staging-release-gate Coverage

Phase J status: Staging Release Gate + Non-Destructive Regression Smoke.

Script:

- `src/staging-scripts/stagingReleaseGateSmoke.js`

Command:

```powershell
npm run smoke:staging-release-gate
```

Use after every staging deploy. This smoke is non-destructive and must not replace Full UAT.

Coverage:

- Safety guard blocks production-like API/database env and live provider/payment/bank/SMS/Slip OCR modes.
- Health/database/mode contract checks `GET /api/health`, `databaseConnected=true`, safe app env, and mock/sandbox/disabled external modes.
- Admin auth negative checks unknown admin returns JSON safe failure, not HTML.
- Demo admin auth uses staging demo admin env and never prints the returned credential.
- Admin read-only regression covers `/api/admin/permissions/me`, `/api/admin/permissions/catalog`, `/api/admin/roles`, `/api/admin/wheel/config`, `/api/admin/wheel/spins`, `/api/admin/wheel/member-rewards`, and `/api/admin/audit-logs?limit=10`.
- Browser route contract checks `/admin`, `/admin/roles`, `/admin-wheel`, `/admin/audit-security`, `/admin/work-schedules`, `/api/*` static boundary, and `/admin/auth/login` JSON boundary.
- Demo member auth uses staging demo member env and never prints the returned credential.
- Member Lucky Wheel read-only regression covers `/api/member/wheel/config`, `/api/member/wheel/history`, and `/api/member/wheel/my-rewards`.
- It intentionally does not call member wheel spin.
- Role permission read-only regression optionally reads `/api/admin/roles/:safeRole` when `STAGING_SAFE_ROLE_NAME` is set and always reads `/api/admin/audit-logs?action=admin.role.permissions.update`.
- It intentionally does not PATCH role permissions.
- Response leak scan rejects password/token/secret markers, `DATABASE_URL`, raw authorization/JWT-shaped values, raw connection strings, raw internal stacks, and sensitive env values.

Command separation:

- `smoke:staging-release-gate` is non-destructive and should run after every deploy.
- `smoke:staging-uat` is Full UAT, may consume member wheel spin, and should run after seed reset or before closing major phases.
- `smoke:staging-role-permission-uat` mutates a safe role fixture and restores state immediately; run it when role/permission behavior changes.

## 30. Phase K Staging Release Runbook Coverage

Runbook:

- `docs/STAGING_RELEASE_RUNBOOK.md`

Static guard:

- `npm run smoke:admin-operator-handoff`

Coverage:

- Confirms the Phase K runbook exists.
- Confirms the runbook documents `npm run smoke:staging-release-gate`, `npm run smoke:staging-uat`, and `npm run smoke:staging-role-permission-uat`.
- Confirms the runbook documents Render Build Command `npm install && npx prisma generate`.
- Confirms the runbook documents Render Start Command `npm start`.
- Confirms the runbook documents seed command temporary-only policy.
- Confirms the runbook has no unexpected `undefined`, `NaN`, or `[object Object]` copy.
- Confirms the runbook does not include static credential-shaped values.

Smoke policy:

- Release gate = run after every deploy.
- Full UAT = run after seed/reset only.
- Role Permission UAT = run after role permission changes.
- Seed command = temporary only.
- Start Command final = `npm start`.

## 31. smoke:staging-release-readiness Coverage

Phase L status: Staging Release Gate Automation + CI Guard.

Script:

- `src/local-smoke-tests/stagingReleaseReadinessSmoke.js`

Command:

```powershell
npm run smoke:staging-release-readiness
```

Use before commit or before release. This smoke is static/local only and can run in Safe CI without staging credentials.

Coverage:

- Confirms package scripts exist for `smoke:staging-release-gate`, `smoke:staging-uat`, `smoke:staging-role-permission-uat`, `smoke:admin-operator-handoff`, and `smoke:staging-release-readiness`.
- Confirms `npm run check` syntax-checks `src/staging-scripts/stagingReleaseGateSmoke.js` and `src/local-smoke-tests/stagingReleaseReadinessSmoke.js`.
- Confirms release/runbook docs exist.
- Confirms runbook policy says release gate runs after every deploy, Full UAT runs after seed/reset, Role Permission UAT is separate, Build Command is `npm install && npx prisma generate`, Start Command is `npm start`, seed command is temporary only, Start Command is restored after seed, rollback checklist exists, and incident checklist exists.
- Confirms safety wording for no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, secret leak safety, and member spin not consumed in release gate.
- Scans related docs/scripts for credential-shaped values, raw connection strings, and unexpected placeholder copy.

Command separation:

- Release readiness = static/local policy smoke before deploy.
- Release gate = runtime staging smoke after deploy.
- Full UAT = after seed/reset only.
- Role Permission UAT = after role/permission changes.

## 32. smoke:production-readiness-audit Coverage

Phase M status: Production-Readiness Gap Audit.

Document:

- `docs/PRODUCTION_READINESS_GAP_AUDIT.md`

Script:

- `src/local-smoke-tests/productionReadinessAuditSmoke.js`

Command:

```powershell
npm run smoke:production-readiness-audit
```

Coverage:

- Confirms the production readiness audit document exists.
- Confirms the document says `NOT production ready`.
- Confirms production blockers, mock/sandbox boundaries, Go/No-Go criteria, P0 checklist, and recommended next phases are documented.
- Confirms the document includes no real money, no production DB, and no live provider boundary wording.
- Scans the audit doc for secret-shaped values and unexpected rendered placeholders.

Boundary:

- This is a static readiness audit only.
- It is not a production deployment, not a production smoke, and not approval to connect live provider/payment/bank/SMS/Slip OCR.
- It does not change the staging safety boundary and does not use production DB, real money, live integrations, or real payout.

## 33. smoke:production-safety-dry-run Coverage

Phase N status: Production Safety Dry Run Design.

Document:

- `docs/PRODUCTION_SAFETY_DRY_RUN.md`

Script:

- `src/local-smoke-tests/productionSafetyDryRunSmoke.js`

Command:

```powershell
npm run smoke:production-safety-dry-run
```

Coverage:

- Confirms the production safety dry-run document exists.
- Confirms the document says `NOT production ready`, `dry-run design`, no production DB, no real money, and no live provider/payment/bank/SMS/Slip OCR.
- Confirms hard safety boundaries, ENV checklist, dry-run smoke plan, rollback dry-run design, backup/restore dry-run design, monitoring/alerting dry-run design, financial safety dry-run, Go/No-Go rehearsal, and next phases Phase O/P/Q/R are documented.
- Scans the dry-run doc for secret-shaped values and rendered placeholder output.

Boundary:

- This is a static planning artifact only.
- It is not a production deployment and not production smoke.
- It does not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout.
- It does not change runtime behavior, auth guard, permission guard, staging safety guard, provider modes, NODE_ENV, or APP_ENV.

## 34. smoke:monitoring-backup-runbook Coverage

Phase O status: Monitoring + Backup Runbook.

Document:

- `docs/MONITORING_BACKUP_RUNBOOK.md`

Script:

- `src/local-smoke-tests/monitoringBackupRunbookSmoke.js`

Command:

```powershell
npm run smoke:monitoring-backup-runbook
```

Coverage:

- Confirms the monitoring backup runbook exists.
- Confirms the document says `NOT production ready`, no production DB, no real money, and no live provider/payment/bank/SMS/Slip OCR.
- Confirms monitoring targets include uptime, `/api/health`, API 5xx rate, database connection status, latency, admin/auth/admin-write/role-permission spikes, Lucky Wheel spin failures, wallet/ledger, deposit/withdraw, provider callbacks, queue/job failures, response leak alerts, Render deploy failures, and port binding/no open ports issue.
- Confirms alert severity levels SEV1-SEV4 and alert routing design are documented.
- Confirms log retention, backup plan, restore drill plan, incident response checklist, incident templates, Go/No-Go monitoring criteria, and next phases Phase P/Q/R are documented.
- Scans the runbook for secret-shaped values and rendered placeholder output.

Boundary:

- This is a static planning artifact only.
- It is not a production deployment and not production smoke.
- It does not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout.
- It does not change runtime behavior, auth guard, permission guard, staging safety guard, provider modes, NODE_ENV, or APP_ENV.

## 35. smoke:financial-ledger-hardening Coverage

Phase P status: Financial Ledger Hardening Plan.

Document:

- `docs/FINANCIAL_LEDGER_HARDENING_PLAN.md`

Script:

- `src/local-smoke-tests/financialLedgerHardeningSmoke.js`

Command:

```powershell
npm run smoke:financial-ledger-hardening
```

Coverage:

- Confirms the financial ledger hardening plan exists.
- Confirms the document says `NOT production ready`, no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, and no live payout.
- Confirms hard financial safety boundaries, ledger model requirements, double-entry/balance integrity, deposit hardening, withdraw hardening, admin credit adjustment hardening, promotion/bonus/reward hardening, reconciliation plan, audit trail requirements, dual control plan, reports required before production, tests required before production, Go/No-Go financial criteria, and next phases Phase Q/R/S/T are documented.
- Scans the plan for secret-shaped values and rendered placeholder output.

Boundary:

- This is a static planning artifact only.
- It is not a production deployment and not production smoke.
- It does not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.
- It does not change financial runtime logic, auth guard, permission guard, staging safety guard, provider modes, NODE_ENV, or APP_ENV.

## 36. smoke:financial-ledger-runtime-contract Coverage

Phase Q status: Financial Ledger Runtime Design / Data Contract.

Document:

- `docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md`

Script:

- `src/local-smoke-tests/financialLedgerRuntimeContractSmoke.js`

Command:

```powershell
npm run smoke:financial-ledger-runtime-contract
```

Coverage:

- Confirms the Phase Q runtime data contract document exists.
- Confirms the document says `NOT production ready`, no production DB, no real money, no live payout, no live provider/payment/bank/SMS/Slip OCR, and no runtime money flow change.
- Confirms ledger account model contract, ledger entry data contract, transaction type contract, API contract draft, idempotency contract, dual control contract, reconciliation data contract, audit event contract, error contract, Phase R Go/No-Go criteria, and next phases Phase R/S/T/U are documented.
- Scans the contract for secret-shaped values, rendered placeholder output, production-ready wording, live-payout-enabled wording, and production-DB-enabled wording.

Boundary:

- Scope is docs + static smoke only.
- It is not a production deployment and not production smoke.
- It does not change runtime money flow.
- It does not add a migration.
- It does not require deploy.
- It does not require seed.
- It does not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.

## 37. smoke:financial-ledger-schema-dry-run Coverage

Phase R status: Ledger schema dry-run design + migration plan only.

Document:

- `docs/FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md`

Script:

- `src/local-smoke-tests/financialLedgerSchemaDryRunSmoke.js`

Command:

```powershell
npm run smoke:financial-ledger-schema-dry-run
```

Coverage:

- Confirms the Phase R schema dry-run plan exists.
- Confirms the document says `NOT production ready`, schema dry-run design only, migration plan only, no Prisma migration, no `schema.prisma` change, no production DB, no real money, no live payout, and no live provider/payment/bank/SMS/Slip OCR.
- Confirms proposed schema draft includes `ledger_accounts`, `ledger_entries`, `ledger_transactions`, `ledger_idempotency_keys`, `ledger_reconciliation_runs`, `ledger_reconciliation_items`, `ledger_admin_adjustment_requests`, `ledger_balance_snapshots`, and `ledger_audit_links`.
- Confirms ledger account, ledger entry, ledger transaction, idempotency, reconciliation, admin adjustment dual-control, index/constraint, migration dry-run, rollback, data backfill, Phase S Go/No-Go, and Phase S/T/U/V next-phase sections are documented.
- Scans the plan for secret-shaped values, rendered placeholder output, production-ready wording, live-payout-enabled wording, and production-DB-enabled wording.

Boundary:

- Scope is docs + static smoke only.
- It is not a production deployment and not production smoke.
- It does not change runtime money flow.
- It does not create a Prisma migration.
- It does not change `prisma/schema.prisma`.
- It does not require deploy.
- It does not require seed.
- It does not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.
