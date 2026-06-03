"use strict";

const PHASE = "ORO-4J";
const GATE = "oroplay_callback_staging_route_mount_decision_readiness";
const PASS = "PASS";
const FAIL = "FAIL";
const BLOCKED = "BLOCKED";
const MANUAL_REVIEW_REQUIRED = "manual_review_required";
const NOT_APPROVED_FOR_MOUNT = "not_approved_for_mount";
const BLOCKED_DECISION = "blocked";

const REQUIRED_CHECKS = Object.freeze([
  "routeCandidateDescriptorExists",
  "internalShadowHarnessExists",
  "dryRunGateExists",
  "balanceCallbackContractReviewed",
  "transactionCallbackContractReviewed",
  "duplicateTransactionIdempotencyReviewed",
  "insufficientBalanceBehaviorReviewed",
  "finishedRoundBehaviorReviewed",
  "sanitizedLogBoundaryReviewed",
  "secretLeakGuardReviewed",
  "srcAppJsNotChanged",
  "expressMountAbsent",
  "publicAliasAbsent",
  "externalNetworkAbsent",
  "walletMutationAbsent",
  "ledgerMutationAbsent",
  "prismaWriteAbsent",
  "migrationAbsent",
  "runtimeTrafficAbsent",
]);

const SECRET_FIELD_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|databaseurl|database_url|privatekey|apikey|cookie|set-cookie/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sanitizeScalar(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\bBearer\s+\S+/gi, "[REDACTED_AUTH]")
    .replace(/\bBasic\s+\S+/gi, "[REDACTED_AUTH]")
    .replace(/\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_JWT]")
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[REDACTED_SECRET]")
    .replace(/-----BEGIN\s+PRIVATE\s+KEY-----[\s\S]*?-----END\s+PRIVATE\s+KEY-----/gi, "[REDACTED_PRIVATE_KEY]");
}

function sanitizeMountDecisionTrace(value) {
  if (Array.isArray(value)) return value.map((entry) => sanitizeMountDecisionTrace(entry));
  if (!isPlainObject(value)) return sanitizeScalar(value);

  const output = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SECRET_FIELD_PATTERN.test(key)) {
      output[key] = "[REDACTED]";
    } else {
      output[key] = sanitizeMountDecisionTrace(entry);
    }
  }
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
  const patterns = [
    /\bBearer\s+\S+/i,
    /\bBasic\s+\S+/i,
    /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/,
    /\b[A-Za-z0-9_-]{32,}\b/,
    /-----BEGIN\s+PRIVATE\s+KEY-----/i,
    /DATABASE_URL\s*[:=]/i,
  ];
  return collectStringValues(value).some((entry) => patterns.some((pattern) => pattern.test(entry)));
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  const checks = isPlainObject(source.checks) ? source.checks : {};
  const safety = isPlainObject(source.safety) ? source.safety : {};

  return {
    id: String(source.id || "unnamed-mount-decision-readiness-fixture"),
    checks,
    safety,
    trace: source.trace || {},
    expected: isPlainObject(source.expected) ? source.expected : {},
  };
}

function readFlag(checks, safety, name) {
  if (Object.prototype.hasOwnProperty.call(checks, name)) return checks[name] === true;
  if (Object.prototype.hasOwnProperty.call(safety, name)) return safety[name] === true;
  return false;
}

function buildCheck(name, fixture) {
  const passed = readFlag(fixture.checks, fixture.safety, name);
  return {
    name,
    status: passed ? PASS : BLOCKED,
    passed,
  };
}

function safetySummary(fixture) {
  return {
    expressMount: readFlag(fixture.checks, fixture.safety, "expressMountAbsent") ? "absent" : "present",
    publicAlias: readFlag(fixture.checks, fixture.safety, "publicAliasAbsent") ? "absent" : "present",
    runtimeTraffic: readFlag(fixture.checks, fixture.safety, "runtimeTrafficAbsent") ? "absent" : "present",
    walletMutation: readFlag(fixture.checks, fixture.safety, "walletMutationAbsent") ? "absent" : "present",
    ledgerMutation: readFlag(fixture.checks, fixture.safety, "ledgerMutationAbsent") ? "absent" : "present",
    prismaWrite: readFlag(fixture.checks, fixture.safety, "prismaWriteAbsent") ? "absent" : "present",
    externalNetwork: readFlag(fixture.checks, fixture.safety, "externalNetworkAbsent") ? "absent" : "present",
    migration: readFlag(fixture.checks, fixture.safety, "migrationAbsent") ? "absent" : "present",
    srcAppJsChange: readFlag(fixture.checks, fixture.safety, "srcAppJsNotChanged") ? "absent" : "present",
    activeRoute: "absent",
    httpListener: "absent",
    liveOroPlayApiCall: "absent",
    realMoney: "absent",
  };
}

function buildMountDecisionReadinessGateReport(input) {
  const fixture = normalizeInput(input);
  const checks = REQUIRED_CHECKS.map((name) => buildCheck(name, fixture));
  const sanitizedTrace = sanitizeMountDecisionTrace(fixture.trace);
  const sanitizerPassed = !hasSecretShapedValue(sanitizedTrace);

  checks.push({
    name: "sanitizedTraceHasNoSecretShapedValue",
    status: sanitizerPassed ? PASS : BLOCKED,
    passed: sanitizerPassed,
  });

  const blockedChecks = checks.filter((check) => !check.passed);
  const result = blockedChecks.length === 0 ? PASS : FAIL;
  const mountDecision = result === PASS ? MANUAL_REVIEW_REQUIRED : BLOCKED_DECISION;
  const safety = safetySummary(fixture);

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    result,
    mountDecision,
    expressMount: safety.expressMount,
    publicAlias: safety.publicAlias,
    runtimeTraffic: safety.runtimeTraffic,
    walletMutation: safety.walletMutation,
    ledgerMutation: safety.ledgerMutation,
    prismaWrite: safety.prismaWrite,
    externalNetwork: safety.externalNetwork,
    activeRoute: safety.activeRoute,
    httpListener: safety.httpListener,
    checks,
    blockers: blockedChecks.map((check) => check.name),
    safety,
    sanitizedTrace,
    humanApprovalRequired: true,
    approvedForMount: false,
    approvedForLiveTraffic: false,
    approvedForPublicAlias: false,
  };
}

function runMountDecisionReadinessGate(fixtures) {
  const source = Array.isArray(fixtures) ? fixtures : [fixtures];
  return source.map((fixture) => buildMountDecisionReadinessGateReport(fixture));
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  BLOCKED,
  MANUAL_REVIEW_REQUIRED,
  NOT_APPROVED_FOR_MOUNT,
  BLOCKED_DECISION,
  REQUIRED_CHECKS,
  buildMountDecisionReadinessGateReport,
  runMountDecisionReadinessGate,
  sanitizeMountDecisionTrace,
};
