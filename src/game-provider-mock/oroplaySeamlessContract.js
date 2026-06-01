"use strict";

const OROPLAY_SEAMLESS_ERROR_CODES = Object.freeze({
  AUTH_FAILED: "AUTH_FAILED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  INVALID_TRANSACTION: "INVALID_TRANSACTION",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  ROUND_FINISHED: "ROUND_FINISHED",
});

const OROPLAY_SEAMLESS_STATUSES = Object.freeze({
  ACCEPTED: "accepted",
  REJECTED: "rejected",
});

const SENSITIVE_KEYS = new Set([
  "authorization",
  "password",
  "secret",
  "token",
  "clientsecret",
  "databaseurl",
  "pin",
  "deviceid",
]);

function normalizeMoneyAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100) / 100;
}

function normalizeKey(key) {
  return String(key || "").replace(/[_-]/g, "").toLowerCase();
}

function isAuthorizationKey(key) {
  return normalizeKey(key) === "authorization" || normalizeKey(key) === "authorizationheader";
}

function shouldOmitSensitiveKey(key) {
  const normalized = normalizeKey(key);
  if (normalized === "authorization") return false;
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

function redactAuthorization(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase().startsWith("basic ") ? "Basic ***" : "[REDACTED]";
}

function sanitizeOroplayPayload(payload) {
  if (Array.isArray(payload)) return payload.map(sanitizeOroplayPayload);
  if (!payload || typeof payload !== "object") return payload;

  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (isAuthorizationKey(key)) {
      sanitized[key] = redactAuthorization(value);
      continue;
    }
    if (shouldOmitSensitiveKey(key)) continue;
    sanitized[key] = sanitizeOroplayPayload(value);
  }
  return sanitized;
}

function validateBasicAuthHeader({ authorizationHeader, expectedUser, expectedSecret }) {
  const header = String(authorizationHeader || "").trim();
  if (!header.toLowerCase().startsWith("basic ")) {
    return {
      ok: false,
      auth: header ? redactAuthorization(header) : "",
      errorCode: OROPLAY_SEAMLESS_ERROR_CODES.AUTH_FAILED,
      message: "Basic Auth required.",
    };
  }

  let decoded = "";
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch (_error) {
    return {
      ok: false,
      auth: "Basic ***",
      errorCode: OROPLAY_SEAMLESS_ERROR_CODES.AUTH_FAILED,
      message: "Basic Auth invalid.",
    };
  }

  const separatorIndex = decoded.indexOf(":");
  const user = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : "";
  const suppliedSecret = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";
  const ok = user === String(expectedUser || "") && suppliedSecret === String(expectedSecret || "");
  return {
    ok,
    auth: "Basic ***",
    errorCode: ok ? null : OROPLAY_SEAMLESS_ERROR_CODES.AUTH_FAILED,
    message: ok ? "Basic Auth accepted." : "Basic Auth rejected.",
  };
}

function buildBalanceResponse({ userCode, balance }) {
  return {
    success: true,
    status: OROPLAY_SEAMLESS_STATUSES.ACCEPTED,
    userCode,
    balance: normalizeMoneyAmount(balance),
    errorCode: null,
    message: "Balance accepted.",
  };
}

function buildTransactionResponse({ userCode, transactionCode, roundId, balance, status, errorCode, message }) {
  const accepted = status === OROPLAY_SEAMLESS_STATUSES.ACCEPTED;
  return {
    success: accepted,
    status,
    userCode,
    transactionCode,
    roundId,
    balance: normalizeMoneyAmount(balance),
    errorCode: errorCode || null,
    message: message || (accepted ? "Transaction accepted." : "Transaction rejected."),
  };
}

function buildErrorResponse({ errorCode, message }) {
  return {
    success: false,
    status: OROPLAY_SEAMLESS_STATUSES.REJECTED,
    errorCode,
    message,
  };
}

module.exports = {
  OROPLAY_SEAMLESS_ERROR_CODES,
  OROPLAY_SEAMLESS_STATUSES,
  normalizeMoneyAmount,
  sanitizeOroplayPayload,
  validateBasicAuthHeader,
  buildBalanceResponse,
  buildTransactionResponse,
  buildErrorResponse,
};
