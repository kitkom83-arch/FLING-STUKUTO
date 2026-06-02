# OroPlay Callback Runtime Implementation Skeleton

## purpose

ORO-4A creates a disabled-by-default runtime implementation skeleton for future OroPlay callback runtime work. This phase is skeleton and gate only.

ORO-4A does not activate callback runtime behavior, does not mutate wallet state, does not mutate ledger state, does not write through Prisma, does not wire a runtime implementation into live routes, and does not enable `/api/balance` or `/api/transaction` aliases.

## scope

- Disabled-by-default runtime skeleton.
- Runtime disabled gate contract.
- Intent-only callback runtime functions.
- Static/mock local smoke coverage.
- Staged implementation path documentation.
- Certification gate documentation before any future activation.

## non-goals

- No live OroPlay callback runtime.
- No production DB.
- No real money.
- No live OroPlay API call.
- No external network call.
- No runtime wallet debit, credit, update, or mutation.
- No runtime ledger create, update, insert, post, reverse, or mutation.
- No Prisma write.
- No DB transaction.
- No migration.
- No deploy.
- No payout.
- No auto-credit.
- No `/api/balance` alias.
- No `/api/transaction` alias.
- No live runtime route or controller wiring.

## disabled-by-default runtime skeleton

The runtime skeleton exists only as static/mock implementation intent. It can produce auth, member mapping, idempotency, wallet, ledger, reconciliation, and sanitized log intent objects, but the intent objects are not executable runtime operations.

The default gate decision is disabled and fail-closed. A mock input that asks to enable runtime without certification still fails closed. A mock input with certification evidence can return staging-ready-only, but never active runtime and never production-enabled.

## callback runtime not active

The skeleton is not mounted in `src/app.js`, not exposed through a live route, and not connected to the ORO-2B fail-closed callback stub. Existing OroPlay callback routes remain fail-closed and runtime-disabled.

## no-mutation guarantee

ORO-4A guarantees:

- `walletMutationAllowed=false`.
- `ledgerMutationAllowed=false`.
- `prismaWriteAllowed=false`.
- `aliasEnabled=false`.
- `walletMutated=false`.
- `ledgerMutated=false`.
- `prismaWritten=false`.
- `externalNetworkCalled=false`.

These flags are proof markers for local smoke and are not runtime enablement flags.

## implementation boundaries

### auth validation intent

Auth validation is intent-only. ORO-4A does not read real secrets, does not add client secret material, does not print Authorization header values, and does not authenticate live provider traffic.

### member mapping intent

Member mapping is intent-only. ORO-4A does not query production DB, does not import Prisma, and does not create or update member mappings.

### idempotency decision

Idempotency is a decision plan only. ORO-4A does not allocate storage, does not write idempotency keys, and does not open transaction locks.

### wallet mutation intent only

Debit and credit functions return wallet intent objects only. They include member, amount, currency, transaction code, mock-only balance source, and `mutationAllowed=false`.

### ledger mutation intent only

Ledger functions return ledger write intent only. They include `ledgerWriteAllowed=false` and `reason=runtime_not_activated`.

### reconciliation intent only

Reconciliation is mock/intent only. It records the future comparison target between callback trace, wallet intent, ledger intent, and provider identity, but no reconciliation record is persisted.

### sanitized log intent only

Sanitized logging is intent-only. Authorization, token, password, clientSecret, client_secret, DATABASE_URL, PIN, and deviceId shaped keys must be redacted before any log-shaped output is returned.

## staged implementation path

Future phases must keep the staged path explicit:

1. ORO-4A skeleton PASS.
2. ORO-4B staging mock runtime PASS.
3. Wallet and ledger dry-run PASS.
4. Reconciliation guard PASS.
5. Audit log proof PASS.
6. Duplicate guard proof PASS.
7. Rollback proof PASS.
8. Explicit approval.

## certification gates required before activation

Runtime activation remains blocked until every gate has evidence:

- ORO-4A skeleton PASS.
- Staging-only runtime design reviewed.
- Wallet source-of-truth approved.
- Ledger bridge approved.
- Idempotency storage approved.
- Reconciliation guard approved.
- Audit and sanitized logging approved.
- Monitoring and alerting approved.
- Rollback and emergency disable approved.
- Alias policy approved if provider-compatible paths are required.
- Explicit activation approval.

## explicit no-mutation statement

ORO-4A is not a live callback runtime. It is a disabled runtime implementation skeleton. It must not debit, credit, insert, update, persist, reconcile, deploy, call a provider, or enable aliases.

## ORO-4B certification precheck current

ORO-4B certifies that this ORO-4A runtime skeleton is still disabled before any future staging wiring. The certification output is mock/static only: default state fail_closed, certified mock state staging_precheck_ready, and activation still false.

ORO-4B does not wire this skeleton into live routes, does not enable `/api/balance` or `/api/transaction`, does not mutate wallet or ledger state, does not write through Prisma, does not call OroPlay, does not read env values, and does not touch production config.
