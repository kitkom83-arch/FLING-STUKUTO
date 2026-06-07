"use strict";

const {
  FAIL_CLOSED_NO_MUTATION,
  PASS: ORO6D_PASS,
  VALIDATION_PASSED,
  buildOro6dLiveTrafficPostEnablementValidationSummary,
} = require("./oro6dLiveTrafficPostEnablementValidationBoundary");

const PHASE = "ORO-6E";
const PASS = "PASS";
const HOLD = "HOLD";
const EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS =
  "submitted_pending_decision";
const EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS = "pending";
const LIVE_TRAFFIC_MODE = FAIL_CLOSED_NO_MUTATION;

const ORO6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS =
  Object.freeze({
    PHASE,
    PASS,
    HOLD,
    EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
    EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS,
    LIVE_TRAFFIC_MODE,
  });

const BASELINE_ORO6D_SUMMARY =
  buildOro6dLiveTrafficPostEnablementValidationSummary();

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(base, overrides) {
  if (!isPlainObject(overrides)) return clone(base);
  const output = clone(base);
  for (const [key, value] of Object.entries(overrides)) {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = clone(value);
    }
  }
  return output;
}

function readBoolean(source, key, fallback) {
  if (isPlainObject(source) && typeof source[key] === "boolean") return source[key];
  return fallback;
}

function readString(source, key, fallback) {
  if (isPlainObject(source) && typeof source[key] === "string" && source[key].trim()) {
    return source[key];
  }
  return fallback;
}

