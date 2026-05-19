# Financial Ledger Schema Dry-Run Plan

## 1. Phase R Status

Phase R defines the Ledger schema dry-run design + migration plan only.

Status: NOT production ready.

This document is schema dry-run design only and migration plan only. It is not a Prisma migration, not a `schema.prisma` change, not a runtime implementation, and not approval to enable production database access, real money, live provider/payment/bank/SMS/Slip OCR, or live payout.

Hard stop: no Prisma migration, no schema.prisma change, no production DB, no real money, no live payout, no live provider/payment/bank/SMS/Slip OCR, and no runtime money flow change are allowed in Phase R.

## 2. Safety Boundaries

- Mock/staging/sandbox only.
- No production DB.
- No real money.
- No live payout.
- No live provider/payment/bank/SMS/Slip OCR.
- No Prisma migration in Phase R.
- No schema.prisma runtime change in Phase R.
- No route/controller/service runtime implementation.
- No frontend money authority.
- No secret/token/password/DATABASE_URL/JWT/Authorization in docs/logs.
- No seed, fixture, provider config, payment config, bank config, SMS config, or Slip OCR config change.
- Auth guard, permission guard, staging safety guard, response leak scan, and provider mode safety must not be weakened.

## 3. Existing Contract References

- Phase P Financial Ledger Hardening Plan: `docs/FINANCIAL_LEDGER_HARDENING_PLAN.md`.
- Phase Q Financial Ledger Runtime Data Contract: `docs/FINANCIAL_LEDGER_RUNTIME_DATA_CONTRACT.md`.
- API contract draft: `docs/API.md`, Financial Ledger Runtime API Contract Draft section.
- Idempotency contract: Phase Q section 8.
- Dual control contract: Phase Q section 9.
- Reconciliation contract: Phase Q section 10.
- Audit event contract: Phase Q section 11.

Phase R only translates these contracts into a schema and migration dry-run plan. It does not implement the schema.

## 4. Proposed Schema Draft

The proposed schema draft is documentation only. It must not be copied into `prisma/schema.prisma` in Phase R and must not create a migration.

Proposed tables:

- `ledger_accounts`
- `ledger_entries`
- `ledger_transactions`
- `ledger_idempotency_keys`
- `ledger_reconciliation_runs`
- `ledger_reconciliation_items`
- `ledger_admin_adjustment_requests`
- `ledger_balance_snapshots`
- `ledger_audit_links`

### ledger_accounts

- Purpose: stores site-scoped ledger accounts for member wallets, platform clearing, liabilities, and reserved balances.
- Draft columns: `id`, `siteId`, `memberId`, `accountType`, `currency`, `status`, `createdAt`, `updatedAt`.
- Required fields: `id`, `siteId`, `accountType`, `currency`, `status`, `createdAt`, `updatedAt`.
- Nullable fields: `memberId`.
- Unique constraints draft: `siteId + memberId + accountType + currency` for member accounts; `siteId + accountType + currency` for platform accounts where member is absent.
- Indexes draft: `siteId`, `siteId + memberId`, `siteId + accountType`, `status`.
- Relation draft: belongs to `sites`; optionally belongs to `users`; referenced by `ledger_entries`.
- Safety notes: account balances must be derived from ledger entries and server-side wallet updates, not frontend input.

### ledger_entries

