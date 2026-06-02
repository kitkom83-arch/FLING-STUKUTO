"use strict";

const {
  buildOroplayRuntimeReadinessGateSummary,
  evaluateOroplayRuntimeReadinessGate,
} = require("./oroplayCallbackRuntimeReadinessGate");

const OROPLAY_CALLBACK_PRE_IMPLEMENTATION_CERTIFICATION_STATUS = Object.freeze({
  phase: "ORO-3D",
  certificationType: "pre_implementation",
  status: "certification pack only",
  runtimeEnabled: false,
  mutationAllowed: false,
  aliasEnabled: false,
  liveTrafficAllowed: false,
  runtimeImplementationAllowed: false,
  supportedReadinessDecisions: Object.freeze([
    "certification_passed_but_runtime_blocked",
    "certification_incomplete",
    "fail_closed",
    "manual_review_required",
  ]),
});

const EVIDENCE_REQUIRED = Object.freeze([
  "preflight clean",
  "Safe CI current HEAD pass",
  "ORO-2B fail-closed route still fail-closed",
  "ORO-2C readiness closed",
  "ORO-3A simulation closed",
  "ORO-3B adapter contract closed",
  "ORO-3C execution plan closed",
  "targeted OroPlay smokes pass",
  "all-local pass or env/backend blocker recorded",
  "callback auth design",
  "member mapping source approval",
  "idempotency store design",
  "wallet bridge approval",
  "ledger bridge approval",
  "transaction log contract",
  "reconciliation proof",
  "audit log design",
  "log redaction proof",
  "monitoring evidence",
  "rollback / compensation evidence",
  "staging callback evidence",
  "go/no-go approval record",
]);

const CHECKLIST_DEFINITIONS = Object.freeze([
  ["callback_auth", "callback auth checklist", "callback auth design"],
  ["payload_validation", "payload validation checklist", "payload validation contract"],
  ["member_mapping", "member mapping checklist", "member mapping source approval"],
  ["idempotency", "idempotency checklist", "idempotency store design"],
  ["wallet_execution", "wallet execution checklist", "wallet bridge approval"],
  ["ledger_execution", "ledger execution checklist", "ledger bridge approval"],
  ["transaction_log", "transaction log checklist", "transaction log contract"],
  ["reconciliation", "reconciliation checklist", "reconciliation proof"],
  ["audit", "audit checklist", "audit log design"],
  ["log_redaction", "log redaction checklist", "redaction proof"],
  ["monitoring", "monitoring checklist", "monitoring evidence"],
  ["rollback", "rollback checklist", "rollback / compensation evidence"],
  ["staging", "staging checklist", "staging callback evidence"],
  ["go_no_go", "go/no-go checklist", "certification review"],
]);

