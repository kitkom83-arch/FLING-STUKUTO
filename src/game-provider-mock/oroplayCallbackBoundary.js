"use strict";

const OROPLAY_CALLBACK_BOUNDARY_STATUS = Object.freeze({
  phase: "ORO-2A",
  status: "design/staging-boundary only",
  routeRuntime: "not implemented in ORO-2A",
  routeBoundary: "staging route boundary only",
});

const OROPLAY_CALLBACK_ROUTES = Object.freeze({
  preferredInternal: Object.freeze([
    Object.freeze({ method: "POST", path: "/api/oroplay/balance", callbackType: "balance" }),
    Object.freeze({ method: "POST", path: "/api/oroplay/transaction", callbackType: "transaction" }),
  ]),
  optionalProviderAliases: Object.freeze([
    Object.freeze({
      method: "POST",
      path: "/api/balance",
      callbackType: "balance",
      optional: true,
      usage: "provider-required-only",
      mapsTo: "/api/oroplay/balance",
    }),
    Object.freeze({
      method: "POST",
      path: "/api/transaction",
      callbackType: "transaction",
      optional: true,
      usage: "provider-required-only",
      mapsTo: "/api/oroplay/transaction",
    }),
  ]),
});

const SENSITIVE_KEYS = new Set([
  "authorization",
  "authorizationheader",
  "password",
  "secret",
  "token",
  "clientsecret",
  "databaseurl",
  "pin",
  "deviceid",
]);

function cloneRoute(route) {
  return { ...route };
}

function normalizeKey(key) {
  return String(key || "").replace(/[_-]/g, "").toLowerCase();
}

function isSensitiveKey(key) {
  const normalized = normalizeKey(key);
  if (SENSITIVE_KEYS.has(normalized)) return true;
  return (
    normalized.includes("password") ||
    normalized.includes("secret") ||
    normalized.includes("token") ||
    normalized.includes("databaseurl") ||
    normalized.includes("pin") ||
    normalized.includes("deviceid")
  );
}

function isAuthorizationKey(key) {
  const normalized = normalizeKey(key);
  return normalized === "authorization" || normalized === "authorizationheader";
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function classifyAmountIntent(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return { valid: false, intent: "invalid", reason: "malformed amount" };
  }
  if (amount === 0) {
    return { valid: false, intent: "invalid", reason: "zero amount" };
  }
  if (amount < 0) {
    return { valid: true, intent: "bet/debit intent", normalizedAmount: amount };
  }
  return { valid: true, intent: "win/credit intent", normalizedAmount: amount };
}

function inferCallbackType(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const explicitType = String(source.callbackType || source.type || "").trim().toLowerCase();
  if (explicitType === "balance" || explicitType === "transaction") return explicitType;
  if (Object.prototype.hasOwnProperty.call(source, "amount") || hasValue(source.transactionCode)) {
    return "transaction";
  }
  return "balance";
}

function buildOroplayCallbackSafetyMatrix() {
  return {
    phase: OROPLAY_CALLBACK_BOUNDARY_STATUS.phase,
    status: OROPLAY_CALLBACK_BOUNDARY_STATUS.status,
    noProductionDb: true,
    noRealMoney: true,
    noLiveOroplayApi: true,
    noExternalNetwork: true,
    noClientSecret: true,
    noRuntimeWalletMutation: true,
    noRuntimeLedgerMutation: true,
    noCallbackWalletMutationRoute: true,
    noAutoCredit: true,
    noPayout: true,
    noMigration: true,
    noDeploy: true,
  };
}

function buildOroplayCallbackRoutePlan() {
  return {
    phase: OROPLAY_CALLBACK_BOUNDARY_STATUS.phase,
    status: OROPLAY_CALLBACK_BOUNDARY_STATUS.status,
    routeRuntime: OROPLAY_CALLBACK_BOUNDARY_STATUS.routeRuntime,
    createsExpressRoute: false,
    importsDatabase: false,
    importsPrisma: false,
    callsExternalNetwork: false,
    routes: {
      preferredInternal: OROPLAY_CALLBACK_ROUTES.preferredInternal.map(cloneRoute),
      optionalProviderAliases: OROPLAY_CALLBACK_ROUTES.optionalProviderAliases.map(cloneRoute),
    },
    authBoundary: {
      type: "Basic Auth",
      credentialSource: "env-only",
      envKeys: ["OROPLAY_CALLBACK_BASIC_AUTH_USER", "OROPLAY_CALLBACK_BASIC_AUTH_PASSWORD"],
      rawAuthorizationLogging: false,
      rawAuthorizationStorage: false,
    },
    requestBoundary: {
      balanceRequiredFields: ["userCode"],
      transactionRequiredFields: ["userCode", "transactionCode", "amount"],
      optionalGuardFields: ["roundId", "isFinished"],
    },
    moneyRule: {
      negative: "bet/debit intent",
      positive: "win/credit intent",
      zero: "invalid",
      malformed: "invalid",
    },
    limitations: buildOroplayCallbackSafetyMatrix(),
    futureDependencies: [
      "member mapping",
      "wallet ledger source of truth",
      "callback logs",
      "game transactions",
      "idempotency",
      "reconciliation",
    ],
  };
}

