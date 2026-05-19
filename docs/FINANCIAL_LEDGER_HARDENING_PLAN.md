# Financial Ledger Hardening Plan

Phase P defines the financial ledger hardening plan for reconciliation, audit trail, dual control, deposit/withdraw certification, and no-live-payout boundaries.

Status: NOT production ready.

This is a planning artifact only. It is not a production deployment, not a production smoke, and not approval to enable production database access, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.

Hard stop: no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, and no live payout are allowed in this phase.

## 1. Purpose

- Document the financial ledger hardening plan before any launch decision.
- Keep the current staging/mock/sandbox boundary unchanged.
- Define ledger, reconciliation, audit, dual-control, certification, and no-live-payout requirements.
- Record production blockers without changing runtime money flow.
- Keep all financial rails disabled, mock, or sandbox only until certified.

## 2. Scope

- Wallet ledger.
- Deposit ledger.
- Withdraw ledger.
- Admin credit adjustment.
- Promotion/bonus credit.
- Lucky Wheel reward credit.
- Cashback/commission.
- Reconciliation.
- Audit trail.
- Dual control.
- Dispute handling.

## 3. Hard Financial Safety Boundaries

- No live payout.
- No production DB.
- No real money.
- No real provider/payment/bank.
- No live provider/payment/bank/SMS/Slip OCR.
- No frontend-selected reward, rewardId, prizeIndex, probability, amount, or prize value.
- All money-affecting actions require audit.
- Admin write actions require reason.
- Response leak scan required for every smoke or operational check that reads responses.
- Sandbox/mock only until provider, payment, bank, SMS, and Slip OCR certification is complete.
- Runtime auth guard, permission guard, staging safety guard, and provider mode safety must not be weakened.

## 4. Ledger Model Requirements

Every ledger entry design must include:

- `ledgerEntryId`
- `siteId`
- `memberId`
- `sourceType`
- `sourceId`
- `transactionType`
- `amount`
- `currency`
- `balanceBefore`
- `balanceAfter`
- `status`
- `idempotencyKey`
- `createdBy`
- `createdAt`
- `reason`
- `auditLogId`
- `metadataSnapshot`

The metadata snapshot must be sanitized and must not contain secret values, raw authorization material, provider credentials, private bank credentials, or unnecessary PII.

## 5. Double-Entry / Balance Integrity Plan

- Every credit/debit must have a source record.
- `balanceBefore` and `balanceAfter` must match the wallet movement exactly.
- No negative balance unless an explicit reviewed rule exists.
- Idempotency required for deposit approval, provider callback, admin adjustment, reward credit, and reversal flow.
- Duplicate callback protection required before any live provider discussion.
- Reconciliation status required for money-affecting records.
- Manual adjustment must require reason and audit.
- Rollback/reversal entry is required instead of silent delete.
- Ledger correction must preserve the original source record and add a linked reversal/correction record.

## 6. Deposit Hardening

- Deposit record lifecycle: pending, verified, credited, rejected, cancelled.
- Slip OCR mock/sandbox only.
- Bank statement mock/sandbox only.
- Idempotency required for the same slip, order, reference, or provider event.
- Admin-added deposit requires reason and audit.
- No live bank automation until certified.
- Deposit credit must create a wallet ledger entry and a sanitized audit event.
- Duplicate approval must not credit twice.
- Rejected or cancelled deposits must not create wallet credit.

## 7. Withdraw Hardening

- Withdraw request lifecycle: pending, review, approved, paid, rejected, cancelled.
- Dual control required for approval/payment in production design.
- No live payout until certified.
- Balance lock/reserve design required before any live payout approval.
- Audit required for approve, reject, pay, cancel, and reversal.
- Withdrawal reversal policy required for failed payout or operator correction.
- Duplicate approve, duplicate pay, and out-of-order transition guards must remain fail-closed.
- Approved-without-paid state must be visible in reconciliation reports.

