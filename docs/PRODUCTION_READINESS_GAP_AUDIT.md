# Production Readiness Gap Audit

Phase M is a readiness audit only. It is not a production deployment plan, not an approval to enable production, and not an approval to connect live provider, payment, bank, SMS, or Slip OCR systems.

## 1. Executive summary

Status: NOT production ready.

The current system is staging/mock/sandbox only. Existing checks show strong staging readiness, but production operation remains blocked because real database isolation, secret management, live integration certification, monitoring, backup/restore, incident response, compliance, and operator controls are not complete.

This audit does not change the staging safety boundary. It does not authorize production DB access, real money, live provider/payment/bank/SMS/Slip OCR, real payout, or any safety guard reduction.

## 2. Current staging strengths

- Safe CI is documented and passing for static and syntax safety.
- Release readiness smoke exists as a static/local policy guard.
- Release gate smoke exists as a non-destructive hosted staging guard.
- Role permission UAT covers catalog, role reads, negative permission paths, safe role update/restore, and audit lookup when fixtures are seeded.
- Admin browser QA covers `/admin`, `/admin/roles`, `/admin-wheel`, `/admin/audit-security`, and `/admin/work-schedules`.
- Lucky Wheel backend, member UAT, and admin UAT are covered for staging/mock flows.
- Response leak scan policy is documented across staging and local smoke.
- Render staging runbook documents build, start, rollback, incident, seed/reset, and smoke policy.
- Render port binding is fixed through `0.0.0.0` and `process.env.PORT`.

## 3. Production blockers

### Production DB provisioning

- A dedicated production PostgreSQL target has not been provisioned and approved.
- Migration ownership, database access policy, network boundary, and destructive-operation policy are not documented for production.
- Production DB must never be reused by staging, local smoke, seed, or UAT flows.

### Secret management / rotation

- A production-grade secret manager and rotation policy are not documented.
- Rotation owners, rotation cadence, emergency rotation steps, and leak escalation are not defined.
- Secrets must not be written to docs, logs, screenshots, tickets, commits, or test output.

### Admin credential policy

- Production admin bootstrap, password policy, MFA/2FA, emergency access, and offboarding are not complete.
- Admin passwords, session secrets, and bootstrap material must not be hardcoded.
- Shared staging demo credentials are not acceptable for production operation.

### Live provider/payment/bank/SMS/Slip OCR integration

- No live provider, payment, bank, SMS, or Slip OCR integration is certified.
- Sandbox/mock adapters are the only approved boundary in the current phase.
- Webhook signing, idempotency, reconciliation, retry limits, and failure handling require contract tests before live use.

### Financial ledger/audit hardening

- Real-money ledger invariants, reconciliation reports, payout approval flows, and immutable audit retention are not complete.
- Duplicate approval and negative-path smoke exists for local/staging, but production-grade accounting review is still required.
- Lucky Wheel Reward Claims remain manual staging/mock item handoff only.

### Monitoring/alerting/log retention

- Production monitoring, alert severity, on-call routing, and log retention policy are not documented.
- Deposit, withdrawal, payout, admin auth, permission change, and provider callback alerts are required before launch.
- Logs must redact credentials and avoid raw PII where not required for operations.

### Backup/restore

- Production backup schedule, restore owner, restore environment, and restore drill evidence are missing.
- A backup that has not been restored successfully must not be treated as launch-ready.

### Rate limiting / abuse prevention

- Production rate limits for auth, member registration, admin login, spin, deposit, withdrawal, and webhook endpoints are not complete.
- Abuse monitoring and lockout behavior require review before launch.

### Legal/compliance/accounting review

- Legal, compliance, tax, accounting, and jurisdiction-specific review have not been completed.
- Real-money handling must not begin without formal review and approval.

### Incident response runbook

- Production incident severity levels, escalation contacts, rollback owners, customer communication, and evidence capture are not complete.
- Secret leak response and provider outage response must be documented.

### Data privacy / PII handling

- PII inventory, masking policy, retention policy, access review, and deletion/export handling are not complete.
- Admin reports and logs must expose only the minimum operational data needed.

### Security review / penetration test

