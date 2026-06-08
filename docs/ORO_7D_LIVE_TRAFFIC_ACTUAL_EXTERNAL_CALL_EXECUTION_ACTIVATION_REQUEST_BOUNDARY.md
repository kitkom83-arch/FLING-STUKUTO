# ORO-7D Live Traffic Actual External Call Execution Activation Request Boundary

## Purpose

ORO-7D submits the actual external call execution activation request after
ORO-7C issued the authorization decision. This phase records a request only.
The request asks for a later separate activation decision, but it does not
issue that decision, approve live execution, activate actual execution, enable
runtime execution, perform execution, open network access, or call live
OroPlay.

## Dependency on ORO-7C

ORO-7D depends on the ORO-7C authorization decision boundary:

- dependsOnOro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary = true
- oro7cLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryPassed = true
- actualExternalCallExecutionAuthorizationDecisionPreparedFromOro7c = true
- actualExternalCallExecutionAuthorizationDecisionIssuedFromOro7c = true
- actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c = approved_for_separate_actual_external_call_execution_activation_request_only
- actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c = authorization_decision_only

ORO-7C must remain authorization-decision-only and must not have submitted an
activation request, issued an activation decision, approved live execution,
activated actual execution, enabled runtime execution, performed execution,
opened external network access, or called live OroPlay.

## Activation request boundary

ORO-7D may record only the activation request:

- actualExternalCallExecutionActivationRequestPrepared = true
- actualExternalCallExecutionActivationRequestSubmitted = true
- actualExternalCallExecutionActivationRequestStatus = submitted_pending_actual_external_call_execution_activation_decision
- actualExternalCallExecutionActivationRequestScope = activation_request_only

The activation decision and execution boundaries remain closed:

- actualExternalCallExecutionActivationDecisionIssued = false
- actualExternalCallExecutionLiveExecutionApproved = false
- actualExternalCallExecutionActivated = false
- actualExternalCallExecutionRuntimeEnabled = false
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why this still is not actual execution

The status
`submitted_pending_actual_external_call_execution_activation_decision` and
scope `activation_request_only` mean only that a later separate activation
decision phase may review the request. They are not activation decision,
actual live execution approval, runtime enablement, execution authorization,
network approval, or live OroPlay call approval.

## Still-no-external-call safety

ORO-7D keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-7D is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-7D keeps all mutation and persistence paths closed:

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

The phase does not call live OroPlay. It only records static activation
request evidence that can be checked by the local smoke harness.

## Next phase expectations

The next phase must issue a separate actual external call execution activation
decision before any actual execution approval, activation, runtime enablement,
or actual execution can occur. ORO-7D still does not approve actual execution,
activate actual execution, enable runtime execution, authorize execution, or
perform actual execution.

ORO-7E activation decision boundary is required next. That next phase may
issue a decision with
`approved_for_separate_actual_external_call_execution_runtime_enablement_request_only`
and `activation_decision_only`, but it still must not submit a runtime
enablement request or perform actual external call execution.

## Sensitive output rules

ORO-7D records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped credential material.

## Activation request output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-7D",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionActivationRequestBoundaryFixture",
  "liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult": "PASS",
  "actualExternalCallExecutionAuthorizationDecisionStatusFromOro7c": "approved_for_separate_actual_external_call_execution_activation_request_only",
  "actualExternalCallExecutionAuthorizationDecisionScopeFromOro7c": "authorization_decision_only",
  "actualExternalCallExecutionActivationRequestStatus": "submitted_pending_actual_external_call_execution_activation_decision",
  "actualExternalCallExecutionActivationRequestScope": "activation_request_only",
  "actualExternalCallExecutionActivationDecisionIssued": false,
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

ORO-7D blocks if the ORO-7C authorization decision dependency is missing; if
ORO-7C did not pass; if the ORO-7C authorization decision was not issued; if
the ORO-7C status is not
`approved_for_separate_actual_external_call_execution_activation_request_only`;
if the ORO-7C scope is not `authorization_decision_only`; if the activation
request is not submitted as `activation_request_only`; if the activation
request status is not
`submitted_pending_actual_external_call_execution_activation_decision`; if the
separate activation decision requirement is missing; if an activation decision
is already issued in this phase; if live execution is approved; if actual
execution is activated, enabled, authorized, or performed; if external network
or live OroPlay is allowed; if wallet, ledger, data write, DB transaction,
migration, or deploy flags open; or if sensitive-shaped output is present.
