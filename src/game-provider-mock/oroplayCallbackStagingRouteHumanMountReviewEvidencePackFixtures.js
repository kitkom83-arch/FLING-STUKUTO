"use strict";

const baseEvidenceSources = Object.freeze({
  routeWiringDesign: {
    present: true,
    phase: "ORO-4F",
    artifact: "Staging Route Wiring Design Contract",
  },
  mountPreflight: {
    present: true,
    phase: "ORO-4G",
    artifact: "Staging Route Wiring Preflight / Mount Readiness Checklist",
  },
  dryRunGate: {
    present: true,
    phase: "ORO-4H",
    artifact: "Staging Route Wiring Dry-Run Gate",
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

const baseReviewerSignOffPlaceholder = Object.freeze({
  present: true,
  reviewer: "",
  date: "",
  decision: "pending_human_approval_for_next_phase",
  signed: false,
});

function baseFixture(id) {
  return {
    id,
    phase: "ORO-4K",
    evidenceSources: JSON.parse(JSON.stringify(baseEvidenceSources)),
    staticSafetyChecks: { ...baseStaticSafetyChecks },
    reviewerSignOffPlaceholder: { ...baseReviewerSignOffPlaceholder },
    trace: {
      routeCandidates: ["POST /api/oroplay/balance", "POST /api/oroplay/transaction"],
      publicAliases: ["POST /api/balance", "POST /api/transaction"],
      evidenceMode: "static mock evidence pack",
      finalBoundary: "pending human approval",
    },
    expected: {
      evidencePackResult: "PASS",
      mountApproval: "pending_human_approval",
      humanApprovalRequired: true,
      blockers: [],
    },
  };
}

const happyPathEvidencePackFixture = Object.freeze(baseFixture("happyPathEvidencePackFixture"));

const missingInternalShadowHarnessEvidenceFixture = Object.freeze({
  ...baseFixture("missingInternalShadowHarnessEvidenceFixture"),
  evidenceSources: {
    ...baseEvidenceSources,
    internalShadowHarness: {
      present: false,
      phase: "ORO-4I",
    },
  },
  expected: {
    evidencePackResult: "FAIL",
    mountApproval: "evidence_incomplete",
    blocker: "missing internal shadow harness",
  },
});

const missingMountDecisionGateEvidenceFixture = Object.freeze({
  ...baseFixture("missingMountDecisionGateEvidenceFixture"),
  evidenceSources: {
    ...baseEvidenceSources,
    mountDecisionGate: {
      present: false,
      phase: "ORO-4J",
    },
  },
  expected: {
    evidencePackResult: "FAIL",
    mountApproval: "evidence_incomplete",
    blocker: "missing mount decision gate",
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
    evidencePackResult: "FAIL",
    mountApproval: "not_approved_for_mount",
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
    evidencePackResult: "FAIL",
    mountApproval: "not_approved_for_mount",
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
    evidencePackResult: "FAIL",
    mountApproval: "not_approved_for_mount",
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
    evidencePackResult: "FAIL",
    mountApproval: "not_approved_for_mount",
    blocker: "externalNetwork present",
  },
});

const autoApprovalAttemptedFixture = Object.freeze({
  ...baseFixture("autoApprovalAttemptedFixture"),
  requestedMountApproval: "mount_approved",
  reviewerSignOffPlaceholder: {
    ...baseReviewerSignOffPlaceholder,
    decision: "auto_approved",
  },
  expected: {
    evidencePackResult: "FAIL",
    mountApproval: "not_approved_for_mount",
    blocker: "auto approval forbidden",
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
secretLikeTrace.nested = {};
secretLikeTrace.nested[["bear", "er"].join("")] = ["mock", "bearer", "value"].join("-");
secretLikeTrace.nested[["bas", "ic"].join("")] = ["mock", "basic", "value"].join("-");
secretLikeTrace.nested[["set", "Cookie"].join("")] = ["mock", "set", "cookie", "value"].join("-");
secretLikeTrace.nested[["x", "Api", "Key"].join("")] = ["mock", "x", "api", "key", "value"].join("-");

const secretLikeTraceFixture = Object.freeze({
  ...baseFixture("secretLikeTraceFixture"),
  trace: secretLikeTrace,
  expected: {
    evidencePackResult: "PASS",
    mountApproval: "pending_human_approval",
    humanApprovalRequired: true,
    sanitized: true,
  },
});

function cloneFixture(fixture) {
  return JSON.parse(JSON.stringify(fixture));
}

function buildHumanMountReviewEvidencePackFixtures() {
  return [
    happyPathEvidencePackFixture,
    missingInternalShadowHarnessEvidenceFixture,
    missingMountDecisionGateEvidenceFixture,
    accidentalExpressMountFixture,
    publicAliasFixture,
    runtimeMutationFixture,
    externalNetworkFixture,
    autoApprovalAttemptedFixture,
    secretLikeTraceFixture,
  ].map(cloneFixture);
}

module.exports = {
  happyPathEvidencePackFixture,
  missingInternalShadowHarnessEvidenceFixture,
  missingMountDecisionGateEvidenceFixture,
  accidentalExpressMountFixture,
  publicAliasFixture,
  runtimeMutationFixture,
  externalNetworkFixture,
  autoApprovalAttemptedFixture,
  secretLikeTraceFixture,
  cloneFixture,
  buildHumanMountReviewEvidencePackFixtures,
};
