# OroPlay Callback Staging Wiring Precheck

## staging wiring precheck purpose

ORO-4B records a staging wiring precheck before any future attempt to connect the disabled callback runtime skeleton to staging. The precheck is static/mock only and does not perform staging wiring.

The default state is fail-closed. A fully certified mock input can only return staging_precheck_ready, while activation remains false.

## what must exist before wiring

Before a future staging wiring phase can start, the project must have:

- ORO-4A skeleton smoke pass evidence.
- ORO-4B precheck smoke pass evidence.
- Manual approval for staging-only wiring.
- Runtime mode policy with default fail-closed behavior.
- Rollback / kill switch evidence.
- Sanitized audit log evidence.
- Wallet and ledger dry-run evidence.
- Reconciliation guard evidence.
- Idempotency and duplicate guard evidence.
- Secret scan evidence with no real secret values.
- Confirmation that production config stays untouched.

## required env names only, no values

Future staging wiring may require these names, but ORO-4B records names only:

- `OROPLAY_CALLBACK_RUNTIME_MODE`
- `OROPLAY_CALLBACK_BASIC_USER`
- `OROPLAY_CALLBACK_BASIC_SECRET`
- `OROPLAY_RUNTIME_CERTIFIED`
- `OROPLAY_ENABLE_PUBLIC_ALIASES`

ORO-4B does not read env values, does not print env values, does not edit `.env`, and does not edit `.env.example` to open runtime.

## route alias remains disabled

Provider-compatible public aliases remain disabled:

- `/api/balance`
- `/api/transaction`

The precheck records `aliasBalanceEnabled=false` and `aliasTransactionEnabled=false`.

## ORO-2B fail-closed preserved

The ORO-2B callback stub remains fail-closed. ORO-4B does not change the route behavior and does not convert the fail-closed route into runtime processing.

## runtime skeleton not wired

The ORO-4A runtime skeleton remains disabled and disconnected:

- `runtimeWiredToLiveRoute=false`
- `activationAllowed=false`
- no route mount
- no controller wiring
- no wallet service wiring
- no ledger service wiring
- no Prisma write path

## activation blockers

Activation is blocked by design until a future approved phase supplies:

- Manual staging approval.
- Staging-only runtime flag plan.
- Sanitized audit proof.
- Rollback / kill switch proof.
- Wallet and ledger dry-run proof.
- Reconciliation guard proof.
- Idempotency guard proof.
- Local smoke and staging smoke evidence.
- Secret scan evidence.
- Production deploy exclusion.

## required manual approval before future staging wiring

Any future staging wiring must be manually approved after ORO-4B evidence is reviewed. ORO-4B evidence is not approval to wire runtime behavior.

## no production deploy

ORO-4B does not deploy and does not change production configuration. It does not create migrations, does not alter Prisma schema, and does not add production runtime settings.

## no live provider call

ORO-4B does not call OroPlay and does not add external network behavior. Any future provider traffic requires separate staging-only approval and sanitized logging proof.

## no wallet/ledger mutation

ORO-4B does not mutate wallet or ledger state:

- `walletMutationAllowed=false`
- `ledgerMutationAllowed=false`
- `prismaWriteAllowed=false`
- no real money
- no payout
- no auto-credit