function buildOro6eLiveTrafficExternalCallAuthorizationRequestInput(overrides = {}) {
  const baseline = {
    id: "happyPathLiveTrafficExternalCallAuthorizationRequestFixture",
    phase: PHASE,
    oro6dValidationEvidence: {
      dependsOnOro6dLiveTrafficPostEnablementValidationBoundary: true,
      oro6dLiveTrafficPostEnablementValidationPassed:
        BASELINE_ORO6D_SUMMARY.liveTrafficPostEnablementValidationBoundaryResult ===
          ORO6D_PASS &&
        BASELINE_ORO6D_SUMMARY.liveTrafficPostEnablementValidationStatus ===
          VALIDATION_PASSED,
      liveTrafficAllowedFromOro6d:
        BASELINE_ORO6D_SUMMARY.liveTrafficAllowedFromOro6c === true,
      liveTrafficEnabledFromOro6d:
        BASELINE_ORO6D_SUMMARY.liveTrafficEnabledFromOro6c === true,
      liveTrafficModeFromOro6d:
        BASELINE_ORO6D_SUMMARY.liveTrafficModeFromOro6c,
      nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest:
        BASELINE_ORO6D_SUMMARY.nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest ===
        true,
    },
    requestEvidence: {
      externalCallAuthorizationRequestPrepared: true,
      externalCallAuthorizationRequestSubmitted: true,
      externalCallAuthorizationRequestStatus:
        EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
      humanApprovalRequired: true,
      separateExternalCallDecisionRequired: true,
      nextPhaseRequiresExternalCallAuthorizationDecision: true,
      responseSanitized: true,
    },
    decisionEvidence: {
      externalCallAuthorizationDecisionIssued: false,
      externalCallAuthorizationDecisionStatus:
        EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS,
    },
    safetyEvidence: {
      externalNetworkAllowed: false,
      externalNetworkCalled: false,
      liveOroPlayApiCallAllowed: false,
      liveOroPlayApiCalled: false,
      walletMutationAllowed: false,
      walletMutationPerformed: false,
      ledgerMutationAllowed: false,
      ledgerMutationPerformed: false,
      prismaWriteAllowed: false,
      prismaWritePerformed: false,
      dbTransactionAllowed: false,
      dbTransactionPerformed: false,
      migrationAllowed: false,
      migrationPerformed: false,
      secretsLeaked: false,
    },
    fileEvidence: {
      srcAppChangedInOro6e: false,
      runtimeRouteControllerServiceChangedInOro6e: false,
    },
  };
  return deepMerge(baseline, overrides);
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const baseline =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestInput();
  const merged = deepMerge(baseline, source);
  const oro6d = isPlainObject(merged.oro6dValidationEvidence)
    ? merged.oro6dValidationEvidence
    : {};
  const request = isPlainObject(merged.requestEvidence)
    ? merged.requestEvidence
    : {};
  const decision = isPlainObject(merged.decisionEvidence)
    ? merged.decisionEvidence
    : {};
  const safety = isPlainObject(merged.safetyEvidence) ? merged.safetyEvidence : {};
  const files = isPlainObject(merged.fileEvidence) ? merged.fileEvidence : {};

  return {
    id: readString(merged, "id", baseline.id),
    dependsOnOro6dLiveTrafficPostEnablementValidationBoundary: readBoolean(
      oro6d,
      "dependsOnOro6dLiveTrafficPostEnablementValidationBoundary",
      true
    ),
    oro6dLiveTrafficPostEnablementValidationPassed: readBoolean(
      oro6d,
      "oro6dLiveTrafficPostEnablementValidationPassed",
      true
    ),
    liveTrafficAllowedFromOro6d: readBoolean(
      oro6d,
      "liveTrafficAllowedFromOro6d",
      true
    ),
    liveTrafficEnabledFromOro6d: readBoolean(
      oro6d,
      "liveTrafficEnabledFromOro6d",
      true
    ),
    liveTrafficModeFromOro6d: readString(
      oro6d,
      "liveTrafficModeFromOro6d",
      LIVE_TRAFFIC_MODE
    ),
    nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest: readBoolean(
      oro6d,
      "nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest",
      true
    ),
    externalCallAuthorizationRequestPrepared: readBoolean(
      request,
      "externalCallAuthorizationRequestPrepared",
      true
    ),
    externalCallAuthorizationRequestSubmitted: readBoolean(
      request,
      "externalCallAuthorizationRequestSubmitted",
      true
    ),
    externalCallAuthorizationRequestStatus: readString(
      request,
      "externalCallAuthorizationRequestStatus",
      EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS
    ),
    humanApprovalRequired: readBoolean(request, "humanApprovalRequired", true),
    separateExternalCallDecisionRequired: readBoolean(
      request,
      "separateExternalCallDecisionRequired",
      true
    ),
    nextPhaseRequiresExternalCallAuthorizationDecision: readBoolean(
      request,
      "nextPhaseRequiresExternalCallAuthorizationDecision",
      true
    ),
    responseSanitized: readBoolean(request, "responseSanitized", true),
    externalCallAuthorizationDecisionIssued: readBoolean(
      decision,
      "externalCallAuthorizationDecisionIssued",
      false
    ),
    externalCallAuthorizationDecisionStatus: readString(
      decision,
      "externalCallAuthorizationDecisionStatus",
      EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS
    ),
    externalNetworkAllowed: readBoolean(safety, "externalNetworkAllowed", false),
    externalNetworkCalled: readBoolean(safety, "externalNetworkCalled", false),
    liveOroPlayApiCallAllowed: readBoolean(
      safety,
      "liveOroPlayApiCallAllowed",
      false
    ),
    liveOroPlayApiCalled: readBoolean(safety, "liveOroPlayApiCalled", false),
    walletMutationAllowed: readBoolean(safety, "walletMutationAllowed", false),
    walletMutationPerformed: readBoolean(safety, "walletMutationPerformed", false),
    ledgerMutationAllowed: readBoolean(safety, "ledgerMutationAllowed", false),
    ledgerMutationPerformed: readBoolean(safety, "ledgerMutationPerformed", false),
    prismaWriteAllowed: readBoolean(safety, "prismaWriteAllowed", false),
    prismaWritePerformed: readBoolean(safety, "prismaWritePerformed", false),
    dbTransactionAllowed: readBoolean(safety, "dbTransactionAllowed", false),
    dbTransactionPerformed: readBoolean(safety, "dbTransactionPerformed", false),
    migrationAllowed: readBoolean(safety, "migrationAllowed", false),
    migrationPerformed: readBoolean(safety, "migrationPerformed", false),
    secretsLeaked: readBoolean(safety, "secretsLeaked", false),
    srcAppChangedInOro6e: readBoolean(files, "srcAppChangedInOro6e", false),
    runtimeRouteControllerServiceChangedInOro6e: readBoolean(
      files,
      "runtimeRouteControllerServiceChangedInOro6e",
      false
    ),
  };
}

