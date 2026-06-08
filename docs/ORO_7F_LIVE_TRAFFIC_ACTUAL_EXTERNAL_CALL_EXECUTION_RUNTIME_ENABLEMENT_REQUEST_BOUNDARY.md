# ORO-7F Live Traffic Actual External Call Execution Runtime Enablement Request Boundary

## Purpose

ORO-7F records the actual external call execution runtime enablement request
after ORO-7E issued the activation decision. This phase submits a request
record only. The request can ask for a later separate runtime enablement
decision, but it does not issue that decision, enable runtime execution,
approve live execution, activate execution, perform execution, open network
access, call live OroPlay, mount a route, or mutate wallet, ledger, or data
state.

## Dependency on ORO-7E

ORO-7F depends on the ORO-7E activation decision boundary:

- dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary = true
- oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed = true
- actualExternalCallExecutionActivationDecisionPreparedFromOro7e = true
- actualExternalCallExecutionActivationDecisionIssuedFromOro7e = true
- actualExternalCallExecutionActivationDecisionStatusFromOro7e = approved_for_separate_actual_external_call_execution_runtime_enablement_request_only
- actualExternalCallExecutionActivationDecisionScopeFromOro7e = activation_decision_only

ORO-7E must remain activation-decision-only and must not have submitted a
runtime enablement request, issued a runtime enablement decision, approved live
execution, activated actual execution, enabled runtime execution, performed
execution, opened external network access, or called live OroPlay.

## Runtime enablement request boundary

ORO-7F may record only the runtime enablement request:

- actualExternalCallExecutionRuntimeEnablementRequestPrepared = true
- actualExternalCallExecutionRuntimeEnablementRequestSubmitted = true
- actualExternalCallExecutionRuntimeEnablementRequestStatus = submitted_pending_actual_external_call_execution_runtime_enablement_decision
- actualExternalCallExecutionRuntimeEnablementRequestScope = runtime_enablement_request_only

The runtime enablement decision and execution boundaries remain closed:

- actualExternalCallExecutionRuntimeEnablementDecisionIssued = false
- actualExternalCallExecutionLiveExecutionApproved = false
- actualExternalCallExecutionActivated = false
- actualExternalCallExecutionRuntimeEnabled = false
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why this still is not runtime enablement

The status
`submitted_pending_actual_external_call_execution_runtime_enablement_decision`
and scope `runtime_enablement_request_only` mean only that a later separate
runtime enablement decision phase may review the request. They are not runtime
enablement, runtime activation, actual live execution approval, execution
authorization, network approval, route enablement, or live OroPlay call
approval.

## Still-no-external-call safety

ORO-7F keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-7F is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-7F keeps all mutation and persistence paths closed:

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

## No route enablement

ORO-7F does not mount, expose, or enable any route. It does not open
`/api/balance`, `/api/transaction`, `/api/oroplay/balance`, or
`/api/oroplay/transaction`.

## No external network

The phase does not open an external network path. It must not use a runtime
client, HTTP transport, live callback, or network side effect.

## No live OroPlay call

The phase does not call live OroPlay. It only records static runtime
enablement request evidence that can be checked by the local smoke harness.

## Next phase expectations

ORO-7G runtime enablement decision boundary is required next. That decision
must stay `runtime_enablement_decision_only` and may approve only the separate
final readiness review status
`approved_for_separate_actual_external_call_execution_runtime_enablement_final_readiness_only`.
ORO-7F still does not issue that decision, approve actual execution, enable
runtime execution, authorize execution, or perform actual execution.

## Sensitive output rules

ORO-7F records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped credential material.

## Runtime enablement request output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-7F",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryFixture",
  "liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult": "PASS",
  "dependsOnOro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundary": true,
  "oro7eLiveTrafficActualExternalCallExecutionActivationDecisionBoundaryPassed": true,
  "actualExternalCallExecutionActivationDecisionPreparedFromOro7e": true,
  "actualExternalCallExecutionActivationDecisionIssuedFromOro7e": true,
  "actualExternalCallExecutionActivationDecisionStatusFromOro7e": "approved_for_separate_actual_external_call_execution_runtime_enablement_request_only",
  "actualExternalCallExecutionActivationDecisionScopeFromOro7e": "activation_decision_only",
  "actualExternalCallExecutionRuntimeEnablementRequestPrepared": true,
  "actualExternalCallExecutionRuntimeEnablementRequestSubmitted": true,
  "actualExternalCallExecutionRuntimeEnablementRequestStatus": "submitted_pending_actual_external_call_execution_runtime_enablement_decision",
  "actualExternalCallExecutionRuntimeEnablementRequestScope": "runtime_enablement_request_only",
  "actualExternalCallExecutionRuntimeEnablementDecisionIssued": false,
  "actualExternalCallExecutionLiveExecutionApproved": false,
  "actualExternalCallExecutionActivated": false,
  "actualExternalCallExecutionRuntimeEnabled": false,
  "actualExternalCallExecutionEnabled": false,
  "externalCallExecutionPerformed": false,
  "externalNetworkAllowed": false,
  "liveOroPlayApiCallAllowed": false,
  "blockers": []
}
```

## Rollback and blocker rules

ORO-7F blocks if the ORO-7E activation decision dependency is missing; if
ORO-7E did not pass; if the ORO-7E activation decision was not issued; if the
ORO-7E status is not
`approved_for_separate_actual_external_call_execution_runtime_enablement_request_only`;
if the ORO-7E scope is not `activation_decision_only`; if the runtime
enablement request is not submitted with request-only scope; if the separate
runtime enablement decision requirement is missing; if human approval is not
required; if a runtime enablement decision is issued in this phase; if live
execution is approved; if actual execution is activated, enabled, authorized,
routed, or performed; if external network or live OroPlay is allowed; if
wallet, ledger, data write, DB transaction, migration, or deploy flags open;
or if sensitive-shaped output is present.
