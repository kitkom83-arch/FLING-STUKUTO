# OroPlay Callback Staging Route Signed Approval Artifact Intake Pre-Mount Evidence Boundary

## Phase name

ORO-4O Signed Approval Record Artifact Intake / Pre-Mount Human Approval Evidence Boundary.

Status: Still No Express Mount. Still No Public Alias. Still No Runtime Traffic. Still No Actual Signed Approval Record. Still No Actual Signed Approval Artifact. Still No Route Mount Authorization.

## Purpose

ORO-4O creates a static/mock signed approval artifact intake contract and a pre-mount human approval evidence boundary after ORO-4N.

This phase separates these facts:

- ORO-4N already has signed approval record review and mount authorization request boundary coverage.
- ORO-4N still has no actual signed approval record.
- ORO-4N still has no actual signed approval artifact.
- ORO-4O can define artifact intake and evidence-pack behavior only.
- Mock signed approval artifact metadata is schema-only and metadata-only.
- Chat approval, plain text approval, and informal approval are not signed approval artifacts.
- A mount authorization evidence pack can be prepared, but it is not submitted and is not authorization.
- Route mount remains blocked.

## Non-goals

- Does not change `src/app.js`.
- Does not add an Express route.
- Does not open `/api/balance`.
- Does not open `/api/transaction`.
- Does not open `/api/oroplay/balance`.
- Does not open `/api/oroplay/transaction`.
- Does not add a public alias.
- Does not create an HTTP listener.
- Does not accept runtime traffic.
- Does not mutate wallet state.
- Does not mutate ledger state.
- Does not perform a Prisma write.
- Does not create a DB transaction.
- Does not call live OroPlay.
- Does not call any external network.
- Does not touch real money.
- Does not create an actual signed approval record.
- Does not create, upload, ingest, or store an actual signed approval artifact.
- Does not treat chat text as a signed approval artifact.
- Does not treat a mock signed artifact as actual authorization.
- Does not submit mount authorization.
- Does not authorize route mount.

## Safety boundary

ORO-4O is docs, static contract, mock artifact metadata, fixtures, and local smoke only.

Hard boundaries:

- No production DB.
- No real money.
- No live provider, payment, bank, SMS, Slip OCR, or OroPlay API call.
- No external network.
- No payout.
- No migration.
- No deploy.
- No production seed.
- No hardcoded secret, token, password, client secret, or `DATABASE_URL`.
- No secret or credential value printed.
- No `src/app.js` change.
- No Express mount.
- No public alias.
- No HTTP listener.
- No runtime wallet mutation.
- No runtime ledger mutation.
- No Prisma write.
- No DB transaction.
- No actual signed approval artifact storage.

## Relationship to ORO-4N

ORO-4N closed as signed approval record review and mount authorization request boundary only. It produced:

- `signedApprovalRecordReviewBoundaryResult=PASS`
- `signedApprovalRecordReviewContractPresent=true`
- `mountAuthorizationRequestBoundaryPresent=true`
- `signedApprovalRecordPresent=false`
- `signedApprovalRecordAccepted=false`
- `signedApprovalRecordVerified=false`
- `mountAuthorizationRequestPrepared=true`
- `mountAuthorizationRequestSubmitted=false`
- `mountAuthorizationRequestStatus=request_pack_prepared_pending_actual_signed_record`
- `preMountAuthorization=pending_signed_approval_record`
- `routeMountAuthorization=not_authorized_for_mount`

ORO-4O follows ORO-4N, but it does not convert the ORO-4N review boundary into an actual signed record or artifact. It also does not submit mount authorization and does not authorize route mounting.

## Signed approval record review vs signed approval artifact intake

Signed approval record review checks whether a candidate signed record shape and request boundary can be reviewed.

Signed approval artifact intake is a later static boundary that defines what an artifact intake package would need before any real mount authorization can be considered.

ORO-4O does not receive, upload, ingest, store, accept, or verify an actual signed approval artifact. It only checks mock artifact metadata and evidence behavior.

## Actual signed approval artifact requirements

An actual signed approval artifact would need at least:

- identifiable signer identity.
- signed timestamp.
- approval scope.
- immutable artifact digest or hash.
- evidence reviewer identity.
- evidence review timestamp.
- traceable link to the ORO-4N signed approval record review boundary.
- explicit statement that any route/mount change still requires separate authorization.

ORO-4O does not create or store that artifact and does not accept any supplied mock as actual authorization.

## Mock signed approval artifact schema-only policy

A mock signed approval artifact can validate required metadata fields and evidence behavior only. It must never set `signedApprovalArtifactAccepted=true`, never set `signedApprovalArtifactVerified=true`, and never change `routeMountAuthorization`.

Mock artifact metadata can confirm:

- malformed metadata fails.
- missing signer identity fails.
- missing `signedAt` fails.
- missing approval scope fails.
- missing artifact digest or hash fails.
- invalid artifact digest or hash format fails.
- missing evidence reviewer identity fails.
- stale signed timestamp fails.
- route-mount scope in a mock artifact is still not actual authorization.

## Chat approval is not signed approval artifact

Chat approval, informal "approve", or a message saying okay cannot count as a signed approval artifact. These inputs must keep:

- `actualSignedApprovalArtifactPresent=false`
- `signedApprovalArtifactAccepted=false`
- `signedApprovalArtifactVerified=false`
- `routeMountAuthorization=not_authorized_for_mount`

