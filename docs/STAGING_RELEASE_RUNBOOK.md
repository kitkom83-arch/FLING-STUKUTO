# Staging Release Runbook

Phase K defines the operator runbook for staging release, rollback, incident handling, and smoke policy. Use it only for the Render staging service and staging/mock/sandbox fixtures.

## 1. Scope

- Staging/mock/sandbox only.
- No production database.
- No real money.
- No live provider, payment, bank, SMS, or Slip OCR.
- No real payout.
- Do not paste real credential values into docs, chat, tickets, screenshots, terminal transcripts, commits, or logs.

## 2. Pre-Deploy Checklist

- Confirm `git status` is clean.
- Confirm the latest commit:

```powershell
git log -1 --oneline
```

- Check recent Safe CI runs:

```powershell
gh run list --branch main --limit 10
```

- Safe CI must be PASS before staging deploy.
- Run static release readiness before commit or release:

```powershell
npm run smoke:staging-release-readiness
```

- Run the Phase M production-readiness audit guard when planning pre-production gaps:

```powershell
npm run smoke:production-readiness-audit
```

- `docs/PRODUCTION_READINESS_GAP_AUDIT.md` is a readiness audit only. It is not a production deployment, does not change the staging safety boundary, and does not approve production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout.

- Run the Phase N production safety dry-run guard when rehearsing the pre-production safety plan:

```powershell
npm run smoke:production-safety-dry-run
```

- `docs/PRODUCTION_SAFETY_DRY_RUN.md` is a dry-run design only. It is not a production deployment, not production smoke, and not approval for production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout.

- Run the Phase O monitoring and backup runbook guard when rehearsing alerting, backup, restore, log retention, and incident escalation:

```powershell
npm run smoke:monitoring-backup-runbook
```

- `docs/MONITORING_BACKUP_RUNBOOK.md` is a planning artifact only. It is not a production deployment, not production smoke, and not approval for production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout.

- Run the Phase P financial ledger hardening guard when planning reconciliation, audit trail, dual control, deposit/withdraw certification, and no-live-payout boundaries:

```powershell
npm run smoke:financial-ledger-hardening
```

- `docs/FINANCIAL_LEDGER_HARDENING_PLAN.md` is a planning artifact only. It is not a production deployment, not production smoke, and not approval for production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.

- Run the Phase Q financial ledger runtime contract guard when reviewing ledger account, entry, transaction type, API, idempotency, dual control, reconciliation, audit, and error contracts:

```powershell
npm run smoke:financial-ledger-runtime-contract
```

- `docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md` is a docs/static smoke contract only. It is not a runtime implementation, not a migration, not a production deployment, and not approval for production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.

- Run the Phase R financial ledger schema dry-run guard when reviewing proposed ledger schema, migration dry-run, rollback, backfill, and Phase S Go/No-Go plans:

```powershell
npm run smoke:financial-ledger-schema-dry-run
```

- `docs/FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md` is a docs/static smoke plan only. It must not create Prisma migrations in Phase R, must not change `prisma/schema.prisma`, and is not approval for production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.

- Run the Phase S financial ledger mock runtime harness guard when reviewing isolated in-memory ledger logic:

```powershell
npm run smoke:financial-ledger-mock-runtime-harness
```

- `docs/FINANCIAL_LEDGER_MOCK_RUNTIME_HARNESS.md` and `src/ledger-mock/financialLedgerMockHarness.js` are isolated mock harness artifacts only. Phase S does not require Render deploy because there is no runtime behavior change. It does not require seed because there is no DB, schema, or fixture change. It does not require staging runtime smoke because no route, controller, service, provider, payment, bank, SMS, Slip OCR, or payout behavior changed. Do not use production DB, do not enable live payout, and do not bind the harness to production route/controller/service code.

- Run the Phase T financial ledger reconciliation mock reports guard when reviewing isolated mock reports and the local static read-only admin UI:

