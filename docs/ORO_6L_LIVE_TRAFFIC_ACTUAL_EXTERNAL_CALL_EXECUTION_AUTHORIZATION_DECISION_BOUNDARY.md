# ORO-6L Live Traffic Actual External Call Execution Authorization Decision Boundary

## Purpose

ORO-6L records the actual external call execution authorization decision after
ORO-6K submitted the static/mock actual execution request. The decision record
is readiness-only. It does not authorize actual execution, does not perform
execution, does not open external network access, and does not call live
OroPlay.

## Dependency on ORO-6K

ORO-6L depends on the ORO-6K actual execution authorization request boundary:

- dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary = true
- oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed = true
- actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k = true
- actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k = true
- actualExternalCallExecutionAuthorizationRequestStatusFromOro6k = submitted_pending_actual_execution_decision
- actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k = false
- actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k = pending
- actualExternalCallExecutionAuthorizedFromOro6k = false
- externalCallExecutionAuthorizedFromOro6k = false
- externalCallExecutionPerformedFromOro6k = false
- externalNetworkAllowedFromOro6k = false
- liveOroPlayApiCallAllowedFromOro6k = false

If the ORO-6K request is missing, not submitted, not
`submitted_pending_actual_execution_decision`, already decided, already
authorized, already executed, or already opened external/live call access,
ORO-6L must fail closed.

## Dependency on ORO-6J

ORO-6L preserves ORO-6J pre-execution readiness evidence passed through ORO-6K:

- dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate = true
- oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed = true
- preExecutionReadinessGateStatusFromOro6j = ready_for_separate_actual_external_call_execution_authorization_request

## Actual external call execution authorization decision boundary

ORO-6L may issue only the readiness-only actual execution decision record:

- actualExternalCallExecutionAuthorizationDecisionPrepared = true
- actualExternalCallExecutionAuthorizationDecisionIssued = true
- actualExternalCallExecutionAuthorizationDecisionStatus = approved_for_live_execution_readiness_only
- actualExternalCallExecutionAuthorizationDecisionScope = live_execution_readiness_only

## Why the decision remains readiness-only

The ORO-6L decision confirms that a later live execution readiness gate may be
prepared. It is not the final authorization to perform an external call. It
does not allow runtime traffic, route opening, wallet changes, ledger changes,
persistence writes, external network access, or live OroPlay execution.

## Actual execution remains blocked

ORO-6L keeps actual execution authorization and execution absent:

- actualExternalCallExecutionAuthorized = false
- externalCallExecutionAuthorized = false
- externalCallExecutionPerformed = false

If decision issuance ever makes `actualExternalCallExecutionAuthorized` true,
or if external execution is performed, the phase must fail closed.

## Still-no-external-call safety

ORO-6L keeps all external/live call activity disabled:

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

The next phase must add a separate live execution readiness gate before any
actual external call execution enablement. ORO-6L still does not authorize
actual execution and still does not perform actual execution.
ORO-6M live traffic actual external call execution readiness gate is required next.
That ORO-6M readiness gate may be
`ready_for_separate_actual_external_call_execution_enablement_request`, but
ORO-6M still does not submit enablement request, enable actual execution, or
perform actual execution.

## Sensitive output rules

ORO-6L records only static and mock evidence. Outputs must stay sanitized and
must not include sensitive-shaped values or hard-coded credential material.

## Actual execution authorization decision output JSON

```json
{
  "phase": "ORO-6L",
  "fixtureId": "happyPathLiveTrafficActualExternalCallExecutionAuthorizationDecisionFixture",
  "liveTrafficActualExternalCallExecutionAuthorizationDecisionBoundaryResult": "PASS",
  "dependsOnOro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestBoundary": true,
  "oro6kLiveTrafficActualExternalCallExecutionAuthorizationRequestPassed": true,
  "actualExternalCallExecutionAuthorizationRequestPreparedFromOro6k": true,
  "actualExternalCallExecutionAuthorizationRequestSubmittedFromOro6k": true,
  "actualExternalCallExecutionAuthorizationRequestStatusFromOro6k": "submitted_pending_actual_execution_decision",
  "actualExternalCallExecutionAuthorizationDecisionIssuedFromOro6k": false,
  "actualExternalCallExecutionAuthorizationDecisionStatusFromOro6k": "pending",
  "actualExternalCallExecutionAuthorizedFromOro6k": false,
  "externalCallExecutionAuthorizedFromOro6k": false,
  "externalCallExecutionPerformedFromOro6k": false,
  "externalNetworkAllowedFromOro6k": false,
  "liveOroPlayApiCallAllowedFromOro6k": false,
  "dependsOnOro6jLiveTrafficExternalCallPreExecutionReadinessGate": true,
  "oro6jLiveTrafficExternalCallPreExecutionReadinessGatePassed": true,
  "preExecutionReadinessGateStatusFromOro6j": "ready_for_separate_actual_external_call_execution_authorization_request",
  "actualExternalCallExecutionAuthorizationDecisionPrepared": true,
  "actualExternalCallExecutionAuthorizationDecisionIssued": true,
  "actualExternalCallExecutionAuthorizationDecisionStatus": "approved_for_live_execution_readiness_only",
  "actualExternalCallExecutionAuthorizationDecisionScope": "live_execution_readiness_only",
  "actualExternalCallExecutionAuthorized": false,
  "externalCallExecutionAuthorized": false,
  "externalCallExecutionPerformed": false,
  "nextPhaseRequiresSeparateLiveExecutionReadinessGate": true,
  "nextPhaseRequiresSeparateActualExternalCallExecutionEnablement": true,
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

ORO-6L blocks if the ORO-6K request record is missing, not passed, not
submitted, or not `submitted_pending_actual_execution_decision`; if ORO-6K
already issued a decision, authorized execution, performed execution, opened
external network, or allowed live OroPlay; if ORO-6J readiness evidence is
missing or unsafe; if the ORO-6L decision is not
`approved_for_live_execution_readiness_only` with
`live_execution_readiness_only` scope; if actual execution authorization or
execution appears; if external network appears; if live OroPlay appears; if
any mutation, persistent write, migration, or deploy appears; if protected
runtime, data, env, lock, or staging example files are touched; or if
sensitive-shaped output is detected.
