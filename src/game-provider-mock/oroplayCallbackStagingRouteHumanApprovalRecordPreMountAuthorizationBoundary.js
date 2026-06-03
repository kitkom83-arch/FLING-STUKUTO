"use strict";

const PHASE = "ORO-4L";
const GATE = "oroplay_callback_staging_route_human_approval_record_pre_mount_authorization_boundary";
const PASS = "PASS";
const FAIL = "FAIL";
const AUTHORIZATION_RECORD_INCOMPLETE = "authorization_record_incomplete";
const NOT_AUTHORIZED_FOR_MOUNT = "not_authorized_for_mount";
const PENDING_MANUAL_AUTHORIZATION = "pending_manual_authorization";

const REQUIRED_EVIDENCE = Object.freeze([
  ["routeWiringDesign", "missing ORO-4F route wiring design"],
  ["routePreflight", "missing ORO-4G route preflight"],
  ["dryRunGate", "missing ORO-4H dry-run gate"],
  ["internalShadowHarness", "missing ORO-4I internal shadow harness"],
  ["mountDecisionGate", "missing ORO-4J mount decision gate"],
  ["humanMountReviewEvidencePack", "missing ORO-4K evidence pack"],
  ["staticSafetyChecks", "missing static safety checks"],
]);

const REQUIRED_TEMPLATE_FIELDS = Object.freeze([
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
]);

const DECISION_OPTIONS = Object.freeze([
  "changes_requested",
  "not_authorized_for_mount",
  "pending_manual_authorization_for_next_phase",
]);