```powershell
npm run smoke:financial-ledger-reconciliation-mock-reports
```

- `docs/FINANCIAL_LEDGER_RECONCILIATION_MOCK_REPORTS.md`, `src/ledger-mock/financialLedgerReconciliationMockReports.js`, and `src/admin-reconciliation-readonly-ui/` are isolated mock reports and static read-only UI artifacts only. Phase T does not require Render deploy because there is no runtime behavior change. It does not require seed because there is no DB, schema, or fixture change. It does not require staging runtime smoke because no route, controller, service, provider, payment, bank, SMS, Slip OCR, payout, deposit, withdraw, provider callback, or admin-credit runtime behavior changed. Do not use production DB, do not enable live payout, do not bind the report/UI to production route/controller/service code, and do not add a real admin write action.

- Run the Phase U financial ledger live integration certification guard when reviewing the final checklist before any later live integration, staging dry-run migration, or DB-backed ledger prototype approval:

```powershell
npm run smoke:financial-ledger-live-integration-certification
```

- `docs/FINANCIAL_LEDGER_LIVE_INTEGRATION_CERTIFICATION_CHECKLIST.md` is docs/checklist/static smoke only. Phase U does not require Render deploy because there is no runtime behavior change. It does not require seed because there is no DB, schema, or fixture change. It does not require staging runtime smoke because no route, controller, service, provider, payment, bank, SMS, Slip OCR, payout, deposit, withdraw, provider callback, admin-credit, migration, schema, seed, or runtime behavior changed. Do not use production DB, do not enable live payout, do not enable live provider/payment/bank/SMS/Slip OCR, and do not make migration/schema/seed/runtime changes. Phase V requires explicit approval before it can start.

- Run the Phase V financial ledger staging dry-run migration guard when reviewing staging/disposable migration dry-run evidence:

```powershell
npm run smoke:financial-ledger-staging-dry-run-migration
```

- Phase V is dry-run only. `docs/FINANCIAL_LEDGER_STAGING_DRY_RUN_MIGRATION_PLAN.md`, `docs/FINANCIAL_LEDGER_STAGING_BACKUP_RESTORE_PROOF.md`, and `docs/FINANCIAL_LEDGER_STAGING_ROLLBACK_PROOF.md` are staging/disposable DB only artifacts. No deploy without explicit approval. No seed without explicit approval. No production DB. If a staging/disposable DB is missing, record NOT EXECUTED and do not fabricate migration, backup/restore, or rollback proof.

- Run the Phase AN Admin Bank Account Review Release Pack / UAT Checklist guard before handing the bank account review flow to staging/mock operators:

```powershell
npm run smoke:admin-bank-account-review-release-pack
```

- `docs/ADMIN_BANK_ACCOUNT_REVIEW_UAT_CHECKLIST.md`, `docs/ADMIN_BANK_ACCOUNT_REVIEW_OPERATOR_RUNBOOK.md`, and `docs/ADMIN_BANK_ACCOUNT_REVIEW_RELEASE_PACK.md` are docs/static release pack artifacts only. Phase AN does not require deploy because there is no runtime behavior change. It does not require migration or seed. It does not approve production DB, real money, live provider/payment/bank/SMS/Slip OCR, credit/debit, payout, withdrawal approve, or new runtime write actions. Staging/mock handoff still requires `members.bank.view`, `members.bank.approve`, `admin.audit.view`, reason required, audit required, duplicate reviewed safe `409`, response leak scan, and manual browser UAT evidence.

- Payment Provider Roadmap: Dual TrueMoney + QR Gateway + Bank Verification remains future phase backlog after Phase AN. Do not enable real money, live provider/payment/bank/SMS/Slip OCR, live transfer, credit/debit runtime action, payout, withdrawal approve, production DB, migration, or deploy from this roadmap note.

