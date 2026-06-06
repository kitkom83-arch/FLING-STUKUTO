# ORO-5W Runtime Traffic Authorization Decision Boundary

## ORO-5W scope

ORO-5W is a decision record boundary only. It issues the runtime traffic
authorization decision for the request submitted by ORO-5V.

If the decision is approved, ORO-5W grants only entry into the next runtime
traffic enablement boundary. ORO-5W does not open runtime traffic, does not
implement runtime traffic, and does not enable live traffic.

## Dependency on ORO-5V request submission

ORO-5W depends on the ORO-5V request submission record:

- dependsOnOro5vRuntimeTrafficAuthorizationRequestSubmission = true
- runtimeTrafficAuthorizationRequestSubmittedFromOro5v = true
- runtimeTrafficAuthorizationRequestStatusFromOro5v = submitted_pending_decision
- runtimeTrafficAuthorizationRequestResultFromOro5v = submitted

## Runtime traffic authorization decision record

ORO-5W issues only the runtime traffic authorization decision record:

- runtimeTrafficAuthorizationDecisionBoundaryResult = PASS
- runtimeTrafficAuthorizationDecisionBoundaryEntered = true
- runtimeTrafficAuthorizationDecisionChecked = true
- runtimeTrafficAuthorizationDecisionIssued = true
- runtimeTrafficAuthorizationDecisionStatus = decision_issued
- runtimeTrafficAuthorizationDecisionResult = approved
- runtimeTrafficAuthorizationRequestStatus = decision_issued
- runtimeTrafficAuthorizationRequestResult = approved
- runtimeTrafficAuthorizationRequestResolved = true

## Runtime traffic grant scope

The approved decision is scoped only to the next enablement boundary:

- runtimeTrafficAuthorizationGranted = true
- runtimeTrafficAuthorizationGrantScope = runtime_traffic_enablement_boundary_only
- runtimeTrafficEnablementAuthorized = true
- runtimeTrafficEnablementAuthorizationScope = runtime_traffic_enablement_boundary_only
- runtimeTrafficEnablementBoundaryEntryAllowed = true
- runtimeTrafficEnablementBoundaryEntryScope = runtime_traffic_enablement_boundary_only

## Runtime traffic remains closed

ORO-5W does not open or implement runtime traffic:

- runtimeTrafficAllowed = false
- runtimeTrafficEnabled = false
- runtimeTrafficImplemented = false
- runtimeTrafficPatchImplemented = false

## Live traffic boundary

Live traffic remains outside this phase:

- liveTrafficAuthorizationRequestSubmitted = false
- liveTrafficAuthorizationDecisionIssued = false
- liveTrafficAllowed = false
- liveTrafficEnabled = false

## Public alias state

The public aliases remain mounted in fail-closed no-mutation mode:

- apiBalancePublicAliasMounted = true
- apiTransactionPublicAliasMounted = true
- apiBalancePublicAliasMode = fail_closed_no_mutation
- apiTransactionPublicAliasMode = fail_closed_no_mutation

## Runtime and money movement boundary

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

## External and live OroPlay boundary

ORO-5W does not allow external network or live OroPlay calls:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false
- secretsLeaked = false

## File boundary

ORO-5W does not change `src/app.js`, route files, controller files, service
files, ledger files, Prisma files, env files, migration files, or deploy files.
It does not open runtime traffic and does not add a live OroPlay call.

## Next phase requirements

- nextPhaseRequiresRuntimeTrafficEnablementBoundary = true
- nextPhaseRequiresSeparateLiveTrafficApproval = true

The next phase requires a separate runtime traffic enablement boundary. Live
traffic remains a separate approval boundary.
