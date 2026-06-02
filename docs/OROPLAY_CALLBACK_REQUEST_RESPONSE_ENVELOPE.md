# OroPlay Callback Request/Response Envelope

## ORO-4D scope

ORO-4D adds a Callback Request/Response Envelope Mapper / Runtime Shadow Response Contract. This phase is docs, contract, static/mock harness, and local smoke only.

It does not add live route behavior, public aliases, production DB access, real money movement, wallet mutation, ledger mutation, Prisma write, DB transaction, migration, deploy, payout, auto-credit, or a live OroPlay call.

## request/response envelope purpose

The mapper converts mock OroPlay-style callback payloads into internal shadow requests and converts shadow decisions back into mock response envelopes.

The request side proves that incoming balance and transaction shapes can be normalized before any future route wiring. The response side proves that shadow-only decisions can be wrapped in a stable response contract without mutating runtime state.

## mapper vs live route

The mapper is an isolated CommonJS helper called directly by local smoke tests. It is not imported by `src/app.js`, route files, controllers, wallet services, ledger services, or Prisma.

Live route wiring would pass Express traffic into callback runtime behavior. ORO-4D does not do that and keeps `runtimeWiredToLiveRoute=false`.

## balance request normalization

Balance request normalization accepts only mock payload fields such as `userCode`, `memberCode`, `playerCode`, and a safe request id. The mapper outputs an internal shadow request with:

- `callbackType=balance`
- safe `userCode`
- safe request id
- `shadowRequestOnly=true`

Unknown members are not resolved by the mapper itself. They fail closed when the mock shadow flow evaluates the request against fixture state.

## transaction request normalization

Transaction request normalization accepts only mock payload fields such as `userCode`, `transactionCode`, `amount`, `roundId`, `transactionType`, and `isFinished`.

The mapper normalizes transaction type to shadow intent direction:

- bet/debit becomes a negative signed amount and can only produce debit intent.
- win/credit becomes a positive signed amount and can only produce credit intent.
- malformed amount, missing transaction id, missing member, or unsupported type fails closed.

## balance response envelope

The balance response envelope is mock contract output only. A successful balance response is built from a mock-only decision and fixture balance:

- `responseSource=mock_only_decision`
- `mockResponseEnvelopeOnly=true`
- `shadowResponseContractOnly=true`
- `walletMutationAllowed=false`

## transaction response envelope

The transaction response envelope is shadow intent output only. A successful transaction response comes from `debit_intent_only` or `credit_intent_only`; it never performs the debit or credit.

The envelope records `intentSource=shadow_intent_only`, `walletMutationAllowed=false`, `ledgerMutationAllowed=false`, and `prismaWriteAllowed=false`.

## fail_closed response behavior

The default response behavior is fail_closed. Malformed request payloads, unknown members, insufficient balance, unsupported types, and finished round replay return a fail_closed response envelope.

The fail_closed envelope does not create wallet intent, ledger intent, Prisma write, route wiring, external network behavior, or public alias activation.

## manual_review response behavior

Conflicting duplicate replay enters manual_review / fail_closed behavior. The manual_review envelope marks `manualReview=true` and `failClosed=true`.

Manual review is a response contract marker only. It does not create an admin action, write an audit row, credit, debit, post ledger, or update Prisma.

## duplicate replay response behavior

Duplicate replay with the same transaction payload returns an idempotent replay response. It does not produce another debit intent or credit intent.

The envelope records `doubleDebitPrevented=true` and `doubleCreditPrevented=true`.

## insufficient balance response behavior

A bet request that exceeds mock fixture balance returns fail_closed with reason `insufficient_balance`.

The response does not debit, reserve balance, write ledger, create a transaction row, or call any provider.

## sanitized log behavior

The mapper returns sanitized log preview metadata only. It never prints raw request bodies or credential-like values.

Safe redaction markers are:

- auth-header-redaction-marker
- credential-prefix-marker
- mock-redaction-key-name
- redacted-credential-marker

Credential-like keys are replaced with redaction output.

## no wallet mutation proof

ORO-4D keeps wallet mutation blocked:

- `walletMutationAllowed=false`
- walletMutation proof flag is false.
- debit and credit remain response intent markers only.
- wallet mutation services are not imported.

## no ledger mutation proof

ORO-4D keeps ledger mutation blocked:

- `ledgerMutationAllowed=false`
- ledgerMutation proof flag is false.
- transaction response envelopes are not ledger records.
- ledger services are not imported.

## no Prisma write proof

ORO-4D keeps Prisma writes blocked:

- `prismaWriteAllowed=false`
- prismaWrite proof flag is false.
- no Prisma client import exists in the new mock mapper or fixture files.
- no DB transaction is introduced.

## no external network proof

ORO-4D keeps external network blocked:

- `externalNetworkAllowed=false`
- `networkAllowed=false`
- externalNetwork proof flag is false.
- no live OroPlay API call is introduced.

## no alias proof

Provider-compatible aliases remain disabled:

- `aliasBalanceEnabled=false`
- `aliasTransactionEnabled=false`
- aliasBalance proof flag is false.
- aliasTransaction proof flag is false.
- `/api/balance` is not opened.
- `/api/transaction` is not opened.

## no live route wiring proof

The ORO-2B fail-closed route remains preserved. ORO-4D does not import or mount the envelope mapper in `src/app.js`, route files, or controllers.

The proof keeps:

- `runtimeWiredToLiveRoute=false`
- `activationAllowed=false`
- liveRouteWiring proof flag is false.
- ORO-4A disabled gate preserved.
- ORO-4B staging precheck preserved.
- ORO-4C shadow invocation preserved.

## future staging route wiring requirements

Any future staging route wiring remains blocked until a separate approved phase supplies:

- explicit manual approval.
- staging-only runtime mode gate.
- callback credential handling proof without printing values.
- sanitized audit log proof.
- request envelope and response envelope compatibility proof.
- idempotency and duplicate replay proof.
- wallet and ledger dry-run proof.
- reconciliation guard proof.
- rollback / kill switch proof.
- local smoke, staging smoke, and secret scan evidence.

## explicit no-real-money boundary

ORO-4D is not real callback runtime. It does not debit, credit, settle, reconcile real money, pay out, auto-credit, mutate wallet, mutate ledger, write through Prisma, call OroPlay, migrate, deploy, enable `/api/balance`, enable `/api/transaction`, or change production config.