function validateOroplayCallbackRoutePlan(plan) {
  const errors = [];
  const candidate = plan && typeof plan === "object" ? plan : {};
  const preferred = candidate.routes && Array.isArray(candidate.routes.preferredInternal)
    ? candidate.routes.preferredInternal
    : [];
  const aliases = candidate.routes && Array.isArray(candidate.routes.optionalProviderAliases)
    ? candidate.routes.optionalProviderAliases
    : [];
  const safety = candidate.limitations || {};

  function hasRoute(routes, method, path) {
    return routes.some((route) => route.method === method && route.path === path);
  }

  if (candidate.status !== OROPLAY_CALLBACK_BOUNDARY_STATUS.status) {
    errors.push("route plan must be design/staging-boundary only.");
  }
  if (candidate.createsExpressRoute !== false) errors.push("route plan must not create Express routes.");
  if (candidate.importsDatabase !== false) errors.push("route plan must not import database modules.");
  if (candidate.importsPrisma !== false) errors.push("route plan must not import Prisma.");
  if (candidate.callsExternalNetwork !== false) errors.push("route plan must not call external network.");
  if (!hasRoute(preferred, "POST", "/api/oroplay/balance")) errors.push("missing POST /api/oroplay/balance.");
  if (!hasRoute(preferred, "POST", "/api/oroplay/transaction")) errors.push("missing POST /api/oroplay/transaction.");
  if (!hasRoute(aliases, "POST", "/api/balance")) errors.push("missing optional POST /api/balance alias.");
  if (!hasRoute(aliases, "POST", "/api/transaction")) errors.push("missing optional POST /api/transaction alias.");
  if (aliases.some((route) => route.optional !== true || route.usage !== "provider-required-only")) {
    errors.push("optional aliases must be provider-required-only.");
  }
  if (!candidate.authBoundary || candidate.authBoundary.type !== "Basic Auth") {
    errors.push("Basic Auth boundary is required.");
  }
  if (!candidate.authBoundary || candidate.authBoundary.credentialSource !== "env-only") {
    errors.push("credentials must be env-only.");
  }
  if (!candidate.authBoundary || candidate.authBoundary.rawAuthorizationLogging !== false) {
    errors.push("raw authorization logging must be disabled.");
  }
  if (!safety.noRuntimeWalletMutation) errors.push("route plan must mark no runtime wallet mutation.");
  if (!safety.noRuntimeLedgerMutation) errors.push("route plan must mark no runtime ledger mutation.");
  if (!safety.noProductionDb) errors.push("route plan must mark no production DB.");
  if (!safety.noRealMoney) errors.push("route plan must mark no real money.");
  if (!safety.noLiveOroplayApi) errors.push("route plan must mark no live OroPlay API.");

  return { ok: errors.length === 0, errors };
}

function validateOroplayCallbackPayloadShape(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const callbackType = inferCallbackType(source);
  const requiredFields = callbackType === "transaction"
    ? ["userCode", "transactionCode", "amount"]
    : ["userCode"];
  const missingFields = requiredFields.filter((field) => !hasValue(source[field]));
  const amountRule = callbackType === "transaction"
    ? classifyAmountIntent(source.amount)
    : { valid: true, intent: "not applicable" };

  return {
    ok: missingFields.length === 0 && amountRule.valid,
    callbackType,
    requiredFields,
    missingFields,
    optionalGuardFields: {
      roundId: {
        supported: true,
        present: hasValue(source.roundId),
      },
      isFinished: {
        supported: true,
        present: typeof source.isFinished === "boolean",
      },
    },
    amountRule,
  };
}

function sanitizeString(value) {
  const text = String(value || "");
  const bearerScheme = ["Be", "arer"].join("");
  if (/^basic\s+/i.test(text)) return "[REDACTED_AUTH]";
  if (new RegExp(`^${bearerScheme}\\s+`, "i").test(text)) return "[REDACTED_AUTH]";
  if (/\bpostgres(?:ql)?:\/\/[^\s]+/i.test(text)) return "[REDACTED_DB_URL]";
  if (/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(text)) return "[REDACTED_TOKEN]";
  return value;
}

function sanitizeOroplayCallbackForLog(payload) {
  if (Array.isArray(payload)) return payload.map(sanitizeOroplayCallbackForLog);
  if (!payload || typeof payload !== "object") {
    return typeof payload === "string" ? sanitizeString(payload) : payload;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (isAuthorizationKey(key)) {
      sanitized[key] = "[REDACTED_AUTH]";
      continue;
    }
    if (isSensitiveKey(key)) {
      continue;
    }
    sanitized[key] = sanitizeOroplayCallbackForLog(value);
  }
  return sanitized;
}

module.exports = {
  OROPLAY_CALLBACK_ROUTES,
  OROPLAY_CALLBACK_BOUNDARY_STATUS,
  buildOroplayCallbackRoutePlan,
  validateOroplayCallbackRoutePlan,
  buildOroplayCallbackSafetyMatrix,
  validateOroplayCallbackPayloadShape,
  sanitizeOroplayCallbackForLog,
};