- Purpose: immutable append-only debit/credit records for every money-affecting balance movement.
- Draft columns: `id`, `transactionId`, `siteId`, `memberId`, `accountId`, `accountType`, `sourceType`, `sourceId`, `transactionType`, `direction`, `amount`, `currency`, `balanceBefore`, `balanceAfter`, `status`, `idempotencyKey`, `correlationId`, `requestId`, `createdByType`, `createdById`, `createdAt`, `reason`, `auditLogId`, `metadataSnapshot`, `reversalOfLedgerEntryId`, `reconciliationStatus`.
- Required fields: `id`, `transactionId`, `siteId`, `accountId`, `accountType`, `sourceType`, `sourceId`, `transactionType`, `direction`, `amount`, `currency`, `balanceBefore`, `balanceAfter`, `status`, `idempotencyKey`, `correlationId`, `createdByType`, `createdAt`, `reconciliationStatus`.
- Nullable fields: `memberId`, `requestId`, `createdById`, `reason`, `auditLogId`, `metadataSnapshot`, `reversalOfLedgerEntryId`.
- Unique constraints draft: `siteId + idempotencyKey + accountId + direction` where applicable; `id` primary key.
- Indexes draft: `siteId + memberId + createdAt`, `siteId + sourceType + sourceId`, `siteId + transactionType + createdAt`, `reconciliationStatus + createdAt`, `auditLogId`, `reversalOfLedgerEntryId`, `transactionId`.
- Relation draft: belongs to `ledger_transactions`; belongs to `ledger_accounts`; optionally links to `admin_logs`; self-references reversal entries.
- Safety notes: old entries are never edited or deleted for correction; failed/reversed states require explicit entries.

### ledger_transactions

- Purpose: groups one or more ledger entries into an atomic transaction boundary.
- Draft columns: `transactionId`, `siteId`, `transactionType`, `sourceType`, `sourceId`, `status`, `idempotencyKey`, `totalDebit`, `totalCredit`, `currency`, `createdAt`, `completedAt`, `failedAt`, `failureReason`, `metadataSnapshot`.
- Required fields: `transactionId`, `siteId`, `transactionType`, `sourceType`, `sourceId`, `status`, `idempotencyKey`, `totalDebit`, `totalCredit`, `currency`, `createdAt`.
- Nullable fields: `completedAt`, `failedAt`, `failureReason`, `metadataSnapshot`.
- Unique constraints draft: `siteId + transactionId`; `siteId + idempotencyKey`.
- Indexes draft: `siteId + sourceType + sourceId`, `siteId + transactionType + createdAt`, `status + createdAt`.
- Relation draft: has many `ledger_entries`; may link to idempotency and reconciliation rows.
- Safety notes: totalDebit must equal totalCredit for double-entry-compatible transactions where applicable; failed/reversed transaction must use explicit reversal entries.

### ledger_idempotency_keys

- Purpose: records money-affecting write idempotency scope, request hash, and safe response snapshot.
- Draft columns: `id`, `siteId`, `action`, `memberId`, `sourceId`, `idempotencyKey`, `requestHash`, `responseSnapshot`, `status`, `expiresAt`, `createdAt`, `updatedAt`.
- Required fields: `id`, `siteId`, `action`, `idempotencyKey`, `requestHash`, `status`, `expiresAt`, `createdAt`, `updatedAt`.
- Nullable fields: `memberId`, `sourceId`, `responseSnapshot`.
- Unique constraints draft: `siteId + action + memberId + sourceId + idempotencyKey`.
- Indexes draft: `siteId + idempotencyKey`, `siteId + action + createdAt`, `expiresAt`, `status`.
- Relation draft: can link to `ledger_transactions` by idempotency key and site scope.
- Safety notes: duplicate same payload returns same result; duplicate different payload returns conflict; response snapshots must be sanitized.

### ledger_reconciliation_runs

- Purpose: stores reconciliation batch metadata for deposits, withdrawals, wallets, providers, rewards, and admin adjustments.
- Draft columns: `id`, `siteId`, `runType`, `status`, `periodStart`, `periodEnd`, `startedAt`, `completedAt`, `createdByType`, `createdById`, `summarySnapshot`, `failureReason`.
- Required fields: `id`, `siteId`, `runType`, `status`, `periodStart`, `periodEnd`, `startedAt`, `createdByType`.
- Nullable fields: `completedAt`, `createdById`, `summarySnapshot`, `failureReason`.
- Unique constraints draft: `siteId + runType + periodStart + periodEnd` for completed runs where applicable.
- Indexes draft: `siteId + runType + startedAt`, `status + startedAt`.
- Relation draft: has many `ledger_reconciliation_items`.
- Safety notes: summaries must use safe counts, totals, and references only.

