# OroPlay Callback Staging Route Mount Authorization Hold Gate

## Phase ORO-4Q scope

ORO-4Q is the Mount Authorization Hold Gate / Actual Signed Approval Artifact Waiting Boundary after ORO-4P.

ORO-4Q is not route mount approval. ORO-4Q is a hold gate only. ORO-4Q confirms that the ORO-4P decision pack is prepared, but the route mount remains held because there is no actual signed approval artifact, no actual signed approval record, no submitted evidence pack, no submitted mount authorization request, and no issued final pre-mount authorization decision.

This phase is docs, static contract, mock fixtures, local smoke, package script registration, smoke runner registration, and roadmap/API mapping coverage only.

## Relationship to ORO-4P

ORO-4P closed as the Signed Approval Artifact Acceptance Review / Final Pre-Mount Authorization Decision Boundary. ORO-4P can prepare the final pre-mount authorization decision pack, but it does not issue that decision and does not authorize route mount.

ORO-4Q follows ORO-4P and records the hold state. It must not change ORO-4P into mount approval, must not treat ORO-4P as final authorization, and must not infer authorization from ORO-4P smoke success.

## Actual signed approval artifact waiting boundary

The waiting boundary remains active because:

- `actualSignedApprovalArtifactPresent=false`
- `signedApprovalRecordPresent=false`
- `signedApprovalArtifactAccepted=false`
- `signedApprovalArtifactVerified=false`
- `preMountAuthorization=pending_actual_signed_approval_artifact`

ORO-4Q must not receive, upload, ingest, store, or verify an actual signed approval artifact. Actual artifact handling requires a separate explicitly authorized phase.

## ORO-4R private artifact hash registry note

ORO-4R is a private artifact hash registry boundary after ORO-4Q. ORO-4R may record owner-provided sanitized private storage metadata and SHA256 chunks for the actual signed approval artifact, but it is not route mount approval and must not change ORO-4Q into mount approval.

Removed by ORO-4R: `missing_actual_signed_approval_artifact`.

Blockers that remain after ORO-4R:

- `missing_signed_approval_record`
- `final_pre_mount_authorization_decision_not_issued`
- `mount_authorization_request_not_submitted`
- `route_mount_authorization_not_granted`

ORO-4R still must keep `signedApprovalRecordPresent=false`, `finalPreMountAuthorizationDecisionIssued=false`, `mountAuthorizationRequestSubmitted=false`, and `routeMountAuthorization=not_authorized_for_mount`.

## Mount authorization hold gate

The hold gate can return `mountAuthorizationHoldGateResult=PASS` only when the safe hold state is intact:

- ORO-4P acceptance review boundary passed.
- Final pre-mount authorization decision pack is prepared.
- Final pre-mount authorization decision is not issued.
- Actual signed approval artifact is absent.
- Actual signed approval record is absent.
- Evidence pack is prepared but not submitted.
- Mount authorization request is not submitted.
- Route mount remains not authorized.
- Express mount, public alias, and runtime traffic remain blocked.

ORO-4Q must not issue final pre-mount authorization. ORO-4Q must not submit mount authorization request. ORO-4Q must not enable route mount.

## Final pre-mount decision not-issued boundary

The prepared decision pack is not an issued authorization. The only valid state is:

- `finalPreMountAuthorizationDecisionPrepared=true`
- `finalPreMountAuthorizationDecisionIssued=false`

Any attempt to mark the final pre-mount authorization decision as issued must fail the hold gate.

## Route mount still not authorized

The only valid route mount state is:

- `routeMountAuthorization=not_authorized_for_mount`
- `mountAuthorizationHoldActive=true`
- `humanAuthorizationRequired=true`
- `separateRouteMountApprovalRequired=true`
- `nextPhaseRequiresSeparateAuthorization=true`

No future route mount may be inferred from this document, a prepared decision pack, a mock artifact, a chat message, or plain text approval.

