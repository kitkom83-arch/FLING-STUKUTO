# OroPlay Callback Staging Route Dry-Run Gate

## Phase

ORO-4H Staging Route Wiring Dry-Run Gate / Still No Public Alias

## Status

- DRY-RUN GATE ONLY
- NO EXPRESS MOUNT
- NO PUBLIC ALIAS
- NO RUNTIME TRAFFIC
- NO RUNTIME MUTATION

## Scope

- docs
- static contract
- mock harness
- fixture evaluation
- local smoke
- dry-run gate only
- no live traffic

## Non-Scope

- no route mount
- no `src/app.js`
- no `/api/balance`
- no `/api/transaction`
- no live provider call
- no wallet mutation
- no ledger mutation
- no Prisma write
- no migration
- no deploy

## Dry-Run Gate Purpose

ORO-4H answers whether a route candidate would pass a dry-run gate. It uses dry-run only evaluation, a static route descriptor, and mock invocation against fixtures. Passing ORO-4H does not approve a real mount, does not activate a route, and does not permit public traffic.

The dry-run gate exists to state what would be required later. It is not a release gate for runtime wiring. ORO-4H remains no Express mount, no public alias, and no runtime traffic.

## Candidate Staging Routes

These paths are candidate routes only. They are not active, not mounted, not public, and exist only inside the static dry-run descriptor.

- POST /api/oroplay/balance
- POST /api/oroplay/transaction

| Method | Path | Status | Notes |
| --- | --- | --- | --- |
| POST | `/api/oroplay/balance` | DRY_RUN_ONLY | Candidate only. No Express mount and no live route. |
| POST | `/api/oroplay/transaction` | DRY_RUN_ONLY | Candidate only. No Express mount and no live route. |

## Explicitly Blocked Aliases

These public aliases are blocked until separate explicit approval. Public alias enablement must be a separate phase and is not allowed in ORO-4H.

- POST /api/balance
- POST /api/transaction

| Method | Path | Status | Notes |
| --- | --- | --- | --- |
| POST | `/api/balance` | PUBLIC_ALIAS_BLOCKED_BY_PHASE | Must not be opened in ORO-4H. |
| POST | `/api/transaction` | PUBLIC_ALIAS_BLOCKED_BY_PHASE | Must not be opened in ORO-4H. |

## Dry-Run Gate Checklist

- Git clean before work
- Safe CI of HEAD passed before work
- targeted OroPlay callback smokes pass
- secret scan pass
- `git diff --check` pass
- no `src/app.js` change
- no Express mount
- no public alias
- no live route
- no route active flag
- no external network
- no live OroPlay call
- no wallet mutation
- no ledger mutation
- no Prisma write
- request envelope documented
- response envelope documented
- callback auth boundary documented
- transaction idempotency documented
- duplicate transaction fail-closed documented
- insufficient balance fail-closed documented
- invalid user fail-closed documented
- malformed payload fail-closed documented
- sanitized log preview documented
- rollback / abort plan documented
- observability dry-run plan documented
- UAT signoff remains separate

## Dry-Run Gate Statuses

Valid ORO-4H report statuses:

- DRY_RUN_GATE_PASS
- BLOCKED
- MOUNT_BLOCKED_BY_PHASE
- PUBLIC_ALIAS_BLOCKED_BY_PHASE
- NO_RUNTIME_TRAFFIC

Mount-ready or live-traffic status labels are not valid ORO-4H report output. ORO-4H must not emit labels such as `READY_TO_MOUNT`, `PUBLIC_ALIAS_READY`, `ROUTE_ACTIVE`, or `LIVE_TRAFFIC_READY`.

## Abort Criteria

Block immediately if any of these values are true or detected:

- `src/app.js` changed
- `expressMounted = true`
- `routeActive = true`
- public alias exists
- `externalNetwork = true`
- `liveOroPlayCall = true`
- `walletMutation = true`
- `ledgerMutation = true`
- `prismaWrite = true`
- `credentialLeakDetected = true`
- secret-shaped fixture detected

## Rollback / Abort Readiness

- keep route unmounted
- disable staging flag
- keep public aliases blocked
- keep fail-closed behavior
- preserve sanitized logs only
- stop any dry-run descriptor promotion
- verify no wallet/ledger mutation occurred
- verify no Prisma write occurred
- run targeted smoke
- run Safe CI before any later phase

