# ORO-6F Live Traffic External Call Authorization Decision Boundary

## Purpose

ORO-6F records the external/live OroPlay call authorization decision after the
ORO-6E request is submitted. The decision status is approved_for_readiness_only,
not approved_to_call_now. It allows the next readiness gate to be prepared, but
does not authorize external call execution.

## Non-goals

ORO-6F does not move real money, mutate wallet or ledger state, write through
Prisma, create DB transactions, run migrations, deploy, call external network,
or call live OroPlay. It does not open `/api/balance`, `/api/transaction`,
`/api/oroplay/balance`, or `/api/oroplay/transaction`, and it does not edit
runtime routes, controllers, services, ledger mocks, `src/app.js`, Prisma files,
or production configuration.

## Dependency on ORO-6E

ORO-6F depends on the ORO-6E external/live call authorization request record:

- dependsOnOro6eLiveTrafficExternalCallAuthorizationRequestBoundary = true
- oro6eLiveTrafficExternalCallAuthorizationRequestPassed = true
- externalCallAuthorizationRequestPreparedFromOro6e = true
- externalCallAuthorizationRequestSubmittedFromOro6e = true
- externalCallAuthorizationRequestStatusFromOro6e = submitted_pending_decision

## Dependency on ORO-6D

ORO-6F depends on the ORO-6D live traffic post-enablement validation record:

- dependsOnOro6dLiveTrafficPostEnablementValidationBoundary = true
- oro6dLiveTrafficPostEnablementValidationPassed = true
- liveTrafficAllowedFromOro6d = true
- liveTrafficEnabledFromOro6d = true
- liveTrafficModeFromOro6d = fail_closed_no_mutation

## Readiness-only decision boundary

ORO-6F records a decision for readiness only:

- liveTrafficExternalCallAuthorizationDecisionBoundaryResult = PASS
- externalCallAuthorizationDecisionPrepared = true
- externalCallAuthorizationDecisionRecorded = true
- externalCallAuthorizationDecisionIssued = true
- externalCallAuthorizationDecisionStatus = approved_for_readiness_only
- decision status = approved_for_readiness_only
- not approved_to_call_now
- externalCallExecutionAuthorized = false
- externalCallReadinessGateAllowedNext = true
- nextPhaseRequiresExternalCallReadinessGate = true
- nextPhaseRequiresSeparateExternalCallExecutionAuthorization = true
- humanApprovalRequired = true
- separateExternalCallExecutionDecisionRequired = true

## No external network

ORO-6F does not allow or perform outgoing external network activity:

- externalNetworkAllowed = false
- externalNetworkCalled = false

## No live OroPlay API call

ORO-6F does not allow or perform a live OroPlay API call:

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

## Next phase readiness gate

The next phase must be readiness gate before any execution. Execution
authorization must be separate decision after the readiness gate passes.

## Secret redaction rules

ORO-6F records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Decision output JSON

```json
{
  "phase": "ORO-6F",
  "fixtureId": "happyPathLiveTrafficExternalCallAuthorizationDecisionFixture",
  "liveTrafficExternalCallAuthorizationDecisionBoundaryResult": "PASS",
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
  "externalCallAuthorizationDecisionPrepared": true,
  "externalCallAuthorizationDecisionRecorded": true,
  "externalCallAuthorizationDecisionIssued": true,
  "externalCallAuthorizationDecisionStatus": "approved_for_readiness_only",
  "externalCallExecutionAuthorized": false,
  "externalCallReadinessGateAllowedNext": true,
  "nextPhaseRequiresExternalCallReadinessGate": true,
  "nextPhaseRequiresSeparateExternalCallExecutionAuthorization": true,
  "humanApprovalRequired": true,
  "separateExternalCallExecutionDecisionRequired": true,
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

ORO-6F blocks if the ORO-6E request record is missing or not submitted, the
ORO-6E request status is not `submitted_pending_decision`, ORO-6D validation is
not passed, live traffic mode is not `fail_closed_no_mutation`, the decision is
anything other than `approved_for_readiness_only`, execution is authorized,
readiness gate is not required next, separate execution authorization is not
required, external network appears, live OroPlay appears, any mutation or
persistent write appears, protected runtime files are touched, or
sensitive-shaped output is detected.
