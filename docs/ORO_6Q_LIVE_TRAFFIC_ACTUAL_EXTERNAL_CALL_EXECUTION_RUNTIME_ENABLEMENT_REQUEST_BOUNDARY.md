# ORO-6Q Live Traffic Actual External Call Execution Runtime Enablement Request Boundary

## Purpose

ORO-6Q records the actual external call execution runtime enablement request
after ORO-6P passed the final live execution readiness gate. This phase submits
the request as a static/mock record only. It does not issue the runtime
enablement decision, enable runtime execution, perform execution, open network
access, or call live OroPlay.

## Dependency on ORO-6P

ORO-6Q depends on the ORO-6P final readiness gate:

- dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate = true
- oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed = true
- finalLiveExecutionReadinessGatePreparedFromOro6p = true
- finalLiveExecutionReadinessGateEvaluatedFromOro6p = true
- finalLiveExecutionReadinessGatePassedFromOro6p = true
- finalLiveExecutionReadinessGateStatusFromOro6p = ready_for_separate_actual_external_call_execution_runtime_enablement_request

ORO-6P must still show that no runtime enablement request had already been
submitted:

- actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p = false
- actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p = false
- actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p = false
- actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p = not_requested
- actualExternalCallExecutionRuntimeEnabledFromOro6p = false
- actualExternalCallExecutionEnabledFromOro6p = false
- actualExternalCallExecutionAuthorizedFromOro6p = false
- externalCallExecutionAuthorizedFromOro6p = false
- externalCallExecutionPerformedFromOro6p = false
- externalNetworkAllowedFromOro6p = false
- liveOroPlayApiCallAllowedFromOro6p = false

ORO-6Q also carries forward the final readiness-only ORO-6O decision evidence:

- dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary = true
- oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed = true
- actualExternalCallExecutionEnablementDecisionStatusFromOro6o = approved_for_final_live_execution_readiness_only
- actualExternalCallExecutionEnablementDecisionScopeFromOro6o = final_live_execution_readiness_only

## Actual external call execution runtime enablement request boundary

ORO-6Q may record only the runtime enablement request submission:

- actualExternalCallExecutionRuntimeEnablementRequestPrepared = true
- actualExternalCallExecutionRuntimeEnablementRequestSubmitted = true
- actualExternalCallExecutionRuntimeEnablementRequestStatus = submitted_pending_runtime_enablement_decision

The request remains pending a separate decision:

- actualExternalCallExecutionRuntimeEnablementDecisionIssued = false
- actualExternalCallExecutionRuntimeEnablementDecisionStatus = pending
- actualExternalCallExecutionRuntimeEnabled = false

The execution boundary remains closed:

- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why request submitted still is not decision issued

The ORO-6Q request status `submitted_pending_runtime_enablement_decision`
means the request record exists and is awaiting a later decision. It is not a
decision, approval, runtime switch, or permission to execute. Any fixture that
combines this request with a decision-issued state must fail closed.

## Why ORO-6Q still does not enable runtime execution

ORO-6Q is the runtime enablement request submission boundary only. The separate
runtime enablement decision remains pending, so runtime execution must remain
disabled. The phase keeps `actualExternalCallExecutionRuntimeEnabled = false`,
`actualExternalCallExecutionEnabled = false`, and
`externalCallExecutionPerformed = false`.

## Still-no-external-call safety

ORO-6Q keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-6Q is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-6Q keeps all mutation and persistence paths closed:

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

The phase does not call live OroPlay. It only records static request evidence
that can be checked by the local smoke harness.

## Next phase expectations

The next phase must issue a separate actual external call execution runtime
enablement decision before any runtime execution can be enabled. ORO-6Q still
does not issue that decision, does not enable actual execution, does not
authorize actual execution, and does not perform actual execution.

## Sensitive output rules

ORO-6Q records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Runtime enablement request output JSON

The happy-path smoke output must stay shaped as follows:

```json
{
  "phase": "ORO-6Q",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionRuntimeEnablementRequestFixture",
  "liveTrafficActualExternalCallExecutionRuntimeEnablementRequestBoundaryResult": "PASS",
  "dependsOnOro6pLiveTrafficActualExternalCallExecutionFinalReadinessGate": true,
  "oro6pLiveTrafficActualExternalCallExecutionFinalReadinessGatePassed": true,
  "finalLiveExecutionReadinessGatePreparedFromOro6p": true,
  "finalLiveExecutionReadinessGateEvaluatedFromOro6p": true,
  "finalLiveExecutionReadinessGatePassedFromOro6p": true,
  "finalLiveExecutionReadinessGateStatusFromOro6p": "ready_for_separate_actual_external_call_execution_runtime_enablement_request",
  "actualExternalCallExecutionRuntimeEnablementRequestPreparedFromOro6p": false,
  "actualExternalCallExecutionRuntimeEnablementRequestSubmittedFromOro6p": false,
  "actualExternalCallExecutionRuntimeEnablementDecisionIssuedFromOro6p": false,
  "actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6p": "not_requested",
  "actualExternalCallExecutionRuntimeEnabledFromOro6p": false,
  "actualExternalCallExecutionEnabledFromOro6p": false,
  "actualExternalCallExecutionAuthorizedFromOro6p": false,
  "externalCallExecutionAuthorizedFromOro6p": false,
  "externalCallExecutionPerformedFromOro6p": false,
  "externalNetworkAllowedFromOro6p": false,
  "liveOroPlayApiCallAllowedFromOro6p": false,
  "dependsOnOro6oLiveTrafficActualExternalCallExecutionEnablementDecisionBoundary": true,
  "oro6oLiveTrafficActualExternalCallExecutionEnablementDecisionPassed": true,
  "actualExternalCallExecutionEnablementDecisionStatusFromOro6o": "approved_for_final_live_execution_readiness_only",
  "actualExternalCallExecutionEnablementDecisionScopeFromOro6o": "final_live_execution_readiness_only",
  "actualExternalCallExecutionRuntimeEnablementRequestPrepared": true,
  "actualExternalCallExecutionRuntimeEnablementRequestSubmitted": true,
  "actualExternalCallExecutionRuntimeEnablementRequestStatus": "submitted_pending_runtime_enablement_decision",
  "actualExternalCallExecutionRuntimeEnablementDecisionIssued": false,
  "actualExternalCallExecutionRuntimeEnablementDecisionStatus": "pending",
  "actualExternalCallExecutionRuntimeEnabled": false,
  "actualExternalCallExecutionEnabled": false,
  "actualExternalCallExecutionAuthorized": false,
  "externalCallExecutionAuthorized": false,
  "externalCallExecutionPerformed": false,
  "nextPhaseRequiresSeparateActualExternalCallExecutionRuntimeEnablementDecision": true,
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

ORO-6Q blocks if the ORO-6P final readiness gate is missing or unsafe; if the
ORO-6P gate did not pass; if the ORO-6P status is not
`ready_for_separate_actual_external_call_execution_runtime_enablement_request`;
if ORO-6P already submitted a runtime enablement request or issued a runtime
enablement decision; if ORO-6P enabled runtime execution, enabled actual
execution, authorized actual execution, performed execution, allowed external
network, or allowed live OroPlay; if the ORO-6O final readiness-only decision
evidence is missing or unsafe; if the ORO-6Q request is not submitted as
`submitted_pending_runtime_enablement_decision`; if ORO-6Q issues a runtime
enablement decision; if runtime execution is enabled; if actual execution is
enabled, authorized, or performed; if external network or live OroPlay is
allowed; if wallet, ledger, data write, DB transaction, migration, or deploy
flags open; or if sensitive-shaped output is present.
