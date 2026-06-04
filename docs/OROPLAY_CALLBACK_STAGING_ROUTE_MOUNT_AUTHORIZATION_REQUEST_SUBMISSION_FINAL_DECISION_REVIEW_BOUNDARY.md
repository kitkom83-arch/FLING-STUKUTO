# OroPlay Callback Staging Route Mount Authorization Request Submission Final Decision Review Boundary

## Phase ORO-4T scope

ORO-4T is the Mount Authorization Request Submission Record / Final Pre-Mount Decision Review Boundary after ORO-4S.

ORO-4T is not route mount approval. ORO-4T creates a mount authorization request submission record only. ORO-4T submission is static/internal metadata only.

This phase is docs, static contract, mock fixtures, local smoke, package script registration, smoke runner registration, and roadmap/API mapping coverage only.

## Relationship to ORO-4S

ORO-4S closed the Signed Approval Record Creation / Mount Authorization Request Preparation Boundary. ORO-4S confirmed that the actual signed approval artifact is private/off-repo, the private hash registry exists, the signed approval record exists, and the mount authorization request draft is prepared.

ORO-4T consumes the ORO-4S signed approval record and mount authorization request draft to create a sanitized static/internal submission metadata record. ORO-4T must not convert the ORO-4S signed approval record into route mount authorization.

## Signed approval record reference

The signed approval record from ORO-4S is referenced as repo metadata only:

```text
signedApprovalRecordId: PG77-ORO-4S-SIGNED-APPROVAL-RECORD-2026-06-03-001
signedApprovalRecordType: owner_signed_approval_artifact_hash_record
signedApprovalRecordSource: private_artifact_hash_registry
signedApprovalRecordStorage: repo_metadata_only
signedApprovalRecordCreated: true
signedApprovalRecordPresent: true
signedApprovalRecordVerifiedForIntake: true
signedApprovalRecordAcceptedForMountRequestPreparation: true
signedApprovalRecordAcceptedAsRouteMountAuthorization: false
```

## Mount authorization request submission record boundary

ORO-4T records that the mount authorization request draft has a repo-internal submission metadata record.

ORO-4T creates a mount authorization request submission record only. It must not approve route mounting, must not issue final pre-mount authorization, and must not enable Express mount, public alias, or runtime traffic.

## Static/internal metadata submission rule

The ORO-4T submission record is static/internal metadata only:

```text
mountAuthorizationRequestSubmitted: true
mountAuthorizationRequestSubmissionMode: static_internal_metadata_only
externalMountAuthorizationRequestSubmitted: false
```

The word submitted in ORO-4T means only that internal repository metadata now contains a submission record for review.

## No external submission rule

ORO-4T must not submit anything to an external network. It must not call OroPlay, upload a file, post a request, open a listener, or trigger provider traffic.

```text
externalMountAuthorizationRequestSubmitted: false
```

## Final pre-mount decision review boundary

ORO-4T prepares final pre-mount decision review only. The review metadata exists so a later phase can issue a separate explicit final decision.

```text
finalPreMountAuthorizationDecisionReviewPrepared: true
finalPreMountAuthorizationDecisionReviewStatus: pending_final_pre_mount_decision
finalPreMountAuthorizationDecisionPrepared: true
```

## No final decision issued rule

ORO-4T must not issue final pre-mount authorization.

```text
finalPreMountAuthorizationDecisionIssued: false
```

## No route mount authorization rule

ORO-4T must not enable route mount.

```text
preMountAuthorization: mount_authorization_request_submitted_pending_final_pre_mount_decision
routeMountAuthorization: not_authorized_for_mount
```

## No Express mount rule

ORO-4T must not enable Express mount.

```text
expressMountAllowed: false
```

## No public alias rule

ORO-4T must not enable public alias.

```text
publicAliasAllowed: false
```

## No runtime traffic rule

ORO-4T must not enable runtime traffic.

```text
runtimeTrafficAllowed: false
```

## No PDF in repository rule

ORO-4T must not commit the signed approval PDF. The file `PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf` must remain outside the repository in private storage only.

## No signature in repository rule

ORO-4T must not commit a signature. Owner identity and signature details remain stored in the private artifact only.

## No local absolute path in repository rule

ORO-4T must not commit a local absolute private storage path. The repository may store only the sanitized private storage reference:

```text
private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf
```

ORO-4T records only sanitized metadata and hash chunks.

## Mount authorization request submission metadata

```text
mountAuthorizationRequestId: PG77-ORO-4S-MOUNT-AUTHORIZATION-REQUEST-DRAFT-2026-06-03-001
mountAuthorizationSubmissionRecordId: PG77-ORO-4T-MOUNT-AUTHORIZATION-REQUEST-SUBMISSION-2026-06-03-001
mountAuthorizationRequestPrepared: true
mountAuthorizationRequestSubmitted: true
mountAuthorizationRequestSubmissionMode: static_internal_metadata_only
externalMountAuthorizationRequestSubmitted: false
mountAuthorizationRequestSubmissionAllowed: true
mountAuthorizationRequestStatus: submitted_pending_final_pre_mount_decision
```

