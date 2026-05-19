# Production Safety Dry Run

Phase N is a production dry-run design. It is not a production deployment, not a production smoke, and not approval to enable production traffic.

Status: NOT production ready.

This document is used to rehearse checklist review, ENV review, smoke planning, rollback planning, backup/restore planning, monitoring, alerting, incident response, and operator signoff. It keeps the current staging/mock/sandbox boundary unchanged.

Hard stop: no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, and no real payout are allowed in this phase.

## 1. Purpose

- Design a production safety rehearsal without opening production.
- Practice the production checklist before any real deploy decision.
- Review required ENV names without recording values.
- Review smoke order, rollback expectations, incident flow, and owner signoff.
- Keep all money, provider, bank, SMS, and Slip OCR paths disabled, mock, or sandbox only.
- Keep secrets out of docs, logs, tickets, screenshots, commits, and test output.

## 2. Dry-Run Scope

- Config review for production intent and current blockers.
- ENV checklist review with placeholder names only.
- Smoke plan review across local static, staging runtime, staging mutating-restored, and full UAT groups.
- Rollback plan review for previous deploy, health check, release gate, audit evidence, and operator communication.
- Backup/restore drill design, including restore target and data integrity checks.
- Monitoring/alerting plan design for app, auth, admin, wallet, provider, queue, and leak signals.
- Admin RBAC review, including protected owner/super_admin controls and negative permission checks.
- Payment/provider/bank/SMS/Slip OCR certification checklist review before any live mode discussion.

## 3. Hard Safety Boundaries

- Production DB disabled.
- Real money disabled.
- Live provider/payment/bank/SMS/Slip OCR disabled.
- No real payout.
- Deposit and withdrawal rails remain disabled until certification.
- Member spin result remains backend-only.
- Frontend-selected reward, rewardId, prizeIndex, probability, or value is not accepted.
- Admin reward claim stays manual staging/mock item handoff only.
- No secret in logs, docs, smoke output, screenshots, tickets, commits, or chat.
- Auth guard, permission guard, staging safety guard, and response leak scan must not be weakened.
- Provider/payment/bank/SMS/Slip OCR modes must not be changed to live.
- Real code must not be changed to force production NODE_ENV or APP_ENV for this dry-run design.

## 4. Production ENV Dry-Run Checklist

Placeholder names only. Values must live only in an approved production secret manager after a future approval phase.

| Group | Placeholder ENV names | Dry-run check |
| --- | --- | --- |
| Runtime | `NODE_ENV`, `APP_ENV` | Review intended labels only; do not change runtime code in Phase N. |
| Database | `DATABASE_URL` | Confirm production DB remains disabled in this phase. |
| Session/auth | `SESSION_SECRET`, `JWT_SECRET` | Confirm generated secret policy and rotation owner are defined later. |
| Admin bootstrap | `ADMIN_BOOTSTRAP_ENV` | Confirm no hardcoded admin password or bootstrap value. |
| Provider | `PROVIDER_CREDENTIALS_ENV` | Confirm mock/sandbox only until certification. |
| Payment | `PAYMENT_CREDENTIALS_ENV` | Confirm real money rails remain disabled. |
| Bank | `BANK_CREDENTIALS_ENV` | Confirm bank statement input is mock/sandbox only. |
| SMS | `SMS_CREDENTIALS_ENV` | Confirm no live SMS sending. |
| Slip OCR | `SLIP_OCR_CREDENTIALS_ENV` | Confirm no live OCR provider connection. |
| Webhook | `WEBHOOK_SECRET_ENV` | Confirm signing and replay policy is not launch-approved yet. |
| Monitoring | `MONITORING_DSN_ENV` | Confirm alert plan exists before any production approval. |
| Backup | `BACKUP_STORAGE_CREDENTIALS_ENV` | Confirm restore drill target and access owner are defined later. |
| Allowed origins | `ALLOWED_ORIGINS_ENV` | Confirm production allowed origins review is required later. |
| Rate limit | `RATE_LIMIT_CONFIG_ENV` | Confirm auth, spin, deposit, withdrawal, and webhook limits are required. |

## 5. Dry-Run Smoke Plan

There is no production smoke in Phase N. Any future production dry-run smoke must start read-only, must not move money, and must include response leak scan on every response.

### A. Static/local

- `smoke:production-readiness-audit`
- `smoke:staging-release-readiness`
- `smoke:production-safety-dry-run`

Scope: docs, scripts, policy wording, checklist completeness, static secret-shaped value scan, and no rendered placeholder scan.

### B. Staging runtime non-destructive

- `smoke:staging-release-gate`

Scope: hosted staging health, database mode contract, admin read-only paths, browser route contract, member Lucky Wheel read-only paths, role-permission audit reads, and response leak scan.

### C. Staging mutating but restored

- `smoke:staging-role-permission-uat`

Scope: safe non-owner role update/restore only, negative permission paths, audit verification, and response leak scan.

### D. Full UAT after seed/reset

- `smoke:staging-uat`

Scope: full staging/mock UAT after guarded seed/reset. It may consume staging/mock fixture state only and must never touch production DB or real money.

