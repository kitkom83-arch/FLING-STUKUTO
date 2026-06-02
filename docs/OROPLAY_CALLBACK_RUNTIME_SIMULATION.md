# OroPlay Callback Runtime Simulation

## Purpose

ORO-3A provides a mock callback runtime simulation harness for OroPlay balance and transaction callbacks. It exercises runtime-shaped decisions before any real wallet, ledger, Prisma, provider, or alias work is approved.

ORO-2C readiness closed. ORO-3A is the current simulation phase.

ORO-3A closed. ORO-3B adapter contract current. The simulation remains no-mutation and still does not enable wallet mutation, ledger mutation, Prisma write, or provider aliases.

ORO-3A closed. ORO-3B closed. ORO-3C execution plan current. The simulation remains no-mutation and ORO-3C still does not enable wallet mutation, ledger mutation, Prisma write, live runtime processing, or provider aliases.

## Non-goals

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
- No provider-compatible alias enablement for `/api/balance` or `/api/transaction`.
- No conversion of the ORO-2B fail-closed route into a live runtime.

## Safety Boundary

ORO-3A is docs, contract, static/mock harness, and local smoke only. The simulator reads mock state, returns decision objects, and may produce mock `ledgerIntent` / `reconciliationIntent` objects only.

No live runtime statement: ORO-3A is not a live callback runtime. Runtime mutation still blocked. The active callback route behavior remains the ORO-2B fail-closed stub.

## Mock Runtime Simulation Flow

1. Balance simulation validates the mock payload.
2. Balance simulation maps `userCode` against mock member state only.
3. Balance simulation returns the mock balance decision without writing anything.
4. Transaction simulation validates `userCode`, `transactionCode`, amount, round fields, and transaction type.
5. Transaction simulation evaluates idempotency against mock state only.
6. Transaction simulation returns a decision and, for valid new transactions only, a mock intent object.
7. No wallet balance is changed and no ledger row is written.

## Member Mapping Simulation

The simulator covers:

- valid `userCode` mapping to a mock PG77 member.
- unknown `userCode` fail-closed.
- blocked member fail-closed.
- inactive member fail-closed.
- malformed payload fail-closed.

All mapping uses mock in-memory state only. There is no DB lookup and no Prisma dependency.

## Idempotency Simulation

The simulator records mock idempotency state only inside the harness:

- New `transactionCode` can produce one mock ledger intent.
- Duplicate `transactionCode` with the same payload returns idempotent replay and does not produce another intent.
- Finished round replay is blocked.
- Unknown or malformed idempotency inputs fail closed.

## Duplicate / Conflicting Replay Handling

Duplicate replay is safe only when the payload fingerprint is unchanged. Conflicting duplicate replay returns `manual_review` and fail-closed, with no wallet mutation and no ledger mutation.

## Ledger Intent / Reconciliation Intent Only

ORO-3A may return:

- `ledgerIntent`
- `reconciliationIntent`

These are mock objects for future review only. They are not persisted, not posted, not executed, and not used to credit, debit, payout, or auto-credit any member.

## Sanitized Log Preview

The simulator returns safe log previews with masked and hashed identifiers. It must not echo authorization, password, secret, token, clientSecret, DATABASE_URL, PIN, deviceId, raw callback body, or credential-like values.

## ORO-3B Prerequisites

ORO-3B is blocked until:

- `smoke:oroplay-callback-runtime-simulation` passes.
- ORO-2B fail-closed route remains default.
- Optional aliases remain disabled unless provider-required and safety-gated.
- Runtime member source of truth is approved.
- Runtime idempotency and finished-round policy is approved.
- Ledger transaction, audit log, and reconciliation boundaries are approved.
- Manual review behavior for conflicting replay is approved.
- Secret redaction and callback log policy are approved.

ORO-3B current adapter contract work builds on this no-mutation simulation output. ORO-3C remains blocked until `smoke:oroplay-callback-runtime-adapter-contract` passes.
