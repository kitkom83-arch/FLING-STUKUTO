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
- `src/staging-scripts/stagingDemoSeed.js` creates or refreshes the staging demo admin from `STAGING_DEMO_ADMIN_EMAIL` and `STAGING_DEMO_ADMIN_PASSWORD` only after the staging safety guard passes. It requires `STAGING_DEMO_MEMBER_USERNAME`, `STAGING_DEMO_MEMBER_PHONE`, and `STAGING_DEMO_MEMBER_PASSWORD` before writing the Lucky Wheel demo member, wallet, points, active status, and refreshed password hash. When the limited fixture env is present, it also creates a no-permission admin for authenticated `403` checks and a safe non-owner role/admin for permission update/restore UAT. Missing limited fixture env skips only that fixture with a safe reason and never prints credential values.
- `src/staging-scripts/stagingUatSmoke.js` targets the Render staging API by default, skips safely with exit `0` when staging demo admin password env is absent, verifies health/database/modes when env is present, checks admin auth leak behavior, logs in the Lucky Wheel member through `POST /api/auth/login` with body `{ phone: <username-or-phone>, password: <password> }`, and reads admin schedule/audit/security endpoints.
- `src/staging-scripts/stagingRolePermissionUatSmoke.js` targets the Render staging API by default, skips safely with exit `0` when staging demo admin env is absent, verifies the role-permission runtime endpoints, checks negative role-matrix paths, restores any temporary non-owner role permission update, confirms `admin.role.permissions.update` audit history when a safe role update runs, and scans responses for secret-shaped values.
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
- Confirm `node src\local-smoke-tests\adminBrowserRoutesSmoke.js` passes before browser UAT on `/admin`, `/admin/roles`, and `/admin-wheel`.
- Confirm `npm run smoke:admin-work-schedule` passes before validating admin schedule UI behavior in staging.
- Confirm `npm run smoke:admin-work-schedule-ui` passes before UAT on `/admin/work-schedules`.
- Confirm `node src\local-smoke-tests\adminRoleManagementSmoke.js` passes before UAT on `/admin/roles` when a safe local/staging DB-backed target and staging-only admin credentials are available.
- Confirm `npm run smoke:admin-audit-security` passes before UAT on `/admin/audit-security` when a safe DB-backed staging/local target is available.
- Confirm local smoke commands are run only after the backend is pointed at the approved safe target.
- Confirm logs redact database URLs, JWTs, tokens, API keys, callback secrets, provider payloads, passwords, and raw authorization headers.
- Confirm `npm run staging:preflight` passes before deploy handoff and again after deploy when `BASE_URL` points at staging.
- Confirm migrations ran through `npm run db:migrate:staging`, not raw Prisma deploy, after the staging DB target was confirmed.
- Confirm demo seed ran through `npm run staging:db:seed` only if demo data was missing.
- Confirm demo admin/member seed ran through `npm run staging:seed-demo` only after `STAGING_DEMO_ADMIN_EMAIL`, `STAGING_DEMO_ADMIN_PASSWORD`, `STAGING_DEMO_MEMBER_USERNAME`, `STAGING_DEMO_MEMBER_PHONE`, and `STAGING_DEMO_MEMBER_PASSWORD` were set in Render Environment. For full Phase H role-permission UAT, also set the limited fixture env listed below before running the seed.
- Confirm `npm run staging:db:check` passes with required schema and demo fixtures.
- Confirm `npm run smoke:staging-uat` passes against the Render staging API when staging demo admin env is present. Without that env, the command must return the documented SKIP-SAFE output and exit `0`.
- Confirm `npm run smoke:staging-role-permission-uat` passes against the Render staging API when staging demo admin env is present. Without that env, the command must return the documented SKIP-SAFE output and exit `0`.

## UAT Handoff Checklist

Use this checklist when handing staging to testers. It authorizes staging UAT only, with no production database, no live provider/payment/bank/SMS/Slip OCR mode, and no real-money flow.

