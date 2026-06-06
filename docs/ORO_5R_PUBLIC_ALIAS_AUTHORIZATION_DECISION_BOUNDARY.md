# ORO-5R Public Alias Authorization Decision Boundary

## ORO-5R scope

ORO-5R is a public alias authorization decision boundary only. It issues a
static/mock decision for the public alias authorization request submitted in
ORO-5Q.

ORO-5R approves entry into the next public alias implementation boundary only.
It does not implement public aliases, does not mount `/api/balance`, does not
mount `/api/transaction`, does not change runtime routes or controllers, and
does not enable runtime traffic.

## Dependency on ORO-5Q request submission

ORO-5R depends on the ORO-5Q public alias authorization request submission:

- dependsOnOro5qPublicAliasAuthorizationRequestSubmission = true
- publicAliasAuthorizationRequestSubmittedFromOro5q = true
- publicAliasAuthorizationRequestStatusFromOro5q = submitted_pending_decision
- publicAliasAuthorizationRequestResultFromOro5q = submitted

## Public alias authorization decision record

ORO-5R issues only the static/mock public alias authorization decision:

- publicAliasAuthorizationDecisionBoundaryResult = PASS
- publicAliasAuthorizationDecisionBoundaryEntered = true
- publicAliasAuthorizationDecisionChecked = true
- publicAliasAuthorizationDecisionIssued = true
- publicAliasAuthorizationDecisionStatus = decision_issued
- publicAliasAuthorizationDecisionResult = approved

The request is resolved by the static/mock decision:

- publicAliasAuthorizationRequestStatus = decision_issued
- publicAliasAuthorizationRequestResult = approved
- publicAliasAuthorizationRequestResolved = true

The grant is limited to the next implementation boundary:

- publicAliasAuthorizationGranted = true
- publicAliasAuthorizationGrantScope = public_alias_implementation_boundary_only
- publicAliasAuthorization = authorized_for_public_alias_implementation_boundary_only
- publicAliasImplementationAuthorized = true
- publicAliasImplementationAuthorizationScope = public_alias_implementation_boundary_only
- publicAliasImplementationBoundaryEntryAllowed = true
- publicAliasImplementationBoundaryEntryScope = public_alias_implementation_boundary_only

## Implementation boundary remains closed

ORO-5R does not perform public alias implementation:

- publicAliasImplemented = false
- publicAliasPatchImplemented = false
- apiBalancePublicAliasMounted = false
- apiTransactionPublicAliasMounted = false
- apiBalancePublicAliasActive = false
- apiTransactionPublicAliasActive = false
- expressMountAllowedInOro5r = false
- expressMountImplementedInOro5r = false

The next phase requires a separate public alias implementation boundary before
any public alias can be mounted.

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

ORO-5R does not change `src/app.js` and does not change runtime route or
controller files:

- srcAppChangedInOro5r = false
- runtimeRouteControllerChangedInOro5r = false

It does not add `/api/balance`, does not add `/api/transaction`, does not add a
new Express mount, does not deploy, and does not add secret-shaped values.

## Next phase requirements

- nextPhaseRequiresPublicAliasImplementationBoundary = true
- nextPhaseRequiresPostAliasValidationBoundary = true
- nextPhaseRequiresSeparateRuntimeTrafficApproval = true
- nextPhaseRequiresSeparateLiveTrafficApproval = true

The next phase requires a separate public alias implementation boundary. A later
separate post-alias validation boundary is required after implementation.
Runtime traffic and live traffic remain separate explicit approvals.
