"use strict";

const baseEvidenceSources = Object.freeze({
  routeWiringDesign: {
    present: true,
    phase: "ORO-4F",
    artifact: "Staging Route Wiring Design Contract",
  },
  routePreflight: {
    present: true,
    phase: "ORO-4G",
    artifact: "Staging Route Mount Readiness Checklist",
  },
  dryRunGate: {
    present: true,
    phase: "ORO-4H",
    artifact: "Staging Route Dry-Run Gate",
  },
  internalShadowHarness: {
    present: true,
    phase: "ORO-4I",
    artifact: "Internal Shadow Harness",
  },
  mountDecisionGate: {
    present: true,
    phase: "ORO-4J",
    artifact: "Mount Decision Readiness Gate",
    mountDecision: "manual_review_required",
  },
  humanMountReviewEvidencePack: {
    present: true,
    phase: "ORO-4K",
    artifact: "Human Mount Review Evidence Pack",
    evidencePackResult: "PASS",
    mountApproval: "pending_human_approval",
  },
  staticSafetyChecks: {
    present: true,
    artifact: "No-mount static safety checks",
  },
});

const baseStaticSafetyChecks = Object.freeze({
  srcAppJsChangeAbsent: true,
  expressMountAbsent: true,
  publicAliasAbsent: true,
  activeRouteAbsent: true,
  httpListenerAbsent: true,
  runtimeTrafficAbsent: true,
  walletMutationAbsent: true,
  ledgerMutationAbsent: true,
  prismaWriteAbsent: true,
  dbTransactionAbsent: true,
  externalNetworkAbsent: true,
  liveOroPlayApiCallAbsent: true,
  migrationAbsent: true,
  realMoneyAbsent: true,
});

const baseHumanApprovalRecordTemplate = Object.freeze({
  present: true,
  fields: [
    "Reviewer name",
    "Reviewer role",
    "Review date",
    "Evidence pack commit",
    "Evidence pack Safe CI Run ID",
    "Reviewed phases",
    "Decision",
    "Required conditions before mount",
    "Rollback owner",
    "Abort criteria acknowledged",
    "No-real-money acknowledgement",
    "No-live-provider acknowledgement",
    "Separate phase required acknowledgement",
  ],
  decisionOptions: [
    "changes_requested",
    "not_authorized_for_mount",
    "pending_manual_authorization_for_next_phase",
  ],
});

function baseFixture(id) {
  return {
    id,
    phase: "ORO-4L",
    evidenceSources: JSON.parse(JSON.stringify(baseEvidenceSources)),
    staticSafetyChecks: { ...baseStaticSafetyChecks },
    humanApprovalRecordTemplate: JSON.parse(JSON.stringify(baseHumanApprovalRecordTemplate)),
    signedHumanApprovalRecord: {
      present: false,
      signed: false,
      status: "absent",
    },
    trace: {
      boundaryMode: "static mock pre-mount authorization boundary",
      evidencePackCommit: "eb598a46b0e5f4c2aa1ed90f275129b689bc1364",
      evidencePackSafeCiRunId: "26864087242",
      finalBoundary: "pending manual authorization",
    },
    expected: {
      authorizationBoundaryResult: "PASS",
      humanApprovalRecordTemplatePresent: true,
      signedHumanApprovalRecordPresent: false,
      preMountAuthorization: "pending_manual_authorization",
      humanAuthorizationRequired: true,
      nextPhaseRequiresSeparateAuthorization: true,
      blockers: [],
    },
  };
}

const happyPathAuthorizationBoundaryFixture = Object.freeze(baseFixture("happyPathAuthorizationBoundaryFixture"));

const missingOro4kEvidencePackFixture = Object.freeze({
  ...baseFixture("missingOro4kEvidencePackFixture"),
  evidenceSources: {
    ...baseEvidenceSources,
    humanMountReviewEvidencePack: {
      present: false,
      phase: "ORO-4K",
    },
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "authorization_record_incomplete",
    blocker: "missing ORO-4K evidence pack",
  },
});

const missingHumanApprovalRecordTemplateFixture = Object.freeze({
  ...baseFixture("missingHumanApprovalRecordTemplateFixture"),
  humanApprovalRecordTemplate: {
    present: false,
    fields: [],
    decisionOptions: [],
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "authorization_record_incomplete",
    blocker: "missing approval record template",
  },
});

const signedApprovalAttemptedFixture = Object.freeze({
  ...baseFixture("signedApprovalAttemptedFixture"),
  signedHumanApprovalRecord: {
    present: true,
    signed: true,
    status: "signed",
  },
  trace: {
    attemptedState: "signed approval attempted",
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "not_authorized_for_mount",
    blocker: "signed approval not accepted in ORO-4L static boundary",
  },
});

