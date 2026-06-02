"use strict";

const crypto = require("crypto");

const {
  evaluateOroplayRuntimeGate,
  validateOroplayCallbackRuntimeGate,
} = require("./oroplayCallbackRuntimeGate");

const OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS = Object.freeze({
  phase: "ORO-3C",
  status: "callback runtime wallet-ledger execution plan only",
  runtimeEnabled: false,
  liveRuntimeEnabled: false,
  mutationAllowed: false,
  prismaWriteAllowed: false,
  aliasEnabled: false,
  noProductionDb: true,
  noRealMoney: true,
  noLiveOroplayApi: true,
  noExternalNetwork: true,
  runtimeWalletMutation: false,
  runtimeLedgerMutation: false,
  previousPhase: "ORO-3B closed; adapter contract remains no-mutation",
  nextPhase: "ORO-3D blocked until ORO-3C execution plan smoke passes",
  supportedDecisions: Object.freeze([
    "accepted_plan",
    "fail_closed",
    "manual_review",
    "idempotent_replay",
    "duplicate_conflict",
    "insufficient_balance",
    "unknown_member",
    "blocked_member",
    "inactive_member",
    "malformed_payload",
    "unsupported_transaction_type",
    "finished_round_replay",
    "canceled_transaction",
  ]),
});

const DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE = Object.freeze({
  members: Object.freeze({
    ORO_VALID_001: Object.freeze({
      memberId: "pg77-member-001",
      status: "active",
      blocked: false,
      mockBalance: 1000,
    }),
    ORO_BLOCKED_001: Object.freeze({
      memberId: "pg77-member-blocked",
      status: "active",
      blocked: true,
      mockBalance: 1000,
    }),
    ORO_INACTIVE_001: Object.freeze({
      memberId: "pg77-member-inactive",
      status: "inactive",
      blocked: false,
      mockBalance: 1000,
    }),
    ORO_LOW_BAL_001: Object.freeze({
      memberId: "pg77-member-low-balance",
      status: "active",
      blocked: false,
      mockBalance: 5,
    }),
  }),
  transactions: Object.freeze({}),
  finishedRounds: Object.freeze({}),
  canceledRounds: Object.freeze({}),
  canceledTransactions: Object.freeze({}),
});

const SAFE_USER_CODE_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;
const SAFE_TRANSACTION_CODE_PATTERN = /^[A-Za-z0-9_.:-]{3,96}$/;
const SUPPORTED_TRANSACTION_TYPES = new Set(["bet", "win", "rollback", "settle", "adjustment"]);
const CANCELED_TRANSACTION_TYPES = new Set(["cancel", "canceled", "void"]);
const SENSITIVE_KEY_MARKERS = Object.freeze([
  "authorization",
  "authorizationheader",
  "credential",
  "password",
  "secret",
  "token",
  "clientsecret",
  "databaseurl",
  "pin",
  "deviceid",
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cloneRuntimeState(state) {
  const source = state && typeof state === "object" ? state : DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE;
  return {
    members: clone(source.members || DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE.members),
    transactions: clone(source.transactions || {}),
    finishedRounds: clone(source.finishedRounds || {}),
    canceledRounds: clone(source.canceledRounds || {}),
    canceledTransactions: clone(source.canceledTransactions || {}),
  };
}

function normalizeKey(key) {
  return String(key || "").replace(/[_-]/g, "").toLowerCase();
}

function isSensitiveKey(key) {
  const normalized = normalizeKey(key);
  if (normalized.startsWith("no")) return false;
  return SENSITIVE_KEY_MARKERS.some((marker) => normalized === marker || normalized.includes(marker));
}

function sanitizeRuntimePlanString(value) {
  const text = String(value || "");
  const bearerScheme = ["Be", "arer"].join("");
  if (/^basic\s+/i.test(text)) return "[REDACTED_AUTH]";
  if (new RegExp(`^${bearerScheme}\\s+`, "i").test(text)) return "[REDACTED_AUTH]";
  if (/\bpostgres(?:ql)?:\/\/[^\s]+/i.test(text)) return "[REDACTED_DB_URL]";
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) {
    return "[REDACTED_TOKEN]";
  }
  return value;
}

function sanitizeOroplayRuntimeExecutionPayload(value) {
  if (Array.isArray(value)) return value.map(sanitizeOroplayRuntimeExecutionPayload);
  if (!value || typeof value !== "object") {
    return typeof value === "string" ? sanitizeRuntimePlanString(value) : value;
  }

  const sanitized = {};
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = normalizeKey(key).includes("authorization") ? "[REDACTED_AUTH]" : "[REDACTED]";
      continue;
    }
    sanitized[key] = sanitizeOroplayRuntimeExecutionPayload(nested);
  }
  return sanitized;
}

