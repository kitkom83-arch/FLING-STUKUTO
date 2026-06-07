# ORO-6E Live Traffic External Call Authorization Request Boundary

## Purpose

ORO-6E creates the external/live OroPlay call authorization request record after
ORO-6D passes. It submits only the request for a separate future decision while
live traffic stays fail_closed_no_mutation and outgoing live OroPlay remains
blocked.

## Non-goals

ORO-6E does not move real money, mutate wallet or ledger state, write through
Prisma, create DB transactions, run migrations, deploy, call external network,
or call live OroPlay. It does not edit runtime routes, controllers, services,
`src/app.js`, Prisma files, or production configuration.

## Dependency on ORO-6D

ORO-6E depends on the ORO-6D post-enablement validation record:

- dependsOnOro6dLiveTrafficPostEnablementValidationBoundary = true
- oro6dLiveTrafficPostEnablementValidationPassed = true
- liveTrafficAllowedFromOro6d = true
- liveTrafficEnabledFromOro6d = true
- liveTrafficModeFromOro6d = fail_closed_no_mutation

## External/live OroPlay call authorization request boundary

ORO-6E prepares and submits only the external/live call authorization request:

- liveTrafficExternalCallAuthorizationRequestBoundaryResult = PASS
- externalCallAuthorizationRequestPrepared = true
- externalCallAuthorizationRequestSubmitted = true
- externalCallAuthorizationRequestStatus = submitted_pending_decision
- humanApprovalRequired = true
- separateExternalCallDecisionRequired = true
- nextPhaseRequiresExternalCallAuthorizationDecision = true
- next phase requires separate external call authorization decision

The request response remains sanitized and does not include sensitive-shaped
output.

## No-external-network statement

ORO-6E does not allow or perform outgoing external network activity:

- externalNetworkAllowed = false
- externalNetworkCalled = false

## No-live-OroPlay-call statement

ORO-6E does not allow or perform a live OroPlay API call:

- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false

## Pending decision statement

The request does not issue a decision:

- externalCallAuthorizationDecisionIssued = false
- externalCallAuthorizationDecisionStatus = pending

## No-mutation statement

Wallet, ledger, persistent writes, DB transactions, and migrations remain
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
- secretsLeaked = false

## Request output JSON

```json
{
  "phase": "ORO-6E",
  "fixtureId": "happyPathLiveTrafficExternalCallAuthorizationRequestFixture",
  "liveTrafficExternalCallAuthorizationRequestBoundaryResult": "PASS",
  "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary": true,
  "oro6dLiveTrafficPostEnablementValidationPassed": true,
  "liveTrafficAllowedFromOro6d": true,
  "liveTrafficEnabledFromOro6d": true,
  "liveTrafficModeFromOro6d": "fail_closed_no_mutation",
  "externalCallAuthorizationRequestPrepared": true,
  "externalCallAuthorizationRequestSubmitted": true,
  "externalCallAuthorizationRequestStatus": "submitted_pending_decision",
  "humanApprovalRequired": true,
  "separateExternalCallDecisionRequired": true,
  "nextPhaseRequiresExternalCallAuthorizationDecision": true,
  "externalCallAuthorizationDecisionIssued": false,
  "externalCallAuthorizationDecisionStatus": "pending",
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

## Rollback and blocker criteria

ORO-6E blocks if the ORO-6D record is missing or not passed, live traffic is not
allowed and enabled from ORO-6D, live traffic mode is not
`fail_closed_no_mutation`, the request is not submitted as pending decision,
human approval or separate decision requirements are missing, a decision is
issued, external network appears, a live OroPlay API call appears, any mutation
or persistent write appears, runtime protected files are touched, or
sensitive-shaped output is detected.

## Next phase requires separate external call authorization decision

The next phase requires separate external call authorization decision. ORO-6E
only submits the request and keeps outgoing live OroPlay blocked.

## ORO-6F external/live OroPlay call decision requirement

ORO-6F is required for external/live OroPlay call authorization decision.
ORO-6F must record `approved_for_readiness_only`, not `approved_to_call_now`.
ORO-6E does not authorize execution, external network, or live OroPlay calls.