### ledger_reconciliation_items

- Purpose: stores item-level reconciliation mismatches, matched records, stale pending records, and variance evidence.
- Draft columns: `id`, `runId`, `siteId`, `itemType`, `sourceType`, `sourceId`, `ledgerEntryId`, `status`, `varianceAmount`, `currency`, `reason`, `metadataSnapshot`, `createdAt`, `resolvedAt`.
- Required fields: `id`, `runId`, `siteId`, `itemType`, `sourceType`, `sourceId`, `status`, `createdAt`.
- Nullable fields: `ledgerEntryId`, `varianceAmount`, `currency`, `reason`, `metadataSnapshot`, `resolvedAt`.
- Unique constraints draft: `runId + sourceType + sourceId + itemType`.
- Indexes draft: `siteId + itemType + createdAt`, `status + createdAt`, `ledgerEntryId`.
- Relation draft: belongs to `ledger_reconciliation_runs`; optionally references `ledger_entries`.
- Safety notes: item metadata must not contain raw provider secrets, raw bank data, or auth material.

### ledger_admin_adjustment_requests

- Purpose: stores maker/checker requests for admin credit/debit adjustments before ledger application.
- Draft columns: `id`, `siteId`, `memberId`, `requestType`, `amount`, `currency`, `status`, `makerAdminId`, `checkerAdminId`, `requestedAt`, `approvedAt`, `rejectedAt`, `reason`, `rejectionReason`, `emergencyOverride`, `emergencyReason`, `auditLogId`, `ledgerTransactionId`, `metadataSnapshot`.
- Required fields: `id`, `siteId`, `memberId`, `requestType`, `amount`, `currency`, `status`, `makerAdminId`, `requestedAt`, `reason`, `auditLogId`.
- Nullable fields: `checkerAdminId`, `approvedAt`, `rejectedAt`, `rejectionReason`, `emergencyReason`, `ledgerTransactionId`, `metadataSnapshot`.
- Unique constraints draft: `siteId + id`; optional `siteId + ledgerTransactionId` when applied.
- Indexes draft: `siteId + memberId + requestedAt`, `siteId + status + requestedAt`, `makerAdminId`, `checkerAdminId`, `auditLogId`.
- Relation draft: belongs to `sites`, `users`, maker admin, checker admin, admin audit log, and optional ledger transaction.
- Safety notes: no self-approval constraint plan must require `makerAdminId != checkerAdminId`; reason required; auditLogId required; emergency override fields require reason and high-risk audit.

### ledger_balance_snapshots

- Purpose: stores safe balance snapshots for reconciliation, backfill verification, and rollback comparison.
- Draft columns: `id`, `siteId`, `memberId`, `accountId`, `accountType`, `currency`, `balance`, `snapshotType`, `snapshotAt`, `sourceType`, `sourceId`, `createdAt`, `metadataSnapshot`.
- Required fields: `id`, `siteId`, `accountId`, `accountType`, `currency`, `balance`, `snapshotType`, `snapshotAt`, `createdAt`.
- Nullable fields: `memberId`, `sourceType`, `sourceId`, `metadataSnapshot`.
- Unique constraints draft: `siteId + accountId + snapshotType + snapshotAt`.
- Indexes draft: `siteId + memberId + snapshotAt`, `siteId + accountType + snapshotAt`, `sourceType + sourceId`.
- Relation draft: belongs to `ledger_accounts`; optionally belongs to `users`.
- Safety notes: snapshots are evidence for comparison only; they are not frontend authority for money movement.

### ledger_audit_links