function stableHash(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
}

function maskValue(value) {
  const text = String(value || "");
  if (!text) return null;
  if (text.length <= 4) return `${text[0] || ""}***`;
  return `${text.slice(0, 2)}***${text.slice(-2)}`;
}

function inferCallbackType(payload) {
  const candidate = payload && typeof payload === "object" ? payload : {};
  const explicit = String(candidate.callbackType || candidate.type || "").trim().toLowerCase();
  if (explicit === "balance" || explicit === "transaction") return explicit;
  if (Object.prototype.hasOwnProperty.call(candidate, "amount") || candidate.transactionCode) return "transaction";
  return "balance";
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function normalizeAmount(input = {}) {
  const callbackType = input.callbackType === "transaction" ? "transaction" : "balance";
  if (callbackType === "balance") return 0;
  const amount = Number(input.amount);
  if (!Number.isFinite(amount)) return 0;
  const transactionType = String(input.transactionType || "").trim().toLowerCase();
  if (transactionType === "bet") return -Math.abs(amount);
  if (transactionType === "win") return Math.abs(amount);
  return amount;
}

function directionFor(input = {}) {
  if (input.callbackType !== "transaction") return "read";
  const transactionType = String(input.transactionType || "").trim().toLowerCase();
  if (transactionType === "bet") return "debit";
  if (transactionType === "win") return "credit";
  return normalizeAmount(input) < 0 ? "debit" : "credit";
}

function baseExecutionStep(stepType, operation, extra = {}) {
  return {
    phase: OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS.phase,
    stepType,
    operation,
    status: "plan_only",
    runtimeEnabled: false,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
    requiresFutureApproval: true,
    noProductionDb: true,
    noExternalNetwork: true,
    ...extra,
  };
}

function buildOroplayWalletExecutionStep(input = {}) {
  const callbackType = input.callbackType === "transaction" ? "transaction" : "balance";
  const signedAmount = normalizeAmount(input);
  const operation = callbackType === "balance" ? "read_balance" : directionFor({ ...input, callbackType });
  const beforeBalanceExpected = hasValue(input.beforeBalanceExpected) ? Number(input.beforeBalanceExpected) : null;
  const afterBalanceExpected =
    beforeBalanceExpected === null || callbackType === "balance" ? beforeBalanceExpected : beforeBalanceExpected + signedAmount;

  return baseExecutionStep("wallet", operation, {
    memberId: input.memberId || null,
    userCode: input.userCode || null,
    callbackType,
    transactionCode: input.transactionCode || null,
    roundId: input.roundId || null,
    amount: Math.abs(signedAmount),
    signedAmount,
    beforeBalanceExpected,
    afterBalanceExpected,
    walletSourceOfTruthApproved: false,
  });
}

function buildOroplayLedgerExecutionStep(input = {}) {
  const callbackType = input.callbackType === "transaction" ? "transaction" : "balance";
  const direction = directionFor({ ...input, callbackType });
  const operation = callbackType === "balance" ? "no_ledger_entry_for_balance_read" : `record_${direction}`;
  const signedAmount = normalizeAmount(input);

  return baseExecutionStep("ledger", operation, {
    memberId: input.memberId || null,
    callbackType,
    transactionType: input.transactionType || null,
    transactionCode: input.transactionCode || null,
    roundId: input.roundId || null,
    vendorCode: input.vendorCode || null,
    gameCode: input.gameCode || null,
    amount: Math.abs(signedAmount),
    signedAmount,
    ledgerTransactionBoundaryApproved: false,
  });
}

function buildOroplayTransactionLogExecutionStep(input = {}) {
  const signedAmount = normalizeAmount(input);
  return baseExecutionStep("transaction_log", "record_game_provider_callback", {
    memberId: input.memberId || null,
    callbackType: input.callbackType || null,
    transactionType: input.transactionType || null,
    transactionCode: input.transactionCode || null,
    roundId: input.roundId || null,
    vendorCode: input.vendorCode || null,
    gameCode: input.gameCode || null,
    amount: signedAmount,
    transactionLogStorageApproved: false,
  });
}

function buildOroplayReconciliationExecutionStep(input = {}) {
  const signedAmount = normalizeAmount(input);
  return baseExecutionStep("reconciliation", "compare_callback_wallet_ledger_transaction_log", {
    memberId: input.memberId || null,
    callbackType: input.callbackType || null,
    transactionCode: input.transactionCode || null,
    roundId: input.roundId || null,
    expectedWalletDelta: signedAmount,
    requiredChecks: Object.freeze([
      "member_mapping",
      "idempotency_key",
      "wallet_delta",
      "ledger_entry",
      "transaction_log",
      "audit_log",
      "provider_callback_trace",
    ]),
    reconciliationWorkflowApproved: false,
  });
}

function buildOroplayAuditExecutionStep(input = {}) {
  const sanitizedPayload = sanitizeOroplayRuntimeExecutionPayload(input.sanitizedPayload || input.payload || {});
  const callbackType = input.callbackType === "transaction" ? "transaction" : "balance";

  return baseExecutionStep("audit", "record_sanitized_callback_audit", {
    callbackType,
    memberId: input.memberId || null,
    userCodeMasked: maskValue(input.userCode),
    userCodeHash: stableHash(input.userCode),
    transactionCodeMasked: maskValue(input.transactionCode),
    transactionCodeHash: stableHash(input.transactionCode),
    decision: input.decision || null,
    bodyLogged: false,
    rawBodyDropped: true,
    sanitizedPayloadOnly: true,
    sanitizedPayload,
    auditLogStorageApproved: false,
  });
}

function buildResponsePlan(input = {}) {
  const callbackType = input.callbackType === "transaction" ? "transaction" : "balance";
  const status = input.status || "fail_closed";
  const result =
    status === "accepted_plan"
      ? "accepted_plan"
      : status === "idempotent_replay"
      ? "idempotent_replay"
      : status === "manual_review"
      ? "manual_review"
      : "fail_closed";

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS.phase,
    responsePlanOnly: true,
    runtimeResponseEnabled: false,
    providerCompatibleAliasEnabled: false,
    route: callbackType === "transaction" ? "/api/oroplay/transaction" : "/api/oroplay/balance",
    callbackType,
    result,
    decision: input.decision || result,
    reason: input.reason || input.decision || result,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
  };
}

