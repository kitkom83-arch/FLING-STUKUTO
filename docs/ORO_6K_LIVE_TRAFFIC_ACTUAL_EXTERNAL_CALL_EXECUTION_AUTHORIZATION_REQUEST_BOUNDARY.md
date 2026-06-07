# ORO-6K Live Traffic Actual External Call Execution Authorization Request Boundary

## Purpose

ORO-6K records the actual external call execution authorization request after
ORO-6J proved the pre-execution readiness gate. This phase submits a
static/mock request for a later actual execution decision. It does not issue
that decision, does not authorize actual execution, does not perform execution,
and does not open any runtime network path.

## Dependency on ORO-6J

ORO-6K depends on the ORO-6J pre-execution readiness gate:

- dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate = true
- oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed = true
- preExecutionReadinessGatePreparedFromOro6j = true
- preExecutionReadinessGateEvaluatedFromOro6j = true
- preExecutionReadinessGatePassedFromOro6j = true
- preExecutionReadinessGateStatusFromOro6j = ready_for_separate_actual_external_call_execution_authorization_request
- actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j = false
- actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j = false
- actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j = false
- actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j = not_requested
- actualExternalCallExecutionAuthorizedFromOro6j = false
- externalCallExecutionAuthorizedFromOro6j = false
- externalCallExecutionPerformedFromOro6j = false
- externalNetworkAllowedFromOro6j = false
- liveOroPlayApiCallAllowedFromOro6j = false

The ORO-6J readiness status means the mock state may submit an actual execution
authorization request. It is not an actual execution decision, not actual
execution authorization, not a network grant, and not a live OroPlay call
grant.

## Dependency on ORO-6I

ORO-6K preserves the ORO-6I readiness-only decision evidence passed through
ORO-6J:

- dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary = true
- oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed = true
- externalCallExecutionAuthorizationDecisionStatusFromOro6i = approved_for_pre_execution_readiness_only
- externalCallExecutionAuthorizationDecisionScopeFromOro6i = pre_execution_readiness_only

## Actual external call execution authorization request boundary

ORO-6K may issue only the actual execution authorization request:

- actualExternalCallExecutionAuthorizationRequestPrepared = true
- actualExternalCallExecutionAuthorizationRequestSubmitted = true
- actualExternalCallExecutionAuthorizationRequestStatus = submitted_pending_actual_execution_decision

The submitted request asks for a future decision. Request submitted is not
decision issued, is not actual execution authorization, and is not external
call execution.

## Actual execution decision remains pending

ORO-6K keeps the actual execution decision and execution absent:

- actualExternalCallExecutionAuthorizationDecisionIssued = false
- actualExternalCallExecutionAuthorizationDecisionStatus = pending
- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

If request submission ever makes `actualExternalCallExecutionAuthorized` true,
or if ORO-6K issues a decision, the phase must fail closed.

## Still-no-external-call safety

ORO-6K keeps all external/live call activity disabled:

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

The next phase must add a separate actual external call execution
authorization decision. ORO-6K does not issue the actual execution decision,
does not authorize actual execution, and does not perform actual execution.
ORO-6L actual external call execution authorization decision boundary is required next.
That ORO-6L decision may be
`approved_for_live_execution_readiness_only`, but ORO-6L still does not authorize actual execution or perform actual execution.

## Secret redaction rules

ORO-6K records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Actual execution authorization request output JSON

```json
{
  "phase": "ORO-6K",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionAuthorizationRequestFixture",
  "liveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryResult": "PASS",
  "dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate": true,
  "oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed": true,
  "preExecutionReadinessGatePreparedFromOro6j": true,
  "preExecutionReadinessGateEvaluatedFromOro6j": true,
  "preExecutionReadinessGatePassedFromOro6j": true,
  "preExecutionReadinessGateStatusFromOro6j": "ready_for_separate_actual_external_call_execution_authorization_request",
  "actualExternalCallExecutionAuthorizationRequestPreparedFromOro6j": false,
  "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6j": false,
  "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6j": false,
  "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6j": "not_requested",
  "actualExternalCallExecutionAuthorizedFromOro6j": false,
  "externalCallExecutionAuthorizedFromOro6j": false,
  "externalCallExecutionPerformedFromOro6j": false,
  "externalNetworkAllowedFromOro6j": false,
  "liveOroPlayApiCallAllowedFromOro6j": false,
  "dependsOnOro6iLiveTrafficExternalCallExecutionAuthorizationDecisionBoundary": true,
  "oro6iLiveTrafficExternalCallExecutionAuthorizationDecisionPassed": true,
  "externalCallExecutionAuthorizationDecisionStatusFromOro6i": "approved_for_pre_execution_readiness_only",
  "externalCallExecutionAuthorizationDecisionScopeFromOro6i": "pre_execution_readiness_only",
  "actualExternalCallExecutionAuthorizationRequestPrepared": true,
  "actualExternalCallExecutionAuthorizationRequestSubmitted": true,
  "actualExternalCallExecutionAuthorizationRequestStatus": "submitted_pending_actual_execution_decision",
  "actualExternalCallExecutionAuthorizationDecisionIssued": false,
  "actualExternalCallExecutionAuthorizationDecisionStatus": "pending",
  "actualExternalCallExecutionAuthorized": false,
  "externalCallExecutionAuthorized": false,
  "externalCallExecutionPerformed": false,
  "nextPhaseRequiresSeparateActualExternalCallExecutionAuthorizationDecision": true,
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

ORO-6K blocks if the ORO-6J readiness gate record is missing, not passed, or
not `ready_for_separate_actual_external_call_execution_authorization_request`;
if ORO-6J already submitted an actual execution request, issued a decision,
authorized execution, performed execution, opened external network, or allowed
live OroPlay; if the ORO-6I readiness-only decision is missing or unsafe; if
the ORO-6K request is not `submitted_pending_actual_execution_decision`; if
ORO-6K issues a decision, authorizes execution, or performs execution; if
external network appears; if live OroPlay appears; if any mutation, persistent
write, migration, or deploy appears; if protected runtime, data, env, lock, or
staging example files are touched; or if sensitive-shaped output is detected.
