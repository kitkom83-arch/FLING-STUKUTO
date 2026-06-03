# OroPlay Callback Staging Route Signed Approval Intake Gate

ORO-4M Pre-Mount Authorization Verification / Signed Approval Intake Gate.

Status: Still No Express Mount. Still No Public Alias. Still No Runtime Wallet/Ledger Mutation. Still No Actual Signed Approval Record Intake. Still No Route Mount Authorization. Still Separate Human Authorization Required.

## Phase summary

ORO-4M adds a static/mock signed approval intake contract and pre-mount authorization verification gate after ORO-4L. It confirms that the ORO-4L approval record template exists, while keeping actual signed approval absent and unverified.

Final ORO-4M happy path status:

- `signedApprovalIntakeGateResult`: `PASS`
- `signedApprovalIntakeContractPresent`: `true`
- `signedApprovalRecordPresent`: `false`
- `signedApprovalRecordVerified`: `false`
- `preMountAuthorization`: `pending_signed_approval_record`
- `routeMountAuthorization`: `not_authorized_for_mount`
- `humanAuthorizationRequired`: `true`
- `nextPhaseRequiresSeparateAuthorization`: `true`

This phase is intake-contract and verification-boundary only. It does not record a signed approval, does not treat a chat message as a signed record, and does not authorize a route mount.

## Purpose

- Separate the approval record template from ORO-4L from an actual signed approval record.
- Create the schema and checklist needed to inspect a signed approval record in a later phase.
- Prevent a chat approval, vague approval phrase, or informal "okay" from being interpreted as signed approval.
- A chat message is not a signed approval record.
- Prevent `signedApprovalIntakeGateResult=PASS` from being interpreted as mount authorized.
- Create a boundary before any future phase that may review an actual signed record.
- State that separate explicit authorization is required before any `src/app.js` change or real route opening.

## Evidence inputs

ORO-4M references these earlier phases:

- ORO-4F route wiring design contract: `docs/OROPLAY_CALLBACK_STAGING_ROUTE_WIRING_DESIGN.md`
- ORO-4G mount readiness checklist: `docs/OROPLAY_CALLBACK_STAGING_ROUTE_PREFLIGHT.md`
- ORO-4H dry-run gate: `docs/OROPLAY_CALLBACK_STAGING_ROUTE_DRY_RUN_GATE.md`
- ORO-4I internal shadow harness: `docs/OROPLAY_CALLBACK_STAGING_ROUTE_INTERNAL_SHADOW_HARNESS.md`
- ORO-4J mount decision readiness gate: `docs/OROPLAY_CALLBACK_STAGING_ROUTE_MOUNT_DECISION_READINESS_GATE.md`
- ORO-4K human mount review evidence pack: `docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_MOUNT_REVIEW_EVIDENCE_PACK.md`
- ORO-4L human approval record / pre-mount authorization boundary: `docs/OROPLAY_CALLBACK_STAGING_ROUTE_HUMAN_APPROVAL_RECORD_PRE_MOUNT_AUTHORIZATION_BOUNDARY.md`

## Non-goals

- Does not open an Express route.
- Does not change `src/app.js`.
- Does not open `/api/balance`.
- Does not open `/api/transaction`.
- Does not open `/api/oroplay/balance`.
- Does not open `/api/oroplay/transaction`.
- Does not accept runtime traffic.
- Does not mutate wallet state.
- Does not mutate ledger state.
- Does not perform a Prisma write.
- Does not create a DB transaction.
- Does not call live OroPlay.
- Does not touch real money.
- Does not deploy.
- Does not approve mount automatically.
- Does not create an actual signed approval record.
- Does not accept a chat message as signed approval.
- Does not authorize route mounting.

## Signed approval intake schema

The signed approval intake contract must contain at least these fields:

