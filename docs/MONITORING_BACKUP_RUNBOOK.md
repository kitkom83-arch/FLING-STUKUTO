# Monitoring + Backup Runbook

Phase O defines the monitoring, alerting, backup, restore drill, log retention, and incident escalation runbook design.

Status: NOT production ready.

This is a planning artifact only. It is not a production deployment, not a production smoke, and not approval to enable production traffic, production database access, real money, live provider/payment/bank/SMS/Slip OCR, or real payout.

Hard stop: no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, and no real payout are allowed in this phase.

## 1. Purpose

- Document the monitoring/alerting/backup/restore runbook design.
- Define alert severity, routing, log retention, backup ownership, restore drill evidence, and incident escalation expectations.
- Rehearse production safety requirements before any launch decision.
- Keep all operational values as placeholders and non-secret labels only.

## 2. Scope

- Staging/mock/sandbox only.
- No production DB.
- No real money.
- No live provider/payment/bank/SMS/Slip OCR.
- No real payout.
- No production deployment.
- No production smoke.
- No real provider webhook, payment callback, bank feed, SMS send, or Slip OCR call.

## 3. Monitoring Targets

Required monitoring targets before any production approval:

- Uptime.
- API health `/api/health`.
- API 5xx rate.
- Database connection status.
- Response latency.
- Admin auth failure spike.
- Admin write action spike.
- Role permission update spike.
- Lucky Wheel spin failure spike.
- Wallet/ledger anomaly.
- Deposit/withdraw anomaly.
- Provider callback anomaly.
- Queue/job failures.
- Response leak alert.
- Render deploy failures.
- Port binding / no open ports issue.

All alert payloads must use non-secret environment labels, route names, status classes, correlation references, and safe counts only.

## 4. Alert Severity Levels

| Severity | Trigger | Owner | Response time target | First action | Escalation |
| --- | --- | --- | --- | --- | --- |
| SEV1 | Outage, DB down, real-money risk, or secret leak | Incident owner | `<sev1-response-target>` | Freeze risky writes if needed, preserve logs, open incident channel | Engineering lead, security, finance if money risk, executive update |
| SEV2 | Partial API failure, elevated 5xx, admin auth spike, or deploy failure | Engineering owner | `<sev2-response-target>` | Check health, recent deploy, mode boundary, and error class | Engineering lead and operator lead |
| SEV3 | Degraded performance, report delay, or non-critical UI issue | Operator or engineering owner | `<sev3-response-target>` | Capture safe evidence and triage affected route/report | Engineering channel if recurring or customer-visible |
| SEV4 | Documentation/static smoke issue | Phase owner | `<sev4-response-target>` | Fix docs/static guard and rerun smoke | Escalate to reviewer if release docs are blocked |

Final response targets must be approved during operator training and launch readiness review.

## 5. Alert Routing Design

- Operator channel: staging health, release gate, UAT, deploy state, and known runbook incidents.
- Engineering channel: API failures, DB connectivity, latency, queue/job failures, deploy failures, and port binding/no open ports issue.
- Security incident channel: secret leak alerts, auth failure spikes, suspicious admin behavior, and unsafe response content.
- Finance/reconciliation channel: wallet/ledger anomaly, deposit/withdraw anomaly, reconciliation drift, and provider/payment/bank callback anomaly.
- Executive update if SEV1: outage, DB down, secret leak, or real-money risk.

Use placeholder channel names only, for example `<operator-channel>` and `<security-incident-channel>`. Do not put real webhook values, tokens, credentials, or private routing URLs in this document.

## 6. Log Retention Plan

Retention values below are placeholders. Final values must pass compliance/accounting review before any production approval.

| Log class | Purpose | Retention placeholder | Access boundary |
| --- | --- | --- | --- |
| Admin audit logs | Admin writes, permission changes, operator actions | 365 days | Restricted operator/security review |
| Auth/security logs | Login failures, lockouts, suspicious auth behavior | 180 days | Restricted security review |
| Financial ledger logs | Wallet, ledger, deposit, withdraw, reconciliation evidence | 365 days | Restricted finance/security review |
| Role permission logs | Role matrix changes and protected-role guard evidence | 365 days | Restricted security/operator review |
| Lucky Wheel logs | Spin failures, reward claims, campaign/reward admin actions | 180 days | Restricted operator/security review |
| Provider/payment/bank callback logs | Callback state, idempotency, reconciliation references | 365 days | Restricted finance/engineering review |
| Deployment logs | Build, start, rollback, health, and platform incidents | 90 days | Restricted engineering/operator review |

Logs must not store raw secret values, raw auth headers, database connection text, provider credentials, full payment credentials, or unnecessary PII.

