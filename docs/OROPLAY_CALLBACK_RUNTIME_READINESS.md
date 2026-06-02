# OroPlay Callback Runtime Readiness Contract

## Purpose

ORO-2C defines the readiness contract for a future OroPlay callback runtime. It documents and tests member mapping, callback payload validation, idempotency, duplicate handling, sanitized logging, and ledger/reconciliation prerequisites before any runtime money-flow work is allowed.

ORO-2B is closed. The existing fail-closed callback stub remains the default behavior.

ORO-2C readiness closed. ORO-3A simulation current. runtime mutation still blocked.

ORO-3A closed. ORO-3B adapter contract current. Runtime mutation still blocked and the wallet-ledger bridge is design only.

ORO-3A closed. ORO-3B closed. ORO-3C execution plan current. Runtime mutation still blocked and the runtime gate remains closed.

## Non-goals

- No production DB.
- No real money.
- No live OroPlay API call.
- No external network.
- No client secret or credential material.
- No runtime wallet mutation.
- No runtime ledger mutation.
- No auto-credit.
- No payout.
- No migration.
- No deploy.
- No provider-compatible alias enablement for `/api/balance` or `/api/transaction`.
- No conversion of the ORO-2B fail-closed route into a live runtime.

## Safety Boundary

ORO-2C is docs, contract, static/mock harness, and local smoke only. The contract uses mock member records only and ORO-2C does not query DB, does not import Prisma, and does not write ledger or wallet state.

No live runtime statement: ORO-2C is not a live callback runtime. The only active runtime callback behavior remains the ORO-2B fail-closed stub.

## Member Mapping Contract

OroPlay sends `userCode`; PG77 must map it to an internal member identity only after a future runtime phase passes safety gates.

ORO-2C member mapping cases:

| Case | Expected readiness result | Runtime behavior in ORO-2C |
| --- | --- | --- |
| valid userCode | Maps to a mock PG77 member identity | No DB query, no wallet mutation |
| unknown userCode | fail-closed | No DB query, no wallet mutation |
| blocked member | fail-closed | No DB query, no wallet mutation |
| inactive member | fail-closed | No DB query, no wallet mutation |
| malformed userCode | fail-closed | No DB query, no wallet mutation |

## Callback Payload Validation Contract

Balance callback payload:

- Requires `userCode`.
- Malformed JSON/body fails closed.
- Missing `userCode` fails closed.
- Malformed `userCode` fails closed.
- Unknown vendor/game fields are ignored for readiness only.

Transaction callback payload:

- Requires `userCode`, `transactionCode`, and non-zero numeric `amount`.
- Malformed JSON/body fails closed.
- Missing `userCode` fails closed.
- Missing `transactionCode` fails closed.
- Invalid `amount` fails closed.
- Unsupported transaction type fails closed.
- Unknown vendor/game fields are ignored for readiness only.

## Idempotency Contract

- Duplicate `transactionCode` must not double debit or double credit.
- Round/session replay must not mutate again.
- Same payload replay is safe and must not mutate again.
- Conflicting replay goes to `manual_review` / fail-closed.
- ORO-2C records idempotency state in mock memory only inside the harness; it does not write ledger records.

## Sanitized Callback Log Contract

Allowed log metadata only:

- `requestId`
- route
- event type
- callback type
- masked or hashed `userCode`
- masked or hashed `transactionCode`
- readiness result

Log boundary:

- Do not log authorization.
- Do not log raw Basic auth.
- Do not log token, password, secret, clientSecret, DATABASE_URL, PIN, or deviceId values.
- Do not log raw body if any credential-like field exists.
- Prefer masked/hash previews over raw identifiers.

## Ledger / Reconciliation Boundary

ORO-2C does not mutate wallet state, does not mutate ledger state, and does not perform Prisma write operations.

Future ORO-3 runtime must define and approve:

- ledger transaction boundary
- audit log boundary
- reconciliation record boundary
- duplicate transaction guard
- round/session replay guard
- manual review queue for conflicting replay
- fail-closed behavior for uncertain callback state

## Optional Alias Decision

OroPlay documentation may use provider-compatible paths `/api/balance` and `/api/transaction`, but aliases remain disabled in ORO-2C.

Aliases may be enabled only in a future provider-required runtime phase after safety gates pass and the implementation shares the same guarded internal handler as `/api/oroplay/balance` and `/api/oroplay/transaction`.

## ORO-3 Prerequisites

ORO-3 is blocked until:

- `smoke:oroplay-callback-readiness` passes.
- Member mapping has an approved runtime source of truth.
- Idempotency and duplicate guard behavior is approved.
- Sanitized callback logging is approved.
- Ledger transaction, audit log, and reconciliation records are approved.
- Provider-compatible alias requirements are confirmed and safety-gated.

## ORO-3A Current Simulation

ORO-3A is a runtime simulation harness only. It may read mock state, return mock balance decisions, return transaction decisions, and produce `ledgerIntent` / `reconciliationIntent` mock objects for review.

Runtime mutation still blocked:

- no production DB.
- no real money.
- no live OroPlay API call.
- no external network.
- no runtime wallet mutation.
- no runtime ledger mutation.
- no Prisma write.
- no alias enablement for `/api/balance` or `/api/transaction`.

## ORO-3B Adapter Contract Current

ORO-3B defines callback adapter contract and wallet-ledger bridge intent shapes only. It does not mutate wallet state, does not mutate ledger state, does not write Prisma records, does not call OroPlay, and does not enable provider-compatible aliases.

## ORO-3D Current Readiness Gate

ORO-3A closed. ORO-3B closed. ORO-3C closed. ORO-3D current readiness gate / certification pack only. Runtime mutation still blocked, and the runtime readiness gate remains closed. ORO-3D does not enable callback runtime, wallet mutation, ledger mutation, Prisma write, live traffic, external network, production DB, real money, or provider-compatible aliases.

## ORO-3E Current Design Freeze

ORO-3A closed. ORO-3B closed. ORO-3C closed. ORO-3D closed. ORO-3E current design freeze / staging-only activation plan only.

Runtime mutation still blocked. staging-only activation remains closed by default. ORO-3E does not enable callback runtime, wallet mutation, ledger mutation, Prisma write, live traffic, external network, production DB, real money, provider-compatible aliases, migration, or deploy.

## ORO-4C Current Shadow Invocation

ORO-4A closed. ORO-4B closed. ORO-4C current shadow invocation harness only.

The shadow invocation harness reads mock fixtures only and returns mock balance decisions or transaction intent objects only. It preserves fail_closed default behavior, shadow_ready_only certified mock state, ORO-2B fail-closed route behavior, ORO-4A disabled gate behavior, and ORO-4B staging precheck behavior. It does not enable runtime route wiring, provider-compatible aliases, wallet mutation, ledger mutation, Prisma write, external network, production DB, real money, migration, deploy, payout, or auto-credit.
