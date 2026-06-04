# ORO-4V Route Mount Approval Boundary

## ORO-4V scope

ORO-4V creates a separate route mount approval boundary as docs, static
contract, mock fixtures, and local smoke only.

ORO-4V does not edit src/app.js, does not mount Express route, does not enable
public alias, and does not allow runtime traffic.

## Input from ORO-4U

ORO-4U final decision has been recorded as static/internal metadata only.

ORO-4V consumes this ORO-4U state:

- `finalPreMountAuthorizationDecisionIssued = true`
- `routeMountAuthorization = not_authorized_for_mount`
- `expressMountAllowed = false`
- `publicAliasAllowed = false`
- `runtimeTrafficAllowed = false`
- separate route mount approval still required

## Separate route mount approval rules

- ORO-4T mount request submission metadata must be present.
- ORO-4U final decision metadata must be present.
- Signed approval record metadata must be present.
- Private artifact hash registry metadata must be present.
- Route mount reviewer must be present.
- Approval timestamp must be present and after ORO-4U final decision.
- Approval output must stay static/internal metadata only.
- Approval output must not include secret-shaped fields.
- Approval output must not authorize or implement runtime route mount.

## Explicit Express mount authorization gate

The ORO-4V explicit Express mount authorization gate is closed.

- `routeMountAuthorization remains not_authorized_for_mount`
- `expressMountAllowed = false`
- `expressMountImplemented = false`
- `publicAliasAllowed = false`
- `runtimeTrafficAllowed = false`
- `separateImplementationPhaseRequired = true`
- `nextPhaseRequiresSeparateImplementationApproval = true`

## Approval result contract

Happy path approval output records an approval boundary only:

- `routeMountApprovalBoundaryResult = PASS`
- `routeMountApprovalStatus = approval_boundary_recorded_mount_still_not_implemented`
- `approvalBoundaryStaticInternalMetadataOnly = true`
- `finalPreMountAuthorizationDecisionIssued = true`
- `mountAuthorizationRequestSubmitted = true`
- `signedApprovalRecordPresent = true`
- `ownerSignedApprovalArtifactPrivateHashRegistered = true`
- `routeMountReviewerPresent = true`
- `routeMountAuthorization = not_authorized_for_mount`
- `expressMountAllowed = false`
- `expressMountImplemented = false`
- `publicAliasAllowed = false`
- `runtimeTrafficAllowed = false`
- `separateImplementationPhaseRequired = true`
- `nextPhaseRequiresSeparateImplementationApproval = true`

The approval boundary recorded but mount not implemented. Any future actual
mount requires a separate implementation phase.

## No actual Express mount boundary

ORO-4V does not mount Express route and does not edit src/app.js.

This phase does not create an HTTP listener, does not register route handlers,
and does not activate `/api/oroplay/balance`, `/api/oroplay/transaction`,
`/api/balance`, or `/api/transaction`.

## Public alias boundary

ORO-4V does not enable public alias.

Public aliases remain blocked for `/api/balance` and `/api/transaction`.

## Runtime traffic boundary

ORO-4V does not allow runtime traffic.

The OroPlay route candidates remain inactive, unmounted, non-public, and not
authorized for traffic.

## Safety boundary

- ORO-4V does not mutate wallet/ledger.
- ORO-4V does not write Prisma/DB.
- no DB transaction
- no migration
- no deploy
- no external network
- no live OroPlay API call
- no production DB
- no real money
- no hardcoded sensitive credential or private device value
- no secret-shaped output

## Required evidence checks

- ORO-4U final decision exists.
- ORO-4T mount request submission exists.
- Signed approval record exists.
- Private artifact hash registry exists.
- Route mount reviewer exists.
- Approval timestamp exists and is not stale.
- Approval boundary is static/internal metadata only.
- Route mount authorization remains blocked.
- Express mount remains blocked and not implemented.
- Public alias remains blocked.
- Runtime traffic remains blocked.
- Separate implementation phase remains required.

## Failure / hold decisions

ORO-4V must return hold/fail status when any of these are true:

- missing ORO-4U final decision
- missing ORO-4T mount request submission
- missing signed approval record
- missing private artifact hash registry
- missing route mount reviewer
- missing approval timestamp
- stale approval timestamp
- approval tries to authorize Express mount directly
- approval tries to edit src/app.js
- approval tries to implement Express mount
- approval tries to enable public alias
- approval tries to enable runtime traffic
- approval tries wallet mutation
- approval tries ledger mutation
- approval tries Prisma write
- approval tries external network
- approval has secret-shaped output

## Next phase requirements

ORO-4V route mount approval boundary remains recorded as static/internal
metadata only.

Route mount authorization remains not_authorized_for_mount unless a later
implementation phase explicitly changes it.

Any future actual mount requires a separate implementation phase with explicit
authorization to edit src/app.js, mount Express routes, expose public aliases,
and accept runtime traffic. ORO-4V is not that implementation phase.

ORO-4W implementation approval readiness may record readiness for that
separate implementation approval gate only. ORO-4W still does not authorize
src/app.js changes, Express route mount, public aliases, or runtime traffic.
