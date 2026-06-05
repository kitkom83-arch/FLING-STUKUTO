# ORO-5M Route Mount Authorization Decision Boundary

## ORO-5M scope

ORO-5M issues route mount authorization decision only. It consumes the
ORO-5L submitted route mount authorization request and may grant permission to
proceed to a future route mount implementation boundary.

ORO-5M may grant permission to proceed to a future route mount implementation boundary.

ORO-5M does not mount Express routes, does not edit `src/app.js`, does not
enable public aliases, does not allow runtime traffic, does not mutate
wallet/ledger state, does not write Prisma/DB, and does not call live OroPlay
API.

## Input from ORO-5L

The happy path requires ORO-5L submitted route mount authorization request
evidence:

- routeMountAuthorizationRequestSubmissionBoundaryEntered = true
- routeMountAuthorizationRequestPrepared = true
- routeMountAuthorizationRequestPreparationStatus = prepared_for_submission
- routeMountAuthorizationRequestSubmissionChecked = true
- routeMountAuthorizationRequestSubmissionAllowed = true
- routeMountAuthorizationRequestSubmitted = true
- routeMountAuthorizationRequestStatus = submitted_pending_decision
- routeMountAuthorizationRequestResult = submitted
- routeMountAuthorizationRequestScope = route_mount_authorization_decision_request_only
- routeMountAuthorizationRequestEvidenceIncluded = true
- routeMountAuthorizationDecisionRequired = true
- routeMountAuthorizationDecisionIssued = false
- routeMountAuthorizationDecisionResult = pending_decision
- routeMountAuthorizationGranted = false
- routeMountAuthorization = not_authorized_for_mount

## Route mount authorization decision rules

ORO-5M may approve only the decision boundary output when the ORO-5L request is
present, submitted, pending decision, in the decision-request-only scope, and
includes the required evidence.

ORO-5M may not treat request submission as a mount, route implementation,
public alias approval, runtime traffic approval, wallet/ledger mutation,
Prisma/DB write, migration, external network permission, or live OroPlay API
permission.

## Decision issued / implementation still held boundary

Happy path ORO-5M output:

- routeMountAuthorizationDecisionBoundaryEntered = true
- routeMountAuthorizationDecisionChecked = true
- routeMountAuthorizationDecisionIssued = true
- routeMountAuthorizationDecisionStatus = decision_issued
- routeMountAuthorizationDecisionResult = approved
- routeMountAuthorizationGranted = true
- routeMountAuthorizationGrantScope = route_mount_implementation_boundary_only
- routeMountAuthorization = authorized_for_route_mount_implementation_boundary_only
- routeMountAuthorizationRequestStatus = decision_issued
- routeMountAuthorizationRequestResult = approved
- routeMountAuthorizationRequestResolved = true
- routeMountPatchImplementationAuthorized = true
- routeMountPatchImplementationAuthorizationScope = route_mount_implementation_boundary_only
- routeMountImplementationBoundaryEntryAllowed = true
- routeMountImplementationBoundaryEntryScope = route_mount_implementation_boundary_only

## Route mount implementation still held gate

- routeMountPatchImplemented = false
- runtimeActualPatchImplementationImplemented = false
- runtimeRoutePatched = false
- runtimeRouteControllerChanged = false
- srcAppChanged = false

## No Express mount boundary

- expressMountAllowed = false
- expressMountImplemented = false
- runtimeRoutePatched = false
- runtimeRouteControllerChanged = false
- srcAppChanged = false

## Public alias boundary

- publicAliasAllowed = false
- publicAliasImplemented = false
- nextPhaseRequiresSeparatePublicAliasApproval = true

## Runtime traffic boundary

- runtimeTrafficAllowed = false
- runtimeTrafficEnabled = false
- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## Wallet / ledger / Prisma write boundary

- walletMutationAllowed = false
- walletMutationPerformed = false
- ledgerMutationAllowed = false
- ledgerMutationPerformed = false
- prismaWriteAllowed = false
- prismaWritePerformed = false
- dbTransactionAllowed = false
- dbTransactionPerformed = false
- migrationAllowed = false
- migrationPerformed = false

## Safety boundary

ORO-5M is a static/mock decision boundary. It produces no runtime app mount,
no route/controller change, no public alias, no runtime traffic, no wallet or
ledger mutation, no Prisma/DB write, no migration, no external network, no live
OroPlay API call, and no sensitive-shaped output.

## Required evidence checks

- ORO-5L request must exist.
- Request submission boundary must be entered.
- Request must be prepared for submission.
- Request submission must be checked and allowed.
- Request must be submitted.
- Request status must be submitted_pending_decision.
- Request result must be submitted.
- Request scope must be route_mount_authorization_decision_request_only.
- Request evidence must be included.
- Decision must be required and still pending.
- Authorization must not already be granted.
- Implementation must not already be authorized.

## Failure / hold decisions

ORO-5M must hold when any of these are true:

- missing ORO-5L request
- route mount request not submitted
- route mount request not pending decision
- wrong route mount request scope
- request evidence missing
- decision already issued
- route mount authorization already granted
- route mount implementation already authorized unexpectedly
- route mount patch implemented unexpectedly
- runtime actual patch implementation already implemented
- runtime route patched unexpectedly
- src/app.js changed unexpectedly
- runtime route/controller changed unexpectedly
- Express mount allowed unexpectedly
- public alias allowed unexpectedly
- runtime traffic allowed unexpectedly
- wallet mutation allowed unexpectedly
- ledger mutation allowed unexpectedly
- Prisma write allowed unexpectedly
- DB transaction allowed unexpectedly
- migration allowed unexpectedly
- external network allowed unexpectedly
- live OroPlay API call allowed unexpectedly
- sensitive-shaped output

## Next phase requirements

- nextPhaseRequiresRouteMountImplementationBoundary = true
- nextPhaseRequiresSeparatePublicAliasApproval = true
- nextPhaseRequiresSeparateRuntimeTrafficApproval = true
- nextPhaseRequiresPostMountValidationBoundary = true
- nextPhaseRequiresSeparateLiveTrafficApproval = true

The next phase must be a separate route mount implementation boundary. Public
alias approval, runtime traffic approval, post-mount validation, and live
traffic approval remain separate explicit boundaries.
