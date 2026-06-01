# Deposit Ledger/Reconciliation Guard

## Phase AR scope

Phase AR defines the Ledger/Reconciliation Guard contract for deposit evidence after Phase AQ. This phase is docs/static/mock only. It creates a mock-only guard contract, an isolated harness, and smoke coverage for recommendation behavior before any real ledger posting exists.

Phase AR does not open a runtime endpoint, post ledger entries, credit member wallets, debit member wallets, auto-credit deposits, connect a payment gateway, connect a bank, call SMS or Slip OCR providers, use production DB, migrate schema, seed production, deploy, or call external network.

## Safety boundary

- no production DB
- no real money
- no real QR
- no real payment
- no live provider/payment/bank/SMS/Slip OCR
- no live TrueMoney
- no live TMNOne
- no live QR payment gateway
- no payout
- no migration
- no deploy
- no external network
- no runtime money-flow
- no auto-credit
- no runtime ledger mutation
- no secret/token/password/PIN/deviceId/DATABASE_URL in examples, docs, or logs

## Ledger/Reconciliation Guard overview

The guard accepts Phase AQ verification source evidence and returns only a mock recommendation. The recommendation can describe whether a source would be a future ledger posting candidate, requires manual review, is a mismatch, is duplicate suspect, should be rejected, or needs no action.

The guard is not an accounting writer. It must never create ledger entries, update wallet balance, credit a member, debit a member, or treat a source as proof of real payment.

## Relationship with Phase AO/AP/AQ

- Phase AO provides provider contract vocabulary for `truemoney_official`, `tmnone`, `qr_payment_gateway`, `slip_verification`, `bank_statement`, `bank_sms_fallback`, and `manual_admin`.
- Phase AP provides member QR deposit UX and mock QR download behavior. QR download is not payment proof.
- Phase AQ provides deposit verification source mock evidence.
- Phase AR consumes Phase AQ source evidence and produces Ledger/Reconciliation Guard mock recommendations only.
- Financial Ledger docs/mock harness remain the later ledger behavior reference. Phase AR does not invoke the existing ledger mock writer and does not add runtime posting.

## Ledger guard input contract

The ledger guard input is a normalized mock object:

| field | contract |
| --- | --- |
| `sourceId` | Stable mock source id for audit and reconciliation lookup. |
| `sourceType` | One of the Phase AQ source types. |
| `orderId` | Mock deposit order id used for duplicate guard. |
| `providerTransactionId` | Mock provider transaction id used for duplicate guard. |
| `rawHash` | Mock source hash used for duplicate guard. |
| `memberId` | Member expected to receive a future deposit credit after later certification. |
| `amount` | Mock source amount. |
| `currency` | Mock source currency, default `THB`. |
| `expectedAmount` | Optional expected amount for mismatch checks. |
| `expectedMemberId` | Optional expected member for mismatch checks. |
| `expectedCurrency` | Optional expected currency for mismatch checks. |
| `status` | Source status from Phase AQ or guard status. |
| `confidence` | Mock verification confidence. |
| `matched` | Whether a mock source matched Phase AQ expectations. |
| `qrDownloaded` | Whether the Phase AP QR mock artifact was downloaded. |
| `qrOrderStatus` | `ready`, `expired`, or `cancelled`. |
| `reason` | Required for manual admin mock input. |

Allowed Phase AQ `sourceType` values:

- `qr_mock_order`
- `payment_provider_mock_event`
- `slip_verification_mock`
- `bank_statement_mock`
- `bank_sms_fallback_mock`
- `manual_admin_mock`

## Ledger guard recommendation contract

Recommendation types:

- `no_action`
- `manual_review_required`
- `ledger_posting_candidate_mock`
- `mismatch_review_required`
- `duplicate_suspect`
- `reject`

`ledger_posting_candidate_mock` is only a mock recommendation. A mock recommendation must never credit member. A mock recommendation must never debit member. It is not a runtime ledger posting action and it is not proof of real payment.

Every result must include:

| field | contract |
| --- | --- |
| `guardStatus` | Ledger guard status. |
| `recommendationType` | One of the recommendation types above. |
| `reconciliationStatus` | One of the reconciliation statuses below. |
| `mockOnly` | Always true in Phase AR. |
| `idempotencyKey` | Stable mock key derived from source type and stable source identity. |
| `reason` | Human-readable mock reason with no secret-shaped values. |
| `canCreditMember` | Always false. |
| `canDebitMember` | Always false. |
| `walletMutated` | Always false. |
| `runtimeLedgerMutation` | Always false. |
| `externalNetworkCalled` | Always false. |

## Reconciliation snapshot contract

The reconciliation snapshot is a read-only mock summary:

| field | contract |
| --- | --- |
| `snapshotId` | Mock snapshot id derived from `sourceId`. |
| `sourceId` | Source id under review. |
| `sourceType` | Phase AQ source type. |
| `orderId` | Mock order id. |
| `providerTransactionId` | Mock provider transaction id. |
| `rawHash` | Mock raw source hash. |
| `amount` | Mock source amount. |
| `currency` | Mock source currency. |
| `expectedAmount` | Expected amount used for mismatch checks. |
| `expectedMemberId` | Expected member used for mismatch checks. |
| `expectedCurrency` | Expected currency used for mismatch checks. |
| `guardStatus` | Guard status at snapshot time. |
| `recommendationType` | Mock recommendation type. |
| `reconciliationStatus` | Mock reconciliation status. |
| `walletMutated` | Always false. |
| `runtimeLedgerMutation` | Always false. |

The reconciliation result must never mutate wallet and must never post ledger.

## Reconciliation statuses

- `reconciled_mock`
- `unreconciled_mock`
- `mismatch_mock`
- `pending_review_mock`
- `duplicate_suspect_mock`
- `rejected_mock`

## Ledger guard statuses

- `ledger_guard_received`
- `ledger_guard_candidate_mock`
- `ledger_guard_manual_review`
- `ledger_guard_duplicate_suspect`
- `ledger_guard_reconciliation_mismatch`
- `ledger_guard_rejected`
- `ledger_guard_failed`

## Ledger posting eligibility rules

- `ledger_posting_candidate_mock` is only a mock recommendation.
- Mock recommendation must never credit member.
- Mock recommendation must never debit member.
- mock recommendation must never credit member
- Reconciliation result must never mutate wallet.
- reconciliation result must never mutate wallet
- Verified `payment_provider_mock_event` source can become `ledger_posting_candidate_mock`.
- Verified or high-confidence `slip_verification_mock` source can become `ledger_posting_candidate_mock`.
- Matched `bank_statement_mock` source can become `ledger_posting_candidate_mock`.
- SMS fallback source must remain manual_review / weak signal.
- SMS-only source must never create ledger posting candidate.
- QR downloaded source must never create ledger posting candidate.
- Expired QR source must be rejected or manual_review only.
- Cancelled QR source must be rejected or manual_review only.
- expired QR source must be rejected or manual_review only
- cancelled QR source must be rejected or manual_review only
- Mismatch amount must become `mismatch_review_required`.
- Member mismatch must become `mismatch_review_required`.
- Currency mismatch must become `mismatch_review_required`.

## Manual review rules

- manual admin source must require reason
- `bank_sms_fallback_mock` always routes to `manual_review_required`.
- Uncertain `slip_verification_mock` routes to `manual_review_required`.
- Unmatched `bank_statement_mock` routes to `manual_review_required`.
- `manual_admin_mock` source must require reason.
- Admin adjustment must require reason and dual-control marker in future docs.
- Manual review does not approve real payment and does not credit or debit a member.

## Duplicate guard

- duplicate orderId
- duplicate providerTransactionId
- duplicate rawHash
- Duplicate `orderId` must become `duplicate_suspect`.
- Duplicate `providerTransactionId` must become `duplicate_suspect`.
- Duplicate `rawHash` must become `duplicate_suspect`.
- Duplicate detection is a guard recommendation only; it does not reject real money and does not post ledger.

## Idempotency

- The guard idempotency key is stable for the same source input.
- The key is scoped by source type and stable identity from `providerTransactionId`, `orderId`, or `rawHash`.
- Same key with same payload returns the same mock recommendation.
- Same key with changed amount, member, currency, or source attributes is an idempotency conflict and must route to `duplicate_suspect` or manual investigation.

## Audit requirements

Future/mock audit action markers:

- `admin.deposit_ledger_guard.evaluated_mock`
- `admin.deposit_ledger_guard.reconciliation_checked_mock`
- `admin.deposit_ledger_guard.mismatch_detected_mock`
- `admin.deposit_ledger_guard.duplicate_suspect_mock`
- `admin.deposit_ledger_guard.manual_review_mock`
- `admin.deposit_ledger_guard.rejected_mock`

Audit records are audit only / mock only. They must include source id, source type, guard status, recommendation type, reconciliation status, sanitized before/after snapshots, admin reason for manual review, and correlation id. They must not include secret-shaped values.

## Secret redaction requirements

- Do not include token, password, PIN, device id, database URL, authorization credential text, API key, raw credential URL, or long credential-shaped text in docs, output, or logs.
- Examples use mock ids and short placeholders only.
- Sanitized snapshots must redact secret-shaped input before display.

## No auto-credit boundary

The guard must never auto-credit member. `ledger_posting_candidate_mock` remains a recommendation marker only and cannot update wallet, ledger, balance, promotion credit, reward credit, or payout state.

## No runtime ledger mutation boundary

The guard must never post ledger, create ledger entries, update existing ledger entries, reverse ledger entries, change wallet balance, or call any runtime ledger writer. It is read-only mock evaluation.

## No real payment boundary

The guard must not treat QR download, SMS text, provider mock event, slip mock, bank statement mock, or manual admin mock as real payment proof. Real ledger posting requires later sandbox integration, live certification, dual control, audit approval, and explicit approval.

## No external network boundary

The guard must not call payment providers, banks, SMS providers, Slip OCR, TrueMoney, TMNOne, QR gateways, webhooks, or any external API. Phase AR uses local mock input only.
