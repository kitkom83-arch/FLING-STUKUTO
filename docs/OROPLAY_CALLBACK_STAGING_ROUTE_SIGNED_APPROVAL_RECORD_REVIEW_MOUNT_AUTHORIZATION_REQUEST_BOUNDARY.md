# OroPlay Callback Staging Route Signed Approval Record Review Mount Authorization Request Boundary

## Phase name

ORO-4N Signed Approval Record Review / Mount Authorization Request Boundary.

Status: Still No Express Mount. Still No Public Alias. Still No Runtime Traffic. Still No Actual Signed Approval Record. Still No Route Mount Authorization.

## Purpose

ORO-4N creates a static/mock review contract for an actual signed approval record and a separate mount authorization request boundary after ORO-4M. It can prepare a request pack for review, but the pack is not submitted and is not authorization.

This phase separates these facts:

- ORO-4M already has a signed approval intake gate.
- ORO-4M still has no actual signed human approval record.
- ORO-4N can review schema and request-boundary behavior only.
- Mock signed records are schema-only and review-only inputs.
- Chat approval, plain text approval, and informal approval are not signed approval records.
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
- Does not treat a mock signed record as actual authorization.
- Does not treat chat text as signed approval.
- Does not submit mount authorization.
- Does not authorize route mount.

## Safety boundary

ORO-4N is docs, static contract, mock fixtures, and local smoke only.

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

## Relationship to ORO-4M

ORO-4M closed as signed approval intake and verification-pack gate only. It produced:

- `signedApprovalIntakeGateResult=PASS`
- `signedApprovalIntakeContractPresent=true`
- `signedApprovalRecordPresent=false`
- `signedApprovalRecordVerified=false`
- `signedApprovalIntakeStatus=verification_pack_passed_pending_human_record`
- `preMountAuthorization=pending_signed_approval_record`
- `routeMountAuthorization=not_authorized_for_mount`

ORO-4N follows ORO-4M, but it does not convert ORO-4M intake into an actual signed record. It also does not authorize route mounting.

## Signed approval intake vs signed approval record review

Signed approval intake is a checklist and intake contract. It proves that the expected review inputs and rejection rules exist.

Signed approval record review is a later boundary that can inspect a candidate record shape. In ORO-4N, even a valid mock candidate is schema-only and review-only. It is not an actual signed human approval record.

## Actual signed approval record requirements

An actual signed human approval record would need at least:

- identifiable signer identity.
- signed timestamp.
- approval scope.
- approval artifact hash.
- reviewer identity.
- evidence references.
- explicit acknowledgement that any route/mount change requires separate authorization.

ORO-4N does not create that record and does not accept any supplied mock as actual authorization.

## Signed approval record review contract

The review contract is static and must include:

- `recordType`
- `phaseReference`
- `projectName`
- `repository`
- `branch`
- `sourceIntakeGatePhase`
- `signerIdentity`
- `signedAt`
- `approvalScope`
- `approvalArtifactHash`
- `reviewerIdentity`
- `reviewedAt`
- `decision`
- `mockRecordPolicy`
- `chatApprovalPolicy`
- `plainTextApprovalPolicy`
- `mountAuthorizationRequestPolicy`
- `separateRouteMountApprovalRequired`
- `nextPhaseRequiresSeparateAuthorization`

Allowed review decisions are `changes_requested`, `pending_actual_signed_record`, `schema_only_review`, and `not_authorized_for_mount`.

## Mount authorization request boundary contract

The request boundary contract is static and must include:

- `requestType`
- `phaseReference`
- `sourceSignedRecordPolicy`
- `requestPackPrepared`
- `requestPackSubmitted`
- `requestStatus`
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

The only happy-path request status is `request_pack_prepared_pending_actual_signed_record`.

## Mock signed record schema-only policy

A mock signed record can validate required fields and review behavior only. It must never set `signedApprovalRecordAccepted=true`, never set `signedApprovalRecordVerified=true`, and never change `routeMountAuthorization`.

Mock record review can confirm:

- malformed records fail.
- missing signer identity fails.
- missing signedAt fails.
- missing approval scope fails.
- missing approval artifact hash fails.
- missing reviewer identity fails.
- stale timestamp fails.
- route-mount scope in a mock record is still not actual authorization.

