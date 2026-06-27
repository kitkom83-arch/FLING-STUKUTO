"use strict";

const ALLOWED_FIELDS = [
  "title",
  "type",
  "status",
  "minDeposit",
  "maxDeposit",
  "bonusType",
  "bonusValue",
  "turnoverMultiplier",
  "maxWithdraw",
  "startAt",
  "endAt",
];

const NUMERIC_FIELDS = new Set([
  "minDeposit",
  "maxDeposit",
  "bonusValue",
  "turnoverMultiplier",
  "maxWithdraw",
]);

const RISK_TAGS = {
  title: ["eligibility", "status"],
  type: ["eligibility", "status"],
  status: ["eligibility", "status"],
  minDeposit: ["eligibility", "bonus-base"],
  maxDeposit: ["eligibility", "bonus-base"],
  bonusType: ["bonus", "ledger"],
  bonusValue: ["bonus", "ledger"],
  turnoverMultiplier: ["turnover"],
  maxWithdraw: ["withdraw"],
  startAt: ["eligibility", "window"],
  endAt: ["eligibility", "window"],
};

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeString(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseNumericField(field, value, errors, side) {
  if (value === null || value === undefined || value === "") return { present: false, value: null };
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed)) {
    errors.push(`${side}.${field} must be a non-negative number or numeric string`);
    return { present: true, value: null };
  }
  if (parsed < 0) {
    errors.push(`${side}.${field} must be non-negative`);
    return { present: true, value: parsed };
  }
  return { present: true, value: parsed };
}

function parseDateField(field, value, errors, side) {
  if (value === null || value === undefined || value === "") return { present: false, value: null };
  const text = normalizeString(value);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    errors.push(`${side}.${field} must be a valid date`);
    return { present: true, value: null };
  }
  return { present: true, value: parsed.toISOString() };
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function emptyRiskSummary() {
  return {
    hasBonusRisk: false,
    hasTurnoverRisk: false,
    hasWithdrawRisk: false,
    hasEligibilityRisk: false,
    hasStatusRisk: false,
  };
}

function validatePromotionAdminWriteDryRun(input) {
  const errors = [];
  const warnings = [];
  const diff = [];

  if (!isPlainObject(input)) {
    return {
      ok: false,
      errors: ["input must be a plain object"],
      warnings,
      diff,
      riskSummary: emptyRiskSummary(),
    };
  }

  const before = input.before;
  const after = input.after;

  if (!isPlainObject(before)) errors.push("before must be a plain object");
  if (!isPlainObject(after)) errors.push("after must be a plain object");
  if (errors.length) {
    return {
      ok: false,
      errors,
      warnings,
      diff,
      riskSummary: emptyRiskSummary(),
    };
  }

  const auditReason = normalizeString(input.auditReason);
  if (!auditReason) errors.push("auditReason is required");
  if (typeof input.riskAcknowledgement !== "boolean") {
    warnings.push("riskAcknowledgement should be a boolean");
  }

  for (const sideName of ["before", "after"]) {
    const side = sideName === "before" ? before : after;
    for (const key of Object.keys(side)) {
      if (!ALLOWED_FIELDS.includes(key)) {
        errors.push(`${sideName}.${key} is not an allowed promotion field`);
      }
    }
  }

  const normalized = { before: {}, after: {} };
  const changedFields = [];

  for (const field of ALLOWED_FIELDS) {
    const beforeHas = hasOwn(before, field);
    const afterHas = hasOwn(after, field);
    const beforeValue = before[field];
    const afterValue = after[field];

    let beforeNormalized = beforeHas ? beforeValue : null;
    let afterNormalized = afterHas ? afterValue : null;

    if (NUMERIC_FIELDS.has(field)) {
      const parsedBefore = parseNumericField(field, beforeValue, errors, "before");
      const parsedAfter = parseNumericField(field, afterValue, errors, "after");
      beforeNormalized = parsedBefore.present ? parsedBefore.value : null;
      afterNormalized = parsedAfter.present ? parsedAfter.value : null;
    } else if (field === "startAt" || field === "endAt") {
      const parsedBefore = parseDateField(field, beforeValue, errors, "before");
      const parsedAfter = parseDateField(field, afterValue, errors, "after");
      beforeNormalized = parsedBefore.present ? parsedBefore.value : null;
      afterNormalized = parsedAfter.present ? parsedAfter.value : null;
    } else {
      beforeNormalized = beforeHas ? normalizeString(beforeValue) : null;
      afterNormalized = afterHas ? normalizeString(afterValue) : null;
    }

    normalized.before[field] = beforeNormalized;
    normalized.after[field] = afterNormalized;

    if (beforeNormalized !== afterNormalized) {
      changedFields.push(field);
      diff.push({
        field,
        before: beforeNormalized,
        after: afterNormalized,
        riskLevel: ["bonus", "ledger", "turnover", "withdraw"].some((tag) => RISK_TAGS[field].includes(tag))
          ? "high"
          : "medium",
        riskTags: RISK_TAGS[field].slice(),
      });
    }
  }

  if (changedFields.length === 0) {
    errors.push("before and after must include at least one changed field");
  }

  const minDeposit = normalized.after.minDeposit ?? normalized.before.minDeposit;
  const maxDeposit = normalized.after.maxDeposit ?? normalized.before.maxDeposit;
  if (minDeposit !== null && maxDeposit !== null && maxDeposit < minDeposit) {
    errors.push("maxDeposit must be greater than or equal to minDeposit");
  }

  const startAt = normalized.after.startAt ?? normalized.before.startAt;
  const endAt = normalized.after.endAt ?? normalized.before.endAt;
  if (startAt && endAt && new Date(startAt).getTime() > new Date(endAt).getTime()) {
    errors.push("startAt must not be later than endAt");
  }

  const riskyFieldChanged = changedFields.some((field) =>
    ["bonusType", "bonusValue", "turnoverMultiplier", "maxWithdraw"].includes(field)
  );
  if (riskyFieldChanged && input.riskAcknowledgement !== true) {
    errors.push("riskAcknowledgement must be true when bonus, turnover, or maxWithdraw changes");
  }
  if (riskyFieldChanged && input.riskAcknowledgement === true) {
    warnings.push("Risk acknowledgement accepted for bonus, turnover, or withdraw changes");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    diff,
    riskSummary: {
      hasBonusRisk: changedFields.some((field) => ["bonusType", "bonusValue"].includes(field)),
      hasTurnoverRisk: changedFields.includes("turnoverMultiplier"),
      hasWithdrawRisk: changedFields.includes("maxWithdraw"),
      hasEligibilityRisk: changedFields.some((field) =>
        ["title", "type", "status", "minDeposit", "maxDeposit", "startAt", "endAt"].includes(field)
      ),
      hasStatusRisk: changedFields.includes("status"),
    },
  };
}

module.exports = {
  validatePromotionAdminWriteDryRun,
};
