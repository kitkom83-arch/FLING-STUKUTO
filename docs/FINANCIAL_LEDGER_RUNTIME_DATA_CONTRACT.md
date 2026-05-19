# Financial Ledger Runtime Data Contract

## 1. Phase Q Status

Phase Q defines the Financial Ledger Runtime Design / Data Contract.

Status: NOT production ready.

This document is a design/contract artifact only. It is not a production deployment, not runtime implementation, not a Prisma migration, and not approval to enable production database access, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.

Hard stop: no production DB, no real money, no live provider/payment/bank/SMS/Slip OCR, no live payout, and no runtime money flow change are allowed in this phase.

## 2. Safety Boundaries

- Mock/staging/sandbox only.
- No production DB.
- No real money.
- No live payout.
- No live provider/payment/bank/SMS/Slip OCR.
- No frontend money calculation authority.
- No admin direct balance mutation without ledger, audit, and dual control.
- No secret/token/password/DATABASE_URL/JWT/Authorization in docs/logs.
- No runtime deposit, withdraw, provider, payment, bank, SMS, Slip OCR, or payout behavior change in Phase Q.
- No Prisma migration, schema runtime change, database fixture, seed data, controller implementation, service implementation, or route implementation in Phase Q.

## 3. Runtime Ledger Principles

- Immutable ledger.
- Append-only entries.
- Double-entry compatible design.
- Idempotency required.
- Every money-affecting action must have `sourceType` and `sourceId`.
- Every balance change must have `balanceBefore` and `balanceAfter`.
- Every admin/manual action must have `reason` and `auditLogId`.
- Ledger write must be atomic with wallet balance update.
- Failed/reversed entries must be explicit entries, not delete/edit old entries.
- Ledger responses must use server-calculated balances only; frontend calculations are display-only and never authoritative.

## 4. Ledger Account Model Contract

This ledger account model is a contract draft only. It is not a Prisma migration and does not change the runtime schema.

Account type draft:

- `member_cash_wallet`
- `member_bonus_wallet`
- `member_point_wallet`
- `member_wheel_credit_wallet`
- `platform_clearing`
- `deposit_pending`
- `withdraw_reserved`
- `provider_transfer_pending`
- `admin_adjustment_clearing`
- `promotion_liability`
- `reward_liability`

Account contract rules:

- Account ownership must be site-scoped.
- Member accounts must include `memberId`.
- Platform accounts must use a non-member account owner reference.
- Account type must be immutable after creation.
- Account status must support active, locked, and archived design states.
- Account balance must be derived from ledger writes and not from frontend input.

## 5. Ledger Entry Data Contract

Every ledger entry design must include:

- `ledgerEntryId`
- `siteId`
- `memberId`
- `accountId`
- `accountType`
- `sourceType`
- `sourceId`
- `transactionType`
- `direction` with allowed values `debit` or `credit`
- `amount`
- `currency`
- `balanceBefore`
- `balanceAfter`
- `status`
- `idempotencyKey`
- `correlationId`
- `requestId`
- `createdByType`
- `createdById`
- `createdAt`
- `reason`
- `auditLogId`
- `metadataSnapshot`
- `reversalOfLedgerEntryId`
- `reconciliationStatus`

Field rules:

- `amount` must be positive; direction controls debit/credit meaning.
- `currency` must be explicit.
- `balanceBefore` and `balanceAfter` must be server-calculated.
- `metadataSnapshot` must be sanitized and must not contain secret-shaped values.
- `reversalOfLedgerEntryId` is required for reversal entries.
- `reconciliationStatus` must support draft states such as pending, matched, unmatched, disputed, and adjusted.

## 6. Transaction Type Contract

Transaction type draft:

- `deposit.requested`
- `deposit.verified`
- `deposit.credited`
- `deposit.rejected`
- `withdraw.requested`
- `withdraw.reserved`
- `withdraw.approved`
- `withdraw.paid_mock`
- `withdraw.rejected`
- `withdraw.reversed`
- `admin.credit.requested`
- `admin.credit.approved`
- `admin.credit.applied`
- `admin.debit.requested`
- `admin.debit.approved`
- `admin.debit.applied`
- `promotion.bonus.awarded`
- `promotion.bonus.reversed`
- `wheel.reward.awarded`
- `wheel.reward.claimed`
- `provider.transfer.out`
- `provider.transfer.in`
- `provider.callback.adjustment`
- `reconciliation.adjustment`