- Staging URL: `https://stukuto-real-core-staging.onrender.com`.
- Admin shell URL: `https://stukuto-real-core-staging.onrender.com/admin`.
- Role Management URL: `https://stukuto-real-core-staging.onrender.com/admin/roles`.
- Admin Wheel Phase C URL: `https://stukuto-real-core-staging.onrender.com/admin-wheel`.
- Phase F admin browser QA doc: `docs/STAGING_ADMIN_BROWSER_QA.md`.
- Phase C handoff doc: `docs/ADMIN_WHEEL_HANDOFF.md`.
- API base URL for smoke commands: `https://stukuto-real-core-staging.onrender.com/api`.
- Health check path: `GET /api/health`.
- Health check must show `success: true`, `data.ok: true`, `data.databaseConnected: true`, and external modes only as `mock`, `sandbox`, or `disabled`.
- Smoke commands before handoff:
  - `npm run check`
  - `node src\local-smoke-tests\adminBrowserRoutesSmoke.js`
  - `node src\local-smoke-tests\adminWheelUiSmoke.js`
  - `npm run staging:preflight`
  - `npm run staging:db:check`
  - `npm run smoke:staging`
  - `npm run smoke:staging-uat`
  - `npm run smoke:staging-role-permission-uat`
- Login test scope: staging demo admin/member only, with credentials supplied through the secret manager or another approved out-of-repo channel.
- Safe negative login test: invalid admin login must return a controlled JSON failure such as `401`/auth failure and must not return `500`, token values, password hints, stack traces, or secret-shaped data.
- Admin schedule UI scope: testers may verify schedule list/read/update behavior, emergency override behavior, schedule-blocked login behavior, and masked audit history for staging demo admins only.
- Audit/security UI scope: testers may verify audit log filters, security event filters, summary counts, empty states, masked IP values, and safe detail modals only.
- Role Management UI scope: testers may open `/admin/roles`, review grouped permission matrix rows, preview effective permissions, assign/revoke permissions for non-owner roles only, enter a required reason, confirm `admin.role.permissions.update` audit history, and verify Save stays disabled without a change plus reason.
- Role Permission Runtime UAT scope: testers may run `npm run smoke:staging-role-permission-uat` only against the staging API. The smoke uses `STAGING_DEMO_ADMIN_EMAIL` and `STAGING_DEMO_ADMIN_PASSWORD`, never prints the token, checks catalog/roles/detail reads, validates `401` no-auth, missing-reason, invalid-key, `admin.manage` forbidden, and owner/super_admin protected-role failures, then performs a temporary non-owner role permission change only when a safe staging/demo role with assigned admins exists.
- Admin browser route scope: testers may open `/admin`, `/admin/roles`, and `/admin-wheel` directly, refresh each route, verify static assets load, and confirm the browser Console has no red errors.
- Rollback condition: stop handoff and roll back or disable staging access if health fails, DB disconnects, smoke fails, an invalid login returns `500`, any secret-shaped value appears, any external mode is `live`, or any real-money/provider/bank path is reachable.
- NO live money/provider mode: game provider, payment, bank statement, SMS, and Slip OCR must stay `mock`, `sandbox`, or `disabled`; live mode is not approved for this handoff.
- Demo credentials must live in Render Environment/Secrets, a password manager, or another approved secret manager only. Do not write them into docs, logs, commits, screenshots, issue trackers, or chat.
- UAT smoke uses `STAGING_DEMO_ADMIN_EMAIL` and `STAGING_DEMO_ADMIN_PASSWORD` when they are present. Lucky Wheel member UAT calls `POST /api/auth/login`; the API request body key is `phone`, and the value may be the configured member username or phone because member auth searches both columns. The smoke prefers `STAGING_DEMO_MEMBER_USERNAME`, falls back to `STAGING_DEMO_MEMBER_PHONE`, and requires `STAGING_DEMO_MEMBER_PASSWORD`. `STAGING_DEMO_MEMBER_PHONE` is still required by `staging:seed-demo` because the member table requires a phone value.
- Role permission UAT can optionally use `STAGING_NO_PERMISSION_ADMIN_EMAIL` or `STAGING_NO_PERMISSION_ADMIN_USERNAME` with `STAGING_NO_PERMISSION_ADMIN_PASSWORD` to verify an authenticated `403` no-permission path. If those optional env values are absent, only that sub-check reports `SKIPPED`; no guard is lowered.
- Phase H role permission UAT uses `STAGING_NO_PERMISSION_ADMIN_EMAIL` or `STAGING_NO_PERMISSION_ADMIN_USERNAME` plus `STAGING_NO_PERMISSION_ADMIN_PASSWORD` for the no-permission negative, and `STAGING_SAFE_ROLE_NAME`, `STAGING_SAFE_ROLE_ADMIN_EMAIL` or `STAGING_SAFE_ROLE_ADMIN_USERNAME`, plus `STAGING_SAFE_ROLE_ADMIN_PASSWORD` for the safe role/admin fixture. When those env values are present and `npm run staging:seed-demo` has run, `npm run smoke:staging-role-permission-uat` must report no-permission negative `PASS (403)`, valid minimal change `PASS`, restore `PASS`, and audit log `PASS`.
- If any credential was exposed outside the approved secret channel, rotate it before tester handoff.
- If a DB-backed runtime smoke reports SKIP-SAFE, SKIPPED, or BLOCKED because the safe local/staging env guard is not satisfied, record the reason and continue only with the checks that are valid for the configured environment. Do not lower auth, permission, staging, or provider-mode guards to force a pass.
- Do not screenshot Render ENV, database settings, shell output, request headers, or any page that shows raw secret values.