const accidentalExpressMountFixture = Object.freeze({
  ...baseFixture("accidentalExpressMountFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    expressMountAbsent: false,
  },
  trace: {
    attemptedState: "express mount present",
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "not_authorized_for_mount",
    blocker: "express mount present",
  },
});

const publicAliasFixture = Object.freeze({
  ...baseFixture("publicAliasFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    publicAliasAbsent: false,
  },
  trace: {
    attemptedState: "public alias present",
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "not_authorized_for_mount",
    blocker: "public alias present",
  },
});

const runtimeMutationFixture = Object.freeze({
  ...baseFixture("runtimeMutationFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    walletMutationAbsent: false,
    ledgerMutationAbsent: false,
  },
  trace: {
    attemptedState: "mock runtime mutation flags present",
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "not_authorized_for_mount",
    blockers: ["walletMutation present", "ledgerMutation present"],
  },
});

const externalNetworkFixture = Object.freeze({
  ...baseFixture("externalNetworkFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    externalNetworkAbsent: false,
  },
  trace: {
    attemptedState: "externalNetwork present",
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "not_authorized_for_mount",
    blocker: "externalNetwork present",
  },
});

const prismaWriteFixture = Object.freeze({
  ...baseFixture("prismaWriteFixture"),
  staticSafetyChecks: {
    ...baseStaticSafetyChecks,
    prismaWriteAbsent: false,
  },
  trace: {
    attemptedState: "prismaWrite present",
  },
  expected: {
    authorizationBoundaryResult: "FAIL",
    preMountAuthorization: "not_authorized_for_mount",
    blocker: "prismaWrite present",
  },
});

const secretLikeTrace = {};
secretLikeTrace[["author", "ization"].join("")] = ["mock", "auth", "header", "value"].join("-");
secretLikeTrace[["to", "ken"].join("")] = ["mock", "token", "value"].join("-");
secretLikeTrace[["client", "Secret"].join("")] = ["mock", "client", "credential", "value"].join("-");
secretLikeTrace[["pass", "word"].join("")] = ["mock", "password", "value"].join("-");
secretLikeTrace[["database", "Url"].join("")] = ["mock", "database", "url", "value"].join("-");
secretLikeTrace[["private", "Key"].join("")] = ["mock", "private", "key", "value"].join("-");
secretLikeTrace[["api", "Key"].join("")] = ["mock", "api", "key", "value"].join("-");
secretLikeTrace[["coo", "kie"].join("")] = ["mock", "cookie", "value"].join("-");
secretLikeTrace[["sign", "ature"].join("")] = ["mock", "signature", "value"].join("-");
secretLikeTrace[["signed", "Approval"].join("")] = ["mock", "approval", "placeholder", "value"].join("-");
secretLikeTrace[["approval", "Signature"].join("")] = ["mock", "signature", "value"].join("-");
secretLikeTrace.nested = {};
secretLikeTrace.nested[["bear", "er"].join("")] = ["mock", "bearer", "value"].join("-");
secretLikeTrace.nested[["bas", "ic"].join("")] = ["mock", "basic", "value"].join("-");
secretLikeTrace.nested[["set", "Cookie"].join("")] = ["mock", "set", "cookie", "value"].join("-");
secretLikeTrace.nested[["x", "Api", "Key"].join("")] = ["mock", "x", "api", "key", "value"].join("-");

const secretLikeTraceFixture = Object.freeze({
  ...baseFixture("secretLikeTraceFixture"),
  trace: secretLikeTrace,
  expected: {
    authorizationBoundaryResult: "PASS",
    humanApprovalRecordTemplatePresent: true,
    signedHumanApprovalRecordPresent: false,
    preMountAuthorization: "pending_manual_authorization",
    sanitized: true,
  },
});

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function buildHumanApprovalRecordPreMountAuthorizationBoundaryFixtures() {
  return [
    happyPathAuthorizationBoundaryFixture,
    missingOro4kEvidencePackFixture,
    missingHumanApprovalRecordTemplateFixture,
    signedApprovalAttemptedFixture,
    accidentalExpressMountFixture,
    publicAliasFixture,
    runtimeMutationFixture,
    externalNetworkFixture,
    prismaWriteFixture,
    secretLikeTraceFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathAuthorizationBoundaryFixture,
  missingOro4kEvidencePackFixture,
  missingHumanApprovalRecordTemplateFixture,
  signedApprovalAttemptedFixture,
  accidentalExpressMountFixture,
  publicAliasFixture,
  runtimeMutationFixture,
  externalNetworkFixture,
  prismaWriteFixture,
  secretLikeTraceFixture,
  cloneFixture,
  buildHumanApprovalRecordPreMountAuthorizationBoundaryFixtures,
};

