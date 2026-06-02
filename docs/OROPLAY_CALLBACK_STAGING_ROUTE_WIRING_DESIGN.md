# OroPlay Callback Staging Route Wiring Design

## ORO-4F scope

ORO-4F adds a Staging Route Wiring Design Contract / No Express Mount Yet contract. This phase is docs, contract, static/mock harness, and local smoke only.

It does not add live route behavior, public aliases, production DB access, real money movement, wallet mutation, ledger mutation, Prisma write, DB transaction, migration, deploy, payout, auto-credit, production config changes, or a live OroPlay call.

## staging route wiring design purpose

The purpose is to document the future staging route wiring shape before any Express mount is approved. ORO-4F records future staging-only paths, public alias policy, activation gates, rollback expectations, and proof flags.

The output is a design contract. It is not a runtime router, not a controller, not middleware, and not a service adapter.

## design contract vs real route wiring

A design contract can describe target route paths and activation blockers without accepting HTTP traffic.

Real route wiring would add Express route definitions, mount them in `src/app.js`, bind controllers, and pass request traffic into runtime logic. ORO-4F does none of that and keeps `expressRouteMounted=false`, `runtimeWiredToLiveRoute=false`, and `activationAllowed=false`.

## future staging-only route paths

Future staging-only route paths are recorded as names only:

- `/api/oroplay/balance` is documented as future-only staging path for balance callbacks.
- `/api/oroplay/transaction` is documented as future-only staging path for transaction callbacks.

These paths are not mounted in ORO-4F.

/api/oroplay/balance is documented as future-only staging path.
/api/oroplay/transaction is documented as future-only staging path.

## public alias policy

Provider-compatible public aliases remain disabled:

- `/api/balance remains disabled`.
- `/api/transaction remains disabled`.
- `publicAliasMounted=false`.
- `activationAllowed=false`.

Future alias enablement requires a separate approved phase after staging route certification.

/api/balance remains disabled.
/api/transaction remains disabled.

## required activation gates

Future staging route activation remains blocked until all gate names are satisfied:

- manual approval required.
- staging env only.
- certified runtime flag required.
- callback auth configured.
- idempotency guard verified.
- ledger/reconciliation guard verified.
- rollback switch verified.
- sanitized log verified.
- no production deployment.

These are names only. ORO-4F does not read or display any credential values.

## callback auth requirement

Callback auth must be configured in a future phase before route activation. ORO-4F records only the requirement name `callback auth configured`.

No credential header, credential value, password, PIN, device identifier, token value, or ENV value is stored, printed, or read in this phase.

## idempotency requirement

Future route wiring must prove an idempotency guard before activation. Duplicate transaction handling must prevent double debit and double credit before any staging mount is approved.

## ledger/reconciliation guard requirement

Future route wiring must prove ledger and reconciliation guard behavior before activation. The guard must be verified before any wallet mutation, ledger mutation, Prisma write, DB transaction, payout, or auto-credit path is considered.

## sanitized log requirement

Future route wiring must prove sanitized logging before activation. Safe redaction markers are:

- auth-header-redaction-marker
- credential-prefix-marker
- mock-redaction-key-name
- redacted-credential-marker

ORO-4F records marker names only and does not print raw request payloads or credential-like values.

## rollback / kill switch requirement

Future staging route wiring must include rollback / kill switch evidence before activation. ORO-4F records a rollback plan only:

- keep ORO-4F design contract out of `src/app.js`.
- keep public aliases disabled.
- keep runtime disconnected from live routes.
- return any later staging mount to disabled state if validation fails.

## monitoring requirement

Future staging wiring must include monitoring proof before activation. Monitoring must confirm fail-closed behavior, activation gate state, sanitized log output, idempotency decisions, and rollback switch readiness without exposing credential-like values.

## no Express route mount proof

ORO-4F keeps Express route mounting blocked:

- `expressRouteMounted=false`.
- no Express router is created.
- no route file is created.
- no controller file is created.
- no mount is added to `src/app.js`.

## no src/app.js edit proof

No src/app.js changes required by this phase.

ORO-4F keeps `srcAppJsTouched=false` and `srcAppJsEditRequired=false`.

## no alias proof

ORO-4F keeps aliases disabled:

- `publicAliasMounted=false`.
- `/api/balance remains disabled`.
- `/api/transaction remains disabled`.

## no wallet mutation proof

ORO-4F keeps wallet mutation blocked:

- `walletMutationAllowed=false`.
- wallet mutation proof flag is false.
- no wallet service import is introduced.

## no ledger mutation proof

ORO-4F keeps ledger mutation blocked:

- `ledgerMutationAllowed=false`.
- ledger mutation proof flag is false.
- no ledger service import is introduced.

## no Prisma write proof

ORO-4F keeps Prisma writes blocked:

- `prismaWriteAllowed=false`.
- no Prisma client import is introduced.
- no DB transaction is introduced.

## no external network proof

ORO-4F keeps external network blocked:

- `externalNetworkAllowed=false`.
- no live OroPlay API call is introduced.
- no fetch, HTTP client, or provider request is introduced.

## future implementation checklist

Future staging route implementation remains blocked until a separate approved phase supplies:

- manual approval evidence.
- staging-only runtime mode evidence.
- certified runtime flag evidence.
- callback auth configuration proof without printing values.
- idempotency guard verification.
- ledger/reconciliation guard verification.
- rollback switch verification.
- sanitized log verification.
- monitoring evidence.
- no production deployment confirmation.
- local smoke, staging smoke, and secret scan evidence.

## explicit no-real-money boundary

ORO-4F is not real callback runtime. It does not debit, credit, settle, reconcile real money, pay out, auto-credit, mutate wallet, mutate ledger, write through Prisma, call OroPlay, migrate, deploy, mount `/api/oroplay/balance`, mount `/api/oroplay/transaction`, enable `/api/balance`, enable `/api/transaction`, add Express routes, or change production config.

## status flags

- `expressRouteMounted=false`
- `publicAliasMounted=false`
- `runtimeWiredToLiveRoute=false`
- `activationAllowed=false`
- `walletMutationAllowed=false`
- `ledgerMutationAllowed=false`
- `prismaWriteAllowed=false`
- `externalNetworkAllowed=false`
- `productionConfigTouched=false`
