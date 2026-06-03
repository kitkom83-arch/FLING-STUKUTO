# OroPlay Callback Staging Route Internal Shadow Harness

## Phase

ORO-4I Staging Route Wiring Internal Shadow Harness / Still No Express Mount

## Status

- INTERNAL SHADOW ONLY
- NO EXPRESS MOUNT
- NO PUBLIC ALIAS
- NO RUNTIME TRAFFIC
- NO RUNTIME MUTATION
- NO EXTERNAL NETWORK

## Scope

- docs
- static contract
- mock harness
- fixture evaluation
- local smoke
- internal shadow invocation only
- sanitized shadow trace
- no live traffic

## Non-Scope

- no route mount
- no `src/app.js`
- no `/api/balance`
- no `/api/transaction`
- no live provider call
- no external network
- no wallet mutation
- no ledger mutation
- no Prisma write
- no migration
- no deploy

## Internal Shadow Purpose

ORO-4I uses internal shadow only evaluation to simulate route candidates with direct-call mock invocation. The harness uses a static route descriptor, evaluates mock request and response envelopes, records a sanitized shadow trace, and asserts no side effect.

The phase is no Express mount, no public alias, no runtime traffic, and no external network. Passing ORO-4I does not approve a live route, does not permit traffic, and does not permit wallet, ledger, or database mutation.

## Candidate Staging Routes

These paths are candidate routes only. They are not active, not mounted, not public, and are used only for the static descriptor and internal shadow invocation.

- POST /api/oroplay/balance
- POST /api/oroplay/transaction

| Method | Path | Status | Notes |
| --- | --- | --- | --- |
| POST | `/api/oroplay/balance` | SHADOW_ONLY | Candidate only. No Express mount and no runtime traffic. |
| POST | `/api/oroplay/transaction` | SHADOW_ONLY | Candidate only. No Express mount and no runtime traffic. |

## Explicitly Blocked Aliases

These aliases are blocked until separate explicit approval. Public alias enablement must have a separate phase and is not allowed in ORO-4I.

- POST /api/balance
- POST /api/transaction

| Method | Path | Status | Notes |
| --- | --- | --- | --- |
| POST | `/api/balance` | PUBLIC_ALIAS_BLOCKED_BY_PHASE | Must not be opened in ORO-4I. |
| POST | `/api/transaction` | PUBLIC_ALIAS_BLOCKED_BY_PHASE | Must not be opened in ORO-4I. |

## Internal Shadow Invocation Model

Flow:

static route candidate descriptor
-> mock request envelope
-> internal shadow auth boundary
-> request envelope mapper
-> internal shadow handler mock
-> response envelope mapper
-> sanitized shadow trace
-> side-effect assertion

This model has:

- no HTTP server
- no Express mount
- no network
- no DB
- no wallet/ledger mutation
- no real balance update

## Internal Shadow Gate Checklist

- Git clean before work
- Safe CI of HEAD passed before work
- targeted OroPlay callback smokes pass
- secret scan pass
- `git diff --check` pass
- no `src/app.js` change
- no Express mount
- no public alias
- no active route
- no HTTP listener
- no runtime traffic
- no external network
- no live OroPlay call
- no wallet mutation
- no ledger mutation
- no Prisma write
- no DB transaction
- no side effect
- request envelope documented
- response envelope documented
- callback auth boundary documented
- transaction idempotency documented
- duplicate transaction fail-closed documented
- insufficient balance fail-closed documented
- invalid user fail-closed documented
- malformed payload fail-closed documented
- sanitized shadow trace documented
- rollback / abort plan documented
- observability shadow plan documented
- UAT signoff remains separate

## Internal Shadow Statuses

Valid ORO-4I report statuses:

- INTERNAL_SHADOW_PASS
- BLOCKED
- SHADOW_ONLY
- MOUNT_BLOCKED_BY_PHASE
- PUBLIC_ALIAS_BLOCKED_BY_PHASE
- NO_RUNTIME_TRAFFIC
- NO_SIDE_EFFECT

Mount-ready, public-ready, route-active, live-traffic, runtime-traffic, or mutation-ready labels are not valid ORO-4I report output.

## Abort Criteria

Block immediately if any of these values are true or detected:

- `src/app.js` changed
- `expressMounted = true`
- `routeActive = true`
- `httpListener = true`
- `runtimeTraffic = true`
- public alias exists
- `externalNetwork = true`
- `liveOroPlayCall = true`
- `walletMutation = true`
- `ledgerMutation = true`
- `prismaWrite = true`
- `dbTransaction = true`
- `sideEffectDetected = true`
- `credentialLeakDetected = true`
- secret-shaped fixture detected

