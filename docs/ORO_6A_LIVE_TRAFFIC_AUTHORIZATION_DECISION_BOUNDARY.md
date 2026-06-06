# ORO-6A Live Traffic Authorization Decision Boundary

## Purpose

ORO-6A creates the live traffic authorization decision record after the ORO-5Z
request has been submitted. The decision can be issued and approved, but it only
authorizes a later enablement boundary.

## Non-goals

ORO-6A does not enable live traffic, move real money, mutate wallet or ledger
state, write through Prisma, create DB transactions, run migrations, deploy,
call external network, or call live OroPlay. It is a static and mock decision
boundary only.

## Dependency on ORO-5Z

ORO-6A depends on the approved ORO-5Z request boundary:

- dependsOnOro5zLiveTrafficAuthorizationRequestBoundary = true
- oro5zLiveTrafficAuthorizationRequestSubmitted = true
- runtimeTrafficEnabledFromOro5z = true
- runtimeTrafficModeFromOro5z = fail_closed_no_mutation

## Live traffic authorization decision boundary

ORO-6A issues only the decision record:

- liveTrafficAuthorizationDecisionBoundaryResult = PASS
- liveTrafficAuthorizationDecisionIssued = true
- liveTrafficAuthorizationDecisionStatus = decision_issued
- liveTrafficAuthorizationDecisionResult = approved

## No-live-enable statement

The decision does not enable live traffic. A separate enablement boundary is
required before any live traffic can run:

- liveTrafficAllowed = false
- liveTrafficEnabled = false
- separateLiveTrafficEnablementRequired = true
- nextPhaseRequiresLiveTrafficEnablementBoundary = true

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

ORO-6A does not allow external network or live OroPlay calls:

- externalNetworkAllowed = false
- externalNetworkCalled = false
- liveOroPlayApiCallAllowed = false
- liveOroPlayApiCalled = false
- secretsLeaked = false

## Decision output JSON

```json
{
  "phase": "ORO-6A",
  "fixtureId": "happyPathLiveTrafficAuthorizationDecisionFixture",
  "liveTrafficAuthorizationDecisionBoundaryResult": "PASS",
  "dependsOnOro5zLiveTrafficAuthorizationRequestBoundary": true,
  "oro5zLiveTrafficAuthorizationRequestSubmitted": true,
  "runtimeTrafficEnabledFromOro5z": true,
  "runtimeTrafficModeFromOro5z": "fail_closed_no_mutation",
  "liveTrafficAuthorizationDecisionIssued": true,
  "liveTrafficAuthorizationDecisionStatus": "decision_issued",
  "liveTrafficAuthorizationDecisionResult": "approved",
  "liveTrafficAllowed": false,
  "liveTrafficEnabled": false,
  "separateLiveTrafficEnablementRequired": true,
  "nextPhaseRequiresLiveTrafficEnablementBoundary": true,
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

ORO-6A blocks if the ORO-5Z request record is missing or not submitted, runtime
mode is not `fail_closed_no_mutation`, the decision is missing or not approved,
the separate enablement requirement is missing, live traffic is allowed or
enabled, any mutation or persistent write appears, external network appears,
live OroPlay appears, or sensitive-shaped output is detected.

## Next phase requires separate live traffic enablement boundary

The next phase requires separate live traffic enablement boundary. ORO-6A only
issues the decision record.

## ORO-6B pre-enablement readiness requirement

ORO-6B is required for pre-enablement readiness. ORO-6A does not enable live traffic. ORO-6A only issues the approved decision record before a later readiness
and enablement boundary.