- Future payment/provider work is blocked until sandbox PASS, UAT PASS, reconciliation PASS, rollback PASS, audit PASS, permission PASS, secret scan PASS, and final approval. TrueMoney Official / Partner Gateway (`truemoney_official`), TMNOne (`tmnone`), QR Payment / Payment Gateway (`qr_payment_gateway`), Slip Verification (`slip_verification`), Statement API (`bank_statement`), Bank SMS fallback (`bank_sms_fallback`), and Manual Admin fallback (`manual_admin`) must stay mock/sandbox/staging only until that approval.

- SMS fallback is manual_review only. The allowed path is `sms_detected -> manual_review`; `sms_detected -> credited` is forbidden. Frontend must not decide credit posting. Provider event must pass idempotency + audit + reconciliation guard before future credit posting. No hardcoded secret/token/password/DATABASE_URL is allowed.

- Phase AO Payment Provider Contract / Dual TrueMoney Provider is provider contract/mock only. It adds docs, isolated mock contract, and `npm run smoke:payment-provider-contract`; it does not enable live provider, live TrueMoney, live TMNOne, real money, production DB, payout, withdrawal approve, credit/debit runtime action, migration, deploy, or runtime money-flow. Live provider work is allowed only after Phase AT certification with sandbox PASS, UAT PASS, reconciliation PASS, rollback PASS, audit PASS, permission PASS, secret scan PASS, webhook signature proof, credential handling proof, and final approval. SMS fallback remains manual review only.

- Render Build Command must be `npm install && npx prisma generate`.
- Render Start Command must be `npm start`.
- Seed command is temporary only. Do not leave it in the Render Start Command.
- Confirm the staging service still uses mock/sandbox/disabled external modes only.

## 3. Deploy Checklist

- Open Render.
- Go to the staging Web Service.
- Use Manual Deploy > Deploy latest commit.
- Wait until Render shows `Your service is live`.
- Check health:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
Invoke-RestMethod "$env:BASE_URL/health"
```

- Confirm `databaseConnected` is `true`.
- Confirm external service modes are `mock`, `sandbox`, or `disabled`.

## 4. Post-Deploy Release Gate

Run after every staging deploy:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-release-gate
```

Release gate policy:

- Non-destructive.
- Does not consume member wheel spin.
- Does not patch role permissions.
- Checks health, database connectivity, external modes, admin read-only endpoints, browser routes, member wheel read-only endpoints, role-permission audit reads, and response leak safety.

Release readiness policy:

- `npm run smoke:staging-release-readiness` is a static/local policy smoke.
- It runs before deploy and can run in Safe CI without staging credentials.
- It does not call the staging API.
- It checks package scripts, runbook/docs policy, CI-safe static wording, and secret-shaped value safety.
- It does not replace `npm run smoke:staging-release-gate`, which is the runtime staging smoke after deploy.

## 5. Full UAT Policy

Run only after seed reset or before closing a major phase:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-uat
```

Full UAT policy:

- It may consume a staging/mock member wheel spin.
- It should not be run repeatedly as a routine release gate.
- If member spin returns `400`, reset the staging demo member/wheel state through the guarded seed and run Full UAT once.

## 6. Role Permission UAT Policy

Run when role or permission behavior changes:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-role-permission-uat
```

Role Permission UAT policy:

- Mutates only a safe non-owner staging role fixture.
- Restores the original role permissions immediately.
- Requires the no-permission admin fixture and safe role fixture for full Phase H/role-permission closure.
- Must not grant owner, `super_admin`, or `admin.manage` through the role matrix.

## 7. Seed/Reset Policy

Use seed/reset only when fixture state must be refreshed for Full UAT or role-permission UAT.

Temporary Render Start Command:

```bash
NODE_ENV=staging npm run staging:seed-demo && npm start
```

Seed/reset steps:

- Set staging-only demo fixture values in Render Environment or the approved credential manager.
- Change the Render Start Command to the temporary command above.
- Deploy latest commit.
- Wait for sanitized seed PASS output.
- Change Render Start Command back to `npm start` immediately.
- Deploy latest commit again.
- Confirm the normal service is live.
- Do not leave the seed command in the Start Command.

## 8. Rollback Checklist

- In Render, roll back to the previous live deploy.
- Check health:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
Invoke-RestMethod "$env:BASE_URL/health"
```

- Run the release gate:

```powershell
npm run smoke:staging-release-gate
```

- If rollback still fails, check Render Build Command, Render Start Command, and Render logs.
- Keep staging connected only to staging/mock/sandbox resources.
- Never point staging at production as a rollback shortcut.

## 9. Incident Checklist

### 502 HTML from `/admin/auth/login`

- Check `/api/health` twice.
- Wait for the service to stabilize.
- Rerun `npm run smoke:staging-release-gate`.
- If it still fails, redeploy latest commit.

### Cannot find module `express`

- Confirm Build Command is `npm install && npx prisma generate`.
- Clear Render build cache and deploy again.

### No open ports detected

- Confirm the server binds `0.0.0.0`.
- Confirm the server uses `process.env.PORT`.

### Member spin `400`

- Full UAT consumes a spin.
- Reset the staging demo member/wheel state through the guarded seed.
- Run Full UAT once after reset.

### No-permission admin credential mismatch

- Check Render Environment values through the approved credential channel.
- Refresh the staging fixture through the guarded seed.

### Start Command is still a seed command

- Change Start Command back to `npm start` immediately.
- Deploy latest commit again.

## 10. ENV Safety

- Use masked input when entering local smoke credentials:

```powershell
$env:STAGING_DEMO_ADMIN_EMAIL = Read-Host "Staging demo admin email"
$env:STAGING_DEMO_ADMIN_PASSWORD = Read-Host -MaskInput "Staging demo admin credential"
$env:STAGING_DEMO_MEMBER_USERNAME = Read-Host "Staging demo member username"
$env:STAGING_DEMO_MEMBER_PASSWORD = Read-Host -MaskInput "Staging demo member credential"
```

- Do not paste real credential values into docs, chat, tickets, screenshots, commits, terminal transcripts, or logs.
- Clear local smoke values after the run.
- Clear PowerShell history after handling staging credentials.

## 11. Commands Copy/Paste

Health check:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
Invoke-RestMethod "$env:BASE_URL/health"
```

Release gate smoke:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-release-gate
```

Full UAT smoke:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-uat
```

Role permission UAT smoke:

```powershell
$env:BASE_URL = "https://stukuto-real-core-staging.onrender.com/api"
npm run smoke:staging-role-permission-uat
```

Cleanup local ENV:

```powershell
Remove-Item Env:\BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_ADMIN_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_ADMIN_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_MEMBER_USERNAME -ErrorAction SilentlyContinue
Remove-Item Env:\STAGING_DEMO_MEMBER_PASSWORD -ErrorAction SilentlyContinue
Clear-History
```

## Final Boundary

- Release readiness = static/local policy smoke before deploy.
- Production readiness audit = static/local pre-production planning artifact only.
- Production safety dry-run = static/local planning artifact only.
- Monitoring + backup runbook = static/local planning artifact only.
- Financial ledger hardening plan = static/local planning artifact only.
- Financial ledger runtime data contract = static/local contract artifact only.
- Financial ledger schema dry-run plan = static/local planning artifact only.
- Financial ledger mock runtime harness = isolated in-memory local smoke only.
- Release gate = run after every deploy.
- Full UAT = run after seed/reset only.
- Role Permission UAT = run after role permission changes.
- Seed command = temporary only.
- Start Command final = `npm start`.
- Build Command final = `npm install && npx prisma generate`.
- Staging remains mock/sandbox only.

## Phase M Production-Readiness Gap Audit

Phase M status: `docs/PRODUCTION_READINESS_GAP_AUDIT.md` records the remaining blockers before any production launch decision.