## Chat/plain text approval rejection rule

ORO-4Q must not accept chat approval or plain text approval as signed approval artifact.

Chat messages, informal approval, approval pasted into chat, or plain text approval without a verifiable actual signed artifact must keep:

- `actualSignedApprovalArtifactPresent=false`
- `signedApprovalArtifactAccepted=false`
- `signedApprovalArtifactVerified=false`
- `finalPreMountAuthorizationDecisionIssued=false`
- `routeMountAuthorization=not_authorized_for_mount`

## Mock artifact rejection rule

ORO-4Q must not accept mock signed artifact as actual authorization.

Mock signed artifact data can be review-only metadata in static fixtures only. It must never set actual artifact presence, signed approval acceptance, signed approval verification, final decision issuance, submitted mount authorization request, Express mount, public alias, runtime traffic, or route mount authorization.

## Evidence pack prepared but not submitted

The evidence pack remains a prepared review pack only:

- `mountAuthorizationEvidencePackPrepared=true`
- `mountAuthorizationEvidencePackSubmitted=false`

A prepared evidence pack is not route mount authorization and is not a submitted mount authorization request.

## Mount authorization request not submitted

The mount authorization request remains not submitted:

- `mountAuthorizationRequestSubmitted=false`

Any submitted request must fail ORO-4Q because a separate explicit authorization phase is still required.

## Express mount prohibition

ORO-4Q must not mount Express routes and must not change `src/app.js`. The following remain not allowed:

- `POST /api/oroplay/balance`
- `POST /api/oroplay/transaction`

## Public alias prohibition

ORO-4Q must not enable public aliases. The following remain not allowed:

- `POST /api/balance`
- `POST /api/transaction`

## Runtime traffic prohibition

ORO-4Q must not accept runtime traffic, create an HTTP listener, call live OroPlay, call external network, mutate wallet state, mutate ledger state, write through Prisma, create a DB transaction, migrate, deploy, payout, auto-credit, or touch real money.

## Safety boundary

Hard boundaries:

- No production DB.
- No real money.
- No live OroPlay API call.
- No external network.
- No real client secret.
- No hardcoded credential, token, password, PIN, device id, or `DATABASE_URL`.
- No runtime wallet mutation.
- No runtime ledger mutation.
- No Prisma write.
- No DB transaction.
- No migration.
- No deploy.
- No payout.
- No auto-credit.
- No upload of an actual signed approval PDF.
- No ingest or storage of an actual signed approval artifact.
- No actual signed approval record creation.
- No final pre-mount authorization issuance.
- No mount authorization request submission.
- No route mount authorization.
- No Express mount.
- No public alias.
- No runtime traffic.

## Decision state

The required ORO-4Q decision state is:

```text
signedApprovalArtifactAcceptanceReviewBoundaryPassed: true
finalPreMountAuthorizationDecisionPrepared: true
finalPreMountAuthorizationDecisionIssued: false
actualSignedApprovalArtifactPresent: false
signedApprovalRecordPresent: false
signedApprovalArtifactAccepted: false
signedApprovalArtifactVerified: false
mountAuthorizationEvidencePackPrepared: true
mountAuthorizationEvidencePackSubmitted: false
mountAuthorizationRequestSubmitted: false
preMountAuthorization: pending_actual_signed_approval_artifact
routeMountAuthorization: not_authorized_for_mount
mountAuthorizationHoldActive: true
expressMountAllowed: false
publicAliasAllowed: false
runtimeTrafficAllowed: false
humanAuthorizationRequired: true
separateRouteMountApprovalRequired: true
nextPhaseRequiresSeparateAuthorization: true
```

## Next phase requirement

The next phase must require separate explicit authorization before any route mount, Express wiring, public alias, runtime traffic, actual signed approval artifact ingestion, actual signed approval record creation, final pre-mount authorization issuance, or mount authorization request submission.
