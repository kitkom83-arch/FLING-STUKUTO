# Financial Ledger Reconciliation Mock Reports

## 1. Phase T status

Phase T adds reconciliation mock reports and a static admin read-only UI.

Status: NOT production ready.

- reconciliation mock reports only
- admin read-only UI only
- mock/in-memory only
- no production DB
- no real money
- no live payout
- no live provider/payment/bank/SMS/Slip OCR
- no Prisma migration
- no schema.prisma change
- no runtime route/controller/service integration
- no deposit/withdraw/admin-credit/provider callback runtime flow change
- no admin write action

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
- Read-only admin UI only.
- No approve/reject/apply/reverse write action in UI.
- No secret/token/password/database env/JWT/auth header values in docs/logs.

## 3. Mock report scope

The reports are used to:

- visualize ledger reconciliation status
- compare wallet snapshot vs mock ledger sum
- compare deposit credited vs mock statement
- compare withdraw reserved/approved/paid_mock
- show admin adjustment variance
- show provider callback variance
- show Lucky Wheel reward liability
- show stale pending items
- show unmatched entries
- show audit link coverage

The reports are not used for:

- real money
- production
- live payout
- live provider
- real deposit/withdraw
- public API
- DB migration
- admin approval/write action

## 4. Reconciliation report types

Report contracts:

- daily deposit ledger vs statement mock report
- withdraw reserve vs approved vs paid_mock report
- wallet balance snapshot vs ledger sum report
- admin adjustment variance report
- provider callback variance report
- Lucky Wheel reward liability report
- stale pending deposit/withdraw report
- unmatched entries report
- audit coverage report
- reconciliation dashboard summary

## 5. Report data contract

Each report returns:

- `reportId`
- `reportType`
- `siteId`
- `generatedAt`
- `generatedBy`
- `sourceMode = mock`
- `dateRange`
- `status`
- `summary`
- `rows`
- `totals`
- `varianceAmount`
- `varianceCount`
- `staleCount`
- `unmatchedCount`
- `auditCoveragePercent`
- `notes`
- `safetyBoundarySnapshot`

## 6. Dashboard summary contract

Dashboard summary returns:

- `totalReports`
- `matchedReports`
- `varianceReports`
- `stalePendingCount`
- `unmatchedEntryCount`
- `totalMockDepositAmount`
- `totalMockWithdrawReserveAmount`
- `totalMockPaidMockAmount`
- `totalMockWheelRewardLiability`
- `auditCoveragePercent`
- `lastGeneratedAt`

## 7. Read-only admin UI contract

The UI is static/local read-only only.

The UI must not include:

- save button
- approve button
- reject button
- apply adjustment button
- reverse transaction button
- payout button
- live provider action
- POST/PATCH/DELETE request
- external network call

UI tabs:

- Overview
- Deposits
- Withdrawals
- Wallet snapshots
- Provider variance
- Lucky Wheel liability
- Admin adjustments
- Stale pending
- Unmatched entries
- Audit coverage

## 8. Empty/error states

Required states:

- ไม่พบข้อมูล
- Mock data only
- No production DB
- Live payout disabled
- Provider live disabled
- Reconciliation mismatch mock
- Stale pending mock
- Audit coverage warning mock

## 9. Mock filter behavior

- date range mock
- report type filter mock
- status filter mock
- member/site filter mock
- search mock
- export preview mock only
- no file write required
- no network

## 10. Reconciliation read-only principles

- report reads mock state only
- no mutation
- no approval
- no wallet change
- no ledger entry write
- no admin adjustment write
- no payout
- no provider callback action
- all UI actions are preview/mock only

## 11. Audit and redaction

- output sanitized
- no secret-shaped values
- no raw internal error
- IP masked
- userAgent hashed
- auditLogId links mock only
- before/after snapshot sanitized

## 12. Phase U Go/No-Go criteria

Phase U must not start unless Phase T passes:

- mock reports module exists
- read-only UI exists
- smoke PASS
- no DB usage
- no Prisma usage
- no network call
- no route/controller/service integration
- no write/approve/reject/payout action in UI
- report contracts PASS
- empty/error state PASS
- audit redaction PASS
- no secret scan PASS
- undefined/NaN/[object Object] scan PASS
- no-live-payout boundary PASS
- no-production-DB boundary PASS

## 13. Next phases

- Phase U: Certification checklist before any live integration
- Phase V: Staging dry-run migration only after explicit approval
- Phase W: DB-backed ledger staging prototype only after Phase V approval
- Phase X: Read-only staging reconciliation API only after explicit approval

## Final boundary

This Phase T artifact is isolated mock reporting plus a local static read-only UI only. It does not expose an API, write a database, use Prisma, change `schema.prisma`, create a migration, change deposit/withdraw/admin-credit/provider callback runtime flow, use real money, or enable live payout.