function validationBlockersFor(input) {
  const fixture = normalizeInput(input);
  const blockers = [];

  if (
    !fixture.dependsOnOro6dLiveTrafficPostEnablementValidationBoundary ||
    !fixture.oro6dLiveTrafficPostEnablementValidationPassed ||
    !fixture.liveTrafficAllowedFromOro6d ||
    !fixture.liveTrafficEnabledFromOro6d ||
    fixture.liveTrafficModeFromOro6d !== LIVE_TRAFFIC_MODE ||
    !fixture.nextPhaseRequiresLiveTrafficExternalCallAuthorizationRequest
  ) {
    blockers.push("ORO-6D post-enablement validation record is required");
  }
  if (
    !fixture.externalCallAuthorizationRequestPrepared ||
    !fixture.externalCallAuthorizationRequestSubmitted ||
    fixture.externalCallAuthorizationRequestStatus !==
      EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS
  ) {
    blockers.push("external call authorization request must be submitted only as pending decision");
  }
  if (
    !fixture.humanApprovalRequired ||
    !fixture.separateExternalCallDecisionRequired ||
    !fixture.nextPhaseRequiresExternalCallAuthorizationDecision
  ) {
    blockers.push("human approval and separate external call decision are required");
  }
  if (!fixture.responseSanitized) {
    blockers.push("external call authorization request response must remain sanitized");
  }
  if (
    fixture.externalCallAuthorizationDecisionIssued ||
    fixture.externalCallAuthorizationDecisionStatus !==
      EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS
  ) {
    blockers.push("external call authorization decision must remain pending");
  }
  if (
    fixture.srcAppChangedInOro6e ||
    fixture.runtimeRouteControllerServiceChangedInOro6e
  ) {
    blockers.push("ORO-6E must not change runtime app, route, controller, or service files");
  }
  if (fixture.externalNetworkAllowed || fixture.externalNetworkCalled) {
    blockers.push("external network must remain absent during external call request");
  }
  if (fixture.liveOroPlayApiCallAllowed || fixture.liveOroPlayApiCalled) {
    blockers.push("live OroPlay API call must remain absent during external call request");
  }
  if (fixture.walletMutationAllowed || fixture.walletMutationPerformed) {
    blockers.push("wallet mutation must remain absent during external call request");
  }
  if (fixture.ledgerMutationAllowed || fixture.ledgerMutationPerformed) {
    blockers.push("ledger mutation must remain absent during external call request");
  }
  if (
    fixture.prismaWriteAllowed ||
    fixture.prismaWritePerformed ||
    fixture.dbTransactionAllowed ||
    fixture.dbTransactionPerformed
  ) {
    blockers.push("Prisma write and DB transaction must remain absent during external call request");
  }
  if (fixture.migrationAllowed || fixture.migrationPerformed) {
    blockers.push("migration must remain absent during external call request");
  }
  if (fixture.secretsLeaked) {
    blockers.push("sensitive-shaped values must not leak during external call request");
  }

  return blockers;
}

function buildOutput(result, blockers, fixture) {
  const pass = result === PASS;
  return {
    phase: PHASE,
    fixtureId: fixture.id,
    liveTrafficExternalCallAuthorizationRequestBoundaryResult: result,
    dependsOnOro6dLiveTrafficPostEnablementValidationBoundary:
      fixture.dependsOnOro6dLiveTrafficPostEnablementValidationBoundary,
    oro6dLiveTrafficPostEnablementValidationPassed:
      pass && fixture.oro6dLiveTrafficPostEnablementValidationPassed,
    liveTrafficAllowedFromOro6d:
      pass && fixture.liveTrafficAllowedFromOro6d,
    liveTrafficEnabledFromOro6d:
      pass && fixture.liveTrafficEnabledFromOro6d,
    liveTrafficModeFromOro6d: pass
      ? fixture.liveTrafficModeFromOro6d
      : HOLD,
    externalCallAuthorizationRequestPrepared:
      pass && fixture.externalCallAuthorizationRequestPrepared,
    externalCallAuthorizationRequestSubmitted:
      pass && fixture.externalCallAuthorizationRequestSubmitted,
    externalCallAuthorizationRequestStatus: pass
      ? fixture.externalCallAuthorizationRequestStatus
      : HOLD,
    humanApprovalRequired: pass && fixture.humanApprovalRequired,
    separateExternalCallDecisionRequired:
      pass && fixture.separateExternalCallDecisionRequired,
    nextPhaseRequiresExternalCallAuthorizationDecision:
      pass && fixture.nextPhaseRequiresExternalCallAuthorizationDecision,
    externalCallAuthorizationDecisionIssued: false,
    externalCallAuthorizationDecisionStatus:
      EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS,
    externalNetworkAllowed: false,
    externalNetworkCalled: false,
    liveOroPlayApiCallAllowed: false,
    liveOroPlayApiCalled: false,
    walletMutationAllowed: false,
    walletMutationPerformed: false,
    ledgerMutationAllowed: false,
    ledgerMutationPerformed: false,
    prismaWriteAllowed: false,
    prismaWritePerformed: false,
    dbTransactionAllowed: false,
    dbTransactionPerformed: false,
    migrationAllowed: false,
    migrationPerformed: false,
    secretsLeaked: false,
    blockers,
  };
}

function buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(
  input = buildOro6eLiveTrafficExternalCallAuthorizationRequestInput()
) {
  const fixture = normalizeInput(input);
  const blockers = validationBlockersFor(input);
  if (blockers.length > 0) return buildOutput(HOLD, blockers, fixture);
  return buildOutput(PASS, [], fixture);
}

