# OroPlay Callback API Design

ORO-2A status: design/staging-boundary only. This phase documents the callback route boundary and adds an isolated mock/static smoke guard only.

ORO-2A closure: closed.

ORO-2B status: current staging callback stub route skeleton. This phase adds fail-closed Express route skeletons only.

ORO-2C status: current callback runtime readiness contract only. This phase adds docs/static/mock readiness coverage for member mapping, payload validation, idempotency, sanitized callback logs, and ledger/reconciliation prerequisites.

ORO-3A status: ORO-3A simulation only. This phase adds a mock runtime simulation harness for decisions and intent objects only.

ORO-3B status: ORO-3B adapter contract only. This phase adds adapter contract and wallet-ledger bridge design outputs only.

This is not a live callback runtime. ORO-2A does not create Express routes, does not connect Prisma or a database, does not mutate wallet state, does not post ledger entries, does not call OroPlay, and does not use real credentials.

ORO-2B is also not a live callback runtime. It does not connect Prisma or a database, does not mutate wallet state, does not post ledger entries, does not call OroPlay, does not use real credentials, and does not return a live success response.

ORO-2C is also not a live callback runtime. It does not query production DB, does not perform Prisma write operations, does not mutate wallet state, does not mutate ledger state, does not call OroPlay, does not enable provider-compatible aliases, and does not convert the ORO-2B fail-closed stub into runtime processing.

ORO-3A is also not a live callback runtime. ORO-2B fail-closed route remains default; no runtime wallet/ledger mutation is allowed, no production DB is used, no Prisma write is allowed, and provider-compatible aliases remain disabled.

ORO-3B is also not a live callback runtime. ORO-2B fail-closed route remains default; ORO-3B adapter contract only returns plan/intent objects, keeps no runtime wallet/ledger mutation, and has no provider-compatible alias enabled.

## ORO-2C Callback Runtime Readiness Contract

ORO-2C readiness covers:

- Member mapping from OroPlay `userCode` to PG77 member identity for valid, unknown, blocked, inactive, and malformed cases.
- Balance callback payload validation.
- Transaction callback payload validation.
- Malformed body, missing `userCode`, missing `transactionCode`, invalid amount, unsupported transaction type, and unknown vendor/game field handling.
- Idempotency for duplicate `transactionCode`, same payload replay, round/session replay, and conflicting replay to manual review / fail-closed.
- Sanitized callback log preview with safe metadata only.
- Ledger/reconciliation boundary for future ORO-3 runtime work.

ORO-2B fail-closed remains default for active callback stub routes.

## ORO-2B Staging Callback Stub Route Skeleton

ORO-2B adds a staging callback stub route skeleton with fail-closed default behavior:

- `POST /api/oroplay/balance`
- `POST /api/oroplay/transaction`

Default behavior is fail-closed. If the staging callback stub is not explicitly enabled by placeholder env key name `OROPLAY_STAGING_CALLBACK_STUB_ENABLED`, the route returns a disabled/fail-closed response. If it is explicitly enabled for staging route-shape checks, it still returns route-skeleton/fail-closed behavior and does not process callbacks.

The response is sanitized and must not echo authorization, credentials, env values, tokens, passwords, secrets, `DATABASE_URL`, PIN values, or device identifiers.

ORO-2B route skeleton limitations:

- No runtime wallet mutation.
- No runtime ledger mutation.
- No production DB.
- No real money.
- No live OroPlay API.
- No external network.
- No real client secret.
- No auto-credit.
- No payout.
- No migration.
- No deploy.
- No live provider.

Optional provider-compatible aliases remain disabled in ORO-2B:

- `POST /api/balance` remains disabled and provider-required-only.
- `POST /api/transaction` remains disabled and provider-required-only.

## Preferred Internal Routes

Use internal OroPlay-prefixed routes as the primary plan:

- `POST /api/oroplay/balance`
- `POST /api/oroplay/transaction`

## Optional Provider-Compatible Aliases

Only add aliases if OroPlay requires exact provider paths during a later approved staging phase:

- `POST /api/balance`
- `POST /api/transaction`

Aliases must share the same guarded handler as the internal routes. They must not bypass Basic Auth, request validation, idempotency, ledger checks, callback logging, reconciliation, or future certification gates.

## Auth Boundary

- Callback auth uses Basic Auth.
- Credentials are env-only and must be represented only by placeholder key names such as `OROPLAY_CALLBACK_BASIC_AUTH_USER` and `OROPLAY_CALLBACK_BASIC_AUTH_PASSWORD`.
- Do not store credentials in source, docs, screenshots, issue comments, callback logs, or smoke output.
- Never print or store the raw `authorization` header.
- Logs may record only sanitized auth status, route, request id, member reference, transaction reference, and safe error class.

