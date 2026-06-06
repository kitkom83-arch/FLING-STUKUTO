# ORO-5X Runtime Traffic Enablement Boundary

## ORO-5X scope

ORO-5X is a runtime traffic enablement boundary only. It enables runtime traffic
for the already mounted public aliases:

- `POST /api/balance`
- `POST /api/transaction`

This runtime traffic is limited to `fail_closed_no_mutation` mode. ORO-5X does
not approve live traffic, does not move real money, does not mutate wallet or
ledger state, does not write through Prisma, does not create DB transactions,
does not migrate, does not deploy, and does not call live OroPlay.

## Dependency on ORO-5W authorization decision

ORO-5X depends on the approved ORO-5W decision record:

- dependsOnOro5wRuntimeTrafficAuthorizationDecision = true
- runtimeTrafficAuthorizationGrantedFromOro5w = true
- runtimeTrafficAuthorizationGrantScopeFromOro5w = runtime_traffic_enablement_boundary_only
- runtimeTrafficEnablementAuthorizedFromOro5w = true
- runtimeTrafficEnablementBoundaryEntryAllowedFromOro5w = true

## Runtime traffic enablement record

ORO-5X records runtime traffic enablement for the fail-closed boundary:

- runtimeTrafficEnablementBoundaryResult = PASS
- runtimeTrafficEnablementBoundaryEntered = true
- runtimeTrafficEnablementBoundaryChecked = true
- runtimeTrafficImplemented = true
- runtimeTrafficPatchImplemented = true
- runtimeTrafficAllowed = true
- runtimeTrafficEnabled = true
- runtimeTrafficMode = fail_closed_no_mutation

## Public alias runtime traffic state

The public aliases remain mounted and fail-closed:

- apiBalancePublicAliasMounted = true
- apiTransactionPublicAliasMounted = true
- apiBalancePublicAliasMode = fail_closed_no_mutation
- apiTransactionPublicAliasMode = fail_closed_no_mutation
- apiBalanceRuntimeTrafficEnabled = true
- apiTransactionRuntimeTrafficEnabled = true
- apiBalanceRuntimeTrafficMode = fail_closed_no_mutation
- apiTransactionRuntimeTrafficMode = fail_closed_no_mutation

## Fail-closed request behavior

Runtime traffic remains fail-closed and no-mutation:

- malformedPayloadFailClosed = true
- unknownUserFailClosed = true
- mockAuthMismatchFailClosed = true
- duplicateTransactionNoDoubleMutation = true
- unsupportedTransactionTypeFailClosedOrManualReview = true
- responseSanitized = true

## Live traffic boundary

Live traffic remains outside this phase:

- liveTrafficAuthorizationRequestSubmitted = false
- liveTrafficAuthorizationDecisionIssued = false
- liveTrafficAllowed = false
- liveTrafficEnabled = false

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

ORO-5X does not allow external network or live OroPlay calls:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false
- secretsLeaked = false

## File boundary

ORO-5X did not need to change `src/app.js` because the ORO-5S public aliases
already reuse the existing fail-closed OroPlay callback handlers. ORO-5X does
not change route files, controller files, service files, ledger files, Prisma
files, env files, migration files, or deploy files.

## Next phase requirements

- nextPhaseRequiresRuntimeTrafficPostEnablementValidation = true
- nextPhaseRequiresSeparateLiveTrafficApproval = true

The next phase requires a separate runtime traffic post-enablement validation
boundary. Live traffic remains a separate approval boundary.

## ORO-5Y post-enable validation requirement

ORO-5Y is required after enablement. ORO-5X runtime traffic remains only fail_closed_no_mutation,
and live traffic remains blocked. ORO-5Y must validate that `/api/balance` and
`/api/transaction` still fail closed, remain
no-mutation, and do not call live OroPlay.