function normalizeCallbackRequest(payload = {}) {
  const candidate = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const callbackType = inferCallbackType(candidate);
  return {
    callbackType,
    userCode: typeof candidate.userCode === "string" ? candidate.userCode.trim() : candidate.userCode,
    memberId: candidate.memberId ? String(candidate.memberId) : null,
    transactionCode:
      typeof candidate.transactionCode === "string" ? candidate.transactionCode.trim() : candidate.transactionCode,
    transactionType: String(candidate.transactionType || "").trim().toLowerCase(),
    roundId: candidate.roundId ? String(candidate.roundId) : null,
    vendorCode: candidate.vendorCode ? String(candidate.vendorCode) : null,
    gameCode: candidate.gameCode ? String(candidate.gameCode) : null,
    amount: candidate.amount,
    isFinished: candidate.isFinished === true,
    isCanceled:
      candidate.isCanceled === true ||
      String(candidate.status || "").trim().toLowerCase() === "canceled" ||
      CANCELED_TRANSACTION_TYPES.has(String(candidate.transactionType || "").trim().toLowerCase()),
    sanitizedPayload: sanitizeOroplayRuntimeExecutionPayload(candidate),
  };
}

function validateCallbackShape(request) {
  if (!request || typeof request !== "object") return { ok: false, decision: "malformed_payload" };
  if (request.callbackType !== "balance" && request.callbackType !== "transaction") {
    return { ok: false, decision: "malformed_payload" };
  }
  if (typeof request.userCode !== "string" || !SAFE_USER_CODE_PATTERN.test(request.userCode)) {
    return { ok: false, decision: "malformed_payload" };
  }
  if (request.callbackType === "balance") {
    return { ok: true, normalized: { callbackType: "balance", userCode: request.userCode } };
  }

  if (typeof request.transactionCode !== "string" || !SAFE_TRANSACTION_CODE_PATTERN.test(request.transactionCode)) {
    return { ok: false, decision: "malformed_payload" };
  }
  if (request.isCanceled === true) return { ok: false, decision: "canceled_transaction" };

  const amount = Number(request.amount);
  if (!Number.isFinite(amount) || amount === 0) return { ok: false, decision: "malformed_payload" };

  if (!SUPPORTED_TRANSACTION_TYPES.has(request.transactionType)) {
    return { ok: false, decision: "unsupported_transaction_type" };
  }

  return {
    ok: true,
    normalized: {
      callbackType: "transaction",
      userCode: request.userCode,
      transactionCode: request.transactionCode,
      transactionType: request.transactionType,
      roundId: request.roundId,
      vendorCode: request.vendorCode,
      gameCode: request.gameCode,
      amount,
      isFinished: request.isFinished === true,
      isCanceled: false,
    },
  };
}

