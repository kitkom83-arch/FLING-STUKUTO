# OroPlay Callback Staging Route Signed Approval Artifact Private Hash Registry

## Phase ORO-4R scope

ORO-4R is the Signed Approval Artifact Intake Record / Private Artifact Hash Registry Boundary after ORO-4Q.

ORO-4R is not route mount approval. ORO-4R is a private artifact hash registry boundary only. ORO-4R records only owner-provided private artifact metadata and SHA256 chunks.

This phase is docs, static contract, mock fixtures, local smoke, package script registration, smoke runner registration, and roadmap/API mapping coverage only.

## Relationship to ORO-4Q

ORO-4Q closed as the Mount Authorization Hold Gate / Actual Signed Approval Artifact Waiting Boundary. ORO-4R removes only the `missing_actual_signed_approval_artifact` blocker by recording owner-provided private/off-repo evidence that the actual signed approval artifact exists and has a chunked SHA256 registry.

ORO-4R must not change ORO-4Q into mount approval. ORO-4R must not infer route mount authorization from the private artifact hash registry.

## Owner signed approval artifact private storage boundary

The owner signed approval artifact exists in private storage outside the repository only. Codex must not open, read, copy, ingest, upload, or process the private PDF.

The repository stores only sanitized metadata and chunked hash evidence provided by the owner.

## Private artifact hash registry

The private artifact hash registry records the signed approval artifact metadata and chunked SHA256 hash. It is an intake and evidence boundary only.

ORO-4R must not accept chat approval or plain text approval as signed approval artifact. ORO-4R records only owner-provided private artifact metadata and SHA256 chunks.

## Sanitized artifact metadata

```text
documentId: PG77-ORO-4Q-SIGNED-APPROVAL-2026-06-03-001
artifactFileName: PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf
artifactStorage: private_off_repo
sanitizedPrivateStorageRef: private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf
artifactCommittedToRepo: false
signatureCommittedToRepo: false
ownerIdentity: stored_in_private_artifact_only
approvalOwnerRole: Project Owner / Sole Owner
approvalDate: 2026-06-03
baselineCommit: f97bdb7b109b55aa28960c0c1e544a95279f1386
baselineSafeCiRunId: 26891982447
sha256Chunks: E5831182 / 83A4A30C / B3E506D5 / F880B4E1 / FCB1CCF1 / 2DB4AB46 / 84E12D6D / 7F6E62EE
```

## SHA256 chunked registry rule

The SHA256 registry must be stored and displayed as chunks only:

```text
E5831182 / 83A4A30C / B3E506D5 / F880B4E1 / FCB1CCF1 / 2DB4AB46 / 84E12D6D / 7F6E62EE
```

The normalized SHA256 value may be reconstructed only in memory for local validation. It must not be committed or displayed as one contiguous 64-character hex literal.

## No PDF in repository rule

ORO-4R must not commit or store the signed PDF. The file `PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf` must remain outside the repository in private storage only.

## No signature in repository rule

ORO-4R must not commit or store the actual signature. Owner identity and signature details remain stored in the private artifact only.

## No local absolute path in repository rule

ORO-4R must not commit a local absolute private storage path. The repository may store only the sanitized private storage reference:

```text
private://PG77-approvals/ORO-4Q/PG77_ORO-4Q_OWNER_SIGNED_APPROVAL_2026-06-03.pdf
```

## Actual signed approval artifact present as private/off-repo evidence

The actual signed approval artifact is present as private/off-repo evidence only:

```text
ownerSignedApprovalArtifactPrivateHashRegistered: true
actualSignedApprovalArtifactPresent: true
actualSignedApprovalArtifactStorage: private_off_repo
signedApprovalArtifactCommittedToRepo: false
signatureCommittedToRepo: false
```

## Signed approval artifact intake record present

ORO-4R records the intake record for private artifact hash evidence:

```text
signedApprovalArtifactIntakeRecordPresent: true
signedApprovalArtifactAcceptedForIntake: true
signedApprovalArtifactAcceptedAsMountAuthorization: false
```

The artifact is accepted for intake only. It is not accepted as route mount authorization.

## Signed approval record still pending

The signed approval record for final mount authorization is still not created:

```text
signedApprovalRecordPresent: false
```

Creating or accepting a separate signed approval record requires a later explicit phase.

## Mount authorization still not approved

ORO-4R must not submit mount authorization request. ORO-4R must not enable route mount. ORO-4R must not enable Express mount. ORO-4R must not enable runtime traffic.

```text
mountAuthorizationEvidencePackPrepared: true
mountAuthorizationEvidencePackSubmitted: false
mountAuthorizationRequestSubmitted: false
routeMountAuthorization: not_authorized_for_mount
```

## Final pre-mount decision not-issued boundary

ORO-4R must not issue final pre-mount authorization:

```text
finalPreMountAuthorizationDecisionPrepared: true
finalPreMountAuthorizationDecisionIssued: false
```

## Route mount still not authorized

The route mount remains not authorized:

```text
preMountAuthorization: signed_artifact_hash_registered_pending_approval_record
routeMountAuthorization: not_authorized_for_mount
expressMountAllowed: false
publicAliasAllowed: false
runtimeTrafficAllowed: false
humanAuthorizationRequired: true
separateRouteMountApprovalRequired: true
nextPhaseRequiresSeparateAuthorization: true
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
- No final pre-mount authorization issuance.
- No mount authorization request submission.
- No route mount authorization.
- No Express mount.
- No public alias.
- No runtime traffic.

## Decision state

```text
signedApprovalArtifactPrivateHashRegistryResult: PASS
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
signedApprovalRecordPresent: false
finalPreMountAuthorizationDecisionPrepared: true
finalPreMountAuthorizationDecisionIssued: false
mountAuthorizationEvidencePackPrepared: true
mountAuthorizationEvidencePackSubmitted: false
mountAuthorizationRequestSubmitted: false
preMountAuthorization: signed_artifact_hash_registered_pending_approval_record
routeMountAuthorization: not_authorized_for_mount
expressMountAllowed: false
publicAliasAllowed: false
runtimeTrafficAllowed: false
humanAuthorizationRequired: true
separateRouteMountApprovalRequired: true
nextPhaseRequiresSeparateAuthorization: true
```

Removed blocker:

- `missing_actual_signed_approval_artifact`

Remaining mount blockers:

- `missing_signed_approval_record`
- `final_pre_mount_authorization_decision_not_issued`
- `mount_authorization_request_not_submitted`
- `route_mount_authorization_not_granted`

## Next phase requirement

The next phase must require separate explicit authorization for signed approval record creation/review, final pre-mount authorization issuance, mount authorization request submission, and route mount authorization.

ORO-4R must not authorize route mount, Express mount, public alias, or runtime traffic.
