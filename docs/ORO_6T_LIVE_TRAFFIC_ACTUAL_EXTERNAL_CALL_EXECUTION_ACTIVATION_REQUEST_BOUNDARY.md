# ORO-6T Live Traffic Actual External Call Execution Activation Request Boundary

## Purpose

ORO-6T records the actual external call execution activation request after
ORO-6S passed the runtime final readiness gate. This phase submits the request
record only. It does not issue the activation decision, activate actual
execution, enable runtime execution, perform execution, open network access, or
call live OroPlay.

## Dependency on ORO-6S

ORO-6T depends on the ORO-6S runtime final readiness gate:

- dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate = true
- oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed = true
- runtimeFinalReadinessGatePreparedFromOro6s = true
- runtimeFinalReadinessGateEvaluatedFromOro6s = true
- runtimeFinalReadinessGatePassedFromOro6s = true
- runtimeFinalReadinessGateStatusFromOro6s = ready_for_separate_actual_external_call_execution_activation_request
- actualExternalCallExecutionActivationRequestPreparedFromOro6s = false
- actualExternalCallExecutionActivationRequestSubmittedFromOro6s = false
- actualExternalCallExecutionActivationDecisionIssuedFromOro6s = false
- actualExternalCallExecutionActivationDecisionStatusFromOro6s = not_requested
- actualExternalCallExecutionActivatedFromOro6s = false
- actualExternalCallExecutionRuntimeEnabledFromOro6s = false
- actualExternalCallExecutionEnabledFromOro6s = false
- actualExternalCallExecutionAuthorizedFromOro6s = false
- externalCallExecutionAuthorizedFromOro6s = false
- externalCallExecutionPerformedFromOro6s = false
- externalNetworkAllowedFromOro6s = false
- liveOroPlayApiCallAllowedFromOro6s = false

ORO-6T also carries forward the ORO-6R runtime enablement decision evidence:

- dependsOnOro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionBoundary = true
- oro6rLiveTrafficActualExternalCallExecutionRuntimeEnablementDecisionPassed = true
- actualExternalCallExecutionRuntimeEnablementDecisionStatusFromOro6r = approved_for_runtime_execution_readiness_only
- actualExternalCallExecutionRuntimeEnablementDecisionScopeFromOro6r = runtime_execution_readiness_only

## Actual external call execution activation request boundary

ORO-6T may record only the activation request:

- actualExternalCallExecutionActivationRequestPrepared = true
- actualExternalCallExecutionActivationRequestSubmitted = true
- actualExternalCallExecutionActivationRequestStatus = submitted_pending_activation_decision

The decision, activation, execution, and runtime boundaries remain closed:

- actualExternalCallExecutionActivationDecisionIssued = false
- actualExternalCallExecutionActivationDecisionStatus = pending
- actualExternalCallExecutionActivated = false
- actualExternalCallExecutionRuntimeEnabled = false
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why request submitted still is not decision issued

The request status `submitted_pending_activation_decision` means ORO-6T has
created the static request record for human review. It is not an approval, not
an activation decision, and not permission to perform any live external call
execution.

## Why ORO-6T still does not activate actual execution

ORO-6T is the activation request boundary only. A later phase must issue a
separate activation decision before any activation, runtime enablement, actual
execution enablement, authorization, external call execution, or live OroPlay
call can occur.

## Still-no-external-call safety

ORO-6T keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-6T is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-6T keeps all mutation and persistence paths closed:

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

The next phase must issue a separate actual external call execution activation
decision before any activation can occur. ORO-6T still does not issue that
decision, does not activate actual execution, does not enable runtime
execution, and does not perform actual execution.

ORO-6U actual external call execution activation decision boundary is required next.
ORO-6U may issue `approved_for_activation_readiness_only` with
`activation_readiness_only` scope only. ORO-6U still does not activate actual execution, enable runtime execution, perform execution, open external network, or call live OroPlay.

## Sensitive output rules

ORO-6T records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Activation request output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-6T",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionActivationRequestFixture",
  "liveTrafficActualExternalCallExecutionActivationRequestBoundaryResult": "PASS",
  "runtimeFinalReadinessGateStatusFromOro6s": "ready_for_separate_actual_external_call_execution_activation_request",
  "actualExternalCallExecutionActivationRequestSubmitted": true,
  "actualExternalCallExecutionActivationRequestStatus": "submitted_pending_activation_decision",
  "actualExternalCallExecutionActivationDecisionIssued": false,
  "actualExternalCallExecutionActivationDecisionStatus": "pending",
  "actualExternalCallExecutionActivated": false,
  "actualExternalCallExecutionRuntimeEnabled": false,
  "externalCallExecutionPerformed": false,
  "externalNetworkAllowed": false,
  "liveOroPlayApiCallAllowed": false,
  "blockers": []
}
```

## Rollback and blocker rules

ORO-6T blocks if the ORO-6S runtime final readiness gate is missing or unsafe;
if the ORO-6S gate did not pass; if the ORO-6S status is not
`ready_for_separate_actual_external_call_execution_activation_request`; if
ORO-6S already submitted activation request or decision; if ORO-6S activated,
enabled, authorized, or performed execution; if ORO-6S allowed external network
or live OroPlay; if the ORO-6R runtime enablement decision evidence is missing
or unsafe; if the activation request is not submitted as
`submitted_pending_activation_decision`; if activation decision flags open; if
actual execution is activated, enabled, authorized, or performed; if external
network or live OroPlay is allowed; if wallet, ledger, data write, DB
transaction, migration, or deploy flags open; or if sensitive-shaped output is
present.
