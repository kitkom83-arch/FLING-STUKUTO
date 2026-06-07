# ORO-6I Live Traffic External Call Execution Authorization Decision Boundary

## Purpose

ORO-6I records the external/live OroPlay call execution authorization decision
after ORO-6H submitted the execution authorization request. The decision is
static/mock only and is approved only for pre-execution readiness. It does not
authorize the actual external call, does not perform execution, and does not
open any runtime network path.

## Dependency on ORO-6H

ORO-6I depends on the ORO-6H execution authorization request record:

- dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary = true
- oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed = true
- externalCallExecutionAuthorizationRequestPreparedFromOro6h = true
- externalCallExecutionAuthorizationRequestSubmittedFromOro6h = true
- externalCallExecutionAuthorizationRequestStatusFromOro6h = submitted_pending_execution_decision
- externalCallExecutionAuthorizationDecisionIssuedFromOro6h = false
- externalCallExecutionAuthorizationDecisionStatusFromOro6h = pending
- externalCallExecutionAuthorizedFromOro6h = false
- externalNetworkAllowedFromOro6h = false
- liveOroPlayApiCallAllowedFromOro6h = false

## Dependency on ORO-6G

ORO-6I preserves the ORO-6G readiness gate dependency passed through ORO-6H:

- dependsOnOro6gLiveTrafficExternalCallReadinessGate = true
- oro6gLiveTrafficExternalCallReadinessGatePassed = true
- externalCallReadinessGateStatusFromOro6g = ready_for_separate_execution_authorization_request

## Decision boundary

ORO-6I records only a readiness-only decision record:

- externalCallExecutionAuthorizationDecisionPrepared = true
- externalCallExecutionAuthorizationDecisionIssued = true
- externalCallExecutionAuthorizationDecisionStatus = approved_for_pre_execution_readiness_only
- externalCallExecutionAuthorizationDecisionScope = pre_execution_readiness_only
- externalCallExecutionAuthorized = false
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

## Decision status allowed values

The only passing decision status is
`approved_for_pre_execution_readiness_only`. This means the ORO-6H request has
been reviewed for pre-execution readiness only. It is not actual execution
authorization, not a network authorization, and not a live OroPlay call
authorization.

## Still-no-external-call safety

ORO-6I keeps all external/live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No mutation, persistence, deploy, or real-money statement

Wallet, ledger, persistent writes, DB transactions, migrations, deploy, payout,
auto-credit, runtime traffic, and real-money behavior remain blocked:

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

The next phase must add a separate pre-execution readiness gate and a separate
actual external call execution authorization. ORO-6I does not authorize or
perform actual execution.

ORO-6J pre-execution readiness gate is required next. ORO-6J does not submit actual execution authorization.
ORO-6J must only advance the static/mock state to
`ready_for_separate_actual_external_call_execution_authorization_request`.

## Secret redaction rules

ORO-6I records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Execution authorization decision output JSON

```json
{
  "phase": "ORO-6I",
  "fixtureId": "happyPathLiveTrafficExternalCallExecutionAuthorizationDecisionFixture",
  "liveTrafficExternalCallExecutionAuthorizationDecisionBoundaryResult": "PASS",
  "dependsOnOro6hLiveTrafficExternalCallExecutionAuthorizationRequestBoundary": true,
  "oro6hLiveTrafficExternalCallExecutionAuthorizationRequestPassed": true,
  "externalCallExecutionAuthorizationRequestPreparedFromOro6h": true,
  "externalCallExecutionAuthorizationRequestSubmittedFromOro6h": true,
  "externalCallExecutionAuthorizationRequestStatusFromOro6h": "submitted_pending_execution_decision",
  "externalCallExecutionAuthorizationDecisionIssuedFromOro6h": false,
  "externalCallExecutionAuthorizationDecisionStatusFromOro6h": "pending",
  "externalCallExecutionAuthorizedFromOro6h": false,
  "externalNetworkAllowedFromOro6h": false,
  "liveOroPlayApiCallAllowedFromOro6h": false,
  "dependsOnOro6gLiveTrafficExternalCallReadinessGate": true,
  "oro6gLiveTrafficExternalCallReadinessGatePassed": true,
  "externalCallReadinessGateStatusFromOro6g": "ready_for_separate_execution_authorization_request",
  "externalCallExecutionAuthorizationDecisionPrepared": true,
  "externalCallExecutionAuthorizationDecisionIssued": true,
  "externalCallExecutionAuthorizationDecisionStatus": "approved_for_pre_execution_readiness_only",
  "externalCallExecutionAuthorizationDecisionScope": "pre_execution_readiness_only",
  "externalCallExecutionAuthorized": false,
  "actualExternalCallExecutionAuthorized": false,
  "externalCallExecutionPerformed": false,
  "nextPhaseRequiresSeparatePreExecutionReadinessGate": true,
  "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorization": true,
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

ORO-6I blocks if the ORO-6H request record is missing, not passed, not
submitted, not `submitted_pending_execution_decision`, already decided, or
already authorized execution; if the ORO-6G readiness gate evidence is missing
or not `ready_for_separate_execution_authorization_request`; if the ORO-6I
decision is not `approved_for_pre_execution_readiness_only`; if the decision
scope is not `pre_execution_readiness_only`; if actual execution is authorized
or performed; if external network appears; if live OroPlay appears; if any
mutation, persistent write, migration, or deploy appears; if protected runtime
files are touched; or if sensitive-shaped output is detected.
