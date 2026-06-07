# ORO-6G Live Traffic External Call Readiness Gate

## Purpose

ORO-6G records the external/live OroPlay call readiness gate after the ORO-6F
decision has been approved_for_readiness_only. The gate confirms that the system
is ready to request a separate external call execution authorization in the next
phase, while execution remains unauthorized in this phase.

## Non-goals

ORO-6G does not move real money, mutate wallet or ledger state, write through
Prisma, create DB transactions, run migrations, deploy, call external network,
or call live OroPlay. It does not submit an execution authorization request,
issue an execution authorization decision, authorize execution, open
`/api/balance`, `/api/transaction`, `/api/oroplay/balance`, or
`/api/oroplay/transaction`, and it does not edit runtime routes, controllers,
services, ledger mocks, `src/app.js`, Prisma files, or production
configuration.

## Dependency on ORO-6F

ORO-6G depends on the ORO-6F readiness-only authorization decision record:

- dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary = true
- oro6fLiveTrafficExternalCallAuthorizationDecisionPassed = true
- externalCallAuthorizationDecisionPreparedFromOro6f = true
- externalCallAuthorizationDecisionRecordedFromOro6f = true
- externalCallAuthorizationDecisionIssuedFromOro6f = true
- externalCallAuthorizationDecisionStatusFromOro6f = approved_for_readiness_only
- not approved_to_call_now
- externalCallExecutionAuthorizedFromOro6f = false
- externalCallReadinessGateAllowedFromOro6f = true
- nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f = true

## Dependency on ORO-6E

ORO-6G depends on the ORO-6E external/live call authorization request record:

- dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary = true
- oro6eLiveTrafficExternalCallAuthorizationRequestPassed = true
- externalCallAuthorizationRequestPreparedFromOro6e = true
- externalCallAuthorizationRequestSubmittedFromOro6e = true
- externalCallAuthorizationRequestStatusFromOro6e = submitted_pending_decision

## Dependency on ORO-6D

ORO-6G depends on the ORO-6D live traffic post-enablement validation record:

- dependsOnOro6dLiveTrafficPostEnablementValidationBoundary = true
- oro6dLiveTrafficPostEnablementValidationPassed = true
- liveTrafficAllowedFromOro6d = true
- liveTrafficEnabledFromOro6d = true
- liveTrafficModeFromOro6d = fail_closed_no_mutation

## Readiness gate status

ORO-6G records only the readiness gate for a later execution authorization
request:

- liveTrafficExternalCallReadinessGateResult = PASS
- externalCallReadinessGatePrepared = true
- externalCallReadinessGateEvaluated = true
- externalCallReadinessGatePassed = true
- externalCallReadinessGateStatus = ready_for_separate_execution_authorization_request
- externalCallExecutionAuthorizationRequestSubmitted = false
- externalCallExecutionAuthorizationDecisionIssued = false
- externalCallExecutionAuthorized = false
- nextPhaseRequiresExternalCallExecutionAuthorizationRequest = true
- nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision = true
- humanApprovalRequired = true
- separateExternalCallExecutionAuthorizationRequired = true

## No external network

ORO-6G does not allow or perform outgoing external network activity:

- externalNetworkAllowed = false
- externalNetworkCalled = false

## No live OroPlay API call

ORO-6G does not allow or perform a live OroPlay API call:

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

## Next phase execution authorization request

The next phase must request separate external call execution authorization.
The execution authorization decision must remain a separate later decision.
ORO-6G does not submit execution authorization request and does not issue the
execution authorization decision.

## ORO-6H execution authorization request boundary linkage

ORO-6H execution authorization request boundary is required next. ORO-6H records
the execution authorization request as submitted_pending_execution_decision
after ORO-6G, while the execution decision remains separate and pending.
ORO-6H does not issue execution authorization decision and does not authorize
external call execution.

## Secret redaction rules

ORO-6G records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Readiness gate output JSON

```json
{
  "phase": "ORO-6G",
  "fixtureId": "happyPathLiveTrafficExternalCallReadinessGateFixture",
  "liveTrafficExternalCallReadinessGateResult": "PASS",
  "dependsOnOro6fLiveTrafficExternalCallAuthorizationDecisionBoundary": true,
  "oro6fLiveTrafficExternalCallAuthorizationDecisionPassed": true,
  "externalCallAuthorizationDecisionPreparedFromOro6f": true,
  "externalCallAuthorizationDecisionRecordedFromOro6f": true,
  "externalCallAuthorizationDecisionIssuedFromOro6f": true,
  "externalCallAuthorizationDecisionStatusFromOro6f": "approved_for_readiness_only",
  "externalCallExecutionAuthorizedFromOro6f": false,
  "externalCallReadinessGateAllowedFromOro6f": true,
  "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationFromOro6f": true,
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
  "externalCallReadinessGatePrepared": true,
  "externalCallReadinessGateEvaluated": true,
  "externalCallReadinessGatePassed": true,
  "externalCallReadinessGateStatus": "ready_for_separate_execution_authorization_request",
  "externalCallExecutionAuthorizationRequestSubmitted": false,
  "externalCallExecutionAuthorizationDecisionIssued": false,
  "externalCallExecutionAuthorized": false,
  "nextPhaseRequiresExternalCallExecutionAuthorizationRequest": true,
  "nextPhaseRequiresSeparateExternalCallExecutionAuthorizationDecision": true,
  "humanApprovalRequired": true,
  "separateExternalCallExecutionAuthorizationRequired": true,
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

ORO-6G blocks if the ORO-6F readiness-only decision record is missing, not
passed, or not `approved_for_readiness_only`; if ORO-6F has already authorized
execution; if the ORO-6E request record is missing or not submitted; if ORO-6D
validation is not passed; if live traffic mode is not `fail_closed_no_mutation`;
if the readiness gate is not
`ready_for_separate_execution_authorization_request`; if an execution
authorization request is submitted; if an execution authorization decision is
issued; if execution is authorized; if external network appears; if live
OroPlay appears; if any mutation or persistent write appears; if protected
runtime files are touched; or if sensitive-shaped output is detected.
