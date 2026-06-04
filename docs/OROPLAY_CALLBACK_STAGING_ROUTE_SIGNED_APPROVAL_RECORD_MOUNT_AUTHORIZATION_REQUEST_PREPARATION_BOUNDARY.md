# OroPlay Callback Staging Route Signed Approval Record Mount Authorization Request Preparation Boundary

## Phase ORO-4S scope

ORO-4S is the Signed Approval Record Creation / Mount Authorization Request Preparation Boundary after ORO-4R.

ORO-4S is not route mount approval. ORO-4S creates a signed approval record metadata boundary only. ORO-4S prepares a mount authorization request package only.

This phase is docs, static contract, mock fixtures, local smoke, package script registration, smoke runner registration, and roadmap/API mapping coverage only.

## Relationship to ORO-4R

ORO-4R closed the Signed Approval Artifact Intake Record / Private Artifact Hash Registry Boundary. ORO-4R confirmed that the actual signed approval artifact exists in private/off-repo storage and that the private artifact hash registry exists as SHA256 chunks only.

ORO-4S consumes the ORO-4R private hash registry metadata to create a sanitized signed approval record. ORO-4S must not change ORO-4R into mount approval, and ORO-4S must not infer route mount authorization from the signed approval record.

## Signed approval artifact private hash registry reference

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
sha256Chunks: E5831182 / 83A4A30C / B3E506D5 / F880B4E1 / FCB1CCF1 / 2DB4AB46 / 84E12D6D / 7F6E62EE
```

The normalized SHA256 value may be reconstructed only in memory for local validation. It must not be committed or displayed as one contiguous 64-character hex literal.

## Signed approval record creation boundary

ORO-4S creates a signed approval record metadata boundary from the private artifact hash registry. The signed approval record is accepted only for mount authorization request preparation.

ORO-4S must not accept the signed approval record as route mount authorization.

## Mount authorization request preparation boundary

ORO-4S prepares a mount authorization request draft package only. The draft is not submitted, and submission is not allowed in this phase.

ORO-4S must not submit the mount authorization request.

## No request submission rule

ORO-4S must not submit the mount authorization request. It must keep:

```text
mountAuthorizationRequestPrepared: true
mountAuthorizationRequestSubmitted: false
mountAuthorizationRequestSubmissionAllowed: false
mountAuthorizationRequestStatus: prepared_not_submitted
```

## No final decision issued rule

ORO-4S may prepare decision metadata for the next boundary, but ORO-4S must not issue final pre-mount authorization.

```text
finalPreMountAuthorizationDecisionPrepared: true
finalPreMountAuthorizationDecisionIssued: false
```

## No route mount authorization rule

ORO-4S must not enable route mount. ORO-4S must not enable Express mount. ORO-4S must not enable runtime traffic.

```text
preMountAuthorization: signed_approval_record_created_pending_mount_authorization_request_submission
routeMountAuthorization: not_authorized_for_mount
expressMountAllowed: false
publicAliasAllowed: false
runtimeTrafficAllowed: false
```

## No PDF in repository rule

ORO-4S must not commit the signed approval PDF. The file `PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf` must remain outside the repository in private storage only.

## No signature in repository rule

ORO-4S must not commit a signature. Owner identity and signature details remain stored in the private artifact only.

## No local absolute path in repository rule

ORO-4S must not commit a local absolute private storage path. The repository may store only the sanitized private storage reference:

```text
private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf
```

ORO-4S records only sanitized metadata and hash chunks.

## Signed approval record metadata

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

## Mount authorization request draft metadata

```text
mountAuthorizationRequestId: PG77-ORO-4S-MOUNT-AUTHORIZATION-REQUEST-DRAFT-2026-06-03-001
mountAuthorizationRequestPrepared: true
mountAuthorizationRequestSubmitted: false
mountAuthorizationRequestSubmissionAllowed: false
mountAuthorizationRequestStatus: prepared_not_submitted
```

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
- No signed approval PDF committed.
- No signature committed.
- No local absolute private path committed.
- No full SHA256 literal committed.
- Private artifact hash stored as chunks only.
- No mount authorization request submission.
- No final pre-mount authorization issuance.
- No route mount authorization.
- No Express mount.
- No public alias.
- No runtime traffic.

## Decision state

```text
signedApprovalRecordMountAuthorizationRequestPreparationResult: PASS
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
mountAuthorizationRequestSubmitted: false
mountAuthorizationRequestSubmissionAllowed: false

finalPreMountAuthorizationDecisionPrepared: true
finalPreMountAuthorizationDecisionIssued: false

preMountAuthorization: signed_approval_record_created_pending_mount_authorization_request_submission
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

Remaining mount blockers:

- `final_pre_mount_authorization_decision_not_issued`
- `mount_authorization_request_not_submitted`
- `route_mount_authorization_not_granted`

## ORO-4T follow-up note

ORO-4T is a request submission record boundary after ORO-4S. It records the mount authorization request submission as static/internal metadata only.

Removed by ORO-4T: `mount_authorization_request_not_submitted`.

ORO-4S remains not route mount approval. ORO-4T also remains not route mount approval. The remaining mount blockers after ORO-4T are:

- `final_pre_mount_authorization_decision_not_issued`
- `route_mount_authorization_not_granted`

## Next phase requirement

The next phase must require separate explicit authorization for mount authorization request submission, final pre-mount authorization issuance, and route mount authorization.

ORO-4S must not authorize route mount, Express mount, public alias, or runtime traffic.
