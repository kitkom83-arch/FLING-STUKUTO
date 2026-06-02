# OroPlay Callback Runtime Shadow Invocation

## ORO-4C scope

ORO-4C adds a Callback Runtime Shadow Invocation Harness. This phase is docs, contract, static/mock harness, and local smoke only.

It does not wire runtime code into Express routes, does not open public provider aliases, does not call OroPlay, does not read production data, and does not move money.

## shadow invocation purpose

The shadow invocation harness calls isolated CommonJS mock functions directly. It exists to prove the runtime skeleton can be exercised against mock fixtures before any future staging route wiring.

The default decision remains fail_closed. A certified mock state is shadow_ready_only and still keeps activationAllowed=false.

## shadow invocation vs live route wiring

Shadow invocation:

- calls `buildOroplayShadowBalanceInvocation()` and `buildOroplayShadowTransactionInvocation()` directly.
- reads mock fixtures only.
- returns decision objects and intent objects only.
- keeps `runtimeWiredToLiveRoute=false`.

Live route wiring would connect route/controller traffic to runtime behavior. ORO-4C does not do that.

## balance shadow flow

Balance shadow flow:

1. Accept a mock payload with a safe fixture `userCode`.
2. Map that user code to a mock member fixture.
3. Return the mock fixture balance with `balanceSource=mock_fixture_only`.
4. Return fail_closed for unknown or malformed input.

No production DB, Prisma, wallet service, ledger service, external network, or route handler is used.

## transaction shadow flow

Transaction shadow flow:

1. Validate mock transaction payload shape.
2. Map the mock member fixture.
3. Evaluate mock idempotency state.
4. For bet payloads, return debitIntent only.
5. For win payloads, return creditIntent only.
6. Return ledgerIntent and reconciliationIntent as no-write intent objects.

Every intent keeps mutationAllowed=false, ledgerWriteAllowed=false, prismaWriteAllowed=false, and networkAllowed=false.

## idempotency / duplicate replay behavior

Duplicate replay with the same transaction payload returns idempotent_replay. It does not create another debit intent, credit intent, ledger intent, or reconciliation intent.

The smoke asserts doubleDebitPrevented=true and doubleCreditPrevented=true for duplicate replay.

## conflicting duplicate behavior

A duplicate transaction code with a different payload enters manual_review and fail_closed behavior. It does not produce wallet, ledger, or reconciliation write intent.

## insufficient balance behavior

A bet shadow invocation fails closed when the mock fixture balance is lower than the debit amount. The result reason is insufficient_balance and no mutation intent is returned.

## sanitized log behavior

The shadow log preview is sanitized before it is returned. It records safe markers only:

- auth-header-redaction-marker
- credential-prefix-marker
- mock-redaction-key-name
- redacted-credential-marker

Credential-like values are replaced with redaction output. Raw credential-like payloads are not printed.

## no wallet mutation proof

ORO-4C keeps wallet mutation blocked:

- `walletMutationAllowed=false`
- `mutationAllowed=false`
- walletMutation proof flag is false.
- debit and credit are intent objects only.

## no ledger mutation proof

ORO-4C keeps ledger mutation blocked:

- `ledgerMutationAllowed=false`
- `ledgerWriteAllowed=false`
- ledgerMutation proof flag is false.
- ledgerIntent is intent-only and no ledger record is written.

## no Prisma write proof

ORO-4C keeps Prisma write blocked:

- `prismaWriteAllowed=false`
- prismaWrite proof flag is false.
- no Prisma client import exists in the new mock files.
- no DB transaction is introduced.

## no external network proof

ORO-4C keeps external network blocked:

- `networkAllowed=false`
- `externalNetworkAllowed=false`
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

The ORO-2B fail-closed route remains preserved. ORO-4C does not import the shadow invoker from `src/app.js`, route files, controllers, wallet services, ledger services, or Prisma.

The proof keeps:

- `runtimeWiredToLiveRoute=false`
- liveRouteWiring proof flag is false.
- ORO-4A disabled gate preserved.
- ORO-4B staging precheck preserved.

## future staging route wiring requirements

Any future staging route wiring remains blocked until a separate approved phase provides:

- explicit manual approval.
- staging-only runtime mode gate.
- callback credential handling proof without printing values.
- sanitized audit log proof.
- idempotency and duplicate replay proof.
- wallet and ledger dry-run proof.
- reconciliation guard proof.
- rollback / kill switch proof.
- local smoke, staging smoke, and secret scan evidence.

## explicit no-real-money boundary

ORO-4C is not real callback runtime. It does not debit, credit, settle, reconcile real money, pay out, auto-credit, mutate wallet, mutate ledger, write through Prisma, call OroPlay, migrate, deploy, enable `/api/balance`, enable `/api/transaction`, or change production config.