## Admin Bank Account Review UAT Checklist

Phase AN Admin Bank Account Review Release Pack / UAT Checklist covers staging/mock handoff for Pending Bank Accounts, approve/reject modal, reason required, audit/history, operator handoff, permission behavior, safe error state, and response leak scan.

Required docs:

- `docs/ADMIN_BANK_ACCOUNT_REVIEW_UAT_CHECKLIST.md`
- `docs/ADMIN_BANK_ACCOUNT_REVIEW_OPERATOR_RUNBOOK.md`
- `docs/ADMIN_BANK_ACCOUNT_REVIEW_RELEASE_PACK.md`

Required smoke:

```powershell
npm run smoke:admin-bank-account-review-release-pack
npm run smoke:admin-guarded-bank-account-review
npm run smoke:admin-operator-handoff
```

Manual staging/mock browser checks:

- Dashboard loads.
- Member List loads.
- Pending Bank Accounts loads and shows pending accounts or a safe empty state.
- Approve modal opens.
- Reject modal opens.
- Empty reason validates before submit.
- Authorized plus reason succeeds only in local/staging/mock.
- Duplicate reviewed returns safe `409`.
- Bank Account Review Audit / Review History shows `member.bank.approve` and `member.bank.reject` when audit fixture exists.
- Operator Handoff is visible.
- Permission behavior is correct for `members.bank.view`, `members.bank.approve`, and `admin.audit.view`.
- Console has no red errors.
- UI shows no `missing display value`, no `invalid numeric display`, and no dangerous buttons for credit/debit, payout, live transfer, provider live, or approve withdrawal.

Safety boundary:

- No production DB.
- No real money.
- No live provider/payment/bank/SMS/Slip OCR.
- No migration.
- No deploy.
- No credit/debit.
- No payout.
- No new runtime write action.

## Payment Provider Roadmap UAT Backlog

Status: backlog / next phase after Phase AN. This is a docs-only UAT backlog for Payment Provider Roadmap: Dual TrueMoney + QR Gateway + Bank Verification. It does not approve production DB, real money, live provider/payment/bank/SMS/Slip OCR, credit/debit runtime action, payout, withdrawal approve, migration, deploy, or runtime money-flow change.

Future UAT backlog:

- QR display.
- Download QR.
- Open full screen QR.
- Copy amount.
- Copy reference/orderId.
- Upload slip fallback.
- Confirm deposit fallback.
- One-device mobile flow copy: if the customer has one phone, download QR and scan it from the phone gallery in the bank app.
- TrueMoney official mock using provider key `truemoney_official`.
- TMNOne mock using provider key `tmnone`.
- QR Payment / Payment Gateway mock using provider key `qr_payment_gateway`.
- Slip verification mock using provider key `slip_verification`.
- Statement mock using provider key `bank_statement`.
- SMS fallback manual_review using provider key `bank_sms_fallback`.
- Manual Admin fallback using provider key `manual_admin`.
- No auto credit from SMS only.
- SMS fallback status must be `sms_detected -> manual_review`, not `sms_detected -> credited`.
- No live provider.
- No real money.
- Frontend must not decide credit posting.
- Provider event must pass idempotency + audit + reconciliation guard before future credit posting.

Future provider verification must stay mock/sandbox/staging only with no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no migration, no deploy, no hardcoded secret/token/password/DATABASE_URL, no payout, and no withdrawal approve.

## Phase AO Payment Provider Contract UAT Checklist

Status: Phase AO is provider contract/mock only. It does not enable live provider, live TrueMoney, live TMNOne, production DB, real money, payout, withdrawal approve, credit/debit runtime action, migration, deploy, or runtime money-flow.