- A production security review and penetration test have not been completed.
- Auth, RBAC, admin schedule controls, file upload, callback endpoints, and financial state transitions need review.

### Observability for payouts/deposits/withdrawals

- Production dashboards and alerts for deposit approval, withdrawal approval, mark-paid, payout status, reconciliation drift, and provider callback failures are not complete.
- Operators need safe correlation IDs and non-secret references.

### Customer support/operator training

- Operator handoff exists for staging, but production support workflows, permission boundaries, escalation paths, and customer-facing scripts are not complete.
- Support staff must be trained on RBAC, audit expectations, and incident reporting.

### Migration/rollback plan

- Production migration order, rollback trigger, rollback command owner, data correction policy, and post-rollback verification are not complete.
- Rollback must be tested before any launch approval.

## 4. Mock/sandbox boundaries that must remain off

- Provider/payment/bank/SMS/Slip OCR must remain mock, sandbox, or disabled until certified.
- Lucky Wheel reward payout must remain staging/mock only and must not create wallet credit, bank transfer, payment action, SMS, or Slip OCR action.
- Real money payout must remain off.
- Production DB must remain off for local, staging, seed, and smoke flows.
- Frontend-selected spin result must remain rejected; Lucky Wheel reward selection stays backend-selected only.

## 5. Required production ENV checklist

Use placeholder names only in docs. Real values must live only in the approved production secret manager.

- `NODE_ENV=production`
- `APP_ENV=production`
- `DATABASE_URL`
- `SESSION_SECRET`
- `JWT_SECRET` if used
- `ADMIN_BOOTSTRAP_SECRET` if used
- Provider/payment/bank/SMS/Slip OCR credentials
- Webhook secrets
- Monitoring DSN
- Backup bucket credentials
- Allowed origins
- Rate limit config

## 6. Required smoke/test before production

- `smoke:staging-release-readiness`
- `smoke:production-safety-dry-run`
- `smoke:staging-release-gate`
- `smoke:staging-role-permission-uat`
- `smoke:staging-uat` after seed/reset
- Production safety dry-run smoke is static/local only in Phase N and must not use real money.
- DB backup/restore drill.
- Incident drill.
- Role permission negative drill.

## 7. Required engineering work before production

P0 checklist:

- [ ] Production DB isolation.
- [ ] Secret rotation and secret manager.
- [ ] Live money flow disabled until certified.
- [ ] Backup/restore implementation and drill.
- [ ] Monitoring and alerting.
- [ ] Admin MFA/2FA plan.
- [ ] Rate limiting.
- [ ] Production deploy runbook.

P1 checklist:

- [ ] Audit log retention policy.
- [ ] Financial reconciliation report.
- [ ] Operator training.
- [ ] Support docs.

P2 checklist:

- [ ] Dashboard/report polish.
- [ ] Performance optimization.

## 8. Go/No-Go criteria

Go only if all P0 items are complete, reviewed, and verified by dry-run evidence.

No-Go if any live provider/payment/bank/SMS/Slip OCR integration is not certified.

No-Go if response leak scan fails.

No-Go if rollback is not tested.

No-Go if DB backup restore is not tested.

No-Go if admin RBAC negative tests fail.

## 9. Recommended next phases

- Phase N: Production Safety Dry Run Design (`docs/PRODUCTION_SAFETY_DRY_RUN.md` and `npm run smoke:production-safety-dry-run`).
- Phase O: Monitoring + Backup Runbook.
- Phase P: Financial Ledger Hardening.
- Phase Q: Provider Integration Contract Tests.
- Phase R: Operator Training Pack.

## Phase N production safety dry-run

`docs/PRODUCTION_SAFETY_DRY_RUN.md` is a dry-run design and planning artifact only. Run the static guard with:

```powershell
npm run smoke:production-safety-dry-run
```

This does not deploy production, does not run production smoke, does not use production DB, does not use real money, does not enable live provider/payment/bank/SMS/Slip OCR, and does not approve real payout. Status remains NOT production ready.

## Final boundary

This file is a pre-production planning artifact only. It keeps the current staging/mock/sandbox boundary unchanged and records why the system is NOT production ready.
