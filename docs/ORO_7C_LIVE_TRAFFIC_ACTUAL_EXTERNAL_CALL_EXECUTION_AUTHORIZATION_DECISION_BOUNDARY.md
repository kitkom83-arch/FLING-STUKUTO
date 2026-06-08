# ORO-7C Live Traffic Actual External Call Execution Authorization Decision Boundary

## Purpose

ORO-7C records the actual external call execution authorization decision after
ORO-7B submitted the authorization request. This phase issues a decision
record only. The decision may approve moving to a separate activation request
gate, but it does not submit that activation request, approve live execution,
activate actual execution, enable runtime execution, perform execution, open
network access, or call live OroPlay.

## Dependency on ORO-7B

ORO-7C depends on the ORO-7B authorization request boundary:

- dependsOnOro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary = true
- oro7bLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundaryPassed = true
- actualExternalCallExecutionAuthorizationRequestPreparedFromOro7b = true
- actualExternalCallExecutionAuthorizationRequestSubmittedFromOro7b = true
- actualExternalCallExecutionAuthorizationRequestStatusFromOro7b = submitted_pending_actual_external_call_execution_authorization_decision
- actualExternalCallExecutionAuthorizationRequestScopeFromOro7b = authorization_request_only

ORO-7B must remain authorization-request-only and must not have issued an
authorization decision that approves actual execution, submitted an activation
request, approved live execution, activated actual execution, enabled runtime
execution, performed execution, opened external network access, or called live
OroPlay.

## Authorization decision boundary

ORO-7C may record only the authorization decision:

- actualExternalCallExecutionAuthorizationDecisionPrepared = true
- actualExternalCallExecutionAuthorizationDecisionIssued = true
- actualExternalCallExecutionAuthorizationDecisionStatus = approved_for_separate_actual_external_call_execution_activation_request_only
- actualExternalCallExecutionAuthorizationDecisionScope = authorization_decision_only

The activation and execution boundaries remain closed:

- actualExternalCallExecutionActivationRequestSubmitted = false
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
`approved_for_separate_actual_external_call_execution_activation_request_only`
and scope `authorization_decision_only` mean only that a later separate
activation request phase may be prepared. They are not actual live execution
approval, activation, runtime enablement, execution authorization, network
approval, or live OroPlay call approval.

## Still-no-external-call safety

ORO-7C keeps all external and live call activity disabled:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No real money

ORO-7C is static/mock evidence only. It does not create real-money movement,
payouts, credits, settlement, or balance effects.

## No wallet/ledger/Prisma mutation

ORO-7C keeps all mutation and persistence paths closed:

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

The phase does not call live OroPlay. It only records static authorization
decision evidence that can be checked by the local smoke harness.

## Next phase expectations

The next phase must submit a separate actual external call execution
activation request before any activation decision, actual execution approval,
or actual execution can occur. ORO-7C still does not approve actual execution,
activate actual execution, enable runtime execution, authorize execution, or
perform actual execution.

ORO-7D activation request boundary is required next. That next phase may
submit a request with
`submitted_pending_actual_external_call_execution_activation_decision` and
`activation_request_only`, but it still must not issue an activation decision
or perform actual external call execution.

## Sensitive output rules

ORO-7C records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped credential material.

## Authorization decision output JSON

The happy-path smoke output must include:

```json
{
  "phase": "ORO-7C",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryFixture",
  "liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult": "PASS",
  "actualExternalCallExecutionAuthorizationRequestStatusFromOro7b": "submitted_pending_actual_external_call_execution_authorization_decision",
  "actualExternalCallExecutionAuthorizationRequestScopeFromOro7b": "authorization_request_only",
  "actualExternalCallExecutionAuthorizationDecisionStatus": "approved_for_separate_actual_external_call_execution_activation_request_only",
  "actualExternalCallExecutionAuthorizationDecisionScope": "authorization_decision_only",
  "actualExternalCallExecutionActivationRequestSubmitted": false,
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

ORO-7C blocks if the ORO-7B authorization request dependency is missing; if
ORO-7B did not pass; if the ORO-7B request was not submitted; if the ORO-7B
status is not
`submitted_pending_actual_external_call_execution_authorization_decision`; if
the ORO-7B scope is not `authorization_request_only`; if the authorization
decision is not issued as `authorization_decision_only`; if the decision
status is not
`approved_for_separate_actual_external_call_execution_activation_request_only`;
if the separate activation request requirement is missing; if an activation
request or activation decision is already submitted in this phase; if live
execution is approved; if actual execution is activated, enabled, authorized,
or performed; if external network or live OroPlay is allowed; if wallet,
ledger, data write, DB transaction, migration, or deploy flags open; or if
sensitive-shaped output is present.