All smoke output must avoid passwords, tokens, secrets, database URLs, authorization headers, JWT values, provider credentials, raw callback secrets, and real customer data.

## 6. Rollback Dry-Run Design

- Roll back to the previous deploy through the approved platform mechanism.
- Run health check after rollback.
- Run the staging release gate after rollback when the target is staging.
- Review audit logs for deploy owner, rollback owner, affected actions, and correlation references.
- Send operator communication with non-secret environment label, incident status, owner, impact, and next update time.
- Capture an incident timeline template:
  - Detected at
  - Detected by
  - Impact summary
  - Decision owner
  - Rollback started at
  - Rollback completed at
  - Health check result
  - Release gate result
  - Customer/operator communication sent at
  - Follow-up owner

## 7. Backup/Restore Dry-Run Design

- Define backup schedule before production approval.
- Define restore drill frequency before production approval.
- Restore only into an approved non-production restore target during rehearsal.
- Check migration state, required table counts, ledger totals, user/admin count sanity, and audit continuity after restore.
- Treat rollback as dependent on known-good backup evidence when data correction is involved.
- A backup that has not been restored successfully is not launch-ready evidence.

## 8. Monitoring/Alerting Dry-Run Design

Required alert design areas:

- Uptime and health check failure.
- API 5xx rate spike.
- Database connection failure.
- Auth failure spike.
- Admin write action spike.
- Wallet/ledger anomaly.
- Provider callback anomaly.
- Queue/job failures.
- Response leak alerts.

Alert records must avoid raw secret values, raw authorization headers, JWT values, full database connection text, provider secrets, and unnecessary PII.

## 9. Financial Safety Dry-Run

- Deposit and withdraw disabled until certified.
- Payment/provider sandbox only.
- Bank statement mock/sandbox only.
- Reconciliation report required before any launch decision.
- Operator dual control required for money-affecting actions.
- No live payout before certification.
- Ledger invariants, duplicate approval guards, idempotency, callback retry policy, and manual correction policy must be reviewed before live use.
- Lucky Wheel reward claims remain staging/mock manual item handoff and must not trigger wallet credit, bank transfer, payment action, SMS, or Slip OCR action.

## 10. Go/No-Go Rehearsal

P0 blockers that keep status at NOT production ready:

- Production DB isolation is not approved.
- Secret manager and rotation plan are not approved.
- Admin bootstrap, password policy, and MFA/2FA plan are not approved.
- Live provider/payment/bank/SMS/Slip OCR certification is not complete.
- Financial ledger, reconciliation, payout controls, and dual-control workflow are not complete.
- Monitoring, alerting, log retention, and response leak alerts are not complete.
- Backup schedule and restore drill evidence are not complete.
- Rate limiting and abuse monitoring are not complete.
- Legal, compliance, tax, and accounting review are not complete.
- Incident response, rollback owner, and communication plan are not complete.
- Data privacy, PII masking, retention, and access review are not complete.
- Security review and penetration test are not complete.
- Operator training and support escalation are not complete.

| Area | Dry-run pass/fail | Evidence placeholder | Owner signoff |
| --- | --- | --- | --- |
| Production DB isolation | pending | `<evidence-reference>` | `<owner-signoff>` |
| Secret management | pending | `<evidence-reference>` | `<security-signoff>` |
| Monitoring and alerts | pending | `<evidence-reference>` | `<owner-signoff>` |
| Backup and restore | pending | `<evidence-reference>` | `<owner-signoff>` |
| Financial controls | pending | `<evidence-reference>` | `<finance-signoff>` |
| Provider certification | pending | `<evidence-reference>` | `<owner-signoff>` |
| RBAC and admin controls | pending | `<evidence-reference>` | `<security-signoff>` |
| Incident and rollback | pending | `<evidence-reference>` | `<operator-signoff>` |

Required signoff placeholders:

- Owner signoff: `<owner-signoff>`
- Security signoff: `<security-signoff>`
- Finance signoff: `<finance-signoff>`
- Operator signoff: `<operator-signoff>`

Go is blocked until every P0 item is complete, reviewed, and backed by dry-run evidence. No-Go remains mandatory if any response leak scan fails, rollback is not tested, restore is not tested, RBAC negative tests fail, or any live provider/payment/bank/SMS/Slip OCR integration is uncertified.

## 11. Next Actions After Dry-Run

- Phase O: Monitoring + Backup Runbook.
- Phase P: Financial Ledger Hardening.
- Phase Q: Provider Integration Contract Tests.
- Phase R: Operator Training Pack.

## Phase O Monitoring + Backup Runbook

`docs/MONITORING_BACKUP_RUNBOOK.md` records the monitoring, alerting, backup, restore drill, log retention, and incident escalation runbook design.

Run the static guard:

```powershell
npm run smoke:monitoring-backup-runbook
```

This runbook is a planning artifact only. It is not a production deployment, not production smoke, and not approval for production DB, real money, live provider/payment/bank/SMS/Slip OCR, or real payout. Status remains NOT production ready.

## Final Boundary

This file is a planning artifact only. It does not make the system production ready, does not deploy production, does not use production DB, does not use real money, does not enable live provider/payment/bank/SMS/Slip OCR, and does not approve real payout.