## Rollback / Abort Readiness

- keep route unmounted
- keep public aliases blocked
- disable staging flag
- stop shadow descriptor promotion
- keep fail-closed behavior
- preserve sanitized logs only
- verify no wallet/ledger mutation occurred
- verify no Prisma write occurred
- verify no side effect occurred
- run targeted smoke
- run Safe CI before any later phase

## Evidence Checklist

| Gate | Expected Evidence | Status | Notes |
| --- | --- | --- | --- |
| Git clean before work | `git status --short` has no output | PASS | Required before ORO-4I edits. |
| Safe CI for HEAD | Safe CI completed with success for current HEAD | PASS | Required before ORO-4I edits. |
| Targeted callback smokes | ORO-4I smoke and prior targeted callback smokes pass | SHADOW_ONLY | Local/static verification only. |
| Secret scan | Changed files do not contain credential-shaped values | SHADOW_ONLY | Use neutral markers only. |
| `git diff --check` | No whitespace errors | SHADOW_ONLY | Required before handoff. |
| No `src/app.js` change | No app mount diff | SHADOW_ONLY | Any app change blocks the phase. |
| No Express mount | `expressMountAllowed=false` and descriptor entries remain unmounted | SHADOW_ONLY | ORO-4I cannot mount routes. |
| No public alias | `/api/balance` and `/api/transaction` remain blocked | SHADOW_ONLY | Alias approval is separate. |
| No active route | Route candidates remain inactive | SHADOW_ONLY | Static descriptors only. |
| No HTTP listener | `httpListener=false` | SHADOW_ONLY | No listener is created. |
| No runtime traffic | `runtimeTrafficAllowed=false` | SHADOW_ONLY | No request handling. |
| No external network | `externalNetworkAllowed=false` | SHADOW_ONLY | No outbound call. |
| No wallet mutation | `walletMutation=false` | SHADOW_ONLY | No money movement. |
| No ledger mutation | `ledgerMutation=false` | SHADOW_ONLY | No ledger write. |
| No Prisma write | `prismaWrite=false` | SHADOW_ONLY | No database write. |
| No DB transaction | `dbTransaction=false` | SHADOW_ONLY | No database transaction. |
| No side effect | `sideEffects=NONE` | SHADOW_ONLY | Direct-call mock only. |
| Request envelope | Static request envelope documented | SHADOW_ONLY | Required for shadow evaluation. |
| Response envelope | Static response envelope documented | SHADOW_ONLY | Required for shadow evaluation. |
| Callback auth boundary | Boundary documented without values | SHADOW_ONLY | No raw auth material. |
| Idempotency | Transaction idempotency documented | SHADOW_ONLY | Missing idempotency blocks. |
| Duplicate transaction | Fail-closed behavior documented | SHADOW_ONLY | No runtime write path. |
| Insufficient balance | Fail-closed behavior documented | SHADOW_ONLY | No runtime write path. |
| Invalid user | Fail-closed behavior documented | SHADOW_ONLY | No runtime write path. |
| Malformed payload | Fail-closed behavior documented | SHADOW_ONLY | No runtime write path. |
| Sanitized shadow trace | Redacted trace documented | SHADOW_ONLY | No raw credential output. |
| Rollback / abort | Abort checklist documented | SHADOW_ONLY | Required before any later phase. |
| Observability | Shadow observability plan documented | SHADOW_ONLY | Static evidence only. |
| UAT signoff | Separate signoff documented | BLOCKED | UAT remains outside ORO-4I. |
| Public aliases | `/api/balance` and `/api/transaction` | BLOCKED | Blocked by phase. |
| Express mount | Runtime mount | NOT_APPLICABLE | Not part of ORO-4I. |

## Next Phase Recommendation

ORO-4J:
Internal Shadow Result Contract Review /
Internal Shadow Harness Review /
Mount Decision Readiness Gate

ORO-4J should still not open:

- `/api/balance`
- `/api/transaction`
- Express mount
- runtime traffic
- runtime wallet/ledger mutation

## Reviewed by ORO-4J Mount Decision Readiness Gate

ORO-4J reviews this internal shadow harness as static/mock evidence for a later mount decision discussion. The review checks route descriptors, direct-call shadow invocation behavior, sanitized trace boundaries, no public alias, no Express mount, and no wallet/ledger/Prisma side effects.

An ORO-4J `PASS` is only a static/mock gate result. It does not approve a mount, does not approve public aliases, does not approve live traffic, and does not make `/api/oroplay/balance` or `/api/oroplay/transaction` active routes. A separate human approval is still required before any later route or mount phase.