Run the static guard:

```powershell
npm run smoke:production-readiness-audit
```

This audit is not a production deployment and not a production smoke. It keeps provider/payment/bank/SMS/Slip OCR, Lucky Wheel payout, real money payout, production DB, and frontend-selected spin result boundaries off until later certified phases.

## Phase N Production Safety Dry Run

Phase N status: `docs/PRODUCTION_SAFETY_DRY_RUN.md` records the production safety dry-run design for checklist, ENV, smoke, rollback, incident, backup/restore, monitoring, RBAC, and financial safety rehearsal.

Run the static guard:

```powershell
npm run smoke:production-safety-dry-run
```

This dry-run is not a production deployment and not a production smoke. It is a planning artifact only. It must not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout, and it keeps staging mock/sandbox boundaries unchanged.

## Phase O Monitoring + Backup Runbook

Phase O status: `docs/MONITORING_BACKUP_RUNBOOK.md` records monitoring targets, alert severity/routing, log retention, backup, restore drill, incident response, incident templates, and monitoring Go/No-Go criteria.

Run the static guard:

```powershell
npm run smoke:monitoring-backup-runbook
```

This runbook is not a production deployment and not a production smoke. It is a planning artifact only. It must not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout, and it keeps staging mock/sandbox boundaries unchanged.

## Phase P Financial Ledger Hardening Plan

Phase P status: `docs/FINANCIAL_LEDGER_HARDENING_PLAN.md` records financial ledger hardening, reconciliation, money-affecting audit trail, dual control, deposit/withdraw certification, reports/tests required before production, and no-live-payout criteria.

Run the static guard:

```powershell
npm run smoke:financial-ledger-hardening
```

This plan is not a production deployment and not a production smoke. It is a planning artifact only. It must not use production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout, and it keeps staging mock/sandbox boundaries unchanged.

## Phase Q Financial Ledger Runtime Data Contract

Phase Q status: `docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md` records ledger account, ledger entry, transaction type, API, idempotency, dual control, reconciliation, audit event, error, and Phase R Go/No-Go contracts.

Run the static guard:

```powershell
npm run smoke:financial-ledger-runtime-contract
```

This contract is docs/static smoke only. It does not require Render deploy because there is no runtime behavior change. It does not require seed because there is no DB, schema, or fixture change. It does not require staging runtime smoke because no runtime route, controller, service, provider, payment, bank, SMS, Slip OCR, or payout behavior changed.

## Phase R Financial Ledger Schema Dry-Run Plan

Phase R status: `docs/FINANCIAL_LEDGER_SCHEMA_DRY_RUN_PLAN.md` records proposed ledger schema, migration dry-run, rollback, data backfill, idempotency, reconciliation, admin adjustment dual-control, index/constraint, and Phase S Go/No-Go plans.

Run the static guard:

```powershell
npm run smoke:financial-ledger-schema-dry-run
```

This plan is docs/static smoke only. It does not require Render deploy because there is no runtime behavior change. It does not require seed because there is no real DB, schema, fixture, or seed data change. It does not require staging runtime smoke because no runtime route, controller, service, provider, payment, bank, SMS, Slip OCR, or payout behavior changed. Prisma migration creation is forbidden in Phase R.

## Phase S Financial Ledger Mock Runtime Harness

Phase S status: `docs/FINANCIAL_LEDGER_MOCK_RUNTIME_HARNESS.md` records the isolated mock runtime harness for in-memory ledger logic only, and `src/ledger-mock/financialLedgerMockHarness.js` implements the local harness.

Run the local guard:

```powershell
npm run smoke:financial-ledger-mock-runtime-harness
```

This phase does not require Render deploy because the harness is isolated and there is no runtime behavior change. It does not require seed because there is no DB, schema, fixture, or seed data change. It does not require staging runtime smoke because no route, controller, service, provider, payment, bank, SMS, Slip OCR, or payout behavior changed. It must not use production DB, must not enable live payout, and must not bind the harness to production route/controller/service code.

