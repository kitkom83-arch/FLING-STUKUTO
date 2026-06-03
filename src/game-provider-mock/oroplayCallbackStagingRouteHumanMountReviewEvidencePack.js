"use strict";

const PHASE = "ORO-4K";
const GATE = "oroplay_callback_staging_route_human_mount_review_evidence_pack";
const PASS = "PASS";
const FAIL = "FAIL";
const PENDING_HUMAN_APPROVAL = "pending_human_approval";
const NOT_APPROVED_FOR_MOUNT = "not_approved_for_mount";
const EVIDENCE_INCOMPLETE = "evidence_incomplete";

const REQUIRED_EVIDENCE = Object.freeze([
  ["routeWiringDesign", "missing route wiring design"],
  ["mountPreflight", "missing mount preflight"],
  ["dryRunGate", "missing dry-run gate"],
  ["internalShadowHarness", "missing internal shadow harness"],
  ["mountDecisionGate", "missing mount decision gate"],
  ["staticSafetyChecks", "missing static safety checks"],
  ["reviewerSignOffPlaceholder", "missing reviewer sign-off placeholder"],
]);

const REVIEW_SECTIONS = Object.freeze([
  "Route identity review",
  "Callback contract review",
  "Auth/signature boundary review",
  "Idempotency review",
  "Duplicate transaction behavior review",
  "Insufficient balance behavior review",
  "Finished round behavior review",
  "Sanitized logging review",
  "Secret leakage review",
  "Error taxonomy review",
  "Reconciliation/audit expectation review",
  "No-mount safety review",
  "Rollback/abort plan review",
  "Operational owner review",
  "Human sign-off review",
]);

const SAFETY_EXPECTATIONS = Object.freeze([
  ["srcAppJsChangeAbsent", "src/app.js change present"],
  ["expressMountAbsent", "express mount present"],
  ["publicAliasAbsent", "public alias present"],
  ["activeRouteAbsent", "active route present"],
  ["httpListenerAbsent", "http listener present"],
  ["runtimeTrafficAbsent", "runtime traffic present"],
  ["walletMutationAbsent", "walletMutation present"],
  ["ledgerMutationAbsent", "ledgerMutation present"],
  ["prismaWriteAbsent", "prismaWrite present"],
  ["dbTransactionAbsent", "db transaction present"],
  ["externalNetworkAbsent", "externalNetwork present"],
  ["liveOroPlayApiCallAbsent", "live OroPlay API call present"],
  ["migrationAbsent", "migration present"],
  ["realMoneyAbsent", "real money present"],
]);

const FORBIDDEN_APPROVAL_VALUES = Object.freeze([
  "approved",
  "mount_approved",
  "ready_for_live_traffic",
  "production_ready",
  "live_ready",
  "auto_approved",
]);

const SENSITIVE_KEY_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|databaseurl|database_url|privatekey|apikey|api-key|cookie|set-cookie|x-api-key|signature/i;

const SECRET_SHAPED_PATTERNS = Object.freeze([
  /\bBearer\s+\S+/i,
  /\bBasic\s+\S+/i,
  /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
  /-----BEGIN\s+PRIVATE\s+KEY-----/i,
  /DATABASE_URL\s*[:=]/i,
  /\b[A-Za-z0-9_-]{32,}\b/,
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sanitizeScalar(value) {
  if (typeof value !== "string") return value;
  let output = value;
  for (const pattern of SECRET_SHAPED_PATTERNS) {
    output = output.replace(pattern, "[REDACTED]");
  }
  return output;
}

function sanitizeHumanMountReviewEvidence(value) {
  if (Array.isArray(value)) return value.map((entry) => sanitizeHumanMountReviewEvidence(entry));
  if (!isPlainObject(value)) return sanitizeScalar(value);

  const output = {};
  let redactedCount = 0;
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      redactedCount += 1;
      continue;
    }
    output[key] = sanitizeHumanMountReviewEvidence(entry);
  }
  if (redactedCount > 0) output.redactedFieldCount = redactedCount;
  return output;
}

function collectStringValues(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectStringValues(entry, output);
    return output;
  }
  if (isPlainObject(value)) {
    for (const entry of Object.values(value)) collectStringValues(entry, output);
  }
  return output;
}

function hasSecretShapedValue(value) {
  return collectStringValues(value).some((entry) => SECRET_SHAPED_PATTERNS.some((pattern) => pattern.test(entry)));
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  return {
    id: String(source.id || "unnamed-human-mount-review-evidence-pack-fixture"),
    evidenceSources: isPlainObject(source.evidenceSources) ? source.evidenceSources : {},
    staticSafetyChecks: isPlainObject(source.staticSafetyChecks) ? source.staticSafetyChecks : {},
    reviewerSignOffPlaceholder: isPlainObject(source.reviewerSignOffPlaceholder)
      ? source.reviewerSignOffPlaceholder
      : {},
    requestedMountApproval: source.requestedMountApproval,
    trace: source.trace || {},
    expected: isPlainObject(source.expected) ? source.expected : {},
  };
}

function sourcePresent(source) {
  if (source === true) return true;
  if (!isPlainObject(source)) return false;
  if (source.present === false) return false;
  return source.present === true || source.status === "present" || source.result === PASS || source.result === "AVAILABLE";
}

