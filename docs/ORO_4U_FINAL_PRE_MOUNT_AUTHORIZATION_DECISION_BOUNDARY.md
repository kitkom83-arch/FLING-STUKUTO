# ORO-4U Final Pre-Mount Authorization Decision Boundary

## ORO-4U scope

ORO-4U records the final pre-mount authorization decision boundary as docs,
static contract, mock fixtures, and local smoke only.

This phase may issue the final decision as static/internal metadata only. It
does not mount a route, does not add an Express route, does not create a public
alias, and does not allow runtime traffic.

## Input from ORO-4T

ORO-4T is closed and provides this static input:

- `mountAuthorizationRequestSubmitted = true`
- `finalPreMountAuthorizationDecisionIssued = false`
- `routeMountAuthorization = not_authorized_for_mount`
- `expressMountAllowed = false`
- `publicAliasAllowed = false`
- `runtimeTrafficAllowed = false`

ORO-4U consumes that request submission state and records the final decision
only as internal metadata.

## Final pre-mount authorization decision rules

- Signed approval record metadata must be present.
- Private artifact hash registry metadata must be present.
- ORO-4T mount authorization request submission must be present.
- Final decision reviewer must be present.
- Final decision timestamp must be present and after request submission.
- Decision output must stay static/internal metadata only.
- Decision output must not include secret-shaped fields.
- Decision output must not authorize Express mount directly.
- Decision output must not enable public alias.
- Decision output must not enable runtime traffic.

## Decision result contract

Happy path decision output:

- `finalPreMountAuthorizationDecisionPrepared = true`
- `finalPreMountAuthorizationDecisionIssued = true`
- `finalPreMountAuthorizationDecisionIssuedMode = static_internal_metadata_only`
- `finalDecisionStaticInternalMetadataOnly = true`
- `decisionOutcome = decision_recorded_mount_still_not_authorized`
- `decisionStatus = final_decision_issued_separate_route_approval_required`
- `mountAuthorizationRequestSubmitted = true`
- `routeMountAuthorization = not_authorized_for_mount`
- `expressMountAllowed = false`
- `publicAliasAllowed = false`
- `runtimeTrafficAllowed = false`
- `separateRouteMountApprovalRequired = true`
- `nextPhaseRequiresSeparateAuthorization = true`

The final decision does not automatically mount route. separate route mount approval is still required before any route mount, public alias, or runtime traffic can be considered.

## Route mount authorization boundary

`routeMountAuthorization remains not_authorized_for_mount` unless separate
route mount approval exists outside this phase.

ORO-4U does not create that separate approval. It only records that the final
pre-mount decision is issued as internal metadata and that route mount remains
blocked.

## Explicit no-mount boundary

- `expressMountAllowed = false`
- `publicAliasAllowed = false`
- `runtimeTrafficAllowed = false`
- no src/app.js change
- no Express mount
- no public alias
- no active callback route
- no runtime traffic

## Safety boundary

- no wallet/ledger mutation
- no Prisma write
- no database transaction
- no migration
- no deploy
- no external network
- no live OroPlay API call
- no production database
- no real money
- no hardcoded sensitive credential or private device value
- no secret-shaped output

## Required evidence checks

- ORO-4T request submission metadata exists.
- Signed approval record metadata exists.
- Private artifact hash registry metadata exists.
- Final decision reviewer exists.
- Final decision timestamp exists.
- Final decision timestamp is not stale.
- Decision is static/internal metadata only.
- Route mount authorization remains blocked.
- Express mount remains blocked.
- Public alias remains blocked.
- Runtime traffic remains blocked.

## Failure / hold decisions

ORO-4U must return hold/fail status when any of these are true:

- missing signed approval record
- missing private artifact hash registry
- missing mount authorization request submission
- final decision missing reviewer
- final decision missing decision timestamp
- stale decision timestamp
- decision tries to authorize Express mount directly
- decision tries to enable public alias
- decision tries to enable runtime traffic
- decision tries wallet mutation
- decision tries ledger mutation
- decision tries Prisma write
- decision tries external network
- decision has secret-shaped output

## Next phase requirements

The next phase must require separate route mount authorization before any
Express route mount, public alias, runtime traffic, wallet mutation, ledger
mutation, Prisma write, live OroPlay API call, or real money behavior.