Required smoke:

```powershell
npm run smoke:payment-provider-contract
```

Checklist:

- Provider contract review includes `truemoney_official`, `tmnone`, `qr_payment_gateway`, `slip_verification`, `bank_statement`, `bank_sms_fallback`, and `manual_admin`.
- TrueMoney Official mock creates a normalized mock deposit event.
- TMNOne mock creates normalized transaction history and transaction info events.
- QR gateway mock creates a QR order contract and QR download UX contract.
- QR download UX contract includes download QR, open full screen QR, copy amount, copy reference/orderId, and upload slip fallback.
- Slip verification mock supports verified match.
- Slip verification uncertain result becomes manual_review.
- Statement API mock fetch supports matched and unmatched records.
- Statement unmatched result becomes manual_review.
- SMS fallback creates manual_review only.
- SMS-only cannot credit.
- Duplicate provider transaction id guard is present.
- Duplicate raw hash guard is present.
- No live provider is enabled.
- No real money is used.
- No production DB is used.
- No payout is available.
- No hardcoded secret/token/password/PIN/deviceId/DATABASE_URL is present.
- Display checks must avoid missing display value, invalid numeric display, and raw object display value.

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

5. Run the role permission runtime UAT smoke:

```powershell
npm run smoke:staging-role-permission-uat
```

6. If credentialed UAT smoke skips because demo admin env is missing, set `STAGING_DEMO_ADMIN_EMAIL` and `STAGING_DEMO_ADMIN_PASSWORD` in Render Environment and run the guarded seed.
7. If Lucky Wheel member UAT skips or login fails after a password change, set `STAGING_DEMO_MEMBER_USERNAME`, `STAGING_DEMO_MEMBER_PHONE`, and `STAGING_DEMO_MEMBER_PASSWORD` in Render Environment, rerun `npm run staging:seed-demo` so the member password hash/status/points/wallet are refreshed, then rerun `npm run smoke:staging-uat`.
8. Check Lucky Wheel member config through `GET /api/member/wheel/config` using staging member auth only.
9. Check Lucky Wheel spin through `POST /api/member/wheel/spin` with only `campaignId`; this must stay mock/sandbox and backend-selected.
10. Check member wheel history and my rewards through `/api/member/wheel/history` and `/api/member/wheel/my-rewards`.
11. Check admin Lucky Wheel config, rewards, spins, reports, and audit through staging admin auth only.
12. Confirm no real money movement, no real payout, and no production ledger action occurred.
13. Confirm game provider, payment, bank statement, SMS, and Slip OCR are not live.
14. Run the local secret-shaped scan before reporting handoff results.
15. Record the Safe CI Run ID, commit hash, Render deploy ID or timestamp, and staging URL. Do not record secret values, DB URLs, request headers, passwords, tokens, or provider credentials.

Stop UAT immediately if health fails, `databaseConnected` is not `true`, an external mode is `live`, a response leaks secret-shaped data, or any real-money/provider/bank path becomes reachable.

## Admin Lucky Wheel UAT Checklist

Use this checklist only with approved staging/mock admin and member accounts. Do not use production DB, live provider/payment/bank/SMS/Slip OCR modes, real money, or real payout flows.

Phase C is Admin Wheel UI Manual QA + Handoff. Use `docs/ADMIN_WHEEL_HANDOFF.md` as the operator/admin browser checklist before handing `/admin-wheel` to testers.

### Admin Wheel UI Manual QA Checklist

