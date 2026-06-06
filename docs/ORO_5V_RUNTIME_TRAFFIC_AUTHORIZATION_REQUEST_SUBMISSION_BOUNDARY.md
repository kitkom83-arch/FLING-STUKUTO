# ORO-5V Runtime Traffic Authorization Request Submission Boundary

## ORO-5V scope

ORO-5V is a request submission record boundary only. It submits the runtime
traffic authorization request record for the public aliases after ORO-5U
readiness passes:

- `POST /api/balance`
- `POST /api/transaction`

ORO-5V does not issue a runtime traffic authorization decision, does not grant
runtime traffic, does not enable runtime traffic, and does not enable live
traffic.

## Dependency on ORO-5U

ORO-5V depends on ORO-5U readiness:

- dependsOnOro5uRuntimeTrafficAuthorizationRequestReadiness = true
- runtimeTrafficAuthorizationRequestReadyFromOro5u = true
- runtimeTrafficAuthorizationRequestPreparedFromOro5u = true

## Request submission record

ORO-5V submits only the runtime traffic authorization request record:

- runtimeTrafficAuthorizationRequestSubmissionBoundaryResult = PASS
- runtimeTrafficAuthorizationRequestSubmissionBoundaryEntered = true
- runtimeTrafficAuthorizationRequestSubmissionChecked = true
- runtimeTrafficAuthorizationRequestSubmitted = true
- runtimeTrafficAuthorizationRequestStatus = submitted_pending_decision
- runtimeTrafficAuthorizationRequestResult = submitted
- runtimeTrafficAuthorizationRequestScope = runtime_traffic_authorization_decision_request_only

## Runtime traffic decision boundary

The runtime traffic authorization decision is not issued in ORO-5V:

- runtimeTrafficAuthorizationDecisionIssued = false
- runtimeTrafficAuthorizationGranted = false
- runtimeTrafficAllowed = false
- runtimeTrafficEnabled = false

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

ORO-5V does not allow external network or live OroPlay calls:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false
- secretsLeaked = false

## File boundary

ORO-5V does not change `src/app.js`, route files, controller files, service
files, ledger files, Prisma files, env files, migration files, or deploy files.
It does not open runtime traffic and does not add a live OroPlay call.

## Next phase requirements

- nextPhaseRequiresRuntimeTrafficAuthorizationDecision = true
- nextPhaseRequiresSeparateLiveTrafficApproval = true

The next phase requires a separate runtime traffic authorization decision
boundary. Live traffic remains a separate approval boundary.

## Downstream ORO-5W decision note

ORO-5W issues the runtime traffic authorization decision record after ORO-5V.
ORO-5W grants only entry to the runtime traffic enablement boundary, keeps
runtime traffic unopened and unimplemented, keeps live traffic disabled, keeps
wallet/ledger/Prisma/DB work blocked, and keeps external and live OroPlay calls
absent.

ORO-5X enables runtime traffic only in fail-closed no-mutation mode after
ORO-5W. ORO-5X keeps live traffic disabled and keeps wallet/ledger/Prisma/DB
work blocked.