function resultFor(input) {
  const summary =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(input);
  return {
    valid:
      summary.liveTrafficExternalCallAuthorizationRequestBoundaryResult === PASS,
    liveTrafficExternalCallAuthorizationRequestBoundaryResult:
      summary.liveTrafficExternalCallAuthorizationRequestBoundaryResult,
    blockers: summary.blockers.slice(),
  };
}

function validateOro6dLiveTrafficPostEnablementValidationRecord(input) {
  const summary =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.dependsOnOro6dLiveTrafficPostEnablementValidationBoundary &&
    summary.oro6dLiveTrafficPostEnablementValidationPassed &&
    summary.liveTrafficAllowedFromOro6d &&
    summary.liveTrafficEnabledFromOro6d &&
    summary.liveTrafficModeFromOro6d === LIVE_TRAFFIC_MODE;
  return { ...base, valid };
}

function buildLiveTrafficExternalCallAuthorizationRequest(input) {
  const fixture = normalizeInput(input);
  return {
    externalCallAuthorizationRequestPrepared:
      fixture.externalCallAuthorizationRequestPrepared,
    externalCallAuthorizationRequestSubmitted:
      fixture.externalCallAuthorizationRequestSubmitted,
    externalCallAuthorizationRequestStatus:
      fixture.externalCallAuthorizationRequestStatus,
    humanApprovalRequired: fixture.humanApprovalRequired,
    separateExternalCallDecisionRequired:
      fixture.separateExternalCallDecisionRequired,
    nextPhaseRequiresExternalCallAuthorizationDecision:
      fixture.nextPhaseRequiresExternalCallAuthorizationDecision,
    responseSanitized: fixture.responseSanitized,
  };
}

function validateLiveTrafficExternalCallAuthorizationRequestBoundary(input) {
  const summary =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(input);
  const request = buildLiveTrafficExternalCallAuthorizationRequest(input);
  const base = resultFor(input);
  const valid =
    base.valid &&
    summary.externalCallAuthorizationRequestPrepared &&
    summary.externalCallAuthorizationRequestSubmitted &&
    summary.externalCallAuthorizationRequestStatus ===
      EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS &&
    summary.humanApprovalRequired &&
    summary.separateExternalCallDecisionRequired &&
    summary.nextPhaseRequiresExternalCallAuthorizationDecision &&
    request.responseSanitized;
  return { ...base, valid };
}

function validateNoExternalNetworkDuringRequest(input) {
  const summary =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const unsafe = ["externalNetworkAllowed", "externalNetworkCalled"].filter(
    (key) => summary[key] !== false
  );
  return { ...base, valid: base.valid && unsafe.length === 0, unsafe };
}

function validateNoLiveOroPlayApiCallDuringRequest(input) {
  const summary =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const unsafe = ["liveOroPlayApiCallAllowed", "liveOroPlayApiCalled"].filter(
    (key) => summary[key] !== false
  );
  return { ...base, valid: base.valid && unsafe.length === 0, unsafe };
}

function validateNoMutationDuringExternalCallRequest(input) {
  const summary =
    buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary(input);
  const base = resultFor(input);
  const unsafe = [
    "walletMutationAllowed",
    "walletMutationPerformed",
    "ledgerMutationAllowed",
    "ledgerMutationPerformed",
    "prismaWriteAllowed",
    "prismaWritePerformed",
    "dbTransactionAllowed",
    "dbTransactionPerformed",
    "migrationAllowed",
    "migrationPerformed",
    "secretsLeaked",
  ].filter((key) => summary[key] !== false);
  return { ...base, valid: base.valid && unsafe.length === 0, unsafe };
}

module.exports = {
  PHASE,
  PASS,
  HOLD,
  EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
  EXTERNAL_CALL_AUTHORIZATION_DECISION_STATUS,
  LIVE_TRAFFIC_MODE,
  FAIL_CLOSED_NO_MUTATION,
  ORO6E_LIVE_TRAFFIC_EXTERNAL_CALL_AUTHORIZATION_REQUEST_STATUS,
  buildOro6eLiveTrafficExternalCallAuthorizationRequestInput,
  validateOro6dLiveTrafficPostEnablementValidationRecord,
  buildLiveTrafficExternalCallAuthorizationRequest,
  validateLiveTrafficExternalCallAuthorizationRequestBoundary,
  validateNoExternalNetworkDuringRequest,
  validateNoLiveOroPlayApiCallDuringRequest,
  validateNoMutationDuringExternalCallRequest,
  buildOro6eLiveTrafficExternalCallAuthorizationRequestSummary,
};
