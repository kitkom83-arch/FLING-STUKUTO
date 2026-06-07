# ORO-6H Live Traffic External Call Execution Authorization Request Boundary

## Purpose

ORO-6H records the external/live OroPlay call execution authorization request
after the ORO-6G readiness gate has passed. It prepares and submits only the
execution authorization request, then leaves the execution decision and any
external call for a later phase.

## Non-goals

ORO-6H does not move real money, mutate wallet or ledger state, write through
Prisma, create DB transactions, run migrations, deploy, call external network,
or call live OroPlay. It does not issue the execution authorization decision,
authorize execution, open `/api/balance`, `/api/transaction`,
`/api/oroplay/balance`, or `/api/oroplay/transaction`, and it does not edit
runtime routes, controllers, services, ledger mocks, `src/app.js`, Prisma files,
or production configuration.

## Dependency on ORO-6G

ORO-6H depends on the ORO-6G external/live call readiness gate record:

- dependsOnOro6gLiveTrafficExternalCallReadinessGate = true
- oro6gLiveTrafficExternalCallReadinessGatePassed = true
- externalCallReadinessGatePreparedFromOro6g = true
- externalCallReadinessGateEvaluatedFromOro6g = true
- externalCallReadinessGatePassedFromOro6g = true
- externalCallReadinessGateStatusFromOro6g = ready_for_separate_execution_authorization_request
- externalCallExecutionAuthorizationRequestSubmittedFromOro6g = false
- externalCallExecutionAuthorizationDecisionIssuedFromOro6g = false
- externalCallExecutionAuthorizedFromOro6g = false
- nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g = true
- nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g = true

## Dependency on ORO-6F

ORO-6H remains downstream of the ORO-6F readiness-only authorization decision:

- dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary = true
- oro6fLiveTrafficExternalCallAuthorizationDecisionPassed = true
- externalCallAuthorizationDecisionStatusFromOro6f = approved_for_readiness_only
- externalCallExecutionAuthorizedFromOro6f = false
- externalCallReadinessGateAllowedFromOro6f = true

## Dependency on ORO-6E

ORO-6H remains downstream of the ORO-6E external/live call authorization request:

- dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary = true
- oro6eLiveTrafficExternalCallAuthorizationRequestPassed = true
- externalCallAuthorizationRequestPreparedFromOro6e = true
- externalCallAuthorizationRequestSubmittedFromOro6e = true
- externalCallAuthorizationRequestStatusFromOro6e = submitted_pending_decision

## Dependency on ORO-6D

ORO-6H depends on the ORO-6D live traffic post-enablement validation record:

- dependsOnOro6dLiveTrafficPostEnablementValidationBoundary = true
- oro6dLiveTrafficPostEnablementValidationPassed = true
- liveTrafficAllowedFromOro6d = true
- liveTrafficEnabledFromOro6d = true
- liveTrafficModeFromOro6d = fail_closed_no_mutation

## Execution authorization request boundary

ORO-6H records only the submitted request for a later separate execution
authorization decision:

- liveTrafficExternalCallExecutionAuthorizationRequestBoundaryResult = PASS
- externalCallExecutionAuthorizationRequestPrepared = true
- externalCallExecutionAuthorizationRequestSubmitted = true
- externalCallExecutionAuthorizationRequestStatus = submitted_pending_execution_decision
- externalCallExecutionAuthorizationDecisionIssued = false
- externalCallExecutionAuthorizationDecisionStatus = pending
- externalCallExecutionAuthorized = false
- nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision = true
- humanApprovalRequired = true
- separateExternalCallExecutionAuthorizationDecisionRequired = true

## No external network

ORO-6H does not allow or perform outgoing external network activity:

- externalNetworkAllowed = false
- externalNetworkCalled = false

## No live OroPlay API call

ORO-6H does not allow or perform a live OroPlay API call:

- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## No mutation, persistence, deploy, or real-money statement

Wallet, ledger, persistent writes, DB transactions, migrations, deploy, and
real-money behavior remain blocked:

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
- secretsLeaked = false

