# OroPlay Callback Runtime Adapter Contract

## purpose

ORO-3B defines the callback runtime adapter contract and wallet-ledger bridge design for future OroPlay callback processing. It connects the ORO-3A simulation output to future wallet, ledger, transaction log, audit log, and reconciliation intent shapes without enabling runtime mutation.

ORO-3B is bridge design / adapter contract only.

## non-goals

- No production DB.
- No real money.
- No live OroPlay API call.
- No external network.
- No client secret or credential material.
- No runtime wallet mutation.
- No runtime ledger mutation.
- No Prisma write.
- No migration.
- No deploy.
- No payout.
- No auto-credit.
- No provider-compatible alias route for `/api/balance` or `/api/transaction`.
- No conversion of the ORO-2B fail-closed route into a live runtime.

## safety boundary

ORO-3B is docs, contract, static/mock harness, local smoke, adapter design only, and wallet/ledger intent design only.

The ORO-2B fail-closed route remains the active callback route behavior. ORO-3B does not open runtime callback processing.

## adapter contract overview

The adapter contract receives a future callback-shaped payload and returns an adapter decision plan. It does not return a live provider response from runtime code.

Supported contract decisions:

- `accepted_plan`
- `fail_closed`
- `manual_review`
- `idempotent_replay`
- `duplicate_conflict`
- `insufficient_balance`
- `unknown_member`
- `blocked_member`
- `inactive_member`
- `malformed_payload`
- `unsupported_transaction_type`
- `finished_round_replay`

Unsafe payload, member, duplicate, replay, and balance states fail closed or route to manual review. Accepted states create intent objects only.

## wallet-ledger bridge design

The bridge design creates future intent objects:

- `walletIntent`
- `ledgerIntent`
- `transactionLogIntent`
- `auditLogIntent`
- `reconciliationIntent`

Every intent is non-executable in ORO-3B. Each plan marks `mutationAllowed: false`, `prismaWriteAllowed: false`, and `liveRuntimeEnabled: false`.

## callback adapter flow

1. receive callback payload
2. sanitize payload for log preview
3. validate basic shape
4. map userCode -> member mapping intent
5. check member status
6. build idempotency key
7. check duplicate/conflict decision
8. build walletIntent
9. build ledgerIntent
10. build transactionLogIntent
11. build auditLogIntent
12. build reconciliationIntent
13. return response plan
14. do not mutate wallet
15. do not mutate ledger
16. do not write DB

## balance callback adapter plan

Balance callback payloads validate `userCode`, map the mock member identity, and build a balance-read wallet intent only. The future response shape is a plan; ORO-3B does not read a real wallet, update balance, or expose a provider-compatible alias.

## transaction callback adapter plan

Transaction callback payloads validate `userCode`, `transactionCode`, non-zero amount, and supported transaction type. Accepted bet and win callbacks build wallet, ledger, transaction log, audit, and reconciliation intent objects only.

## member mapping guard

`userCode` is mapped against mock member state only in ORO-3B. Unknown, blocked, inactive, missing, blank, or malformed member references fail closed.

## idempotency guard

The adapter design builds a deterministic idempotency key from callback type, user code, transaction code, round id, amount, and transaction type. ORO-3B stores no DB idempotency record; mock state is used only by the local harness.

## duplicate replay handling

Duplicate `transactionCode` with the same fingerprint returns `idempotent_replay`. It creates no second wallet, ledger, transaction log, audit, or reconciliation mutation.

## conflicting replay handling

Duplicate `transactionCode` with a different fingerprint returns `manual_review` with fail-closed safety. No wallet, ledger, transaction log, audit, or reconciliation write is performed.

## insufficient balance fail-closed

Bet/debit intent is rejected when the mock before-balance cannot cover the requested debit amount. The adapter returns fail-closed planning output only.

## finished round / canceled round handling

Finished or canceled round replay is fail-closed or manual-review only. ORO-3B does not reopen rounds, reverse wallet state, post compensation entries, or write a transaction record.

## wallet intent only

`walletIntent` describes a future debit, credit, or balance-read operation. It is not executed, persisted, or sent to a wallet service.

## ledger intent only

`ledgerIntent` describes a future ledger entry. It is not inserted, posted, or persisted.

## reconciliation intent only

`reconciliationIntent` describes future checks between provider callback data, wallet state, ledger entries, and game transaction logs. It is not persisted.

## transaction log intent only

`transactionLogIntent` describes a future game transaction log row. It is not inserted and does not create runtime transaction history.

## sanitized audit preview

Audit preview uses masked or hashed identifiers and redacts credential-like fields. It must not expose authorization, password, secret, token, clientSecret, DATABASE_URL, PIN, deviceId, raw credentials, or raw credential-like payload values.

## response shape mapping

Accepted adapter decisions return a response plan with:

- callback type.
- internal route plan.
- detailed adapter decision.
- future provider result class.
- intent objects for accepted new transactions.
- `mutationAllowed: false`.
- `runtimeResponseEnabled: false`.

ORO-3B response mapping is not a live provider response.

## error shape mapping

Unsafe adapter decisions return fail-closed or manual-review plans with:

- error class.
- safe reason.
- sanitized audit preview.
- no intent execution.
- no wallet mutation.
- no ledger mutation.
- no DB write.

## rollback / compensation design note

Rollback and compensation remain design-only in ORO-3B. Future ORO-3C must define whether rollback callbacks create reversal entries, compensation intents, manual-review tasks, or reject/fail-closed responses. ORO-3B does not perform compensation.

## ORO-3C prerequisites

ORO-3C is blocked until:

- `smoke:oroplay-callback-runtime-adapter-contract` passes.
- ORO-2B fail-closed route remains default.
- ORO-3A simulation remains no-mutation.
- runtime member source of truth is approved.
- runtime idempotency storage is approved.
- wallet source of truth is approved.
- ledger transaction boundary is approved.
- transaction log storage boundary is approved.
- audit log storage boundary is approved.
- reconciliation workflow is approved.
- rollback and compensation rules are approved.
- provider-compatible alias decision is explicitly approved if required.

## no live runtime statement

ORO-3B is not a runtime adapter. It is not a live callback runtime and does not process provider callbacks.

## no runtime wallet mutation

ORO-3B does not debit or credit wallet balance.

## no runtime ledger mutation

ORO-3B does not insert, update, post, reverse, or persist ledger entries.

## no alias provider-compatible route enabled

ORO-3B does not enable `/api/balance` or `/api/transaction`. The only existing callback route behavior remains the ORO-2B fail-closed stub under `/api/oroplay`.