## Final pre-mount decision review metadata

```text
finalPreMountAuthorizationDecisionReviewId: PG77-ORO-4T-FINAL-PRE-MOUNT-DECISION-REVIEW-2026-06-03-001
finalPreMountAuthorizationDecisionReviewPrepared: true
finalPreMountAuthorizationDecisionReviewStatus: pending_final_pre_mount_decision
finalPreMountAuthorizationDecisionPrepared: true
finalPreMountAuthorizationDecisionIssued: false
```

## Artifact registry reference

The signed approval artifact remains private/off-repo. The repository stores only sanitized metadata and hash chunks:

```text
documentId: PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001
artifactFileName: PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf
artifactStorage: private_off_repo
sanitizedPrivateStorageRef: private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf
artifactCommittedToRepo: false
signatureCommittedToRepo: false
baselineCommit: f97bdb7b109b55aa28960c0c1e544a95279f1386
baselineSafeCiRunId: 26891982447
artifactRegistryCommit: 957b4d2941af642a51f001d0b74c51cf76db28cb
artifactRegistrySafeCiRunId: 26904110250
signedApprovalRecordCommit: 7beb142dce561a53c9d833b73c0662a59d03ad47
signedApprovalRecordSafeCiRunId: 26907826949
sha256Chunks: E5831182 / 83A4A30C / B3E506D5 / F880B4E1 / FCB1CCF1 / 2DB4AB46 / 84E12D6D / 7F6E62EE
```

The normalized SHA256 value may be reconstructed only in memory for local validation. It must not be committed or displayed as one contiguous 64-character hex literal.

## Safety boundary

Hard boundaries:

- No production DB.
- No real money.
- No live OroPlay API call.
- No external network.
- No external mount request submission.
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
- No signed approval PDF committed.
- No signature committed.
- No local absolute private path committed.
- No full SHA256 literal committed.
- Private artifact hash stored as chunks only.
- Mount authorization request submitted as static/internal metadata only.
- No final pre-mount authorization issuance.
- No route mount authorization.
- No Express mount.
- No public alias.
- No runtime traffic.

## Decision state

```text
mountAuthorizationRequestSubmissionFinalDecisionReviewResult: PASS

ownerSignedApprovalArtifactPrivateHashRegistered: true
actualSignedApprovalArtifactPresent: true
actualSignedApprovalArtifactStorage: private_off_repo
signedApprovalArtifactCommittedToRepo: false
signatureCommittedToRepo: false
signedApprovalArtifactHashChunksPresent: true
signedApprovalArtifactHashFormatValid: true
signedApprovalArtifactIntakeRecordPresent: true
signedApprovalArtifactAcceptedForIntake: true
signedApprovalArtifactAcceptedAsMountAuthorization: false

signedApprovalRecordCreated: true
signedApprovalRecordPresent: true
signedApprovalRecordVerifiedForIntake: true
signedApprovalRecordAcceptedForMountRequestPreparation: true
signedApprovalRecordAcceptedAsRouteMountAuthorization: false

mountAuthorizationRequestPrepared: true
mountAuthorizationRequestSubmitted: true
mountAuthorizationRequestSubmissionMode: static_internal_metadata_only
externalMountAuthorizationRequestSubmitted: false
mountAuthorizationRequestStatus: submitted_pending_final_pre_mount_decision

finalPreMountAuthorizationDecisionReviewPrepared: true
finalPreMountAuthorizationDecisionReviewStatus: pending_final_pre_mount_decision
finalPreMountAuthorizationDecisionPrepared: true
finalPreMountAuthorizationDecisionIssued: false

preMountAuthorization: mount_authorization_request_submitted_pending_final_pre_mount_decision
routeMountAuthorization: not_authorized_for_mount

expressMountAllowed: false
publicAliasAllowed: false
runtimeTrafficAllowed: false

humanAuthorizationRequired: true
separateRouteMountApprovalRequired: true
nextPhaseRequiresSeparateAuthorization: true
```

## Remaining blockers

Removed blockers:

- `missing_actual_signed_approval_artifact`
- `missing_signed_approval_record`
- `mount_authorization_request_not_submitted`

Remaining mount blockers:

- `final_pre_mount_authorization_decision_not_issued`
- `route_mount_authorization_not_granted`

## Next phase requirement

The next phase must require separate explicit authorization for final pre-mount authorization issuance and route mount authorization.

ORO-4T must not authorize route mount, Express mount, public alias, or runtime traffic.

## ORO-4U follow-up boundary

ORO-4U may issue the final decision only as static/internal metadata after the
ORO-4T request submission record. That final decision may be issued only as
static/internal metadata and route mount remains blocked without separate
approval.

The final decision may be issued only as static/internal metadata.
The route mount remains blocked without separate approval.

ORO-4U still must not authorize Express mount, public alias, runtime traffic,
wallet mutation, ledger mutation, Prisma write, external network, live OroPlay
call, deploy, migration, or real money behavior.
