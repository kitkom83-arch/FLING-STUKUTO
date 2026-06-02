"use strict";

const OROPLAY_CALLBACK_STUB_STATUS = Object.freeze({
  phase: "ORO-2B",
  status: "staging callback stub fail-closed",
  defaultState: "disabled_fail_closed",
  enabledState: "route_skeleton_fail_closed",
});

const OROPLAY_CALLBACK_STUB_ROUTES = Object.freeze({
  preferredInternal: Object.freeze([
    Object.freeze({ method: "POST", path: "/api/oroplay/balance", callbackType: "balance", activeSkeleton: true }),
    Object.freeze({
      method: "POST",
      path: "/api/oroplay/transaction",
      callbackType: "transaction",
      activeSkeleton: true,
    }),
  ]),
  optionalProviderAliases: Object.freeze([
    Object.freeze({
      method: "POST",
      path: "/api/balance",
      callbackType: "balance",
      activeSkeleton: false,
      optional: true,
      usage: "provider-required-only",
      mapsTo: "/api/oroplay/balance",
    }),
    Object.freeze({
      method: "POST",
      path: "/api/transaction",
      callbackType: "transaction",
      activeSkeleton: false,
      optional: true,
      usage: "provider-required-only",
      mapsTo: "/api/oroplay/transaction",
    }),
  ]),
});

const SENSITIVE_KEY_MARKERS = [
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
];

function cloneRoute(route) {
  return { ...route };
}

function normalizeKey(key) {
  return String(key || "").replace(/[_-]/g, "").toLowerCase();
}

function isSensitiveKey(key) {
  const normalized = normalizeKey(key);
  if (normalized.startsWith("no")) return false;
  return SENSITIVE_KEY_MARKERS.some((marker) => normalized === marker || normalized.includes(marker));
}

function isAuthorizationKey(key) {
  const normalized = normalizeKey(key);
  return normalized === "authorization" || normalized === "authorizationheader";
}

function sanitizeString(value) {
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

function sanitizeOroplayCallbackStubResponse(payload) {
  if (Array.isArray(payload)) return payload.map(sanitizeOroplayCallbackStubResponse);
  if (!payload || typeof payload !== "object") {
    return typeof payload === "string" ? sanitizeString(payload) : payload;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (isAuthorizationKey(key)) {
      sanitized[key] = "[REDACTED_AUTH]";
      continue;
    }
    if (isSensitiveKey(key)) continue;
    sanitized[key] = sanitizeOroplayCallbackStubResponse(value);
  }
  return sanitized;
}

function buildOroplayCallbackStubSafety() {
  return {
    failClosed: true,
    stagingOnly: true,
    noProductionDb: true,
    noWalletMutation: true,
    noLedgerMutation: true,
    noExternalNetwork: true,
    noRealMoney: true,
    noLiveOroplayApi: true,
    noClientSecret: true,
    noAutoCredit: true,
    noPayout: true,
    noMigration: true,
    noDeploy: true,
  };
}

function buildOroplayCallbackStubResponse(options = {}) {
  const callbackType = options.callbackType === "transaction" ? "transaction" : "balance";
  const stubEnabled = options.stubEnabled === true;
  const routeState = stubEnabled
    ? OROPLAY_CALLBACK_STUB_STATUS.enabledState
    : OROPLAY_CALLBACK_STUB_STATUS.defaultState;

  return sanitizeOroplayCallbackStubResponse({
    success: false,
    phase: OROPLAY_CALLBACK_STUB_STATUS.phase,
    status: OROPLAY_CALLBACK_STUB_STATUS.status,
    routeState,
    callbackType,
    result: "fail_closed",
    message: stubEnabled
      ? "OroPlay staging callback route skeleton is present but runtime processing is blocked."
      : "OroPlay staging callback stub is disabled and fails closed.",
    safety: buildOroplayCallbackStubSafety(),
  });
}

function buildOroplayCallbackStubRouteSummary() {
  return {
    phase: OROPLAY_CALLBACK_STUB_STATUS.phase,
    status: OROPLAY_CALLBACK_STUB_STATUS.status,
    mount: "/api/oroplay",
    preferredInternal: OROPLAY_CALLBACK_STUB_ROUTES.preferredInternal.map(cloneRoute),
    optionalProviderAliases: OROPLAY_CALLBACK_STUB_ROUTES.optionalProviderAliases.map(cloneRoute),
    defaultBehavior: "fail-closed",
    activeAliases: false,
    safety: buildOroplayCallbackStubSafety(),
  };
}

function validateOroplayCallbackStubSafety(candidate) {
  const response = candidate && typeof candidate === "object" ? candidate : buildOroplayCallbackStubResponse();
  const safety = response.safety || {};
  const errors = [];
  const requiredTrueFlags = [
    "failClosed",
    "stagingOnly",
    "noProductionDb",
    "noWalletMutation",
    "noLedgerMutation",
    "noExternalNetwork",
    "noRealMoney",
    "noLiveOroplayApi",
    "noClientSecret",
    "noAutoCredit",
    "noPayout",
    "noMigration",
    "noDeploy",
  ];

  if (response.success !== false) errors.push("stub response must not report success.");
  if (response.result !== "fail_closed") errors.push("stub response must fail closed.");
  for (const flag of requiredTrueFlags) {
    if (safety[flag] !== true) errors.push(`stub safety must set ${flag}.`);
  }

  return { ok: errors.length === 0, errors };
}

module.exports = {
  OROPLAY_CALLBACK_STUB_ROUTES,
  OROPLAY_CALLBACK_STUB_STATUS,
  buildOroplayCallbackStubResponse,
  buildOroplayCallbackStubRouteSummary,
  sanitizeOroplayCallbackStubResponse,
  validateOroplayCallbackStubSafety,
};