function buildEvidenceItems(fixture) {
  return REQUIRED_EVIDENCE.map(([key, missingMessage]) => {
    const source =
      key === "reviewerSignOffPlaceholder" ? fixture.reviewerSignOffPlaceholder : fixture.evidenceSources[key];
    const present = sourcePresent(source);
    return {
      key,
      label: missingMessage.replace(/^missing\s+/, ""),
      present,
      status: present ? "present" : "missing",
    };
  });
}

function safetyFlag(fixture, key) {
  return fixture.staticSafetyChecks[key] === true;
}

function buildSafetySummary(fixture) {
  return {
    srcAppJsChange: safetyFlag(fixture, "srcAppJsChangeAbsent") ? "absent" : "present",
    expressMount: safetyFlag(fixture, "expressMountAbsent") ? "absent" : "present",
    publicAlias: safetyFlag(fixture, "publicAliasAbsent") ? "absent" : "present",
    activeRoute: safetyFlag(fixture, "activeRouteAbsent") ? "absent" : "present",
    httpListener: safetyFlag(fixture, "httpListenerAbsent") ? "absent" : "present",
    runtimeTraffic: safetyFlag(fixture, "runtimeTrafficAbsent") ? "absent" : "present",
    walletMutation: safetyFlag(fixture, "walletMutationAbsent") ? "absent" : "present",
    ledgerMutation: safetyFlag(fixture, "ledgerMutationAbsent") ? "absent" : "present",
    prismaWrite: safetyFlag(fixture, "prismaWriteAbsent") ? "absent" : "present",
    dbTransaction: safetyFlag(fixture, "dbTransactionAbsent") ? "absent" : "present",
    externalNetwork: safetyFlag(fixture, "externalNetworkAbsent") ? "absent" : "present",
    liveOroPlayApiCall: safetyFlag(fixture, "liveOroPlayApiCallAbsent") ? "absent" : "present",
    migration: safetyFlag(fixture, "migrationAbsent") ? "absent" : "present",
    realMoney: safetyFlag(fixture, "realMoneyAbsent") ? "absent" : "present",
  };
}

function collectForbiddenApprovalAttempts(fixture) {
  const values = [
    fixture.requestedMountApproval,
    fixture.reviewerSignOffPlaceholder.decision,
    fixture.expected.mountApproval,
  ];
  return values
    .filter((value) => typeof value === "string")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => FORBIDDEN_APPROVAL_VALUES.includes(value));
}

function buildHumanMountReviewEvidencePack(input) {
  const fixture = normalizeInput(input);
  const evidenceItems = buildEvidenceItems(fixture);
  const safetySummary = buildSafetySummary(fixture);
  const sanitizedTrace = sanitizeHumanMountReviewEvidence(fixture.trace);
  const blockers = [];

  for (const item of evidenceItems) {
    if (!item.present) blockers.push(REQUIRED_EVIDENCE.find(([key]) => key === item.key)[1]);
  }

  for (const [key, blocker] of SAFETY_EXPECTATIONS) {
    if (!safetyFlag(fixture, key)) blockers.push(blocker);
  }

  if (hasSecretShapedValue(sanitizedTrace)) blockers.push("sanitized trace contains secret-shaped value");

  if (collectForbiddenApprovalAttempts(fixture).length > 0) {
    blockers.push("auto approval forbidden");
  }

  const missingEvidence = evidenceItems.some((item) => !item.present);
  const evidencePackResult = blockers.length === 0 ? PASS : FAIL;
  let mountApproval = PENDING_HUMAN_APPROVAL;
  if (evidencePackResult === FAIL) {
    mountApproval = missingEvidence ? EVIDENCE_INCOMPLETE : NOT_APPROVED_FOR_MOUNT;
  }
  if (blockers.includes("auto approval forbidden")) mountApproval = NOT_APPROVED_FOR_MOUNT;

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    evidenceItems,
    reviewSections: REVIEW_SECTIONS.slice(),
    safetySummary,
    evidencePackResult,
    mountApproval,
    humanApprovalRequired: true,
    expressMount: safetySummary.expressMount,
    publicAlias: safetySummary.publicAlias,
    activeRoute: safetySummary.activeRoute,
    runtimeTraffic: safetySummary.runtimeTraffic,
    walletMutation: safetySummary.walletMutation,
    ledgerMutation: safetySummary.ledgerMutation,
    prismaWrite: safetySummary.prismaWrite,
    dbTransaction: safetySummary.dbTransaction,
    externalNetwork: safetySummary.externalNetwork,
    liveOroPlayApiCall: safetySummary.liveOroPlayApiCall,
    realMoney: safetySummary.realMoney,
    blockers,
    sanitizedTrace,
  };
}

function runHumanMountReviewEvidencePack(fixtures) {
  const source = Array.isArray(fixtures) ? fixtures : [fixtures];
  return source.map((fixture) => buildHumanMountReviewEvidencePack(fixture));
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  PENDING_HUMAN_APPROVAL,
  NOT_APPROVED_FOR_MOUNT,
  EVIDENCE_INCOMPLETE,
  REQUIRED_EVIDENCE,
  REVIEW_SECTIONS,
  buildHumanMountReviewEvidencePack,
  runHumanMountReviewEvidencePack,
  sanitizeHumanMountReviewEvidence,
};