function mapMember(userCode, state) {
  const member = state.members[userCode];
  if (!member) return { ok: false, decision: "unknown_member" };
  if (member.blocked === true) return { ok: false, decision: "blocked_member" };
  if (member.status !== "active") return { ok: false, decision: "inactive_member" };
  return { ok: true, member: clone(member) };
}

function buildIdempotencyKey(normalized = {}) {
  if (normalized.callbackType === "balance") return `oroplay:balance:${stableHash(normalized.userCode)}`;
  return `oroplay:transaction:${stableHash(normalized.transactionCode)}`;
}

function transactionFingerprint(normalized = {}) {
  return JSON.stringify({
    userCode: normalized.userCode,
    transactionCode: normalized.transactionCode,
    transactionType: normalized.transactionType,
    roundId: normalized.roundId || null,
    vendorCode: normalized.vendorCode || null,
    gameCode: normalized.gameCode || null,
    amount: Number(normalized.amount),
  });
}

function inspectIdempotency(normalized, state) {
  if (normalized.callbackType === "balance") {
    return {
      status: "accepted_plan",
      decision: "accepted_plan",
      idempotencyKey: buildIdempotencyKey(normalized),
      nextState: state,
    };
  }

  const roundId = normalized.roundId;
  if (state.canceledTransactions[normalized.transactionCode] || (roundId && state.canceledRounds[roundId])) {
    return {
      status: "fail_closed",
      decision: "canceled_transaction",
      idempotencyKey: buildIdempotencyKey(normalized),
      nextState: state,
    };
  }
  if (roundId && state.finishedRounds[roundId]) {
    return {
      status: "fail_closed",
      decision: "finished_round_replay",
      idempotencyKey: buildIdempotencyKey(normalized),
      nextState: state,
    };
  }

  const previous = state.transactions[normalized.transactionCode];
  const currentFingerprint = transactionFingerprint(normalized);
  if (previous) {
    if (previous.fingerprint === currentFingerprint) {
      return {
        status: "idempotent_replay",
        decision: "idempotent_replay",
        idempotencyKey: buildIdempotencyKey(normalized),
        nextState: state,
      };
    }

    return {
      status: "manual_review",
      decision: "duplicate_conflict",
      idempotencyKey: buildIdempotencyKey(normalized),
      nextState: state,
    };
  }

  const nextState = cloneRuntimeState(state);
  nextState.transactions[normalized.transactionCode] = {
    fingerprint: currentFingerprint,
    transactionType: normalized.transactionType,
    roundId: normalized.roundId,
  };
  if (normalized.roundId && normalized.isFinished === true) nextState.finishedRounds[normalized.roundId] = true;

  return {
    status: "accepted_plan",
    decision: "accepted_plan",
    idempotencyKey: buildIdempotencyKey(normalized),
    nextState,
  };
}

