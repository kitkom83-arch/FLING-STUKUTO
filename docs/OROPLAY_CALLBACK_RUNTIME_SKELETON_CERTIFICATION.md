# OroPlay Callback Runtime Skeleton Certification

## ORO-4B scope

ORO-4B certifies the ORO-4A callback runtime skeleton as still disabled before any future staging wiring. This phase is docs, contract, static/mock harness, and local smoke only.

ORO-4B does not wire runtime skeleton code into live routes, does not enable production or staging runtime activation, and does not enable provider-compatible public aliases.

## current status

- Phase: ORO-4B Runtime Skeleton Certification / Staging Wiring Precheck.
- Current state: fail-closed by default.
- Certified mock state: staging_precheck_ready only.
- Activation: not allowed.
- Runtime route wiring: not present.
- Boundary: no production DB, no real money, no live OroPlay provider call, no external network, no wallet mutation, no ledger mutation, no Prisma write, no migration, and no deploy.

## certification checklist

The certification checklist must remain evidence-only:

- ORO-4A skeleton smoke has passed.
- ORO-4B precheck has been reviewed.
- Staging-only approval evidence is recorded for a future phase.
- Rollback / kill switch evidence is defined for a future phase.
- Sanitized audit log evidence is approved.
- Wallet and ledger dry-run evidence is required before future wiring.
- Reconciliation guard evidence is required before future wiring.
- Manual approval is required before future staging wiring.

Missing evidence keeps the precheck fail-closed. Complete mock evidence may only return staging_precheck_ready and still cannot activate runtime.

## disabled-by-default proof

Default helper output keeps:

- `defaultState=fail_closed`
- `activationAllowed=false`
- `runtimeWiredToLiveRoute=false`
- `productionConfigTouched=false`

No environment values are read. Future environment requirements are listed by name only.

## fail-closed proof

The ORO-4B precheck accepts only two states:

- fail_closed
- staging_precheck_ready

The staging_precheck_ready state is a mock certification status only. It is not runtime enablement and does not bypass manual approval.

## no wallet mutation proof

Wallet mutation stays blocked:

- `walletMutationAllowed=false`
- no wallet service import
- no debit operation
- no credit operation
- no runtime balance update

## no ledger mutation proof

Ledger mutation stays blocked:

- `ledgerMutationAllowed=false`
- no ledger service import
- no ledger record create
- no ledger record update
- no runtime ledger posting

## no Prisma write proof

Prisma write stays blocked:

- `prismaWriteAllowed=false`
- no Prisma client import in the ORO-4B mock helper
- no DB transaction
- no migration
- no runtime persistence

## no external network proof

External network remains blocked:

- `externalNetworkAllowed=false`
- no live OroPlay API call
- no provider callback request
- no network client import in the ORO-4B mock helper

## no alias proof

Provider-compatible aliases remain disabled:

- `aliasBalanceEnabled=false`
- `aliasTransactionEnabled=false`
- no `/api/balance` alias
- no `/api/transaction` alias

## no live route wiring proof

The runtime skeleton remains disconnected from live routes:

- `runtimeWiredToLiveRoute=false`
- ORO-2B fail-closed callback route is preserved.
- ORO-4A disabled gate is preserved.
- No controller, route, app mount, or service wiring is added in ORO-4B.

## future staging-only activation requirements

Before any future staging wiring, the following must exist and pass review:

- Manual approval for staging-only wiring.
- Runtime mode policy with default fail-closed behavior.
- Sanitized audit logging and redaction proof.
- Wallet dry-run proof.
- Ledger dry-run proof.
- Reconciliation guard proof.
- Idempotency and duplicate guard proof.
- Rollback / kill switch proof.
- Safe local and staging smoke evidence.
- Secret scan evidence with no real secret values.

Future env names are names only in ORO-4B:

- `OROPLAY_CALLBACK_RUNTIME_MODE`
- `OROPLAY_CALLBACK_BASIC_USER`
- `OROPLAY_CALLBACK_BASIC_SECRET`
- `OROPLAY_RUNTIME_CERTIFIED`
- `OROPLAY_ENABLE_PUBLIC_ALIASES`

ORO-4B does not read, print, or require values for these names.

## rollback / kill switch requirement

Future staging wiring must include an explicit kill switch with fail-closed default behavior. The kill switch must be testable before any route is wired and must have manual rollback instructions.

## audit / sanitized log requirement

Future staging wiring must prove sanitized audit output before runtime activation. Logs must not print env values, database connection strings, tokens, passwords, PINs, device identifiers, client secret material, auth header values, or raw credential-like payloads.

ORO-4B uses safe redaction markers only, including auth-header-redaction-marker, credential-prefix-marker, mock-redaction-key-name, and redacted-credential-marker.

## explicit no-real-money boundary

ORO-4B is not a live callback runtime and not a money movement phase. It must not debit, credit, settle, reconcile for real money, pay out, auto-credit, mutate wallet, mutate ledger, write through Prisma, call OroPlay, migrate, deploy, or enable aliases.

## ORO-4C handoff boundary

ORO-4C may invoke isolated mock shadow functions directly after ORO-4B evidence, but it is not route wiring. ORO-4C must keep activationAllowed=false, runtimeWiredToLiveRoute=false, aliasBalanceEnabled=false, aliasTransactionEnabled=false, walletMutationAllowed=false, ledgerMutationAllowed=false, prismaWriteAllowed=false, and networkAllowed=false.