const REQUIRED_ACKNOWLEDGEMENTS = Object.freeze([
  "I understand this phase does not mount any Express route.",
  "I understand this phase does not authorize live traffic.",
  "I understand this phase does not authorize wallet mutation.",
  "I understand this phase does not authorize ledger mutation.",
  "I understand this phase does not authorize real money.",
  "I understand any future route mount requires a separate phase.",
  "I understand any future route mount requires a separate explicit authorization.",
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

const FORBIDDEN_PRE_MOUNT_AUTHORIZATION_VALUES = Object.freeze([
  "approved",
  "mount_approved",
  "ready_for_live_traffic",
  "production_ready",
  "live_ready",
  "auto_approved",
  "route_mount_authorized",
]);

const SENSITIVE_KEY_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|databaseurl|database_url|privatekey|apikey|api-key|cookie|set-cookie|x-api-key|signature|signedapproval|approvalsignature/i;

const SENSITIVE_TEXT_PATTERN =
  /authorization|bearer|basic|token|secret|clientsecret|password|database_url|databaseurl|private\s*key|privatekey|api\s*key|apikey|api-key|cookie|set-cookie|x-api-key|signature|signed\s*approval|signedapproval|approval\s*signature|approvalsignature/i;

const SECRET_SHAPED_PATTERNS = Object.freeze([
  new RegExp(`${["Be", "arer"].join("")}\\s+\\S+`, "i"),
  new RegExp(`${["Ba", "sic"].join("")}\\s+\\S+`, "i"),
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
  if (SENSITIVE_TEXT_PATTERN.test(output)) return "[MASKED]";
  for (const pattern of SECRET_SHAPED_PATTERNS) {
    output = output.replace(pattern, "[MASKED]");
  }
  return output;
}

function sanitizeHumanApprovalRecordTrace(value) {
  if (Array.isArray(value)) return value.map((entry) => sanitizeHumanApprovalRecordTrace(entry));
  if (!isPlainObject(value)) return sanitizeScalar(value);

  const output = {};
  let maskedFieldCount = 0;
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      maskedFieldCount += 1;
      continue;
    }
    output[key] = sanitizeHumanApprovalRecordTrace(entry);
  }
  if (maskedFieldCount > 0) output.maskedFieldCount = maskedFieldCount;
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
  return collectStringValues(value).some(
    (entry) => SENSITIVE_TEXT_PATTERN.test(entry) || SECRET_SHAPED_PATTERNS.some((pattern) => pattern.test(entry))
  );
}

function normalizeInput(input) {
  const source = isPlainObject(input) ? input : {};
  return {
    id: String(source.id || "unnamed-human-approval-record-pre-mount-authorization-boundary-fixture"),
    evidenceSources: isPlainObject(source.evidenceSources) ? source.evidenceSources : {},
    staticSafetyChecks: isPlainObject(source.staticSafetyChecks) ? source.staticSafetyChecks : {},
    humanApprovalRecordTemplate: isPlainObject(source.humanApprovalRecordTemplate)
      ? source.humanApprovalRecordTemplate
      : {},
    signedHumanApprovalRecord: source.signedHumanApprovalRecord,
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

function evidencePresent(fixture, key) {
  if (key === "staticSafetyChecks" && Object.keys(fixture.staticSafetyChecks).length > 0) return true;
  return sourcePresent(fixture.evidenceSources[key]);
}

function buildEvidenceItems(fixture) {
  return REQUIRED_EVIDENCE.map(([key, missingMessage]) => {
    const present = evidencePresent(fixture, key);
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

function normalizeTemplate(template) {
  const fields = Array.isArray(template.fields) ? template.fields.map(String) : [];
  const decisionOptions = Array.isArray(template.decisionOptions) ? template.decisionOptions.map(String) : [];
  const missingFields = REQUIRED_TEMPLATE_FIELDS.filter((field) => !fields.includes(field));
  const invalidDecisionOptions = decisionOptions.filter(
    (option) => !DECISION_OPTIONS.includes(option) || FORBIDDEN_PRE_MOUNT_AUTHORIZATION_VALUES.includes(option)
  );
  const present = template.present === true && missingFields.length === 0 && invalidDecisionOptions.length === 0;

  return {
    present,
    fields,
    decisionOptions,
    missingFields,
    invalidDecisionOptions,
  };
}

function signedApprovalRecordPresent(value) {
  if (value === true) return true;
  if (!isPlainObject(value)) return false;
  return value.present === true || value.signed === true || value.status === "present" || value.status === "signed";
}

function buildHumanApprovalRecordPreMountAuthorizationBoundary(input) {
  const fixture = normalizeInput(input);
  const evidenceItems = buildEvidenceItems(fixture);
  const authorizationRecordTemplate = normalizeTemplate(fixture.humanApprovalRecordTemplate);
  const safetySummary = buildSafetySummary(fixture);
  const sanitizedTrace = sanitizeHumanApprovalRecordTrace(fixture.trace);
  const blockers = [];

  for (const item of evidenceItems) {
    if (!item.present) blockers.push(REQUIRED_EVIDENCE.find(([key]) => key === item.key)[1]);
  }

  if (!authorizationRecordTemplate.present) {
    blockers.push("missing approval record template");
    for (const field of authorizationRecordTemplate.missingFields) {
      blockers.push(`missing approval record template field: ${field}`);
    }
    for (const option of authorizationRecordTemplate.invalidDecisionOptions) {
      blockers.push(`invalid approval record decision option: ${option}`);
    }
  }

  for (const [key, blocker] of SAFETY_EXPECTATIONS) {
    if (!safetyFlag(fixture, key)) blockers.push(blocker);
  }

  const signedHumanApprovalRecordPresent = signedApprovalRecordPresent(fixture.signedHumanApprovalRecord);
  if (signedHumanApprovalRecordPresent) {
    blockers.push("signed approval not accepted in ORO-4L static boundary");
  }

  if (hasSecretShapedValue(sanitizedTrace)) {
    blockers.push("sanitized trace contains secret-shaped value");
  }

  const hasMissingEvidence = evidenceItems.some((item) => !item.present) || !authorizationRecordTemplate.present;
  const hasHardBoundaryBlocker =
    signedHumanApprovalRecordPresent ||
    SAFETY_EXPECTATIONS.some(([key]) => !safetyFlag(fixture, key)) ||
    hasSecretShapedValue(sanitizedTrace);
  const authorizationBoundaryResult = blockers.length === 0 ? PASS : FAIL;
  let preMountAuthorization = PENDING_MANUAL_AUTHORIZATION;

  if (authorizationBoundaryResult === FAIL) {
    preMountAuthorization = hasMissingEvidence && !hasHardBoundaryBlocker ? AUTHORIZATION_RECORD_INCOMPLETE : NOT_AUTHORIZED_FOR_MOUNT;
  }

  return {
    phase: PHASE,
    gate: GATE,
    fixtureId: fixture.id,
    evidenceItems,
    authorizationRecordTemplate,
    requiredAcknowledgements: REQUIRED_ACKNOWLEDGEMENTS.slice(),
    safetySummary,
    authorizationBoundaryResult,
    humanApprovalRecordTemplatePresent: authorizationRecordTemplate.present,
    signedHumanApprovalRecordPresent,
    preMountAuthorization,
    humanAuthorizationRequired: true,
    nextPhaseRequiresSeparateAuthorization: true,
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

function runHumanApprovalRecordPreMountAuthorizationBoundary(fixtures) {
  const source = Array.isArray(fixtures) ? fixtures : [fixtures];
  return source.map((fixture) => buildHumanApprovalRecordPreMountAuthorizationBoundary(fixture));
}

module.exports = {
  PHASE,
  GATE,
  PASS,
  FAIL,
  AUTHORIZATION_RECORD_INCOMPLETE,
  NOT_AUTHORIZED_FOR_MOUNT,
  PENDING_MANUAL_AUTHORIZATION,
  REQUIRED_EVIDENCE,
  REQUIRED_TEMPLATE_FIELDS,
  DECISION_OPTIONS,
  REQUIRED_ACKNOWLEDGEMENTS,
  FORBIDDEN_PRE_MOUNT_AUTHORIZATION_VALUES,
  buildHumanApprovalRecordPreMountAuthorizationBoundary,
  runHumanApprovalRecordPreMountAuthorizationBoundary,
  sanitizeHumanApprovalRecordTrace,
};