Live payout remains disabled. Any paid status in this contract is mock/sandbox design language only until certification, dual control, reconciliation, and launch approval are complete.

## 7. API Contract Draft

This API contract draft is not implemented runtime. It describes future endpoint behavior only.

Common endpoint requirements:

- Auth required except where explicitly marked internal/mock.
- Permission required for every admin route.
- Idempotency required for money-affecting writes.
- Audit required for admin/manual writes and approval/rejection writes.
- No secret response.
- Standard success response shape:

```json
{
  "success": true,
  "data": {
    "status": "draft_contract"
  }
}
```

- Standard error response shape:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Safe error message",
    "correlationId": "safe-correlation-reference"
  }
}
```

### Admin Endpoints

| Method | Path | Auth required | Permission required | Idempotency behavior | Audit requirement | Response shape | Error shape |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/admin/ledger/entries` | Admin auth + site access | `ledger.view` or `reports.view` | Read-only; no idempotency key required | Read audit optional by policy | `{ success, data: { rows, page, limit, total } }` | Standard error with safe code |
| GET | `/api/admin/ledger/entries/:id` | Admin auth + site access | `ledger.view` or `reports.view` | Read-only; no idempotency key required | Read audit optional by policy | `{ success, data: { entry } }` | Standard error with safe code |
| GET | `/api/admin/ledger/reconciliation` | Admin auth + site access | `ledger.reconciliation.view` or `reports.view` | Read-only; no idempotency key required | Read audit optional by policy | `{ success, data: { reports, generatedAt } }` | Standard error with safe code |
| GET | `/api/admin/ledger/member/:memberId` | Admin auth + site access | `ledger.view` or `members.view` | Read-only; no idempotency key required | Read audit optional by policy | `{ success, data: { memberId, balances, entries } }` | Standard error with safe code |
| POST | `/api/admin/ledger/admin-adjustment/request` | Admin auth + site access | `ledger.adjustment.request` | Required; duplicate same payload returns same result; different payload conflicts | Required with reason | `{ success, data: { requestId, status } }` | Standard error with safe code |
| POST | `/api/admin/ledger/admin-adjustment/:id/approve` | Admin auth + site access | `ledger.adjustment.approve` | Required; duplicate same payload returns same result; different payload conflicts | Required with reason and checker identity | `{ success, data: { adjustmentId, status, ledgerEntryIds } }` | Standard error with safe code |
| POST | `/api/admin/ledger/admin-adjustment/:id/reject` | Admin auth + site access | `ledger.adjustment.approve` | Required; duplicate same payload returns same result; different payload conflicts | Required with reason and checker identity | `{ success, data: { adjustmentId, status } }` | Standard error with safe code |

### Member Endpoints

| Method | Path | Auth required | Permission required | Idempotency behavior | Audit requirement | Response shape | Error shape |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/member/ledger/history` | Member auth | Own member scope | Read-only; no idempotency key required | No admin audit; safe access log optional | `{ success, data: { rows, page, limit } }` | Standard error with safe code |
| GET | `/api/member/wallet/balance` | Member auth | Own member scope | Read-only; no idempotency key required | No admin audit; safe access log optional | `{ success, data: { balances, serverCalculatedAt } }` | Standard error with safe code |

### Internal/Mock Endpoints

| Method | Path | Auth required | Permission required | Idempotency behavior | Audit requirement | Response shape | Error shape |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/internal/mock-ledger/deposit-credit` | Internal mock guard | Mock-only internal permission | Required; scoped to source | Required safe mock audit | `{ success, data: { ledgerEntryIds, status } }` | Standard error with safe code |
| POST | `/api/internal/mock-ledger/withdraw-reserve` | Internal mock guard | Mock-only internal permission | Required; scoped to source | Required safe mock audit | `{ success, data: { reserveId, ledgerEntryIds, status } }` | Standard error with safe code |
| POST | `/api/internal/mock-ledger/reversal` | Internal mock guard | Mock-only internal permission | Required; scoped to source | Required safe mock audit | `{ success, data: { reversalLedgerEntryIds, status } }` | Standard error with safe code |