function buildDisabledSteps(request, decision) {
  const stepInput = {
    callbackType: request.callbackType,
    userCode: request.userCode,
    memberId: request.memberId,
    transactionCode: request.transactionCode,
    transactionType: request.transactionType,
    roundId: request.roundId,
    vendorCode: request.vendorCode,
    gameCode: request.gameCode,
    amount: request.amount,
    sanitizedPayload: request.sanitizedPayload,
    decision,
  };

  return {
    walletStep: buildOroplayWalletExecutionStep({ ...stepInput, amount: 0 }),
    ledgerStep: buildOroplayLedgerExecutionStep({ ...stepInput, amount: 0 }),
    transactionLogStep: buildOroplayTransactionLogExecutionStep({ ...stepInput, amount: 0 }),
    reconciliationStep: buildOroplayReconciliationExecutionStep({ ...stepInput, amount: 0 }),
    auditStep: buildOroplayAuditExecutionStep(stepInput),
  };
}

function buildPlanEnvelope(request, state, fields = {}) {
  const safetyGate = evaluateOroplayRuntimeGate(fields.runtimeGateInput || {});
  const status = fields.status || "fail_closed";
  const decision = fields.decision || "fail_closed";
  const steps =
    fields.steps ||
    buildDisabledSteps(
      {
        ...request,
        memberId: fields.memberId || request.memberId || null,
      },
      decision
    );

  return {
    phase: OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS.phase,
    status,
    callbackType: request.callbackType,
    userCode: request.userCode || null,
    memberId: fields.memberId || request.memberId || null,
    transactionCode: request.transactionCode || null,
    roundId: request.roundId || null,
    vendorCode: request.vendorCode || null,
    gameCode: request.gameCode || null,
    amount: hasValue(fields.amount) ? fields.amount : hasValue(request.amount) ? Number(request.amount) : null,
    decision,
    reason: fields.reason || decision,
    failClosed: status === "fail_closed" || status === "manual_review",
    manualReview: status === "manual_review",
    idempotencyKey: fields.idempotencyKey || null,
    duplicateHandling: fields.duplicateHandling || null,
    safetyGate,
    walletStep: steps.walletStep,
    ledgerStep: steps.ledgerStep,
    transactionLogStep: steps.transactionLogStep,
    reconciliationStep: steps.reconciliationStep,
    auditStep: steps.auditStep,
    responsePlan: buildResponsePlan({ status, decision, reason: fields.reason, callbackType: request.callbackType }),
    nextState: fields.nextState || state,
    mutationAllowed: false,
    prismaWriteAllowed: false,
    liveRuntimeEnabled: false,
    aliasEnabled: false,
  };
}

function buildAcceptedSteps(normalized, member, request, decision) {
  const stepInput = {
    ...normalized,
    memberId: member.memberId,
    beforeBalanceExpected: member.mockBalance,
    sanitizedPayload: request.sanitizedPayload,
    decision,
  };

  return {
    walletStep: buildOroplayWalletExecutionStep(stepInput),
    ledgerStep: buildOroplayLedgerExecutionStep(stepInput),
    transactionLogStep: buildOroplayTransactionLogExecutionStep(stepInput),
    reconciliationStep: buildOroplayReconciliationExecutionStep(stepInput),
    auditStep: buildOroplayAuditExecutionStep(stepInput),
  };
}

function buildOroplayBalanceExecutionPlan(payload = {}, state = DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE, options = {}) {
  const workingState = cloneRuntimeState(state);
  const request = normalizeCallbackRequest({ ...payload, callbackType: "balance" });
  const gate = evaluateOroplayRuntimeGate(options.runtimeGateInput || {});
  if (gate.decision === "fail_closed") {
    return buildPlanEnvelope(request, workingState, {
      status: "fail_closed",
      decision: "fail_closed",
      reason: gate.reason,
      runtimeGateInput: options.runtimeGateInput,
    });
  }

  const validation = validateCallbackShape(request);
  if (!validation.ok) {
    return buildPlanEnvelope(request, workingState, { status: "fail_closed", decision: validation.decision });
  }

  const memberMapping = mapMember(validation.normalized.userCode, workingState);
  if (!memberMapping.ok) {
    return buildPlanEnvelope(request, workingState, { status: "fail_closed", decision: memberMapping.decision });
  }

  const idempotency = inspectIdempotency(validation.normalized, workingState);
  const steps = buildAcceptedSteps(validation.normalized, memberMapping.member, request, idempotency.decision);

  return buildPlanEnvelope(request, workingState, {
    status: "accepted_plan",
    decision: "accepted_plan",
    memberId: memberMapping.member.memberId,
    amount: 0,
    idempotencyKey: idempotency.idempotencyKey,
    steps,
    nextState: idempotency.nextState,
  });
}

