# ORO-5Z Live Traffic Authorization Request Boundary

## Purpose

ORO-5Z creates a live traffic authorization request record after ORO-5Y passes.
It asks for a separate future live traffic authorization decision without
enabling live traffic.

## Non-goals

ORO-5Z does not enable live traffic, move real money, mutate wallet or ledger
state, write through Prisma, create DB transactions, run migrations, deploy,
call external network, or call live OroPlay. It is a static and mock request
submission boundary only.

## Dependency on ORO-5Y

ORO-5Z depends on the approved ORO-5Y post-enablement validation record:

- dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary = true
- oro5yRuntimeTrafficPostEnablementValidationPassed = true
- runtimeTrafficEnabledFromOro5y = true
- runtimeTrafficModeFromOro5y = fail_closed_no_mutation

## Live traffic authorization request boundary

ORO-5Z prepares and submits only the request record:

- liveTrafficAuthorizationRequestBoundaryResult = PASS
- liveTrafficAuthorizationRequestPrepared = true
- liveTrafficAuthorizationRequestSubmitted = true
- liveTrafficAuthorizationRequestStatus = submitted_pending_decision
- humanApprovalRequired = true
- separateLiveTrafficDecisionRequired = true
- nextPhaseRequiresLiveTrafficAuthorizationDecision = true

## No-live-enable statement

The request does not issue a decision and does not enable live traffic:

- liveTrafficAuthorizationDecisionIssued = false
- liveTrafficAuthorizationDecisionStatus = pending
- liveTrafficAllowed = false
- liveTrafficEnabled = false

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

## No external network and no live OroPlay call statement

ORO-5Z does not allow external network or live OroPlay calls:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false
- secretsLeaked = false

## Request output JSON

```json
{
  "phase": "ORO-5Z",
  "fixtureId": "happyPathLiveTrafficAuthorizationRequestFixture",
  "liveTrafficAuthorizationRequestBoundaryResult": "PASS",
  "dependsOnOro5yRuntimeTrafficPostEnablementValidationBoundary": true,
  "oro5yRuntimeTrafficPostEnablementValidationPassed": true,
  "runtimeTrafficEnabledFromOro5y": true,
  "runtimeTrafficModeFromOro5y": "fail_closed_no_mutation",
  "liveTrafficAuthorizationRequestPrepared": true,
  "liveTrafficAuthorizationRequestSubmitted": true,
  "liveTrafficAuthorizationRequestStatus": "submitted_pending_decision",
  "humanApprovalRequired": true,
  "separateLiveTrafficDecisionRequired": true,
  "nextPhaseRequiresLiveTrafficAuthorizationDecision": true,
  "liveTrafficAuthorizationDecisionIssued": false,
  "liveTrafficAuthorizationDecisionStatus": "pending",
  "liveTrafficAllowed": false,
  "liveTrafficEnabled": false,
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
  "externalNetworkAllowed": false,
  "externalNetworkCalled": false,
  "liveOroPlayApiCallAllowed": false,
  "liveOroPlayApiCalled": false,
  "secretsLeaked": false,
  "blockers": []
}
```

## Rollback and blocker criteria

ORO-5Z blocks if the ORO-5Y record is missing or not passed, runtime mode is not
`fail_closed_no_mutation`, human approval or separate decision requirements are
missing, a live decision is issued, live traffic is enabled, any mutation or
persistent write appears, external network appears, live OroPlay appears, or
sensitive-shaped output is detected.

## Next phase requires separate live traffic authorization decision

The next phase requires separate live traffic authorization decision. ORO-5Z
only submits the request.
