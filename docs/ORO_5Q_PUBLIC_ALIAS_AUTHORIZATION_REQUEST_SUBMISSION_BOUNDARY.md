# ORO-5Q Public Alias Authorization Request Submission Boundary

## ORO-5Q scope

ORO-5Q is a public alias authorization request submission boundary only. It
creates a static/mock request submission record after ORO-5P readiness passed.

ORO-5Q does not issue the public alias authorization decision, does not grant a
public alias, does not authorize implementation, does not implement a public
alias, and does not enable runtime traffic.

## Dependency on ORO-5P readiness

ORO-5Q depends on ORO-5P public alias authorization request readiness:

- dependsOnOro5pPublicAliasReadiness = true
- publicAliasAuthorizationRequestReadinessPreparedFromOro5p = true
- publicAliasAuthorizationRequestReadinessStatusFromOro5p = ready_for_request_submission_boundary
- postMountValidationDecisionIssuedFromOro5p = true
- postMountValidationDecisionResultFromOro5p = validated_passed

## Request submission record

ORO-5Q submits only a static/mock public alias authorization request record:

- publicAliasAuthorizationRequestSubmissionBoundaryResult = PASS
- publicAliasAuthorizationRequestSubmissionBoundaryEntered = true
- publicAliasAuthorizationRequestSubmissionChecked = true
- publicAliasAuthorizationRequestSubmitted = true
- publicAliasAuthorizationRequestStatus = submitted_pending_decision
- publicAliasAuthorizationRequestResult = submitted
- publicAliasAuthorizationRequestScope = public_alias_authorization_decision_request_only

## Decision and implementation boundary

ORO-5Q does not issue or grant authorization:

- publicAliasAuthorizationDecisionIssued = false
- publicAliasAuthorizationDecisionStatus = not_issued
- publicAliasAuthorizationDecisionResult = pending
- publicAliasAuthorizationGranted = false
- publicAliasAuthorization = not_authorized_for_public_alias
- publicAliasImplementationAuthorized = false
- publicAliasImplementationAuthorizationScope = not_authorized
- publicAliasImplementationBoundaryEntryAllowed = false

Public aliases remain absent and inactive:

- publicAliasAllowed = false
- publicAliasImplemented = false
- apiBalancePublicAliasMounted = false
- apiTransactionPublicAliasMounted = false
- apiBalancePublicAliasActive = false
- apiTransactionPublicAliasActive = false

## Runtime and money movement boundary

The internal `/api/oroplay` staging mount remains fail-closed:

- oroplayInternalCallbackRouteMounted = true
- oroplayBalanceRouteMounted = true
- oroplayTransactionRouteMounted = true
- oroplayBalanceRouteMode = fail_closed_no_mutation
- oroplayTransactionRouteMode = fail_closed_no_mutation

Runtime traffic and live traffic remain disabled:

- runtimeTrafficAllowed = false
- runtimeTrafficEnabled = false
- liveTrafficAllowed = false
- liveTrafficEnabled = false

Wallet, ledger, persistent writes, DB transactions, and migrations remain
blocked:

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

External network and live OroPlay calls remain blocked:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## File boundary

ORO-5Q does not change `src/app.js` and does not change runtime route or
controller files:

- srcAppChangedInOro5q = false
- runtimeRouteControllerChangedInOro5q = false

It does not add `/api/balance`, does not add `/api/transaction`, does not add a
new Express mount, does not deploy, and does not add secret-shaped values.

## Next phase requirements

- nextPhaseRequiresPublicAliasAuthorizationDecision = true
- nextPhaseRequiresPublicAliasImplementationBoundary = true
- nextPhaseRequiresSeparateRuntimeTrafficApproval = true
- nextPhaseRequiresSeparateLiveTrafficApproval = true

The next phase requires a separate public alias authorization decision boundary.
A later separate implementation boundary is required before any public alias can
be mounted. Runtime traffic and live traffic remain separate explicit approvals.