- Purpose: links ledger records, adjustment requests, reconciliation items, and audit events without duplicating audit payloads.
- Draft columns: `id`, `siteId`, `auditLogId`, `ledgerEntryId`, `ledgerTransactionId`, `adjustmentRequestId`, `reconciliationItemId`, `linkType`, `createdAt`.
- Required fields: `id`, `siteId`, `auditLogId`, `linkType`, `createdAt`.
- Nullable fields: `ledgerEntryId`, `ledgerTransactionId`, `adjustmentRequestId`, `reconciliationItemId`.
- Unique constraints draft: `siteId + auditLogId + linkType + ledgerEntryId`; similar unique drafts for transaction, adjustment, and reconciliation links.
- Indexes draft: `auditLogId`, `ledgerEntryId`, `transactionId`, `siteId + linkType + createdAt`.
- Relation draft: belongs to admin audit logs and optionally links to ledger schema rows.
- Safety notes: links store references only; audit snapshots remain sanitized and immutable.

## 5. ledger_accounts Draft

Fields:

- `id`
- `siteId`
- `memberId` nullable
- `accountType`
- `currency`
- `status`
- `createdAt`
- `updatedAt`

Supported accountType values:

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

Status draft: active, locked, archived. Final enum names require later review.

## 6. ledger_entries Draft

Fields:

- `id`
- `transactionId`
- `siteId`
- `memberId`
- `accountId`
- `accountType`
- `sourceType`
- `sourceId`
- `transactionType`
- `direction`
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

Entry draft rules:

- Direction is debit or credit.
- Amount must be positive.
- Balance fields are server-calculated.
- Audit is required for admin/manual actions.
- Reversal entries reference `reversalOfLedgerEntryId`.

## 7. ledger_transactions Draft

Fields:

- `transactionId`
- `siteId`
- `transactionType`
- `sourceType`
- `sourceId`
- `status`
- `idempotencyKey`
- `totalDebit`
- `totalCredit`
- `currency`
- `createdAt`
- `completedAt`
- `failedAt`
- `failureReason`
- `metadataSnapshot`

Transaction draft rules:

- totalDebit must equal totalCredit for double-entry-compatible transactions where applicable.
- failed/reversed transaction must use explicit reversal entries.
- Transaction status is append-observable through entries and audit links.
- Metadata snapshot must be sanitized.

## 8. Idempotency Schema Plan

- Key scope by `siteId + action + memberId/sourceId`.
- `requestHash` stores a sanitized deterministic request hash.
- `responseSnapshot` stores a safe response snapshot for duplicate same-payload replay.
- `status` tracks pending, completed, failed, or expired.
- `expiresAt` supports retention/cleanup after the reconciliation window.
- Unique constraint draft: `siteId + action + memberId + sourceId + idempotencyKey`.
- Conflict behavior: duplicate key with same payload returns same result; duplicate key with different payload returns idempotency conflict.
- No replay without audit for money-affecting admin actions.

## 9. Reconciliation Schema Plan

Required reconciliation records:

- Reconciliation run.
- Reconciliation item.
- Unmatched deposit.
- Unmatched withdraw.
- Stale pending.
- Provider variance.
- Lucky Wheel reward liability.
- Admin adjustment variance.
- Wallet balance snapshot mismatch.

Plan:

- `ledger_reconciliation_runs` records batch metadata and safe summary totals.
- `ledger_reconciliation_items` records matched, unmatched, stale, disputed, and adjusted items.
- `ledger_balance_snapshots` stores wallet snapshot evidence for ledger-sum comparison.
- Every variance item requires owner, status, safe source reference, createdAt, and follow-up action.

## 10. Admin Adjustment Schema Plan

- Request table draft: `ledger_admin_adjustment_requests`.
- Approval/rejection fields: `checkerAdminId`, `approvedAt`, `rejectedAt`, `rejectionReason`.
- Maker/checker separation: maker creates, checker approves/rejects.
- No self-approval constraint plan: `makerAdminId` must differ from `checkerAdminId`.
- Reason required for request, approval, rejection, and emergency override.
- `auditLogId` required for request and decision evidence.
- Emergency override fields: `emergencyOverride`, `emergencyReason`.
- Applied adjustments link to `ledgerTransactionId`.
- High-risk adjustment reports must include owner/auditor review status before any production approval.