const BLOCKER_MATRIX = Object.freeze([
  Object.freeze({
    blockerId: "PRODUCTION_DB_NOT_ALLOWED",
    blocker: "production DB not allowed",
    whyItBlocksRuntime: "Runtime write certification cannot use production DB in ORO-3D.",
    currentStatus: "blocked",
    requiredEvidence: "local/staging-only DB target proof and future approval",
    ownerFutureOwner: "future backend owner",
    passCondition: "production DB remains blocked until live certification approval",
  }),
  Object.freeze({
    blockerId: "REAL_MONEY_NOT_ALLOWED",
    blocker: "real money not allowed",
    whyItBlocksRuntime: "Wallet mutation could move value.",
    currentStatus: "blocked",
    requiredEvidence: "mock-only proof and money-flow approval",
    ownerFutureOwner: "future wallet owner",
    passCondition: "explicit real-money approval after certification",
  }),
  Object.freeze({
    blockerId: "LIVE_OROPLAY_API_NOT_ALLOWED",
    blocker: "live OroPlay API not allowed",
    whyItBlocksRuntime: "Live provider calls exceed readiness-only scope.",
    currentStatus: "blocked",
    requiredEvidence: "staging provider evidence and future approval",
    ownerFutureOwner: "future provider owner",
    passCondition: "explicit live provider approval",
  }),
  Object.freeze({
    blockerId: "ALIAS_BALANCE_NOT_ENABLED",
    blocker: "alias /api/balance not enabled",
    whyItBlocksRuntime: "Provider-compatible alias could expose callback runtime traffic.",
    currentStatus: "blocked",
    requiredEvidence: "alias route design, shared handler proof, smoke, monitoring",
    ownerFutureOwner: "future API owner",
    passCondition: "explicit alias enablement approval",
  }),
  Object.freeze({
    blockerId: "ALIAS_TRANSACTION_NOT_ENABLED",
    blocker: "alias /api/transaction not enabled",
    whyItBlocksRuntime: "Provider-compatible alias could expose callback runtime traffic.",
    currentStatus: "blocked",
    requiredEvidence: "alias route design, shared handler proof, smoke, monitoring",
    ownerFutureOwner: "future API owner",
    passCondition: "explicit alias enablement approval",
  }),
  Object.freeze({
    blockerId: "ALIAS_ENABLEMENT_BLOCKED",
    blocker: "alias enablement blocked",
    whyItBlocksRuntime: "Alias traffic must not bypass fail-closed callback guards.",
    currentStatus: "blocked",
    requiredEvidence: "shared guarded handler evidence and route smoke",
    ownerFutureOwner: "future API owner",
    passCondition: "alias remains disabled until approved",
  }),
  Object.freeze({
    blockerId: "RUNTIME_WALLET_MUTATION_BLOCKED",
    blocker: "runtime wallet mutation blocked",
    whyItBlocksRuntime: "Wallet debit/credit needs source-of-truth, lock, audit, and rollback evidence.",
    currentStatus: "blocked",
    requiredEvidence: "wallet bridge approval, lock ordering, audit proof",
    ownerFutureOwner: "future wallet owner",
    passCondition: "wallet mutation approval granted after evidence review",
  }),
  Object.freeze({
    blockerId: "RUNTIME_LEDGER_MUTATION_BLOCKED",
    blocker: "runtime ledger mutation blocked",
    whyItBlocksRuntime: "Ledger writes need transaction boundary and reconciliation evidence.",
    currentStatus: "blocked",
    requiredEvidence: "ledger bridge approval and reconciliation proof",
    ownerFutureOwner: "future ledger owner",
    passCondition: "ledger mutation approval granted after evidence review",
  }),
  Object.freeze({
    blockerId: "PRISMA_WRITE_BLOCKED",
    blocker: "Prisma write blocked",
    whyItBlocksRuntime: "DB writes require schema, migration, transaction, and rollback evidence.",
    currentStatus: "blocked",
    requiredEvidence: "schema and transaction proof",
    ownerFutureOwner: "future backend owner",
    passCondition: "explicit Prisma write approval",
  }),
  Object.freeze({
    blockerId: "MIGRATION_BLOCKED",
    blocker: "migration blocked",
    whyItBlocksRuntime: "Schema changes are outside ORO-3D scope.",
    currentStatus: "blocked",
    requiredEvidence: "reviewed migration plan",
    ownerFutureOwner: "future backend owner",
    passCondition: "migration approval granted separately",
  }),
  Object.freeze({
    blockerId: "DEPLOY_BLOCKED",
    blocker: "deploy blocked",
    whyItBlocksRuntime: "Deployment could expose unfinished runtime.",
    currentStatus: "blocked",
    requiredEvidence: "release plan, rollback, monitoring",
    ownerFutureOwner: "future release owner",
    passCondition: "deploy approval granted separately",
  }),
  Object.freeze({
    blockerId: "EXTERNAL_NETWORK_BLOCKED",
    blocker: "external network blocked",
    whyItBlocksRuntime: "ORO-3D must remain static/mock-only.",
    currentStatus: "blocked",
    requiredEvidence: "sandbox plan and network allowlist evidence",
    ownerFutureOwner: "future provider owner",
    passCondition: "external network approval granted separately",
  }),
  Object.freeze({
    blockerId: "SECRET_HANDLING_NOT_ALLOWED_IN_REPO",
    blocker: "secret handling not allowed in repo",
    whyItBlocksRuntime: "Credentials must remain env-only and redacted.",
    currentStatus: "blocked",
    requiredEvidence: "redaction proof and secret scan",
    ownerFutureOwner: "future security owner",
    passCondition: "no real secrets in repo or logs",
  }),
  Object.freeze({
    blockerId: "MONITORING_EVIDENCE_REQUIRED",
    blocker: "monitoring evidence required",
    whyItBlocksRuntime: "Runtime cannot be operated safely without visibility.",
    currentStatus: "blocked",
    requiredEvidence: "dashboards, counters, and alert evidence",
    ownerFutureOwner: "future ops owner",
    passCondition: "monitoring evidence reviewed",
  }),
  Object.freeze({
    blockerId: "ROLLBACK_EVIDENCE_REQUIRED",
    blocker: "rollback evidence required",
    whyItBlocksRuntime: "Runtime mutation needs recovery path.",
    currentStatus: "blocked",
    requiredEvidence: "compensation and rollback runbook",
    ownerFutureOwner: "future ops owner",
    passCondition: "rollback evidence reviewed",
  }),
  Object.freeze({
    blockerId: "LIVE_TRAFFIC_BLOCKED",
    blocker: "live traffic blocked",
    whyItBlocksRuntime: "Live callback traffic exceeds certification scope.",
    currentStatus: "blocked",
    requiredEvidence: "staging proof, provider approval, alerting",
    ownerFutureOwner: "future provider owner",
    passCondition: "explicit live traffic approval",
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeStringSet(values) {
  if (!Array.isArray(values)) return new Set();
  return new Set(values.map((value) => String(value || "").trim()).filter(Boolean));
}

function buildChecklistItems(input = {}) {
  const candidate = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const incompleteIds = normalizeStringSet(candidate.incompleteChecklistIds);

  return CHECKLIST_DEFINITIONS.map(([checklistId, label, requiredEvidence]) => ({
    checklistId,
    label,
    requiredEvidence,
    status: incompleteIds.has(checklistId) ? "missing_evidence" : "pass",
    runtimeEnabled: false,
    mutationAllowed: false,
  }));
}

function buildOroplayImplementationBlockerMatrix() {
  return clone(BLOCKER_MATRIX);
}

function evaluateOroplayPreImplementationCertificationPack(input = {}) {
  const candidate = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const gate = evaluateOroplayRuntimeReadinessGate(candidate.readinessGateInput || candidate);
  const checklistItems = buildChecklistItems(candidate);
  const blockerMatrix = buildOroplayImplementationBlockerMatrix();
  const passCount = checklistItems.filter((item) => item.status === "pass").length;
  const failCount = checklistItems.filter((item) => item.status !== "pass").length;
  const blockedCount = blockerMatrix.filter((item) => item.currentStatus === "blocked").length;

  let readinessDecision = "certification_passed_but_runtime_blocked";
  if (gate.decision === "fail_closed") readinessDecision = "fail_closed";
  else if (candidate.manualReviewRequired === true) readinessDecision = "manual_review_required";
  else if (failCount > 0 || gate.readinessBlockers.length > 0) readinessDecision = "certification_incomplete";

  return {
    phase: OROPLAY_CALLBACK_PRE_IMPLEMENTATION_CERTIFICATION_STATUS.phase,
    certificationType: OROPLAY_CALLBACK_PRE_IMPLEMENTATION_CERTIFICATION_STATUS.certificationType,
    runtimeEnabled: false,
    mutationAllowed: false,
    aliasEnabled: false,
    liveTrafficAllowed: false,
    runtimeImplementationAllowed: false,
    runtimeBlocked: true,
    evidenceRequired: EVIDENCE_REQUIRED.slice(),
    checklistItems,
    blockerMatrix,
    passCount,
    failCount,
    blockedCount,
    readinessDecision,
    gateSummary: buildOroplayRuntimeReadinessGateSummary(candidate.readinessGateInput || candidate),
    requiredApprovalsBeforeRuntimeMutation: Object.freeze([
      "wallet bridge approval",
      "ledger bridge approval",
      "transaction boundary approval",
      "monitoring evidence approval",
      "rollback evidence approval",
      "staging callback approval",
    ]),
    requiredApprovalsBeforeAliasEnablement: Object.freeze([
      "shared guarded handler approval",
      "route smoke approval",
      "monitoring approval",
      "explicit alias enablement approval",
    ]),
    requiredApprovalsBeforeLiveProviderTraffic: Object.freeze([
      "staging callback pass",
      "provider approval",
      "alerting approval",
      "rollback approval",
      "secret handling approval",
    ]),
  };
}

function buildOroplayPreImplementationCertificationChecklist(input = {}) {
  return evaluateOroplayPreImplementationCertificationPack(input);
}

function buildOroplayPreImplementationCertificationSummary(input = {}) {
  const pack = evaluateOroplayPreImplementationCertificationPack(input);
  return {
    phase: pack.phase,
    certificationType: pack.certificationType,
    readinessDecision: pack.readinessDecision,
    runtimeEnabled: pack.runtimeEnabled,
    mutationAllowed: pack.mutationAllowed,
    aliasEnabled: pack.aliasEnabled,
    liveTrafficAllowed: pack.liveTrafficAllowed,
    runtimeImplementationAllowed: pack.runtimeImplementationAllowed,
    runtimeBlocked: pack.runtimeBlocked,
    passCount: pack.passCount,
    failCount: pack.failCount,
    blockedCount: pack.blockedCount,
  };
}

function validateOroplayPreImplementationCertificationPack() {
  const errors = [];
  const pack = evaluateOroplayPreImplementationCertificationPack();

  if (pack.phase !== "ORO-3D") errors.push("certification pack phase must be ORO-3D.");
  if (pack.certificationType !== "pre_implementation") errors.push("certification type mismatch.");
  if (pack.runtimeEnabled !== false) errors.push("runtimeEnabled must be false.");
  if (pack.mutationAllowed !== false) errors.push("mutationAllowed must be false.");
  if (pack.aliasEnabled !== false) errors.push("aliasEnabled must be false.");
  if (pack.liveTrafficAllowed !== false) errors.push("liveTrafficAllowed must be false.");
  if (pack.runtimeImplementationAllowed !== false) errors.push("runtimeImplementationAllowed must be false.");
  if (pack.runtimeBlocked !== true) errors.push("runtimeBlocked must be true.");
  if (!Array.isArray(pack.evidenceRequired) || pack.evidenceRequired.length < 1) {
    errors.push("evidenceRequired must be populated.");
  }
  if (!Array.isArray(pack.checklistItems) || pack.checklistItems.length < CHECKLIST_DEFINITIONS.length) {
    errors.push("checklistItems must be populated.");
  }
  if (!Array.isArray(pack.blockerMatrix) || pack.blockerMatrix.length < BLOCKER_MATRIX.length) {
    errors.push("blockerMatrix must be populated.");
  }
  if (pack.failCount !== 0) errors.push("default certification checklist must not fail.");
  if (pack.readinessDecision !== "certification_passed_but_runtime_blocked") {
    errors.push("passing certification must still return runtime blocked decision.");
  }

  for (const requiredBlocker of [
    "production DB",
    "real money",
    "wallet mutation",
    "ledger mutation",
    "alias enablement",
    "live traffic",
    "Prisma write",
  ]) {
    const found = pack.blockerMatrix.some((item) =>
      `${item.blocker} ${item.blockerId}`.toLowerCase().includes(requiredBlocker.toLowerCase())
    );
    if (!found) errors.push(`blocker matrix missing ${requiredBlocker}.`);
  }

  const incomplete = evaluateOroplayPreImplementationCertificationPack({ incompleteChecklistIds: ["monitoring"] });
  if (incomplete.readinessDecision !== "certification_incomplete") {
    errors.push("missing checklist evidence must mark certification incomplete.");
  }

  const failClosed = evaluateOroplayPreImplementationCertificationPack({ walletMutationAllowed: true });
  if (failClosed.readinessDecision !== "fail_closed") errors.push("dangerous runtime flags must fail closed.");

  const manualReview = evaluateOroplayPreImplementationCertificationPack({ manualReviewRequired: true });
  if (manualReview.readinessDecision !== "manual_review_required") {
    errors.push("manualReviewRequired must return manual_review_required.");
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_PRE_IMPLEMENTATION_CERTIFICATION_STATUS,
  buildOroplayPreImplementationCertificationChecklist,
  buildOroplayImplementationBlockerMatrix,
  evaluateOroplayPreImplementationCertificationPack,
  buildOroplayPreImplementationCertificationSummary,
  validateOroplayPreImplementationCertificationPack,
};