## 7. Backup Plan

- Database backup schedule: `<backup-schedule-placeholder>`.
- Backup encryption: required before production approval.
- Backup storage: approved storage only, with credentials kept outside docs and source control.
- Backup access control: least privilege, named owners, and emergency access review.
- Backup retention: `<backup-retention-placeholder>` pending compliance/accounting review.
- Backup restore testing frequency: `<restore-drill-frequency-placeholder>`.
- Backup owner: `<backup-owner-placeholder>`.
- Backup failure alert: required, routed to engineering and operator channels.

Do not put bucket credentials, storage keys, private URLs, or provider account secrets in this runbook.

## 8. Restore Drill Plan

- Restore to non-production target only.
- Verify schema and migration state.
- Verify sample records by safe counts and non-secret references.
- Verify admin login is disabled or controlled in the restored environment.
- Verify no live provider credentials exist in the restored environment.
- Run `smoke:staging-release-readiness`.
- Run a read-only release gate equivalent against the approved non-production target.
- Document restore result, owner, timestamp, source backup label, target label, checks run, failures, follow-up actions, and signoff.

Restore drills must never point staging, local smoke, or restored environments at production resources.

## 9. Incident Response Checklist

- Detect alert or operator report.
- Classify severity.
- Freeze risky writes if needed.
- Preserve logs and safe evidence.
- Notify owner.
- Rollback if deploy-related.
- Restore if data-related and approved.
- Run release gate after rollback or restore when the target is staging/non-production.
- Write incident report.

If a secret leak is suspected, stop copying logs, preserve evidence safely, rotate through the approved secret manager, and record only non-secret references.

## 10. Incident Templates

### Incident Summary

- Incident ID: `<incident-id>`
- Severity: `<severity>`
- Environment label: `<environment-label>`
- Owner: `<incident-owner>`
- Status: `<status>`
- Summary: `<short-summary>`

### Timeline

- Detected at: `<timestamp>`
- Acknowledged at: `<timestamp>`
- Mitigation started at: `<timestamp>`
- Rollback/restore started at: `<timestamp>`
- Service verified at: `<timestamp>`
- Closed at: `<timestamp>`

### Impact

- Affected routes/features: `<safe-route-or-feature-list>`
- Affected users/accounts: `<safe-count-or-none>`
- Money risk: `<none-or-reviewed-risk>`
- Data risk: `<none-or-reviewed-risk>`

### Root Cause

- Category: `<category>`
- Root cause summary: `<root-cause-summary>`
- Evidence references: `<non-secret-evidence-reference>`

### Mitigation

- Immediate mitigation: `<mitigation-summary>`
- Risky writes frozen: `<yes-no-not-applicable>`
- Monitoring added or adjusted: `<monitoring-change-summary>`

### Rollback/Restore Action

- Rollback action: `<rollback-summary>`
- Restore action: `<restore-summary>`
- Release gate result: `<release-gate-result>`
- Data integrity check: `<integrity-check-result>`

### Follow-Up Tasks

- Owner: `<follow-up-owner>`
- Task: `<follow-up-task>`
- Due date: `<due-date>`
- Verification: `<verification-method>`

## 11. Go/No-Go Monitoring Criteria

No-Go if:

- No uptime monitoring.
- No DB alert.
- No 5xx alert.
- No backup restore drill.
- No secret leak alert plan.
- No incident owner.
- No rollback path.
- No log retention plan.

Go remains blocked until monitoring, alerting, backup, restore drill, log retention, incident owner, rollback path, and response leak alert evidence are complete and reviewed. This runbook does not make the system production ready.

## 12. Next Phases

- Phase P: Financial Ledger Hardening (`docs/FINANCIAL_LEDGER_HARDENING_PLAN.md` and `npm run smoke:financial-ledger-hardening`).
- Phase Q: Provider Integration Contract Tests.
- Phase R: Operator Training Pack.

## Phase P Financial Ledger Hardening Plan

`docs/FINANCIAL_LEDGER_HARDENING_PLAN.md` records the financial ledger hardening, reconciliation, money-affecting audit trail, dual control, deposit/withdraw certification, and no-live-payout planning artifact.

Run the static guard:

```powershell
npm run smoke:financial-ledger-hardening
```

This plan is not a production deployment, not production smoke, and not approval for production DB, real money, live provider/payment/bank/SMS/Slip OCR, or live payout. It keeps the current staging/mock/sandbox boundary unchanged.

## Final Boundary

This runbook is a planning artifact only. It does not deploy production, does not use production DB, does not use real money, does not enable live provider/payment/bank/SMS/Slip OCR, and does not approve real payout. Status remains NOT production ready.