## Request Boundary

Balance callback boundary:

- Required: `userCode`

Transaction callback boundary:

- Required: `userCode`
- Required: `transactionCode`
- Required: `amount`
- Optional guard field: `roundId`
- Optional guard field: `isFinished`

`roundId` and `isFinished` are guard inputs for future idempotency, round-state, reconciliation, and provider-compatible behavior. They are not wallet mutation triggers in ORO-2A.

## Money Rule

- Negative `amount` = bet/debit intent.
- Positive `amount` = win/credit intent.
- Zero `amount` = reject.
- Missing, non-numeric, infinite, or otherwise malformed `amount` = reject.

The amount rule classifies intent only. ORO-2A must not credit, debit, auto-credit, payout, or post ledger entries.

## ORO-2A Limitation

- No runtime wallet mutation.
- No runtime ledger mutation.
- No production DB.
- No real money.
- No live OroPlay API.
- No external network.
- No real client secret.
- No callback route that mutates wallet.
- No auto-credit.
- No payout.
- No migration.
- No deploy.

## Future ORO-3 Dependency

ORO-2B Staging Callback Stub adds only disabled/staging-only route skeletons. It must still fail closed without wallet or ledger mutation until ORO-3 guard work is complete.

ORO-3 Ledger/Reconciliation dependency must define and approve:

- member mapping between OroPlay `userCode` and internal member identity.
- wallet ledger source of truth.
- Sanitized callback logs.
- game transaction storage.
- idempotency by `transactionCode` and related provider references.
- reconciliation between callbacks, game transactions, wallet ledger, and provider betting history.
- Duplicate, insufficient balance, invalid transaction, finished-round, and retry behavior.

## Static Smoke Boundary

`smoke:oroplay-callback-boundary` covers:

- Preferred internal route plan.
- Optional provider-compatible aliases marked provider-required-only.
- Basic Auth env-only boundary.
- Request payload shape.
- Amount intent rule.
- No runtime wallet, ledger, or production DB mutation.
- Sanitized callback log shape.
- Static secret-shaped value scan.

`smoke:oroplay-callback-stub` covers:

- Route skeleton files and `/api/oroplay` mount.
- `POST /api/oroplay/balance` and `POST /api/oroplay/transaction` skeleton routes.
- Optional alias disabled guard for `POST /api/balance` and `POST /api/transaction`.
- Fail-closed disabled/staging-only response contract.
- No wallet mutation, no ledger mutation, no production DB, no external network, and no real money safety flags.
- Sanitized response guard for authorization, credentials, token, password, secret, client secret, `DATABASE_URL`, PIN, and device identifier fields.
- Static secret-shaped value scan.

`smoke:oroplay-callback-readiness` covers:

- Member mapping cases.
- Balance and transaction payload readiness validation.
- Idempotency and duplicate replay handling.
- Sanitized callback log metadata boundary.
- Ledger/reconciliation boundary with no runtime wallet mutation, no runtime ledger mutation, and no Prisma write.
- ORO-2B fail-closed stub remains fail-closed.
- Optional alias disabled guard for `POST /api/balance` and `POST /api/transaction`.

`smoke:oroplay-callback-runtime-simulation` covers:

- ORO-3A simulation only.
- Valid balance simulation from mock state.
- Transaction decision simulation with `ledgerIntent` / `reconciliationIntent` only.
- Duplicate `transactionCode` idempotent replay without double intent.
- Conflicting duplicate manual_review / fail-closed.
- Unknown, blocked, inactive, insufficient balance, malformed, finished-round, and unsupported transaction cases fail closed.
- Sanitized log preview.
- ORO-2B fail-closed route remains default.
- Optional alias disabled guard for `POST /api/balance` and `POST /api/transaction`.

`smoke:oroplay-callback-runtime-adapter-contract` covers:

- ORO-3B adapter contract only.
- Balance callback adapter plan.
- Transaction callback adapter plan for bet/debit and win/credit intent objects.
- Wallet, ledger, transaction log, audit, and reconciliation intent shapes.
- Duplicate replay, conflicting replay, insufficient balance, finished round, unsupported type, malformed payload, unknown member, blocked member, and inactive member fail-closed behavior.
- Sanitized audit preview.
- ORO-2B fail-closed route remains default.
- No provider-compatible alias enabled.
- No runtime wallet/ledger mutation.