## Phase T Financial Ledger Reconciliation Mock Reports

Phase T status: `docs/FINANCIAL_LEDGER_RECONCILIATION_MOCK_REPORTS.md` records isolated reconciliation mock reports, and `src/admin-reconciliation-readonly-ui/` provides a local static read-only admin UI.

Run the local guard:

```powershell
npm run smoke:financial-ledger-reconciliation-mock-reports
```

This phase does not require Render deploy because the reports and UI are isolated and there is no runtime behavior change. It does not require seed because there is no DB, schema, fixture, or seed data change. It does not require staging runtime smoke because no route, controller, service, provider, payment, bank, SMS, Slip OCR, payout, deposit, withdraw, provider callback, or admin-credit runtime behavior changed. It must not use production DB, must not enable live payout, must not bind reports/UI to production route/controller/service code, and must not add a real admin write action.

## Phase U Financial Ledger Live Integration Certification Checklist

Phase U status: `docs/FINANCIAL_LEDGER_LIVE_INTEGRATION_CERTIFICATION_CHECKLIST.md` records the certification checklist before any live integration, staging dry-run migration, DB-backed ledger staging prototype, or provider/payment/bank sandbox certification approval.

Run the static guard:

```powershell
npm run smoke:financial-ledger-live-integration-certification
```

This phase does not require Render deploy because it is docs/checklist/static smoke only and there is no runtime behavior change. It does not require seed because there is no DB, schema, fixture, or seed data change. It does not require staging runtime smoke because no route, controller, service, provider, payment, bank, SMS, Slip OCR, payout, deposit, withdraw, provider callback, admin-credit, migration, schema, seed, or runtime behavior changed. It must not use production DB, must not enable live payout, must not enable live provider/payment/bank/SMS/Slip OCR, and must not make migration/schema/seed/runtime changes. Phase V requires explicit approval before it can start.

## Phase V Financial Ledger Staging Dry-Run Migration

Phase V status: staging dry-run migration only after explicit approval.

Run the static guard:

```powershell
npm run smoke:financial-ledger-staging-dry-run-migration
```

Phase V is dry-run only and staging/disposable DB only. It is not a Render deploy, not a seed/reset, not a production migration, not a runtime money-flow change, not real money, not live payout, and not live provider/payment/bank/SMS/Slip OCR.

Evidence to collect:

- repo preflight result
- Safe CI PASS result
- reviewed Phase P/Q/R/S/T/U docs
- env classification as staging/disposable only
- redacted connection info only
- `prisma migrate diff` dry-run summary when safely executed
- backup/restore proof result or NOT EXECUTED
- rollback proof result or NOT EXECUTED
- smoke result
- no secret output confirmation

If staging DB is missing, record NOT EXECUTED for dry-run, backup/restore proof, and rollback proof. Do not connect to another target as a substitute.

Stop conditions:

- target looks production-like
- target cannot be classified as staging/disposable
- schema diff is unexpected
- backup/restore cannot be proven safely
- rollback cannot be proven safely
- any secret-shaped value would be printed
- any deploy or seed would be required
- any live provider/payment/bank/SMS/Slip OCR, live payout, or real-money path appears

## Phase AP Member QR Deposit UX / Mock QR Download Note

- Phase AP is member QR deposit UX contract/mock only.
- Mock QR download is not a real payment QR.
- Live QR provider enablement is blocked in this phase.
- QR download must never credit member.
- Live provider work remains blocked until Phase AT certification.

## Phase AQ Deposit Verification Source Mock Harness Note

- Phase AQ is deposit verification source mock only.
- Source verification status is mock contract evidence only.
- No runtime auto-credit is enabled.
- No live provider enablement is allowed.
- No real QR/payment validation is allowed.
- Live verification only after Phase AT certification.
