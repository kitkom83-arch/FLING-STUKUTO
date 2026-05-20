# Financial Ledger Mock Runtime Harness

## 1. Phase S status

Phase S adds a Financial Ledger mock runtime harness for local logic verification only.

Status: NOT production ready.

- mock runtime harness only.
- in-memory only.
- No production DB.
- No real money.
- No live payout.
- No live provider/payment/bank/SMS/Slip OCR.
- No Prisma migration.
- No schema.prisma change.
- No runtime route/controller/service integration.
- No deposit/withdraw/admin-credit/provider callback runtime flow change.

## 2. Safety boundaries

- Mock/staging/sandbox only.
- No production DB.
- No real money.
- No live payout.
- No live provider/payment/bank/SMS/Slip OCR.
- No DB writes.
- No external network calls.
- No Prisma client usage.
- No Express route exposure.
- No frontend money calculation authority.
- No admin direct balance mutation without ledger/audit/dual control.
- No secret/token/password/DATABASE_URL/JWT/Authorization in docs/logs.

## 3. Mock harness scope

The harness is used to:

- Simulate ledger entries.
- Simulate wallet balance changes.
- Simulate idempotency behavior.
- Simulate audit event creation.
- Simulate dual-control decision.
- Simulate reconciliation summary.
- Simulate reversal entries.
- Simulate no-live-payout guard.

The harness is not used for:

- Real money.
- Production.
- Live payout.
- Live provider.
- Real deposit/withdraw.
- Public API.
- DB migration.

## 4. Mock ledger principles

- Immutable append-only entries.
- `balanceBefore` and `balanceAfter` are required.
- Idempotency is required for money-affecting mock writes.
- Every mock transaction must have `sourceType` and `sourceId`.
- Every admin mock action must have a reason.
- Every manual approval/rejection must have an audit event.
- Reversal creates an explicit reversal entry.
- Original entries are never deleted or edited.
- Failed action returns a safe error shape, not a raw internal error.

## 5. Mock harness operations

Supported mock operation names:

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

`withdraw.paid_mock` is mock only. Live payout remains disabled.

## 6. Mock data model

The harness uses only in-memory structures:

- `mockState`: root state object for one isolated run.
- `accounts`: in-memory ledger account records by account id.
- `balances`: in-memory numeric balance by account id.
- `ledgerTransactions`: append-only transaction headers.
- `ledgerEntries`: append-only account movement entries.
- `idempotencyKeys`: scoped in-memory request hash and response snapshot records.
- `auditEvents`: sanitized immutable audit evidence.
- `adjustmentRequests`: maker/checker admin adjustment requests.
- `reconciliationRuns`: reconciliation batch summaries.
- `reconciliationItems`: reconciliation item evidence for matched, unmatched, stale, and variance rows.

## 7. Idempotency mock behavior

- Same idempotencyKey plus same payload returns the same result.
- Same idempotencyKey plus different payload returns idempotency_conflict.
- Key scope is `siteId + action + memberId/sourceId`.
- `requestHash` is stored in memory.
- `responseSnapshot` is stored in memory.
- No replay without audit.

## 8. Dual control mock behavior

- Maker/checker separation.
- No self-approval.
- Approval requires reason.
- Rejection requires reason.
- Emergency override requires reason.
- High-risk adjustment requires second admin.
- All decisions write an audit event.

## 9. Audit mock behavior

- Audit event is required for admin/manual/high-risk mock actions.
- Before/after snapshots are sanitized.
- IP is masked.
- UserAgent is hashed.
- No token/password/secret/DATABASE_URL/JWT/Authorization.
- No raw internal error.

## 10. Reconciliation mock behavior

- Wallet balance snapshot vs ledger sum.
- Deposit credited vs statement mock.
- Withdraw reserved vs approved vs paid_mock.
- Admin adjustment variance.
- Provider callback variance.
- Lucky Wheel reward liability.
- Stale pending mock report.
- Unmatched entries mock report.

## 11. Error contract

Safe mock error codes:

- `validation_error`
- `unauthorized_mock`
- `forbidden_mock`
- `idempotency_conflict`
- `insufficient_balance`
- `ledger_write_failed_mock`
- `dual_control_required`
- `no_self_approval`
- `reconciliation_mismatch`
- `live_payout_disabled`
- `provider_live_disabled`
- `production_db_blocked`
- `prisma_disabled_in_mock_harness`
- `network_disabled_in_mock_harness`

Errors must use a safe shape with `success: false`, `error.code`, `error.message`, and `error.correlationId`.

## 12. Phase T Go/No-Go criteria

Phase T must not start unless Phase S passes:

- Mock runtime harness exists.
- Smoke PASS.
- No DB usage.
- No Prisma usage.
- No network call.
- No route/controller/service integration.
- Idempotency mock PASS.
- Dual control mock PASS.
- Audit redaction mock PASS.
- Reversal mock PASS.
- Reconciliation mock PASS.
- No secret scan PASS.
- undefined/NaN/[object Object] scan PASS.
- No-live-payout boundary PASS.
- No-production-DB boundary PASS.

## 13. Next phases

- Phase T: Reconciliation mock reports + admin read-only UI.
- Phase U: Certification checklist before any live integration.
- Phase V: Staging dry-run migration only after explicit approval.
- Phase W: DB-backed ledger staging prototype only after Phase V approval.

## Final boundary

This Phase S harness is isolated mock runtime logic only. It does not expose an API, does not write a database, does not use Prisma, does not change `schema.prisma`, does not create a migration, does not change deposit/withdraw/admin-credit/provider callback runtime flow, does not use real money, and does not enable live payout.
