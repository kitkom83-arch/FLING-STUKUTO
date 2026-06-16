"use strict";

const {
  ORO11H_STATUS,
  buildOro11hDefaultInput,
  buildOro11hSafetySummary,
} = require("./oro11hSeparateGate");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildFixture(id, overrides = {}) {
  const merged = clone(buildOro11hDefaultInput());
  merged.id = id;
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === "object" && !Array.isArray(value) && merged[key] && typeof merged[key] === "object") {
      merged[key] = { ...merged[key], ...value };
    } else {
      merged[key] = value;
    }
  }
  return Object.freeze(merged);
}

const validOro11hUserApprovedSeparateGateFixture = buildFixture("validOro11hUserApprovedSeparateGateFixture");
const approvedForGateOnlyFixture = buildFixture("approvedForGateOnlyFixture", {
  status: ORO11H_STATUS.APPROVED_FOR_GATE_ONLY,
});
const rejectedGateRecordFixture = buildFixture("rejectedGateRecordFixture", {
  status: ORO11H_STATUS.REJECTED,
});
const missingApprovalFixture = buildFixture("missingApprovalFixture", {
  status: ORO11H_STATUS.MISSING_APPROVAL,
  approvalEvidence: { createdFromHumanApproval: false, separateGateApprovalPresent: false },
  safetyEvidence: buildOro11hSafetySummary({
    humanApprovedSeparateGateDecision: false,
    separateGateApprovalPresent: false,
    userApprovedNextGateAfterOro11g: false,
  }),
});
const previousPhaseNotClosedFixture = buildFixture("previousPhaseNotClosedFixture", {
  approvalEvidence: { oro11gClosed: false },
  safetyEvidence: buildOro11hSafetySummary({ oro11gClosed: false }),
});
const routeMountEnabledFixture = buildFixture("routeMountEnabledFixture", {
  status: ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED,
  safetyEvidence: buildOro11hSafetySummary({ routeMountDisabled: false, routeMountEnabled: true }),
});
const publicAliasEnabledFixture = buildFixture("publicAliasEnabledFixture", {
  status: ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED,
  safetyEvidence: buildOro11hSafetySummary({ publicAliasDisabled: false, publicAliasEnabled: true }),
});
const runtimeTrafficEnabledFixture = buildFixture("runtimeTrafficEnabledFixture", {
  status: ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED,
  safetyEvidence: buildOro11hSafetySummary({ runtimeTrafficDisabled: false, runtimeTrafficEnabled: true }),
});
const walletMutationFixture = buildFixture("walletMutationFixture", {
  status: ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED,
  safetyEvidence: buildOro11hSafetySummary({ walletMutationDisabled: false, walletMutation: true }),
});
const ledgerMutationFixture = buildFixture("ledgerMutationFixture", {
  status: ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED,
  safetyEvidence: buildOro11hSafetySummary({ ledgerMutationDisabled: false, ledgerMutation: true }),
});
const liveExecutionFixture = buildFixture("liveExecutionFixture", {
  status: ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED,
  safetyEvidence: buildOro11hSafetySummary({ liveExecutionDisabled: false, liveExecution: true }),
});
const externalCallFixture = buildFixture("externalCallFixture", {
  status: ORO11H_STATUS.UNSAFE_RUNTIME_REQUESTED,
  safetyEvidence: buildOro11hSafetySummary({
    externalCallDisabled: false,
    externalCall: true,
    externalNetworkCalled: true,
  }),
});
const guardedShapeFixture = buildFixture("guardedShapeFixture", {
  approvalEvidence: { credentialMarker: "mock-placeholder-only" },
});
const nextGateMissingFixture = buildFixture("nextGateMissingFixture", {
  safetyEvidence: buildOro11hSafetySummary({ nextPhaseRequiresSeparateGate: false }),
});

function buildOro11hSeparateGateFixtures() {
  return [
    validOro11hUserApprovedSeparateGateFixture,
    approvedForGateOnlyFixture,
    rejectedGateRecordFixture,
    missingApprovalFixture,
    previousPhaseNotClosedFixture,
    routeMountEnabledFixture,
    publicAliasEnabledFixture,
    runtimeTrafficEnabledFixture,
    walletMutationFixture,
    ledgerMutationFixture,
    liveExecutionFixture,
    externalCallFixture,
    guardedShapeFixture,
    nextGateMissingFixture,
  ];
}

module.exports = {
  validOro11hUserApprovedSeparateGateFixture,
  approvedForGateOnlyFixture,
  rejectedGateRecordFixture,
  missingApprovalFixture,
  previousPhaseNotClosedFixture,
  routeMountEnabledFixture,
  publicAliasEnabledFixture,
  runtimeTrafficEnabledFixture,
  walletMutationFixture,
  ledgerMutationFixture,
  liveExecutionFixture,
  externalCallFixture,
  guardedShapeFixture,
  nextGateMissingFixture,
  buildOro11hSeparateGateFixtures,
};