Internal/mock endpoints must never be enabled for production traffic and must never call live provider/payment/bank/SMS/Slip OCR systems.

## 8. Idempotency Contract

- `idempotencyKey` required for money-affecting writes.
- Duplicate key with same payload returns same result.
- Duplicate key with different payload returns conflict.
- Idempotency key scope: `siteId + action + memberId/sourceId`.
- TTL policy draft: retain idempotency records for at least the reconciliation window; final value requires compliance/accounting review.
- No replay without audit.
- Idempotency conflict responses must not expose stored payload secrets or raw request bodies.
- Retry after transient failure must reuse the same key and correlation reference.

## 9. Dual Control Contract

- Maker creates request.
- Checker approves or rejects request.
- Auditor reviews immutable evidence.
- Owner can review all high-risk actions.
- No self-approval.
- Emergency override reason required.
- All approval/rejection writes audit event.
- High-risk action requires second admin.
- Checker permission must be distinct from maker permission.
- Owner override must be visible in audit and reconciliation anomaly reports.

## 10. Reconciliation Data Contract

Report contracts required before production:

- Daily deposit ledger vs statement.
- Withdraw reserve vs approved vs paid mock.
- Wallet balance snapshot vs ledger sum.
- Admin adjustment report.
- Provider callback variance report.
- Lucky Wheel reward liability report.
- Stale pending deposit/withdraw report.
- Unmatched entries report.

Report output rules:

- Use safe IDs, counts, totals, status labels, and correlation references.
- Do not include raw bank credentials, provider credentials, auth material, or unnecessary PII.
- Every mismatch must have owner, status, createdAt, and follow-up action fields.

## 11. Audit Event Contract

Every money-affecting audit event design must include:

- `auditLogId`
- `siteCode`
- `actorType`
- `actorId`
- `action`
- `targetType`
- `targetId`
- `beforeSnapshotSanitized`
- `afterSnapshotSanitized`
- `reason`
- `ipAddressMasked`
- `userAgentHash`
- `createdAt`
- `correlationId`

Audit event rules:

- Immutable.
- Sanitized.
- No secret-shaped values.
- Redact token/password/DATABASE_URL/JWT/Authorization.
- Link approval/rejection audit events to adjustment, ledger, or source records.
- Record emergency override as high-risk evidence.

## 12. Error Contract

Error code draft:

- `validation_error`
- `unauthorized`
- `forbidden`
- `idempotency_conflict`
- `insufficient_balance`
- `ledger_write_failed`
- `reconciliation_mismatch`
- `dual_control_required`
- `live_payout_disabled`
- `provider_live_disabled`
- `production_db_blocked`

Error rules:

- Use standard safe error response shape.
- Do not return stack traces, raw SQL, raw provider payloads, raw auth material, or secret-shaped values.
- Expected validation and business rule failures must not return `500`.
- Live payout and live provider attempts must fail closed.
- Production DB boundary failures must fail closed.

## 13. Go/No-Go Criteria for Phase R

Phase R must not start unless Phase Q passes static review and smoke.

No-Go if missing:

- Ledger data contract.
- API contract.
- Idempotency contract.
- Dual control contract.
- Audit event contract.
- Reconciliation contract.
- Static smoke guard.
- Secret scan.
- Rendered placeholder scan for missing values, invalid numeric output, and object string output.
- No-live-payout boundary.
- Production DB boundary.

No-Go also applies if any wording implies live payout is enabled, production DB is enabled, real money is enabled, or live provider/payment/bank/SMS/Slip OCR is enabled.

## 14. Next Phases

- Phase R: Ledger schema dry-run design + migration plan only.
- Phase S: Ledger mock runtime harness, no real money.
- Phase T: Reconciliation mock reports + admin read-only UI.
- Phase U: Certification checklist before any live integration.

## Final Boundary

This Phase Q contract is docs/static smoke only. It does not add migrations, does not implement runtime routes, does not change deposit/withdraw/provider/payment/bank/SMS/Slip OCR behavior, does not use production DB, does not move real money, and does not enable live payout. Status remains NOT production ready.