- Open `https://stukuto-real-core-staging.onrender.com/admin-wheel` and confirm `Lucky Wheel Admin Console` renders.
- Confirm all tabs open: Campaign settings, Rewards management, Spin history, Reports, Audit history, and Reward Claims.
- Confirm the `Permission summary` panel shows current role, site code, campaign view/update, reward manage, claims view/update, reports view, and audit view.
- Confirm an account without a view permission sees `ไม่มีสิทธิ์เข้าถึง` and `กรุณาติดต่อผู้ดูแลระบบ` on that tab.
- Confirm an account without write permission sees Save campaign, Add reward, Edit reward, Mark claimed, and Cancel disabled with `ไม่มีสิทธิ์ดำเนินการนี้`.
- Confirm Campaign settings save rejects blank `Reason`, then saves with a staging-safe reason and creates `wheel.campaign.update`.
- Confirm Rewards management add/edit/enable/disable rejects blank `Reason` and creates the expected reward audit action.
- Confirm Reward Claims filter by status, detail modal opens/closes, claim is available only for pending item rewards, cancel is available only for pending rewards, and both actions require `Reason`.
- Confirm Reports show summary cards, top rewards, stock usage, claim status summary, reward type summary, daily spin count, and member reward summary from staging/mock data.
- Confirm Audit history filters actions and can show `wheel.campaign.update`, `wheel.reward.create`, `wheel.reward.update`, `wheel.reward.status.update`, and `wheel.memberReward.status.update`.
- Confirm browser Console has no red errors, modals do not overflow, desktop tables scroll horizontally when needed, and empty states show `ไม่พบข้อมูล`.
- Confirm the UI does not call member spin endpoints and does not expose force reward, force spin, or set-prize-index controls.
- Confirm responses, details, docs, logs, and screenshots do not expose real credentials, connection strings, raw request headers, raw stacks, or raw unmasked IPs.
- Run `node src\local-smoke-tests\adminWheelUiSmoke.js` before browser UAT. If DB-backed runtime env is safe and complete, also run `node src\local-smoke-tests\adminWheelRuntimeSmoke.js`; SKIPPED by safety guard is acceptable only when the script reports the missing local env reason and confirms no production DB/no real provider/no real money.

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
- Admin spin history check: `GET /api/admin/wheel/spins` must return sanitized rows with reward type, cost type/amount, backend `prizeIndex`, spin ID, masked IP values, and user-agent hash when present.
- Admin Reward Claims check: `GET /api/admin/wheel/member-rewards` must return sanitized `{ rows, summary }`; claim/cancel uses `PATCH /api/admin/wheel/member-rewards/:id/status` with required `reason`, admin auth, site access, permission guard, and `wheel.memberReward.status.update` audit. Manual `claimed` is for staging/mock `item` rewards only and must not perform real payout, wallet credit, point/ticket mutation, provider, bank, payment, SMS, or Slip OCR action.
- Admin reports check: the Admin Lucky Wheel reports tab must derive only from admin config/spins/member-rewards and show total spins, unique members spun, rewards issued, pending/claimed/expired/cancelled rewards, total point cost, total ticket cost, stock used, top reward, top stock-used reward, empty/no reward count, stock usage, reward type summary, daily spin count, claim status summary, and member reward summary without `invalid numeric display` or `missing display value`.
- Audit history check: audit history must come from the existing admin audit endpoint and show safe time, actor/admin, action, target type, target ID, site code, reason, before summary, and after summary only, including `wheel.memberReward.status.update`.
- Permission contract check: Lucky Wheel routes must use `wheel.view`/`wheel.campaign.view`, `wheel.campaign.update`, `wheel.rewards.create`, `wheel.rewards.update`, `wheel.rewards.status.update`, `wheel.spins.view`, `wheel.claims.view`, `wheel.claims.status.update`, and `wheel.audit.view`/`admin.audit.view` as documented in `docs/ADMIN_PERMISSION_MATRIX.md`.
- Secret leak check: responses, UI details, docs, logs, and smoke output must not expose raw tokens, auth headers, passwords, provider secrets, database URLs, raw stack traces, or raw unmasked IPs.
- Rollback note: if any Lucky Wheel check fails, disable staging tester access or roll back the staging deploy; keep provider modes mock/sandbox and do not switch to production DB as a workaround.

### Lucky Wheel Staging Preflight Checklist