## Next phase execution authorization decision

The next phase must issue a separate external call execution authorization
decision. ORO-6H does not issue that decision and does not authorize execution.
The execution decision must remain a human/separate decision.

## ORO-6I execution authorization decision boundary linkage

ORO-6I execution authorization decision boundary is required next. ORO-6I
records the decision as approved_for_pre_execution_readiness_only after ORO-6H
submits the request. ORO-6I does not authorize actual external call execution,
does not allow external network, and does not call live OroPlay.

## Secret redaction rules

ORO-6H records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Execution authorization request output JSON

```json
{
  "phase": "ORO-6H",
  "fixtureId": "happyPathLiveTrafficExternalCallExecutionAuthorizationRequestFixture",
  "liveTrafficExternalCallExecutionAuthorizationRequestBoundaryResult": "PASS",
  "dependsOnOro6gLiveTrafficExternalCallReadinessGate": true,
  "oro6gLiveTrafficExternalCallReadinessGatePassed": true,
  "externalCallReadinessGatePreparedFromOro6g": true,
  "externalCallReadinessGateEvaluatedFromOro6g": true,
  "externalCallReadinessGatePassedFromOro6g": true,
  "externalCallReadinessGateStatusFromOro6g": "ready_for_separate_execution_authorization_request",
  "externalCallExecutionAuthorizationRequestSubmittedFromOro6g": false,
  "externalCallExecutionAuthorizationDecisionIssuedFromOro6g": false,
  "externalCallExecutionAuthorizedFromOro6g": false,
  "nextPhaseRequiresExternalCallExecutionAuthorizationRequestFromOro6g": true,
  "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecisionFromOro6g": true,
  "dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary": true,
  "oro6fLiveTrafficExternalCallAuthorizationDecisionPassed": true,
  "externalCallAuthorizationDecisionStatusFromOro6f": "approved_for_readiness_only",
  "externalCallExecutionAuthorizedFromOro6f": false,
  "externalCallReadinessGateAllowedFromOro6f": true,
  "dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary": true,
  "oro6eLiveTrafficExternalCallAuthorizationRequestPassed": true,
  "externalCallAuthorizationRequestPreparedFromOro6e": true,
  "externalCallAuthorizationRequestSubmittedFromOro6e": true,
  "externalCallAuthorizationRequestStatusFromOro6e": "submitted_pending_decision",
  "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary": true,
  "oro6dLiveTrafficPostEnablementValidationPassed": true,
  "liveTrafficAllowedFromOro6d": true,
  "liveTrafficEnabledFromOro6d": true,
  "liveTrafficModeFromOro6d": "fail_closed_no_mutation",
  "externalCallExecutionAuthorizationRequestPrepared": true,
  "externalCallExecutionAuthorizationRequestSubmitted": true,
  "externalCallExecutionAuthorizationRequestStatus": "submitted_pending_execution_decision",
  "externalCallExecutionAuthorizationDecisionIssued": false,
  "externalCallExecutionAuthorizationDecisionStatus": "pending",
  "externalCallExecutionAuthorized": false,
  "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision": true,
  "humanApprovalRequired": true,
  "separateExternalCallExecutionAuthorizationDecisionRequired": true,
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
  "secretsLeaked": false,
  "blockers": []
}
```

## Rollback and blocker rules

ORO-6H blocks if the ORO-6G readiness gate record is missing, not passed, not
`ready_for_separate_execution_authorization_request`, or already submitted,
decided, or authorized execution; if the ORO-6F readiness-only decision is
missing or not `approved_for_readiness_only`; if the ORO-6E request is missing
or not submitted; if ORO-6D validation is not passed; if live traffic mode is
not `fail_closed_no_mutation`; if ORO-6H fails to submit only the execution
authorization request; if the execution authorization decision is issued; if
execution is authorized; if external network appears; if live OroPlay appears;
if any mutation or persistent write appears; if protected runtime files are
touched; or if sensitive-shaped output is detected.