function buildOroplayTransactionExecutionPlan(payload = {}, state = DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE, options = {}) {
  const workingState = cloneRuntimeState(state);
  const request = normalizeCallbackRequest({ ...payload, callbackType: "transaction" });
  const gate = evaluateOroplayRuntimeGate(options.runtimeGateInput || {});
  if (gate.decision === "fail_closed") {
    return buildPlanEnvelope(request, workingState, {
      status: "fail_closed",
      decision: "fail_closed",
      reason: gate.reason,
      runtimeGateInput: options.runtimeGateInput,
    });
  }

  const validation = validateCallbackShape(request);
  if (!validation.ok) {
    return buildPlanEnvelope(request, workingState, { status: "fail_closed", decision: validation.decision });
  }

  const memberMapping = mapMember(validation.normalized.userCode, workingState);
  if (!memberMapping.ok) {
    return buildPlanEnvelope(request, workingState, { status: "fail_closed", decision: memberMapping.decision });
  }

  const idempotency = inspectIdempotency(validation.normalized, workingState);
  if (idempotency.status === "idempotent_replay") {
    return buildPlanEnvelope(request, workingState, {
      status: "idempotent_replay",
      decision: "idempotent_replay",
      memberId: memberMapping.member.memberId,
      idempotencyKey: idempotency.idempotencyKey,
      duplicateHandling: "same_fingerprint_replay_no_second_plan",
      nextState: idempotency.nextState,
    });
  }
  if (idempotency.status === "manual_review") {
    return buildPlanEnvelope(request, workingState, {
      status: "manual_review",
      decision: "duplicate_conflict",
      memberId: memberMapping.member.memberId,
      idempotencyKey: idempotency.idempotencyKey,
      duplicateHandling: "conflicting_duplicate_requires_manual_review",
      nextState: idempotency.nextState,
    });
  }
  if (idempotency.status === "fail_closed") {
    return buildPlanEnvelope(request, workingState, {
      status: "fail_closed",
      decision: idempotency.decision,
      memberId: memberMapping.member.memberId,
      idempotencyKey: idempotency.idempotencyKey,
      nextState: idempotency.nextState,
    });
  }

  if (
    validation.normalized.transactionType === "bet" &&
    memberMapping.member.mockBalance < Math.abs(Number(validation.normalized.amount))
  ) {
    return buildPlanEnvelope(request, workingState, {
      status: "fail_closed",
      decision: "insufficient_balance",
      memberId: memberMapping.member.memberId,
      idempotencyKey: idempotency.idempotencyKey,
    });
  }

  const steps = buildAcceptedSteps(validation.normalized, memberMapping.member, request, idempotency.decision);
  return buildPlanEnvelope(request, workingState, {
    status: "accepted_plan",
    decision: "accepted_plan",
    memberId: memberMapping.member.memberId,
    amount: normalizeAmount(validation.normalized),
    idempotencyKey: idempotency.idempotencyKey,
    steps,
    nextState: idempotency.nextState,
  });
}

function buildOroplayCallbackExecutionPlan(payload = {}, state = DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE, options = {}) {
  const callbackType = inferCallbackType(payload);
  if (callbackType === "transaction") return buildOroplayTransactionExecutionPlan(payload, state, options);
  return buildOroplayBalanceExecutionPlan(payload, state, options);
}

function validateStepSafety(step, label) {
  const errors = [];
  if (!step || typeof step !== "object") return [`${label} must exist.`];
  if (step.mutationAllowed !== false) errors.push(`${label} mutationAllowed must be false.`);
  if (step.runtimeEnabled !== false) errors.push(`${label} runtimeEnabled must be false.`);
  if (step.requiresFutureApproval !== true) errors.push(`${label} requiresFutureApproval must be true.`);
  if (step.prismaWriteAllowed !== false) errors.push(`${label} prismaWriteAllowed must be false.`);
  return errors;
}

