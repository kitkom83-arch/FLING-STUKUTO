# ORO-6W Live Traffic Actual External Call Execution Live Execution Request Boundary

## Purpose

ORO-6W records the actual external call execution live execution request after
ORO-6V passed the activation final readiness gate. This phase submits a request
for a later live execution decision. It does not issue that decision, approve
live execution, activate actual execution, enable runtime execution, perform
execution, open network access, or call live OroPlay.

## Dependency on ORO-6V

ORO-6W depends on the ORO-6V activation final readiness gate:

- dependsOnOro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGate = true
- oro6vLiveTrafficActualExternalCallExecutionActivationFinalReadinessGatePassed = true
- activationFinalReadinessGatePreparedFromOro6v = true
- activationFinalReadinessGateEvaluatedFromOro6v = true
- activationFinalReadinessGatePassedFromOro6v = true
- activationFinalReadinessGateStatusFromOro6v = ready_for_separate_actual_external_call_execution_live_execution_request
- actualExternalCallExecutionLiveExecutionRequestPreparedFromOro6v = false
- actualExternalCallExecutionLiveExecutionRequestSubmittedFromOro6v = false
- actualExternalCallExecutionLiveExecutionDecisionIssuedFromOro6v = false
- actualExternalCallExecutionLiveExecutionDecisionStatusFromOro6v = not_requested
- actualExternalCallExecutionLiveExecutionApprovedFromOro6v = false
- actualExternalCallExecutionActivatedFromOro6v = false
- actualExternalCallExecutionRuntimeEnabledFromOro6v = false
- actualExternalCallExecutionEnabledFromOro6v = false
- actualExternalCallExecutionAuthorizedFromOro6v = false
- externalCallExecutionAuthorizedFromOro6v = false
- externalCallExecutionPerformedFromOro6v = false
- externalNetworkAllowedFromOro6v = false
- liveOroPlayApiCallAllowedFromOro6v = false

ORO-6W also carries forward the ORO-6U activation decision evidence:

- dependsOnOro6uLiveTrafficActualExternalCallExecutionActivationDecisionBoundary = true
- oro6uLiveTrafficActualExternalCallExecutionActivationDecisionPassed = true
- actualExternalCallExecutionActivationDecisionStatusFromOro6u = approved_for_activation_readiness_only
- actualExternalCallExecutionActivationDecisionScopeFromOro6u = activation_readiness_only

## Actual external call execution live execution request boundary

ORO-6W may record only the live execution request:

- actualExternalCallExecutionLiveExecutionRequestPrepared = true
- actualExternalCallExecutionLiveExecutionRequestSubmitted = true
- actualExternalCallExecutionLiveExecutionRequestStatus = submitted_pending_live_execution_decision

The live execution decision and approval remain closed:

- actualExternalCallExecutionLiveExecutionDecisionIssued = false
- actualExternalCallExecutionLiveExecutionDecisionStatus = pending
- actualExternalCallExecutionLiveExecutionApproved = false

The activation, execution, and runtime boundaries remain closed:

- actualExternalCallExecutionActivated = false
- actualExternalCallExecutionRuntimeEnabled = false
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why request submitted still is not decision issued

The status `submitted_pending_live_execution_decision` means only that the
request record exists and is waiting for a separate live execution decision. It
is not an approval, activation, runtime enablement, execution authorization,
network approval, or live OroPlay call approval.

## Why ORO-6W still does not approve live execution

ORO-6W is the live execution request boundary only. A later phase must issue a
separate live execution decision before any live execution can be approved.

## Why ORO-6W still does not execute external call

Submitting a live execution request is not execution. ORO-6W does not activate
actual execution, does not enable runtime execution, does not authorize actual
execution, and does not perform an external call.

## Still-no-external-call safety

ORO-6W keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-6W is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-6W keeps all mutation and persistence paths closed:

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

The phase does not call live OroPlay. It only records static live execution
request evidence that can be checked by the local smoke harness.

## Next phase expectations

The next phase must issue a separate actual external call execution live
execution decision. ORO-6W still does not approve live execution, does not
activate actual execution, does not enable runtime execution, and does not
perform actual execution.

## Sensitive output rules

ORO-6W records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Live execution request output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-6W",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionLiveExecutionRequestFixture",
  "liveTrafficActualExternalCallExecutionLiveExecutionRequestBoundaryResult": "PASS",
  "activationFinalReadinessGateStatusFromOro6v": "ready_for_separate_actual_external_call_execution_live_execution_request",
  "actualExternalCallExecutionLiveExecutionRequestPrepared": true,
  "actualExternalCallExecutionLiveExecutionRequestSubmitted": true,
  "actualExternalCallExecutionLiveExecutionRequestStatus": "submitted_pending_live_execution_decision",
  "actualExternalCallExecutionLiveExecutionDecisionIssued": false,
  "actualExternalCallExecutionLiveExecutionDecisionStatus": "pending",
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

ORO-6W blocks if the ORO-6V activation final readiness gate is missing or
unsafe; if the ORO-6V gate did not pass; if the ORO-6V status is not
`ready_for_separate_actual_external_call_execution_live_execution_request`; if
ORO-6V already submitted or decided a live execution request; if ORO-6V
activated, enabled, authorized, or performed execution; if ORO-6V allowed
external network or live OroPlay; if the ORO-6U activation-readiness-only
decision evidence is missing or unsafe; if the ORO-6W request is not submitted
with `submitted_pending_live_execution_decision`; if a live execution decision
is issued or approved; if actual execution is activated, enabled, authorized,
or performed; if external network or live OroPlay is allowed; if wallet,
ledger, data write, DB transaction, migration, or deploy flags open; or if
sensitive-shaped output is present.