- Member wheel config: verify `GET /api/member/wheel/config` returns public campaign/reward fields only.
- Member wheel spin: verify `POST /api/member/wheel/spin` sends only `campaignId` and receives a backend-selected result.
- Member wheel history: verify `GET /api/member/wheel/history` returns sanitized rows or an empty array.
- Member my rewards: verify `GET /api/member/wheel/my-rewards` returns sanitized pending/claimed/expired rows or an empty array.
- Admin wheel campaign config: verify `GET /api/admin/wheel/config` and campaign edits require staging admin auth plus non-empty `reason`.
- Admin wheel permission panel: verify `/admin-wheel` reads `GET /api/admin/permissions/me`, shows only safe role/site/can-do summary values, and does not render raw permission objects.
- Admin role management: verify `/admin/roles` reads `GET /api/admin/permissions/me`, `GET /api/admin/permissions/catalog`, and `GET /api/admin/roles`; owner/super_admin are shown as guard-protected; normal-role writes require reason and create `admin.role.permissions.update`.
- Admin rewards: verify create/edit reward uses staging/mock data only and rejects empty `reason`.
- Admin Reward Claims: verify list filters for date range, member, reward type, status, campaign, and source spin ID; verify claim/cancel rejects empty `reason`, creates audit, and never changes reward value or performs live payout.
- Admin spin history: verify `GET /api/admin/wheel/spins` returns sanitized rows, supports reward ID filtering, and shows masked IP plus user-agent hash only when available.
- Admin reports: verify reports render client-side summaries from config/spins/member-rewards only, including empty/no reward count, daily spin count, claim status summary, and member reward summary, and never show `invalid numeric display`, `missing display value`, or real-money payout data.
- Audit history: verify wheel audit rows show safe time, actor/admin, action, target type, target ID, site code, reason, before summary, and after summary only.
- Secret leak scan: verify smoke output, API responses, docs, logs, and UI details do not expose DB URLs, tokens, passwords, auth headers, provider secrets, raw stacks, or raw IPs.
- Rollback note: if any item fails, stop UAT, keep external modes mock/sandbox/disabled, disable staging tester access or roll back the staging deploy, and never point staging at production DB.

- Open `/admin/lucky-wheel/` and confirm the page shows `Lucky Wheel Admin Console`, `Staging / Mock Admin Console`, `No real money / no live provider`, site code, active/inactive status, last updated, and the response leak warning.
- Confirm Campaign settings loads through `GET /api/admin/wheel/config` or shows a safe error state.
- Confirm Save campaign without `reason` fails before API submission.
- Confirm Save campaign with `reason` uses only approved staging/mock data and writes audit context.
- Confirm Create/Edit reward opens the modal and rejects empty `reason`; confirm Enable/Disable reward uses a reason and creates a status audit row.
- Confirm reward payloads do not include `stockUsed`, `rewardId`, `prizeIndex`, or member spin result fields.
- Confirm Reward Claims list loads sanitized pending/claimed/expired/cancelled rewards, shows detail modal fields, and claim/cancel requires `reason` before calling the backend.
- Confirm Mark as claimed is available only for appropriate manual item rewards and does not run real payout, wallet credit, point/ticket mutation, provider, bank, payment, SMS, or Slip OCR.
- Confirm Spin history loads sanitized rows or `ไม่พบข้อมูล`, shows masked IP only, and detail modal does not expose raw IP, user-agent, token, password, secret, authorization header, or database URL.
- Confirm Reports derive from admin config/spins only and never show `invalid numeric display` or `missing display value`; zero-spin state must render `0`, `0 %`, `ไม่จำกัด`, or `ไม่พบข้อมูล`.
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

Create or refresh only the staging UAT demo admin:

```bash
npm run staging:seed-demo
```

Set the staging demo member env in Render before this command when Lucky Wheel member UAT is required:

- `STAGING_DEMO_MEMBER_USERNAME`
- `STAGING_DEMO_MEMBER_PHONE`
- `STAGING_DEMO_MEMBER_PASSWORD`

Set the Phase H limited role-permission fixture env in Render before this command when full role-permission UAT must run without SKIPPED sections:

- `STAGING_NO_PERMISSION_ADMIN_EMAIL` or `STAGING_NO_PERMISSION_ADMIN_USERNAME`
- `STAGING_NO_PERMISSION_ADMIN_PASSWORD`
- `STAGING_SAFE_ROLE_NAME` (default: `staging_safe_role`)
- `STAGING_SAFE_ROLE_ADMIN_EMAIL` or `STAGING_SAFE_ROLE_ADMIN_USERNAME`
- `STAGING_SAFE_ROLE_ADMIN_PASSWORD`

The no-permission admin is active, site-bound, and has no `admin.roles.view`, `admin.roles.update`, or `admin.manage`. The safe role/admin fixture is non-owner, non-super_admin, starts with `wheel.view` and `wheel.reports.view`, and is used only so the smoke can add/revoke one safe permission and immediately restore the original list. Passwords must come from Render Environment/Secrets only; do not put real values in docs, logs, screenshots, tickets, commits, or chat.

These values must live only in Render Environment/Secrets or another approved secret manager. Do not paste the member password, admin password, tokens, authorization headers, JWTs, or DB URLs into docs, logs, screenshots, issue trackers, or chat.

For Render Free, use a temporary start command only long enough to run the seed:

```bash
npm run staging:seed-demo && npm start
```

