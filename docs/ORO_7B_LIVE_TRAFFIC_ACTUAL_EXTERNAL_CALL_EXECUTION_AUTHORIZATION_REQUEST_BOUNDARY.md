# ORO-7B Live Traffic Actual External Call Execution Authorization Request Boundary

## Purpose

ORO-7B records the actual external call execution authorization request after
ORO-7A issued the final execution decision. This phase submits a request record
only. The request waits for a separate authorization decision in a later phase,
and it does not issue that decision, approve live execution, activate actual
execution, enable runtime execution, perform execution, open network access, or
call live OroPlay.

## Dependency on ORO-7A

ORO-7B depends on the ORO-7A final execution decision boundary:

- dependsOnOro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundary = true
- oro7aLiveTrafficActualExternalCallExecutionFinalExecutionDecisionBoundaryPassed = true
- actualExternalCallExecutionFinalExecutionDecisionPreparedFromOro7a = true
- actualExternalCallExecutionFinalExecutionDecisionIssuedFromOro7a = true
- actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a = approved_for_separate_actual_external_call_execution_authorization_request_only
- actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a = final_execution_decision_only

ORO-7A must remain final-execution-decision-only and must not have submitted
the authorization request, issued an authorization decision, approved live
execution, activated actual execution, enabled runtime execution, performed
execution, opened external network access, or called live OroPlay.

## Authorization request boundary

ORO-7B may record only the authorization request:

- actualExternalCallExecutionAuthorizationRequestPrepared = true
- actualExternalCallExecutionAuthorizationRequestSubmitted = true
- actualExternalCallExecutionAuthorizationRequestStatus = submitted_pending_actual_external_call_execution_authorization_decision
- actualExternalCallExecutionAuthorizationRequestScope = authorization_request_only

The decision and execution boundaries remain closed:

- actualExternalCallExecutionAuthorizationDecisionIssued = false
- actualExternalCallExecutionLiveExecutionApproved = false
- actualExternalCallExecutionActivated = false
- actualExternalCallExecutionRuntimeEnabled = false
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why this still is not actual execution

The status
`submitted_pending_actual_external_call_execution_authorization_decision` and
scope `authorization_request_only` mean only that a later separate
authorization decision phase may evaluate the request. They are not actual live
execution approval, activation, runtime enablement, execution authorization,
network approval, or live OroPlay call approval.

## Still-no-external-call safety

ORO-7B keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-7B is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-7B keeps all mutation and persistence paths closed:

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
- deployAllowed = false
- deployPerformed = false

## No external network

The phase does not open an external network path. It must not use a runtime
client, HTTP transport, live callback, or network side effect.

## No live OroPlay call

The phase does not call live OroPlay. It only records static authorization
request evidence that can be checked by the local smoke harness.

## Next phase expectations

The next phase must issue a separate actual external call execution
authorization decision before any actual execution approval or actual execution
can occur. ORO-7B still does not approve actual execution, activate actual
execution, enable runtime execution, authorize execution, or perform actual
execution.

## Sensitive output rules

ORO-7B records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped credential material.

## Authorization request output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-7B",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryFixture",
  "liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult": "PASS",
  "actualExternalCallExecutionFinalExecutionDecisionStatusFromOro7a": "approved_for_separate_actual_external_call_execution_authorization_request_only",
  "actualExternalCallExecutionFinalExecutionDecisionScopeFromOro7a": "final_execution_decision_only",
  "actualExternalCallExecutionAuthorizationRequestStatus": "submitted_pending_actual_external_call_execution_authorization_decision",
  "actualExternalCallExecutionAuthorizationRequestScope": "authorization_request_only",
  "actualExternalCallExecutionAuthorizationDecisionIssued": false,
  "actualExternalCallExecutionLiveExecutionApproved": false,
  "actualExternalCallExecutionActivated": false,
  "actualExternalCallExecutionRuntimeEnabled": false,
  "externalCallExecutionPerformed": false,
  "externalNetworkAllowed": false,
  "liveOroPlayApiCallAllowed": false,
  "blockers": []
}
```

## Rollback and blocker rules

ORO-7B blocks if the ORO-7A final execution decision dependency is missing; if
ORO-7A did not pass; if the ORO-7A final execution decision was not issued; if
the ORO-7A decision status is not
`approved_for_separate_actual_external_call_execution_authorization_request_only`;
if the ORO-7A decision scope is not `final_execution_decision_only`; if the
authorization request is not submitted as `authorization_request_only`; if the
request status is not
`submitted_pending_actual_external_call_execution_authorization_decision`; if
the separate authorization decision requirement is missing; if an authorization
decision is already issued in this phase; if live execution is approved; if
actual execution is activated, enabled, authorized, or performed; if external
network or live OroPlay is allowed; if wallet, ledger, data write, DB
transaction, migration, or deploy flags open; or if sensitive-shaped output is
present.
