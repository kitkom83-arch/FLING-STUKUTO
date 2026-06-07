# ORO-6U Live Traffic Actual External Call Execution Activation Decision Boundary

## Purpose

ORO-6U records the actual external call execution activation decision after
ORO-6T submitted the activation request. This phase issues an
activation-readiness-only decision record. It does not activate actual
execution, enable runtime execution, perform execution, open network access, or
call live OroPlay.

## Dependency on ORO-6T

ORO-6U depends on the ORO-6T activation request boundary:

- dependsOnOro6tLiveTrafficActualExternalCallExecutionActivationRequestBoundary = true
- oro6tLiveTrafficActualExternalCallExecutionActivationRequestPassed = true
- actualExternalCallExecutionActivationRequestPreparedFromOro6t = true
- actualExternalCallExecutionActivationRequestSubmittedFromOro6t = true
- actualExternalCallExecutionActivationRequestStatusFromOro6t = submitted_pending_activation_decision
- actualExternalCallExecutionActivationDecisionIssuedFromOro6t = false
- actualExternalCallExecutionActivationDecisionStatusFromOro6t = pending
- actualExternalCallExecutionActivatedFromOro6t = false
- actualExternalCallExecutionRuntimeEnabledFromOro6t = false
- actualExternalCallExecutionEnabledFromOro6t = false
- actualExternalCallExecutionAuthorizedFromOro6t = false
- externalCallExecutionAuthorizedFromOro6t = false
- externalCallExecutionPerformedFromOro6t = false
- externalNetworkAllowedFromOro6t = false
- liveOroPlayApiCallAllowedFromOro6t = false

ORO-6U also carries forward the ORO-6S runtime final readiness evidence:

- dependsOnOro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGate = true
- oro6sLiveTrafficActualExternalCallExecutionRuntimeFinalReadinessGatePassed = true
- runtimeFinalReadinessGateStatusFromOro6s = ready_for_separate_actual_external_call_execution_activation_request

## Actual external call execution activation decision boundary

ORO-6U may record only the activation-readiness decision:

- actualExternalCallExecutionActivationDecisionPrepared = true
- actualExternalCallExecutionActivationDecisionIssued = true
- actualExternalCallExecutionActivationDecisionStatus = approved_for_activation_readiness_only
- actualExternalCallExecutionActivationDecisionScope = activation_readiness_only

The activation, execution, and runtime boundaries remain closed:

- actualExternalCallExecutionActivated = false
- actualExternalCallExecutionRuntimeEnabled = false
- actualExternalCallExecutionEnabled = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Why decision issued still is activation-readiness-only

The status `approved_for_activation_readiness_only` and scope
`activation_readiness_only` mean the activation decision record is ready for a
later final readiness gate. It is not actual activation, runtime enablement,
actual execution authorization, network approval, or live OroPlay call
approval.

## Why ORO-6U still does not activate actual execution

ORO-6U is the activation decision boundary only. A later phase must pass a
separate activation final readiness gate and a separate live execution request
before any activation, runtime enablement, actual execution enablement,
authorization, external call execution, or live OroPlay call can occur.

## Still-no-external-call safety

ORO-6U keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-6U is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-6U keeps all mutation and persistence paths closed:

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

The phase does not call live OroPlay. It only records static decision evidence
that can be checked by the local smoke harness.

## Next phase expectations

The next phase must pass a separate actual external call execution activation
final readiness gate before any live execution request can occur. ORO-6U still
does not activate actual execution, does not enable runtime execution, and does
not perform actual execution.

ORO-6V activation final readiness gate is required next and must report
ready_for_separate_actual_external_call_execution_live_execution_request before
any later live execution request phase. ORO-6V still does not submit live execution request. ORO-6V does not approve live execution, does not activate actual execution, and does not call live OroPlay.

## Sensitive output rules

ORO-6U records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Activation decision output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-6U",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionActivationDecisionFixture",
  "liveTrafficActualExternalCallExecutionActivationDecisionBoundaryResult": "PASS",
  "actualExternalCallExecutionActivationRequestStatusFromOro6t": "submitted_pending_activation_decision",
  "actualExternalCallExecutionActivationDecisionStatus": "approved_for_activation_readiness_only",
  "actualExternalCallExecutionActivationDecisionScope": "activation_readiness_only",
  "actualExternalCallExecutionActivated": false,
  "actualExternalCallExecutionRuntimeEnabled": false,
  "externalCallExecutionPerformed": false,
  "externalNetworkAllowed": false,
  "liveOroPlayApiCallAllowed": false,
  "blockers": []
}
```

## Rollback and blocker rules

ORO-6U blocks if the ORO-6T activation request boundary is missing or unsafe;
if ORO-6T did not submit the activation request; if the ORO-6T request status
is not `submitted_pending_activation_decision`; if ORO-6T already issued an
activation decision; if ORO-6T activated, enabled, authorized, or performed
execution; if ORO-6T allowed external network or live OroPlay; if the ORO-6S
runtime final readiness evidence is missing or unsafe; if the ORO-6U decision
is not issued with `approved_for_activation_readiness_only` and
`activation_readiness_only`; if actual execution is activated, enabled,
authorized, or performed; if external network or live OroPlay is allowed; if
wallet, ledger, data write, DB transaction, migration, or deploy flags open; or
if sensitive-shaped output is present.