After the deploy logs show the sanitized seed result, change the start command back to `npm start` and redeploy. Render Free does not provide practical one-off jobs or SSH for this workflow, so do not leave the seed command in place.

Verify schema and fixtures:

```bash
npm run staging:db:check
```

Verify hosted UAT readiness against Render:

```bash
BASE_URL=https://stukuto-real-core-staging.onrender.com/api npm run smoke:staging-uat
BASE_URL=https://stukuto-real-core-staging.onrender.com/api npm run smoke:staging-role-permission-uat
```

PowerShell equivalent:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-uat
npm run smoke:staging-role-permission-uat
```

Required env values must live only in Render Environment/Secrets or an ignored local shell. Do not commit or paste `DATABASE_URL`, admin password, JWT secret, tokens, provider keys, callback secrets, or credential scheme values.

Role permission runtime UAT requires:

- `BASE_URL` pointing at the HTTPS staging API.
- `APP_ENV`/`STAGING_MODE` set to staging, mock, sandbox, QA, or another safe non-production label.
- Provider modes for game, payment, bank statement, SMS, and Slip OCR unset, `mock`, `sandbox`, or `disabled`.
- `STAGING_DEMO_ADMIN_EMAIL` and `STAGING_DEMO_ADMIN_PASSWORD` for credentialed checks.
- `STAGING_NO_PERMISSION_ADMIN_EMAIL` or `STAGING_NO_PERMISSION_ADMIN_USERNAME` plus `STAGING_NO_PERMISSION_ADMIN_PASSWORD` for the authenticated no-permission `403` check when Phase H is being closed.
- `STAGING_SAFE_ROLE_NAME`, `STAGING_SAFE_ROLE_ADMIN_EMAIL` or `STAGING_SAFE_ROLE_ADMIN_USERNAME`, and `STAGING_SAFE_ROLE_ADMIN_PASSWORD` for the valid minimal permission change/restore path when Phase H is being closed.

The script never edits `owner` or `super_admin` through the role matrix. With the Phase H fixture env present, it targets the seeded safe role, requires at least one assigned staging admin, performs a valid temporary update, verifies the role detail changed, restores the original permissions immediately, verifies the restored detail, and then checks `admin.role.permissions.update` audit history. If the Phase H fixture env is absent, only the corresponding fixture-dependent sections may report `SKIPPED`; no auth guard, permission guard, staging safety guard, reason requirement, audit requirement, owner/super_admin protection, or response leak scan may be lowered.

## UAT GO / NO-GO

GO for staging UAT only when all items are true:

- `/api/health` returns HTTP `200`, `APP_ENV=staging`, `databaseConnected=true`, and all external modes are `mock`, `sandbox`, or `disabled`.
- `npm run db:migrate:staging` completed against staging/test DB only.
- `npm run staging:db:check` passes.
- `npm run smoke:staging` passes.
- `npm run smoke:staging-uat` passes with staging demo admin env present. A local SKIP-SAFE result is acceptable only before credentialed UAT handoff.
- `npm run smoke:staging-role-permission-uat` passes with staging demo admin env present. For Phase H closure, limited fixture env must also be present and the no-permission negative, valid minimal change, restore, and audit log sections must report PASS with no SKIPPED fixture sections.
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
- Never commit `.env`, real database URLs, JWT secrets, provider API keys, callback secrets, passwords, or credential scheme tokens.
- Never paste secrets into docs, pull requests, issue trackers, screenshots, terminal transcripts, or chat.
- Use placeholders such as `<STAGING_DATABASE_URL>` or `<PROVIDER_SANDBOX_KEY>` only when a shape is needed.
- Rotate any secret immediately if it is printed, committed, screenshotted, or shared outside the approved secret store.
- Confirm secret leak scans pass before handoff.

## Phase I Admin Operator Handoff Final

Phase I status: Admin UI End-to-End Manual QA + Operator Handoff Final is documented for staging/manual browser handoff.

Operator handoff doc:

- `docs/ADMIN_OPERATOR_HANDOFF_FINAL.md`

Final browser pages:

- `/admin`
- `/admin/roles`
- `/admin-wheel`
- `/admin/audit-security`
- `/admin/work-schedules`

Final manual browser QA checklist:

- Use `docs/STAGING_ADMIN_BROWSER_QA.md`.
- Confirm route refresh does not return `404`.
- Confirm tabs, modals, disabled states, access-denied states, and reason validation.
- Confirm no `missing display value`, `invalid numeric display`, `raw object display value`, raw credential value, DB connection value, request auth header value, or JWT-shaped value is visible.

Required staging smoke before handoff:

```powershell
npm run smoke:staging-uat
npm run smoke:staging-role-permission-uat
npm run smoke:admin-browser-routes
npm run smoke:admin-operator-handoff
```

Render Start Command reminder:

- Normal service Start Command must be `npm start`.
- Seed commands are temporary only.
- After any seed deploy, change the Start Command back to `npm start` and redeploy.
- Do not keep `npm run staging:seed-demo && npm start` as the permanent service command.

Phase I remains staging/mock/sandbox only. No production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, and no real payout are approved.

## Phase J Release Gate Smoke

Use this after every staging deploy:

```powershell
npm run smoke:staging-release-gate
```

Release Gate Smoke is non-destructive:

- It checks safety guard, `/api/health`, database connectivity, and external mode labels.
- It checks admin auth negative behavior and demo admin login without printing credential values.
- It reads admin permissions, role catalog, Admin Wheel config/spins/member-rewards, and audit logs.
- It checks browser routes `/admin`, `/admin/roles`, `/admin-wheel`, `/admin/audit-security`, and `/admin/work-schedules`.
- It logs in the demo member and reads Lucky Wheel config, history, and my-rewards.
- It does not consume a member wheel spin.
- It does not PATCH role permissions.

Full UAT Smoke remains:

```powershell
npm run smoke:staging-uat
```

Use Full UAT after seed reset or before closing a major phase. It may consume a staging/mock member wheel spin. If member spin returns `400`, check the sanitized reason. Common safe causes are daily limit reached, not enough points, inactive campaign, or no active campaign. Reset the staging demo member/wheel state through the guarded seed and run Full UAT once.

Role Permission UAT remains:

```powershell
npm run smoke:staging-role-permission-uat
```

Use Role Permission UAT when role/permission behavior changes. It mutates a safe non-owner role only when the fixture exists, restores state immediately, and verifies `admin.role.permissions.update` audit history.

Release gate ENV names:

- `BASE_URL`
- `STAGING_DEMO_ADMIN_EMAIL` or `STAGING_DEMO_ADMIN_USERNAME`
- `STAGING_DEMO_ADMIN_PASSWORD`
- `STAGING_DEMO_MEMBER_USERNAME` or `STAGING_DEMO_MEMBER_PHONE`
- `STAGING_DEMO_MEMBER_PASSWORD`
- Optional: `STAGING_SAFE_ROLE_NAME`

Do not put real credential values in docs. Values must live only in Render Environment/Secrets or an approved secret manager.

## Phase K Staging Release Runbook

Use `docs/STAGING_RELEASE_RUNBOOK.md` as the staging release and rollback checklist before and after Render deploys.

Smoke policy:

- `npm run smoke:staging-release-gate` is the release gate. Run it after every deploy. It is non-destructive and does not consume member wheel spin.
- `npm run smoke:staging-uat` is Full UAT. Run it after seed/reset or before closing a major phase. It may consume member wheel spin.
- `npm run smoke:staging-role-permission-uat` is Role Permission UAT. Run it after role/permission changes. It mutates a safe non-owner role fixture and restores state immediately.

Seed/reset policy:

- Render Start Command must normally be `npm start`.
- Seed command is temporary only.
- After seed/reset, always change Start Command back to `npm start` and deploy latest commit again.
- Build Command must remain `npm install && npx prisma generate`.

Rollback and incidents:

- Roll back to the previous live deploy in Render.
- Check `/api/health`.
- Rerun `npm run smoke:staging-release-gate`.
- Use the Phase K runbook for 502 HTML auth responses, missing `express`, no open ports, member spin `400`, no-permission admin credential mismatch, and accidental seed Start Command incidents.

## Phase L Release Readiness Static Smoke

Run this before commit or before release:

```powershell
npm run smoke:staging-release-readiness
```

Release readiness is static/local:

- It checks package scripts, runbook/docs policy, rollback/incident checklist coverage, and secret-shaped value safety.
- It does not require staging credentials.
- It does not call the staging API.
- It is safe to run in Safe CI.

Release gate remains runtime staging:

```powershell
npm run smoke:staging-release-gate
```

Run the release gate after every deploy. Full UAT remains after seed/reset only, and Role Permission UAT remains after role/permission changes.
