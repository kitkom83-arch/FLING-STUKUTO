# ORO-6Z Live Traffic Actual External Call Execution Final Execution Request Boundary

## Purpose

ORO-6Z records the final execution request after ORO-6Y passed the live
execution final readiness gate. This phase submits a request record only. It
does not issue the final execution decision, approve live execution, activate
actual execution, enable runtime execution, perform execution, open network
access, or call live OroPlay.

## Dependency on ORO-6Y

ORO-6Z depends on the ORO-6Y live execution final readiness gate:

- dependsOnOro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGate = true
- oro6yLiveTrafficActualExternalCallExecutionLiveExecutionFinalReadinessGatePassed = true
- actualExternalCallExecutionLiveExecutionFinalReadinessGatePreparedFromOro6y = true
- actualExternalCallExecutionLiveExecutionFinalReadinessGateEvaluatedFromOro6y = true
- actualExternalCallExecutionLiveExecutionFinalReadinessGatePassedFromOro6y = true
- actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y = ready_for_separate_actual_external_call_execution_final_execution_request
- actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y = final_readiness_only

ORO-6Y must remain final-readiness-only and must not have submitted a final
execution request, issued a final execution decision, approved live execution,
activated actual execution, enabled runtime execution, performed execution,
opened external network access, or called live OroPlay.

## Final execution request boundary

ORO-6Z may record only the final execution request:

- actualExternalCallExecutionFinalExecutionRequestPrepared = true
- actualExternalCallExecutionFinalExecutionRequestSubmitted = true
- actualExternalCallExecutionFinalExecutionRequestStatus = submitted_pending_actual_external_call_execution_decision
- actualExternalCallExecutionFinalExecutionRequestScope = final_execution_request_only

The final decision and execution boundaries remain closed:

- actualExternalCallExecutionFinalExecutionDecisionIssued = false
- actualExternalCallExecutionLiveExecutionApproved = false
- actualExternalCallExecutionActivated = false
- actualExternalCallExecutionRuntimeEnabled = false
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why this still is not execution approval

The status `submitted_pending_actual_external_call_execution_decision` and
scope `final_execution_request_only` mean only that a later separate decision
phase may evaluate the request. They are not live execution approval,
activation, runtime enablement, execution authorization, network approval, or
live OroPlay call approval.

## Still-no-external-call safety

ORO-6Z keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-6Z is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-6Z keeps all mutation and persistence paths closed:

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

The phase does not call live OroPlay. It only records static final execution
request evidence that can be checked by the local smoke harness.

## Next phase expectations

The next phase must issue a separate actual external call execution final
decision before any live execution approval or actual execution can occur.
ORO-6Z still does not approve live execution, activate actual execution, enable
runtime execution, authorize execution, or perform actual execution.

ORO-7A final execution decision boundary is required next. The next phase may
record
`approved_for_separate_actual_external_call_execution_authorization_request_only`
with `final_execution_decision_only` scope, but it still must not submit the
authorization request, approve live execution, activate actual execution,
enable runtime execution, or perform any external call execution.

## Sensitive output rules

ORO-6Z records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped credential material.

## Final execution request output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-6Z",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryFixture",
  "liveTrafficActualExternalCallExecutionFinalExecutionRequestBoundaryResult": "PASS",
  "actualExternalCallExecutionLiveExecutionFinalReadinessGateStatusFromOro6y": "ready_for_separate_actual_external_call_execution_final_execution_request",
  "actualExternalCallExecutionLiveExecutionFinalReadinessGateScopeFromOro6y": "final_readiness_only",
  "actualExternalCallExecutionFinalExecutionRequestStatus": "submitted_pending_actual_external_call_execution_decision",
  "actualExternalCallExecutionFinalExecutionRequestScope": "final_execution_request_only",
  "actualExternalCallExecutionFinalExecutionDecisionIssued": false,
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

ORO-6Z blocks if the ORO-6Y final readiness gate dependency is missing; if
ORO-6Y did not pass; if the ORO-6Y status is not
`ready_for_separate_actual_external_call_execution_final_execution_request`;
if the ORO-6Y scope is not `final_readiness_only`; if the final execution
request is not prepared and submitted as `final_execution_request_only`; if a
separate human approval requirement is missing; if a final execution decision
is already issued; if live execution is approved; if actual execution is
activated, enabled, authorized, or performed; if external network or live
OroPlay is allowed; if wallet, ledger, data write, DB transaction, migration,
or deploy flags open; or if sensitive-shaped output is present.
