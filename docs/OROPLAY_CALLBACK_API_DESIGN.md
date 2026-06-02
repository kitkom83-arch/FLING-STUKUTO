# OroPlay Callback API Design

ORO-2A status: design/staging-boundary only. This phase documents the callback route boundary and adds an isolated mock/static smoke guard only.

This is not a live callback runtime. ORO-2A does not create Express routes, does not connect Prisma or a database, does not mutate wallet state, does not post ledger entries, does not call OroPlay, and does not use real credentials.

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

## Future ORO-2B / ORO-3 Dependency

ORO-2B Future Staging Callback Stub may add a disabled/staging-only route stub only after approval. It must still fail closed without wallet or ledger mutation until ORO-3 guard work is complete.

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