function validatePlanSafety(plan, label) {
  const errors = [];
  if (!plan || typeof plan !== "object") return [`${label} must be an object.`];
  if (plan.phase !== "ORO-3C") errors.push(`${label} phase must be ORO-3C.`);
  if (plan.mutationAllowed !== false) errors.push(`${label} mutationAllowed must be false.`);
  if (plan.prismaWriteAllowed !== false) errors.push(`${label} prismaWriteAllowed must be false.`);
  if (plan.liveRuntimeEnabled !== false) errors.push(`${label} liveRuntimeEnabled must be false.`);
  if (plan.aliasEnabled !== false) errors.push(`${label} aliasEnabled must be false.`);
  if (!plan.safetyGate || plan.safetyGate.gateStatus !== "closed") errors.push(`${label} safety gate must be closed.`);
  for (const [stepKey, stepLabel] of [
    ["walletStep", "walletStep"],
    ["ledgerStep", "ledgerStep"],
    ["transactionLogStep", "transactionLogStep"],
    ["reconciliationStep", "reconciliationStep"],
    ["auditStep", "auditStep"],
  ]) {
    errors.push(...validateStepSafety(plan[stepKey], `${label} ${stepLabel}`));
  }
  return errors;
}

function validateOroplayCallbackRuntimeExecutionPlan() {
  const errors = [];
  const gateValidation = validateOroplayCallbackRuntimeGate();

  if (!gateValidation.ok) errors.push(...gateValidation.errors);
  if (OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS.runtimeEnabled !== false) errors.push("runtimeEnabled must be false.");
  if (OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS.mutationAllowed !== false) {
    errors.push("mutationAllowed must be false.");
  }
  if (OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS.prismaWriteAllowed !== false) {
    errors.push("prismaWriteAllowed must be false.");
  }
  if (OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS.aliasEnabled !== false) errors.push("aliasEnabled must be false.");

  const balance = buildOroplayBalanceExecutionPlan({ userCode: "ORO_VALID_001" });
  const bet = buildOroplayTransactionExecutionPlan({
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ORO3C_VALIDATE_BET",
    transactionType: "bet",
    amount: 25,
    roundId: "ROUND_ORO3C_VALIDATE_BET",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
  });
  const win = buildOroplayTransactionExecutionPlan({
    userCode: "ORO_VALID_001",
    transactionCode: "TX_ORO3C_VALIDATE_WIN",
    transactionType: "win",
    amount: 75,
    roundId: "ROUND_ORO3C_VALIDATE_WIN",
    vendorCode: "OROPLAY",
    gameCode: "ORO-SLOT",
  });

  errors.push(...validatePlanSafety(balance, "balance"));
  errors.push(...validatePlanSafety(bet, "bet"));
  errors.push(...validatePlanSafety(win, "win"));
  if (balance.decision !== "accepted_plan") errors.push("balance must return accepted_plan.");
  if (bet.walletStep.operation !== "debit") errors.push("bet wallet step must be debit.");
  if (win.walletStep.operation !== "credit") errors.push("win wallet step must be credit.");
  if (bet.ledgerStep.prismaWriteAllowed !== false) errors.push("bet ledger step must keep Prisma write false.");
  if (win.ledgerStep.prismaWriteAllowed !== false) errors.push("win ledger step must keep Prisma write false.");

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_RUNTIME_EXECUTION_PLAN_STATUS,
  DEFAULT_OROPLAY_CALLBACK_RUNTIME_STATE,
  buildOroplayCallbackExecutionPlan,
  buildOroplayBalanceExecutionPlan,
  buildOroplayTransactionExecutionPlan,
  buildOroplayWalletExecutionStep,
  buildOroplayLedgerExecutionStep,
  buildOroplayTransactionLogExecutionStep,
  buildOroplayReconciliationExecutionStep,
  buildOroplayAuditExecutionStep,
  sanitizeOroplayRuntimeExecutionPayload,
  validateOroplayCallbackRuntimeExecutionPlan,
};
