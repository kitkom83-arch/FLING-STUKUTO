# OroPlay Callback Staging Route Preflight

## Phase

ORO-4G Staging Route Wiring Preflight / Mount Readiness Checklist

## Status

- PRE-MOUNT ONLY
- NO EXPRESS MOUNT
- NO PUBLIC ALIAS
- NO RUNTIME MUTATION

Mount readiness state: `NOT_READY_TO_MOUNT_BY_DEFAULT`.

ORO-4G does not approve a real route mount. ORO-4G only defines the checklist and static evidence required before a future staging route mount can be considered.

## Scope

- Docs.
- Static contract.
- Mock harness.
- Local smoke only.
- Preflight checklist.
- Rollback readiness checklist.
- No live traffic.

## Non-scope

- No route mount.
- No `src/app.js` change.
- No `POST /api/balance`.
- No `POST /api/transaction`.
- No live provider call.
- No wallet mutation.
- No ledger mutation.
- No Prisma write.
- No migration.
- No deploy.
- No public alias.
- No runtime route.

## Preflight Gates Before Any Future Staging Mount

A future phase must provide evidence for every gate below before a staging mount is considered:

- Git clean.
- Safe CI for HEAD passed.
- Targeted OroPlay smokes passed.
- Secret-shaped scan passed.
- `git diff --check` passed.
- Route alias disabled.
- `src/app.js` unchanged until explicit mount approval.
- Callback auth strategy documented.
- Request envelope mapping documented.
- Response envelope mapping documented.
- Idempotency behavior documented.
- Duplicate transaction behavior documented.
- Insufficient balance behavior documented.
- Invalid user behavior documented.
- Malformed payload behavior documented.
- Sanitizer and log redaction documented.
- Rollback plan documented.
- Staging-only flag strategy documented.
- Observability and audit plan documented.
- Ledger reconciliation gate documented.
- UAT signoff checklist documented.

## Future Staging Route Candidates

These are candidates only:

- `POST /api/oroplay/balance`
- `POST /api/oroplay/transaction`

Candidate status:

- Not active.
- Not mounted.
- Not public.
- Not an alias.
- Not approved for traffic in ORO-4G.

## Explicitly Blocked Aliases

These aliases remain blocked until a separate explicit approval phase:

- `POST /api/balance`
- `POST /api/transaction`

Public alias enablement must have its own phase. ORO-4G must not open these aliases.

## Mount Readiness Decision

ORO-4G has no ready-to-mount state.

- If any preflight gate fails, the result is `BLOCKED`.
- If every static gate passes, the result is still `NOT_READY_TO_MOUNT`.
- ORO-4G never returns a ready-to-mount approval.
- ORO-4G never activates a route.
- ORO-4G never enables a public alias.

## Rollback Readiness Checklist

A future staging mount phase must have rollback evidence for:

- disable staging flag.
- remove route mount.
- keep fail-closed behavior.
- preserve sanitized logs.
- stop external traffic.
- verify no wallet or ledger mutation occurred.
- run targeted smoke.
- run Safe CI.

Rollback readiness is documentation and static contract only in ORO-4G.

## Evidence Checklist

| Gate | Expected Evidence | Status | Notes |
| --- | --- | --- | --- |
| Git clean | `git status --short` has no output before a mount phase | PASS | Verified for ORO-4G preflight start only; future mount needs fresh evidence. |
| Safe CI for HEAD | Safe CI run for HEAD is completed/success | PASS | Verified for ORO-4G preflight start only; future mount needs fresh evidence. |
| Targeted OroPlay smokes | ORO-4G and prior targeted callback smokes pass | NOT_READY | ORO-4G adds static smoke; future mount needs fresh run. |
| Secret-shaped scan | Changed files scan has no credential-shaped values | NOT_READY | Future mount must rescan changed files. |
| `git diff --check` | No whitespace errors | NOT_READY | Future mount must rerun after implementation diff. |
| Route alias disabled | `/api/balance` and `/api/transaction` remain blocked | PASS | ORO-4G explicitly blocks aliases. |
| `src/app.js` unchanged | No app mount diff before approval | PASS | ORO-4G does not require app changes. |
| Callback auth strategy documented | Strategy exists without values | NOT_READY | Required before future mount approval. |
| Request envelope mapping documented | Request DTO mapping and malformed handling documented | NOT_READY | Required before future mount approval. |
| Response envelope mapping documented | Response contract documented for provider callbacks | NOT_READY | Required before future mount approval. |
| Idempotency behavior documented | Idempotency key and repeat handling documented | NOT_READY | Required before future mount approval. |
| Duplicate transaction behavior documented | Duplicate prevention evidence documented | NOT_READY | Required before future mount approval. |
| Insufficient balance behavior documented | Debit failure behavior documented | NOT_READY | Required before future mount approval. |
| Invalid user behavior documented | User lookup failure behavior documented | NOT_READY | Required before future mount approval. |
| Malformed payload behavior documented | Validation failure response documented | NOT_READY | Required before future mount approval. |
| Sanitizer/log redaction documented | Log output proves sanitized fields only | NOT_READY | Required before future mount approval. |
| Rollback plan documented | Disable flag, unmount, smoke, Safe CI listed | PASS | ORO-4G provides the readiness checklist only. |
| Staging-only flag strategy documented | Flag default and kill switch documented | NOT_READY | Required before future mount approval. |
| Observability/audit plan documented | Audit events and metrics documented without values | NOT_READY | Required before future mount approval. |
| Ledger reconciliation gate documented | Reconciliation proof and no double-write gate documented | NOT_READY | Required before future mount approval. |
| UAT signoff checklist documented | Manual UAT signoff steps documented | NOT_READY | Required before future mount approval. |
| Express mount | No Express mount in this phase | NOT_APPLICABLE | ORO-4G is still no mount. |
| Runtime mutation | No wallet, ledger, or DB write path | PASS | ORO-4G is static/mock only. |

## Rollback Evidence Expectations

Future rollback evidence must show:

- The staging flag can be disabled without printing values.
- Route mount removal is scoped and reversible.
- Fail-closed behavior remains the default.
- Sanitized logs remain available after rollback.
- External traffic can be stopped.
- Wallet, ledger, and Prisma write paths are not triggered by rollback.
- Targeted smoke passes after rollback.
- Safe CI passes after rollback.

## Safety Boundary

ORO-4G does not use production DB access, real money, live OroPlay calls, external network, real callback credential values, wallet mutation, ledger mutation, Prisma write, DB transactions, migration, deploy, payout, auto-credit, public alias enablement, or production config changes.

## Next Phase Recommendation

Recommended next phase:

ORO-4H Staging Route Wiring Dry-Run Gate / Still No Public Alias

ORO-4H should still avoid opening `POST /api/balance` or `POST /api/transaction`. Public aliases require a separate explicit approval phase after staging-only dry-run evidence.