## Evidence Checklist

| Gate | Expected Evidence | Status | Notes |
| --- | --- | --- | --- |
| Git clean before work | `git status --short` has no output | PASS | Required before ORO-4H edits. |
| Safe CI for HEAD | Safe CI completed with success for current HEAD | PASS | Required before ORO-4H edits. |
| Targeted callback smokes | ORO-4H smoke and prior targeted callback smokes pass | DRY_RUN_ONLY | Local/static verification only. |
| Secret scan | Changed files do not contain credential-shaped values | DRY_RUN_ONLY | Use neutral markers only. |
| `git diff --check` | No whitespace errors | DRY_RUN_ONLY | Required before handoff. |
| No `src/app.js` change | No app mount diff | DRY_RUN_ONLY | Any app change blocks the phase. |
| No Express mount | `expressMountAllowed=false` and descriptor entries remain unmounted | DRY_RUN_ONLY | ORO-4H cannot mount routes. |
| No public alias | `/api/balance` and `/api/transaction` remain blocked | DRY_RUN_ONLY | Alias approval is separate. |
| No active route | Route candidates remain inactive | DRY_RUN_ONLY | Static descriptors only. |
| No runtime traffic | `runtimeTrafficAllowed=false` | DRY_RUN_ONLY | No request handling. |
| No wallet mutation | `walletMutation=false` | DRY_RUN_ONLY | No money movement. |
| No ledger mutation | `ledgerMutation=false` | DRY_RUN_ONLY | No ledger write. |
| No Prisma write | `prismaWrite=false` | DRY_RUN_ONLY | No database write. |
| No external network | `externalNetwork=false` | DRY_RUN_ONLY | No outbound call. |
| No live OroPlay call | `liveOroPlayCall=false` | DRY_RUN_ONLY | Mock invocation only. |
| Request envelope | Static request envelope documented | DRY_RUN_ONLY | Required for dry-run evaluation. |
| Response envelope | Static response envelope documented | DRY_RUN_ONLY | Required for dry-run evaluation. |
| Callback auth boundary | Names and boundary documented without values | DRY_RUN_ONLY | No real credential material. |
| Idempotency | Transaction idempotency documented | DRY_RUN_ONLY | Missing idempotency blocks. |
| Duplicate transaction | Fail-closed behavior documented | DRY_RUN_ONLY | No runtime write path. |
| Insufficient balance | Fail-closed behavior documented | DRY_RUN_ONLY | No runtime write path. |
| Invalid user | Fail-closed behavior documented | DRY_RUN_ONLY | No runtime write path. |
| Malformed payload | Fail-closed behavior documented | DRY_RUN_ONLY | No runtime write path. |
| Sanitized log preview | Redacted preview documented | DRY_RUN_ONLY | No raw credential output. |
| Rollback / abort | Abort checklist documented | DRY_RUN_ONLY | Required before any later phase. |
| Observability | Dry-run observability plan documented | DRY_RUN_ONLY | Static evidence only. |
| UAT signoff | Separate signoff documented | BLOCKED | UAT remains outside ORO-4H. |
| Public aliases | `/api/balance` and `/api/transaction` | BLOCKED | Blocked by phase. |
| Express mount | Runtime mount | NOT_APPLICABLE | Not part of ORO-4H. |

## Next Phase Recommendation

ORO-4I:
Staging Route Wiring Internal Shadow Harness /
Still No Express Mount

See `docs/OROPLAY_CALLBACK_STAGING_ROUTE_INTERNAL_SHADOW_HARNESS.md` for the ORO-4I internal shadow harness. ORO-4I should still not open `/api/balance`, `/api/transaction`, a real Express mount, or runtime wallet/ledger mutation.

ORO-4J cross-reference:

See `docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md` for the later static/mock mount decision readiness gate. ORO-4J reviews dry-run and internal shadow evidence, but still does not approve mounting, public aliases, runtime traffic, wallet mutation, ledger mutation, Prisma writes, or live OroPlay calls.

ORO-4K cross-reference:

See `docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_MOUNT_REVIEW_EVIDENCE_PACK.md` for the later human mount review evidence pack. ORO-4H dry-run evidence is one source for ORO-4K, but ORO-4K still does not mount routes, open public aliases, accept runtime traffic, mutate wallet or ledger state, write through Prisma, or call live OroPlay.