## Chat approval is not signed approval

Chat approval, plain text approval, informal "okay", or a message saying approve cannot count as a signed approval record. These inputs must keep:

- `signedApprovalRecordPresent=false`
- `signedApprovalRecordAccepted=false`
- `signedApprovalRecordVerified=false`
- `routeMountAuthorization=not_authorized_for_mount`

## Mount authorization request is not mount authorization

A prepared request pack is a review artifact only. It is not a submitted request and not route mount authorization.

Explicit statement: this phase does not approve mount.

Explicit statement: this phase does not submit mount authorization.

Explicit statement: separate authorization required before any route/mount change.

## Verification / review decision matrix

| Case | Review result | Signed record accepted | Mount request submitted | Route mount authorization |
| --- | --- | --- | --- | --- |
| ORO-4M intake exists, no actual signed record | PASS | false | false | not_authorized_for_mount |
| Chat approval supplied | FAIL | false | false | not_authorized_for_mount |
| Plain text approval supplied | FAIL | false | false | not_authorized_for_mount |
| Mock signed record valid | PASS schema-only | false | false | not_authorized_for_mount |
| Mock signed record malformed | FAIL | false | false | not_authorized_for_mount |
| Missing signer, signedAt, scope, artifact hash, or reviewer | FAIL | false | false | not_authorized_for_mount |
| Stale mock signed record | FAIL | false | false | not_authorized_for_mount |
| Request pack prepared | PASS | false | false | not_authorized_for_mount |
| Request tries to authorize mount | FAIL | false | false | not_authorized_for_mount |

## Route mount authorization decision

Route mount remains `not_authorized_for_mount`.

ORO-4N does not authorize `src/app.js` changes, Express mount, public alias, HTTP listener, runtime traffic, wallet mutation, ledger mutation, Prisma writes, DB transactions, live OroPlay calls, external network, deploy, migration, payout, or real money.

## Required happy path output

signedApprovalRecordReviewBoundaryResult: PASS
signedApprovalRecordReviewContractPresent: true
mountAuthorizationRequestBoundaryPresent: true
signedApprovalRecordPresent: false
signedApprovalRecordAccepted: false
signedApprovalRecordVerified: false
mountAuthorizationRequestPrepared: true
mountAuthorizationRequestSubmitted: false
mountAuthorizationRequestStatus: request_pack_prepared_pending_actual_signed_record
preMountAuthorization: pending_signed_approval_record
routeMountAuthorization: not_authorized_for_mount
humanAuthorizationRequired: true
separateRouteMountApprovalRequired: true
nextPhaseRequiresSeparateAuthorization: true
blockers: []

## Blockers

ORO-4N must fail if any of these appear:

- actual signed approval record treated as accepted.
- actual signed approval record treated as verified.
- chat approval counted as signed approval.
- plain text approval counted as signed approval.
- mock signed record treated as actual authorization.
- mount authorization request submitted.
- mount authorization request treated as route authorization.
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

Any phase after ORO-4N that touches route/mount must be separately authorized. The next phase must not infer authorization from this document, from ORO-4M, from a chat message, from a mock signed record, or from a prepared request pack.

Before any route/mount change, a separate explicit authorization must name the route/mount scope and must still respect no-runtime-traffic and safety guard requirements unless the new phase explicitly changes that scope.

## Followed by ORO-4O Signed Approval Artifact Intake / Pre-Mount Evidence Boundary

ORO-4O follows ORO-4N as signed approval artifact intake and pre-mount human approval evidence boundary only.

ORO-4N is still no actual signed record or artifact.

ORO-4N still has no actual signed record or artifact and still does not authorize route mount. ORO-4O may prepare an evidence pack, but it must keep `signedApprovalRecordPresent=false`, `actualSignedApprovalArtifactPresent=false`, `signedApprovalArtifactAccepted=false`, `signedApprovalArtifactVerified=false`, `mountAuthorizationEvidencePackSubmitted=false`, `mountAuthorizationRequestSubmitted=false`, and `routeMountAuthorization=not_authorized_for_mount`.

ORO-4O does not authorize `src/app.js`, Express mount, public aliases, runtime traffic, wallet mutation, ledger mutation, Prisma writes, DB transactions, live OroPlay calls, external network, or real money.