## 8. Admin Credit Adjustment Hardening

- Add credit and remove credit require reason.
- Bonus credit requires source and reason.
- Turnover edit requires reason.
- Cash wallet credit check required before debit or correction.
- All money-affecting admin actions require audit.
- High-risk action flag required for adjustment, reversal, and balance correction.
- Before/after balance snapshot required.
- Operator identity required.
- Audit log required.
- Optional second approval remains a future production control.

## 9. Promotion/Bonus/Reward Hardening

- Bonus credit source must be recorded.
- Lucky Wheel reward source must be recorded.
- Cashback/commission source must be recorded.
- Reward claims status must be recorded from claim through final resolution.
- No manual payout without audit.
- No reward value mutation during claim.
- Report/reconciliation required for promotion, bonus, reward, cashback, and commission cost.
- Lucky Wheel reward selection remains backend-only and must not accept frontend-selected reward or prizeIndex.

## 10. Reconciliation Plan

- Daily deposit reconciliation.
- Daily withdraw reconciliation.
- Wallet balance reconciliation.
- Provider callback reconciliation.
- Admin adjustment reconciliation.
- Lucky Wheel reward reconciliation.
- Unmatched transaction report.
- Stale pending report.
- Failed callback report.
- Ledger variance report.
- Reconciliation output must use safe references, counts, and sanitized IDs only.

## 11. Audit Trail Requirements

- Immutable audit events.
- Actor/admin identity.
- `siteCode`.
- Action.
- Target type/id.
- Before/after sanitized snapshot.
- Reason.
- IP masked.
- UserAgent hash.
- `createdAt`.
- No secret values.
- Audit event must link to the ledger/source record when money is affected.

## 12. Dual Control Plan

Money-affecting high-risk actions require two-person approval in production design.

Role separation:

- Maker.
- Checker.
- Auditor.
- Owner.

Controls:

- No self-approval.
- Emergency override requires reason and audit.
- Checker must have permission independent from maker.
- Auditor can review evidence but must not bypass maker/checker controls.
- Owner override must be exceptional, documented, and visible in anomaly reports.

## 13. Reports Required Before Production

- Ledger balance report.
- Member balance report.
- Deposit reconciliation report.
- Withdraw reconciliation report.
- Admin adjustment report.
- Bonus/reward cost report.
- Stuck pending report.
- Failed callback report.
- Audit anomaly report.

## 14. Tests Required Before Production

- Existing financial safety tests.
- Wallet/deposit/withdraw/admin-credit/provider-callback tests.
- Idempotency tests.
- Duplicate callback tests.
- Negative balance tests.
- Reversal tests.
- Response leak scan.
- Reconciliation dry-run.
- Backup/restore drill.

## 15. Go/No-Go Financial Criteria

No-Go if:

- No reconciliation report.
- No audit trail for money-affecting actions.
- No idempotency for deposits/provider callbacks.
- No dual control design for withdrawals.
- No backup/restore drill.
- Response leak scan fails.
- Live provider/payment/bank not certified.
- Production DB not isolated.
- Admin RBAC negative tests fail.

Go remains blocked until financial ledger invariants, reconciliation evidence, audit trail, dual control, backup/restore evidence, response leak scan, live integration certification, production DB isolation, and admin RBAC negative tests are complete and reviewed.

## 16. Next Phases

- Phase Q: Financial Ledger Runtime Design / Data Contract (`docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md` and `npm run smoke:financial-ledger-runtime-contract`).
- Phase R: Ledger schema dry-run design + migration plan only.
- Phase S: Ledger mock runtime harness, no real money.
- Phase T: Reconciliation mock reports + admin read-only UI.

## Final Boundary

This financial ledger hardening plan is a planning artifact only. It does not deploy production, does not use production DB, does not use real money, does not enable live provider/payment/bank/SMS/Slip OCR, does not open live payout, and does not change runtime money flow. Status remains NOT production ready.
