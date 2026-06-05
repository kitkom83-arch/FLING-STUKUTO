# ORO-5G Actual Patch Implementation Authorization Request Boundary

## ORO-5G scope

ORO-5F issued actual patch implementation approval decision.

ORO-5F grants only the right to submit actual patch implementation authorization request.

ORO-5G records actual patch implementation authorization request submission only.

ORO-5G does not issue authorization decision.

ORO-5G does not grant implementation authorization.

ORO-5G does not implement route mount patch.

ORO-5G is docs, static contract, mock fixtures, and local smoke only. It does not change runtime behavior.

## Input from ORO-5F

ORO-5G consumes this ORO-5F state:

- `actualPatchImplementationApprovalRequestSubmitted = true`
- `actualPatchImplementationApprovalRequestStatus = decision_issued`
- `actualPatchImplementationApprovalDecisionIssued = true`
- `actualPatchImplementationApprovalGranted = true`
- `actualPatchImplementationApprovalGrantScope = actual_patch_implementation_authorization_request_only`
- `actualPatchImplementationAuthorized = false`
- `actualPatchImplementationImplemented = false`
- `routeMountPatchApproved = false`
- `routeMountPatchImplementationAuthorized = false`
- `routeMountPatchImplemented = false`
- `routeMountAuthorization = not_authorized_for_mount`
- `expressMountAllowed = false`
- `publicAliasAllowed = false`
- `runtimeTrafficAllowed = false`

ORO-5G must hold if the ORO-5F decision is missing, not issued, not granted, or granted with the wrong scope.

## Actual patch implementation authorization request rules

ORO-5G may submit only this request record:

- `actualPatchImplementationAuthorizationRequestSubmitted = true`
- `actualPatchImplementationAuthorizationRequestStatus = submitted_pending_decision`
- `actualPatchImplementationAuthorizationRequestResult = pending_decision`

ORO-5G does not issue authorization decision.

ORO-5G does not grant implementation authorization.

The request must not already be submitted before ORO-5G.

## Authorization decision still pending gate

ORO-5G authorization decision remains pending:

- `actualPatchImplementationAuthorizationDecisionIssued = false`
- `actualPatchImplementationAuthorizationGranted = false`

future actual patch implementation authorization decision requires separate explicit decision.

## Actual implementation still held gate

ORO-5G actual implementation remains held:

- `actualPatchImplementationApprovalDecisionIssued = true`
- `actualPatchImplementationApprovalGranted = true`
- `actualPatchImplementationApprovalGrantScope = actual_patch_implementation_authorization_request_only`
- `actualPatchImplementationAuthorized = false`
- `actualPatchImplementationImplemented = false`
- `routeMountPatchApproved = false`
- `routeMountPatchImplementationAuthorized = false`
- `routeMountPatchImplemented = false`
- `implementationExecutionApproved = false`

ORO-5G does not grant actual patch implementation authorization.

## Route mount authorization still held gate

ORO-5G route mount authorization remains held:

- `routeMountAuthorization = not_authorized_for_mount`
- `expressMountAllowed = false`
- `expressMountImplemented = false`

future route mount authorization requires separate explicit authorization.

## No actual Express mount boundary

ORO-5G does not edit src/app.js.

ORO-5G does not mount Express route.

ORO-5G does not register runtime routes or controllers.

ORO-5G does not expose active `/api/balance`, `/api/transaction`, `/api/oroplay/balance`, or `/api/oroplay/transaction`.

## Public alias boundary

ORO-5G does not enable public alias.

`publicAliasAllowed = false`

## Runtime traffic boundary

ORO-5G does not allow runtime traffic.

`runtimeTrafficAllowed = false`

future runtime traffic requires separate explicit runtime traffic approval.

## Safety boundary

- ORO-5G does not mutate wallet/ledger.
- ORO-5G does not write Prisma/DB.
- ORO-5G does not open a DB transaction.
- ORO-5G does not run migrations.
- ORO-5G does not call live OroPlay API.
- ORO-5G does not use external network.
- ORO-5G does not hardcode or print secrets.
- ORO-5G is not actual patch implementation.
- ORO-5G authorization request is not authorization decision.
- ORO-5G authorization request is not route mount authorization.
- ORO-5G authorization request is not runtime traffic approval.

## Required evidence checks

The local evidence must confirm:

- ORO-5G helper exports status, input builder, evaluator, still-held gates, summary builder, and validator.
- ORO-5G happy path returns authorization request submitted pending decision.
- ORO-5G keeps authorization decision, implementation, route mount, public alias, and runtime traffic held.
- ORO-5G fixtures cover missing ORO-5F decision, invalid ORO-5F decision state, wrong scope, prior request, prior authorization decision, prior authorization grant, implementation attempts, mount attempts, database attempts, external network attempts, and secret-shaped output.
- `smoke:oro-5g` passes.

## Failure / hold decisions

ORO-5G must return hold/fail status when any of these are true:

- missing ORO-5F decision
- ORO-5F decision not issued
- ORO-5F approval not granted
- wrong ORO-5F approval grant scope
- authorization request already submitted
- authorization decision already issued
- authorization already granted
- actualPatchImplementationAuthorized true
- actualPatchImplementationImplemented true
- routeMountPatchApproved true
- routeMountPatchImplementationAuthorized true
- routeMountPatchImplemented true
- routeMountAuthorization authorized_for_mount
- expressMountAllowed true
- publicAliasAllowed true
- runtimeTrafficAllowed true
- attempted src/app.js edit
- attempted runtime route/controller edit
- attempted Express mount
- attempted wallet mutation
- attempted ledger mutation
- attempted Prisma write
- attempted DB transaction
- attempted migration
- attempted external network
- secret-shaped output

## Next phase requirements

The next phase is actual patch implementation authorization decision boundary.

The next phase requires an actual patch implementation authorization decision.

The next phase requires separate route mount authorization.

The next phase requires separate runtime traffic approval.

Required next-phase flags:

- `nextPhaseRequiresActualPatchImplementationAuthorizationDecision = true`
- `nextPhaseRequiresSeparateRouteMountAuthorization = true`
- `nextPhaseRequiresSeparateRuntimeTrafficApproval = true`

## ORO-5H downstream boundary

ORO-5H issued actual patch implementation authorization decision after
ORO-5G submitted actual patch implementation authorization request.

ORO-5H grants only permission to proceed to a later actual patch implementation
execution boundary.

ORO-5H still does not execute actual patch implementation, still does not
apply patch, still does not mount route, and still does not open runtime
traffic.

The next phase is actual patch implementation execution boundary.

ORO-5I checks actual patch implementation execution readiness after ORO-5H.

ORO-5I prepares isolated mock execution plan only and still does not start
execution, apply runtime patch, implement patch, mount route, open public alias,
or open runtime traffic.
