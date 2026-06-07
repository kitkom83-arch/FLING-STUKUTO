# ORO-6N Live Traffic Actual External Call Execution Enablement Request Boundary

## Purpose

ORO-6N records the actual external call execution enablement request after
ORO-6M passed the live execution readiness gate. This phase submits a
mock/static request record only. It does not issue the enablement decision,
does not enable actual execution, does not authorize actual execution, and does
not open any runtime network path.

## Dependency on ORO-6M

ORO-6N depends on the ORO-6M live execution readiness gate:

- dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate = true
- oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed = true
- liveExecutionReadinessGatePreparedFromOro6m = true
- liveExecutionReadinessGateEvaluatedFromOro6m = true
- liveExecutionReadinessGatePassedFromOro6m = true
- liveExecutionReadinessGateStatusFromOro6m = ready_for_separate_actual_external_call_execution_enablement_request
- actualExternalCallExecutionEnablementRequestPreparedFromOro6m = false
- actualExternalCallExecutionEnablementRequestSubmittedFromOro6m = false
- actualExternalCallExecutionEnablementDecisionIssuedFromOro6m = false
- actualExternalCallExecutionEnablementDecisionStatusFromOro6m = not_requested
- actualExternalCallExecutionEnabledFromOro6m = false
- actualExternalCallExecutionAuthorizedFromOro6m = false
- externalCallExecutionAuthorizedFromOro6m = false
- externalCallExecutionPerformedFromOro6m = false
- externalNetworkAllowedFromOro6m = false
- liveOroPlayApiCallAllowedFromOro6m = false

ORO-6M must be passed, must carry the exact readiness status, and must not
already have submitted an enablement request or issued an enablement decision.

## Dependency on ORO-6L

ORO-6N preserves the readiness-only actual execution decision evidence passed
through ORO-6M:

- dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary = true
- oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed = true
- actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l = approved_for_live_execution_readiness_only
- actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l = live_execution_readiness_only

## Actual external call execution enablement request boundary

ORO-6N may record only the enablement request:

- actualExternalCallExecutionEnablementRequestPrepared = true
- actualExternalCallExecutionEnablementRequestSubmitted = true
- actualExternalCallExecutionEnablementRequestStatus = submitted_pending_enablement_decision

## Why request submission does not enable execution

The ORO-6N request record asks for a later enablement decision. It is not the
decision, not the execution enablement, and not actual external call execution.

ORO-6N keeps the decision and execution flags closed:

- actualExternalCallExecutionEnablementDecisionIssued = false
- actualExternalCallExecutionEnablementDecisionStatus = pending
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

If request submission ever enables actual execution, authorizes execution, or
performs external execution, the phase must fail closed.

## Still-no-external-call safety

ORO-6N keeps all external/live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No mutation, persistence, deploy, or real-money statement

Wallet, ledger, persistent writes, DB transactions, migrations, deploy, payout,
auto-credit, runtime traffic, route opening, and real-money behavior remain
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
- deployAllowed = false
- deployPerformed = false
- secretsLeaked = false

## Next phase expectations

The next phase must add a separate actual external call execution enablement
decision before execution can be enabled. ORO-6N still does not issue
enablement decision, does not enable actual execution, and does not perform
actual execution.

## Sensitive output rules

ORO-6N records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Actual execution enablement request output JSON

```json
{
  "phase": "ORO-6N",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionEnablementRequestFixture",
  "liveTrafficActualExternalCallExecutionEnablementRequestBoundaryResult": "PASS",
  "dependsOnOro6mLiveTrafficActualExternalCallExecutionReadinessGate": true,
  "oro6mLiveTrafficActualExternalCallExecutionReadinessGatePassed": true,
  "liveExecutionReadinessGatePreparedFromOro6m": true,
  "liveExecutionReadinessGateEvaluatedFromOro6m": true,
  "liveExecutionReadinessGatePassedFromOro6m": true,
  "liveExecutionReadinessGateStatusFromOro6m": "ready_for_separate_actual_external_call_execution_enablement_request",
  "actualExternalCallExecutionEnablementRequestPreparedFromOro6m": false,
  "actualExternalCallExecutionEnablementRequestSubmittedFromOro6m": false,
  "actualExternalCallExecutionEnablementDecisionIssuedFromOro6m": false,
  "actualExternalCallExecutionEnablementDecisionStatusFromOro6m": "not_requested",
  "actualExternalCallExecutionEnabledFromOro6m": false,
  "actualExternalCallExecutionAuthorizedFromOro6m": false,
  "externalCallExecutionAuthorizedFromOro6m": false,
  "externalCallExecutionPerformedFromOro6m": false,
  "externalNetworkAllowedFromOro6m": false,
  "liveOroPlayApiCallAllowedFromOro6m": false,
  "dependsOnOro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundary": true,
  "oro6lLiveTrafficActualExternalCallExecutionAuthorizationDecisionPassed": true,
  "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6l": "approved_for_live_execution_readiness_only",
  "actualExternalCallExecutionAuthorizationDecisionScopeFromOro6l": "live_execution_readiness_only",
  "actualExternalCallExecutionEnablementRequestPrepared": true,
  "actualExternalCallExecutionEnablementRequestSubmitted": true,
  "actualExternalCallExecutionEnablementRequestStatus": "submitted_pending_enablement_decision",
  "actualExternalCallExecutionEnablementDecisionIssued": false,
  "actualExternalCallExecutionEnablementDecisionStatus": "pending",
  "actualExternalCallExecutionEnabled": false,
  "actualExternalCallExecutionAuthorized": false,
  "externalCallExecutionAuthorized": false,
  "externalCallExecutionPerformed": false,
  "nextPhaseRequiresSeparateActualExternalCallExecutionEnablementDecision": true,
  "humanApprovalRequiredForActualExecution": true,
  "separateActualExecutionApprovalRequired": true,
  "externalNetworkAllowed": false,
  "externalNetworkCalled": false,
  "liveOroPlayApiCallAllowed": false,
  "liveOroPlayApiCalled": false,
  "walletMutationAllowed": false,
  "walletMutationPerformed": false,
  "ledgerMutationAllowed": false,
  "ledgerMutationPerformed": false,
  "prismaWriteAllowed": false,
  "prismaWritePerformed": false,
  "dbTransactionAllowed": false,
  "dbTransactionPerformed": false,
  "migrationAllowed": false,
  "migrationPerformed": false,
  "deployAllowed": false,
  "deployPerformed": false,
  "secretsLeaked": false,
  "blockers": []
}
```

## Rollback and blocker rules

ORO-6N blocks if the ORO-6M readiness gate is missing, not passed, or not
`ready_for_separate_actual_external_call_execution_enablement_request`; if
ORO-6M already submitted an enablement request, issued an enablement decision,
enabled actual execution, authorized execution, performed execution, opened
external network, or allowed live OroPlay; if the ORO-6L readiness-only
decision evidence is missing or unsafe; if the ORO-6N request status is not
`submitted_pending_enablement_decision`; if an enablement decision is issued;
if actual execution is enabled, authorized, or performed; if external network
appears; if live OroPlay appears; if any mutation, persistent write, migration,
or deploy appears; or if sensitive-shaped output is detected.