- `recordType`
- `phaseReference`
- `projectName`
- `repository`
- `branch`
- `reviewerName`
- `reviewerRole`
- `reviewDate`
- `evidencePackCommit`
- `evidencePackSafeCiRunId`
- `preMountBoundaryCommit`
- `preMountBoundarySafeCiRunId`
- `reviewedPhases`
- `decision`
- `requiredConditionsBeforeMount`
- `rollbackOwner`
- `abortCriteriaAcknowledged`
- `noRealMoneyAcknowledged`
- `noLiveProviderAcknowledged`
- `noRuntimeWalletMutationAcknowledged`
- `noRuntimeLedgerMutationAcknowledged`
- `separatePhaseRequiredAcknowledged`
- `separateExplicitAuthorizationRequiredAcknowledged`
- `signatureMethod`
- `signatureTimestamp`
- `signedRecordReference`

Allowed `decision` values:

- `changes_requested`
- `not_authorized_for_mount`
- `pending_signed_approval_record_review`

Forbidden `decision` values:

- must not be `approved`
- must not be `mount_approved`
- must not be `route_mount_authorized`
- must not be `ready_for_live_traffic`
- must not be `production_ready`

## Intake verification model

Valid intake states:

- `intake_contract_missing`
- `pending_signed_approval_record`
- `candidate_record_received_for_review`
- `invalid_signed_record_candidate`
- `signed_record_rejected`
- `not_authorized_for_mount`
- `verification_pack_passed_pending_human_record`

Default and final state for ORO-4M is `verification_pack_passed_pending_human_record`.

Required final output invariants:

- `signedApprovalRecordPresent=false`
- `signedApprovalRecordVerified=false`
- `routeMountAuthorization=not_authorized_for_mount`

## Required rejection rules

The intake boundary must reject:

- Chat message as signed approval.
- Vague approval phrase.
- Missing reviewer identity.
- Missing review date.
- Missing evidence pack commit.
- Missing Safe CI run id.
- Missing ORO-4L boundary reference.
- Missing acknowledgements.
- Mock placeholder signature as actual record.
- Secret-like signature value in trace.
- Any final route mount authorization state.
- Any Express mount, public alias, or runtime mutation present.

## Required human acknowledgements

A reviewer must acknowledge all of these before any later route mount phase:

- I understand this phase does not mount any Express route.
- I understand this phase does not authorize live traffic.
- I understand this phase does not authorize wallet mutation.
- I understand this phase does not authorize ledger mutation.
- I understand this phase does not authorize real money.
- I understand a chat message is not a signed approval record.
- I understand a mock signed record is not actual authorization.
- I understand any future route mount requires a separate phase.
- I understand any future route mount requires a separate explicit authorization.

## Decision output format

```json
{
  "phase": "ORO-4M",
  "gate": "oroplay_callback_staging_route_signed_approval_intake_gate",
  "signedApprovalIntakeGateResult": "PASS",
  "signedApprovalIntakeContractPresent": true,
  "signedApprovalRecordPresent": false,
  "signedApprovalRecordVerified": false,
  "signedApprovalIntakeStatus": "verification_pack_passed_pending_human_record",
  "preMountAuthorization": "pending_signed_approval_record",
  "routeMountAuthorization": "not_authorized_for_mount",
  "humanAuthorizationRequired": true,
  "nextPhaseRequiresSeparateAuthorization": true,
  "expressMount": "absent",
  "publicAlias": "absent",
  "runtimeTraffic": "absent",
  "walletMutation": "absent",
  "ledgerMutation": "absent",
  "prismaWrite": "absent",
  "externalNetwork": "absent",
  "liveOroPlayApiCall": "absent",
  "realMoney": "absent"
}
```

## Explicit next-phase boundary

After ORO-4M, any continuation must be a separate phase, for example ORO-4N.

ORO-4N must still begin with actual signed approval record review before any route mount work can be considered.

ORO-4M does not authorize `src/app.js` changes.

ORO-4M does not authorize mounting any Express route.

ORO-4M does not authorize public aliases.

ORO-4M does not authorize runtime wallet or ledger mutation.