## 11. Index and Constraint Plan

Required index/constraint drafts:

- `siteId + memberId + createdAt`
- `siteId + sourceType + sourceId`
- `siteId + idempotencyKey`
- `siteId + transactionType + createdAt`
- `reconciliationStatus + createdAt`
- `auditLogId`
- `reversalOfLedgerEntryId`
- `transactionId`

Additional constraint drafts:

- Positive amount checks for ledger entries and adjustment requests.
- Debit/credit direction allowed values.
- Member account uniqueness by site, member, account type, and currency.
- Idempotency uniqueness by site, action, member/source, and key.
- Maker/checker no-self-approval for admin adjustment decisions.

## 12. Migration Dry-Run Plan

Phase R does not create migrations. Future dry-run steps:

- Create draft migration in isolated branch only in Phase S/T, not Phase R.
- Run against disposable local DB only.
- Run Prisma generate only in dry-run environment.
- Verify no production DB.
- Verify no seed touching live data.
- Verify rollback script.
- Verify response leak scan.
- Verify smoke suite.
- Verify backup/restore drill requirement before production.
- Review migration SQL for destructive operations before any staging dry-run approval.
- Confirm no runtime provider/payment/bank/SMS/Slip OCR mode change.

## 13. Rollback Plan

- Rollback migration plan draft must exist before any future dry-run migration.
- Restore from backup requirement before production consideration.
- Stop writes before rollback.
- Verify ledger/wallet snapshot consistency.
- Run post-rollback reconciliation.
- Write incident report.
- Preserve audit and migration logs with safe references only.
- Do not use production DB rollback in Phase R.

## 14. Data Backfill Plan Draft

- No live backfill in Phase R.
- Historical wallet balance snapshot strategy: capture safe member/account snapshot totals for comparison only.
- Deposit/withdraw historical mapping draft: map existing transaction ids, statuses, amounts, and safe references to ledger source drafts.
- Admin adjustment mapping draft: map admin credit/debit audit events to adjustment request drafts where evidence exists.
- Lucky Wheel reward liability mapping draft: map pending/claimed/cancelled reward claims into liability report drafts only.
- Provider callback mapping draft: map mock/sandbox callback references only; no live provider feed.
- Backfill verification report: compare row counts, totals, variance counts, and reconciliation status.
- Unmatched records report: list safe source references, status, owner, and follow-up action.

## 15. Phase S Go/No-Go Criteria

Phase S must not start unless Phase R passes static review and smoke.

No-Go if missing:

- Schema dry-run plan.
- Proposed schema draft.
- Migration dry-run plan.
- Rollback plan.
- Reconciliation schema plan.
- Idempotency schema plan.
- Admin adjustment dual-control schema plan.
- No production DB boundary.
- No migration created.
- No schema.prisma changed.
- Static smoke guard PASS.
- Secret scan PASS.
- Rendered placeholder scan PASS.

No-Go also applies if any forbidden file changed, including `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.js`, runtime route/controller/service files, database fixtures, or live integration config.

## 16. Next Phases

- Phase S: Ledger mock runtime harness, no real money.
- Phase T: Reconciliation mock reports + admin read-only UI.
- Phase U: Certification checklist before any live integration.
- Phase V: Staging dry-run migration only after explicit approval.

## Final Boundary

This Phase R plan is docs/static smoke only. It does not create a Prisma migration, does not change `schema.prisma`, does not change runtime deposit/withdraw/provider/payment/bank/SMS/Slip OCR behavior, does not add route/controller/service implementation, does not use production DB, does not move real money, and does not enable live payout. Status remains NOT production ready.