## Plain text approval is not signed approval artifact

Plain text approval without a verifiable signed artifact cannot count as a signed approval artifact. Plain text must keep:

- `actualSignedApprovalArtifactPresent=false`
- `signedApprovalArtifactAccepted=false`
- `signedApprovalArtifactVerified=false`
- `routeMountAuthorization=not_authorized_for_mount`

## Pre-mount human approval evidence boundary contract

The pre-mount human approval evidence boundary is static and must include:

- `evidenceBoundaryType`
- `phaseReference`
- `sourceSignedApprovalArtifactPolicy`
- `evidencePackPrepared`
- `evidencePackSubmitted`
- `mountAuthorizationRequestSubmitted`
- `evidenceStatus`
- `preMountAuthorization`
- `routeMountAuthorization`
- `humanAuthorizationRequired`
- `separateRouteMountApprovalRequired`
- `nextPhaseRequiresSeparateAuthorization`
- `runtimeRoutePolicy`
- `publicAliasPolicy`
- `walletMutationPolicy`
- `ledgerMutationPolicy`
- `prismaWritePolicy`

The only happy-path evidence status is `evidence_pack_prepared_pending_actual_signed_approval_artifact`.

## Mount authorization evidence pack is not mount authorization

A prepared evidence pack is a review artifact only. It is not a submitted mount authorization request and not route mount authorization.

Explicit statement: this phase does not approve mount.

Explicit statement: this phase does not submit mount authorization.

Explicit statement: this phase does not create or store actual signed approval artifact.

Explicit statement: separate authorization required before any route/mount change.

## Verification / artifact intake decision matrix

| Case | Intake result | Artifact accepted | Evidence pack submitted | Request submitted | Route mount authorization |
| --- | --- | --- | --- | --- | --- |
| ORO-4N review boundary exists, no actual signed approval artifact | PASS | false | false | false | not_authorized_for_mount |
| Chat approval supplied | FAIL | false | false | false | not_authorized_for_mount |
| Plain text approval supplied | FAIL | false | false | false | not_authorized_for_mount |
| Mock signed approval artifact metadata valid | PASS schema-only | false | false | false | not_authorized_for_mount |
| Mock artifact metadata malformed | FAIL | false | false | false | not_authorized_for_mount |
| Missing signer, signedAt, scope, digest, or evidence reviewer | FAIL | false | false | false | not_authorized_for_mount |
| Invalid artifact digest or hash format | FAIL | false | false | false | not_authorized_for_mount |
| Stale mock signed timestamp | FAIL | false | false | false | not_authorized_for_mount |
| Evidence pack prepared | PASS | false | false | false | not_authorized_for_mount |
| Evidence pack tries to authorize mount | FAIL | false | false | false | not_authorized_for_mount |

## Route mount authorization decision

Route mount remains `not_authorized_for_mount`.

ORO-4O does not authorize `src/app.js` changes, Express mount, public alias, HTTP listener, runtime traffic, wallet mutation, ledger mutation, Prisma writes, DB transactions, live OroPlay calls, external network, deploy, migration, payout, or real money.

## Required happy path output

signedApprovalArtifactIntakeBoundaryResult: PASS
signedApprovalArtifactIntakeContractPresent: true
preMountHumanApprovalEvidenceBoundaryPresent: true
actualSignedApprovalArtifactPresent: false
signedApprovalRecordPresent: false
signedApprovalArtifactAccepted: false
signedApprovalArtifactVerified: false
mockSignedApprovalArtifactSchemaOnly: true
mountAuthorizationEvidencePackPrepared: true
mountAuthorizationEvidencePackSubmitted: false
mountAuthorizationRequestSubmitted: false
mountAuthorizationEvidenceStatus: evidence_pack_prepared_pending_actual_signed_approval_artifact
preMountAuthorization: pending_actual_signed_approval_artifact
routeMountAuthorization: not_authorized_for_mount
humanAuthorizationRequired: true
separateRouteMountApprovalRequired: true
nextPhaseRequiresSeparateAuthorization: true
blockers: []

## Blockers

ORO-4O must fail if any of these appear:

- actual signed approval artifact treated as present.
- signed approval record treated as present.
- signed approval artifact treated as accepted.
- signed approval artifact treated as verified.
- chat approval counted as signed approval artifact.
- plain text approval counted as signed approval artifact.
- mock signed artifact treated as actual authorization.
- malformed mock artifact metadata treated as valid.
- missing signer, signedAt, scope, digest, or evidence reviewer treated as valid.
- stale artifact timestamp treated as valid.
- mount authorization evidence pack submitted.
- mount authorization request submitted.
- evidence pack treated as mount authorization.
- route mount authorization not equal to `not_authorized_for_mount`.
- Express mount.
- public alias.
- active route marker.
- HTTP listener.
- runtime traffic.
- wallet mutation.
- ledger mutation.
- Prisma write.
- DB transaction.
- external network.
- live OroPlay API call.
- production DB, deploy, migration, payout, or real money.
- secret-shaped values in trace output.

## Next phase requirements

Any phase after ORO-4O that touches route/mount must be separately authorized. The next phase must not infer authorization from this document, from ORO-4N, from a chat message, from plain text, from mock artifact metadata, or from a prepared evidence pack.

Before any route/mount change, a separate explicit authorization must name the route/mount scope and must still respect no-runtime-traffic and safety guard requirements unless the new phase explicitly changes that scope.
