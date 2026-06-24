"use strict";

require("dotenv").config();

const {
  maskDiagnosticText,
} = require("../game-provider-oroplay/oroplayProductionTransferClient");

const SAFE_NODE_ENVS = new Set(["development-local", "test", "staging"]);
const SAFE_APP_ENVS = new Set(["development-local", "local-test", "staging", "test"]);
const REQUIRED_ENV_KEYS = ["OROPLAY_BASE_URL", "OROPLAY_CLIENT_ID", "OROPLAY_CLIENT_SECRET"];
const BALANCE_FLAG = "OROPLAY_DIAGNOSTIC_BALANCE";

function isTruthyFlag(value) {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return false;
  return ["1", "true", "yes", "y", "enabled", "active", "on"].includes(normalized);
}

function maskClientId(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= 4) return "***";
  return `${text.slice(0, 2)}***${text.slice(-2)}`;
}

function readDiagnosticEnv(env = process.env) {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !String(env[key] || "").trim());
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(", ")}.`);
  }

  const nodeEnv = String(env.NODE_ENV || "").trim().toLowerCase();
  const appEnv = String(env.APP_ENV || "").trim().toLowerCase();
  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    throw new Error("NODE_ENV must be development-local, test, or staging.");
  }
  if (!SAFE_APP_ENVS.has(appEnv)) {
    throw new Error("APP_ENV must be development-local, local-test, staging, or test.");
  }

  const baseUrl = String(env.OROPLAY_BASE_URL || "").trim().replace(/\/+$/, "");
  let parsedBaseUrl;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch (_error) {
    throw new Error("OROPLAY_BASE_URL must be a valid URL.");
  }
  if (parsedBaseUrl.protocol !== "https:") {
    throw new Error("OROPLAY_BASE_URL must use https.");
  }

  return {
    baseUrl,
    clientId: String(env.OROPLAY_CLIENT_ID || "").trim(),
    clientSecret: String(env.OROPLAY_CLIENT_SECRET || "").trim(),
    balanceEnabled: isTruthyFlag(env[BALANCE_FLAG]),
  };
}

function redactDiagnosticValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    const text = String(value);
    const trimmed = text.trim();
    if (!trimmed) return text;
    if (/^Bearer\s+[A-Za-z0-9._-]+$/i.test(trimmed)) return "Bearer [REDACTED]";
    if (/^[A-Za-z0-9._-]{8,}$/.test(trimmed)) return "[REDACTED]";
    return maskDiagnosticText(text).replace(/\b[A-Za-z0-9._-]{20,}\b/g, "[REDACTED]");
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(redactDiagnosticValue);
  if (typeof value === "object") {
    const output = {};
    for (const [key, child] of Object.entries(value)) {
      if (/(token|access[_-]?token|authorization|bearer|secret|password|launch[_-]?url|url)/i.test(key)) {
        output[key] = "[REDACTED]";
      } else {
        output[key] = redactDiagnosticValue(child);
      }
    }
    return output;
  }
  return value;
}

function sanitizeResponseBody(bodyText) {
  const text = String(bodyText || "");
  if (!text.trim()) return "";

  const parsed = (() => {
    try {
      return JSON.parse(text);
    } catch (_error) {
      return null;
    }
  })();

  if (parsed !== null) {
    return JSON.stringify(redactDiagnosticValue(parsed), null, 2);
  }

  const sanitized = maskDiagnosticText(text)
    .replace(/^[A-Za-z0-9._-]{8,}$/g, "[REDACTED]")
    .replace(/access[_-]?token\s*[:=]\s*["']?[^"'\s,}]+["']?/gi, "accessToken=[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/\b[A-Za-z0-9._-]{20,}\b/g, "[REDACTED]");

  return sanitized;
}

function formatDiagnosticBlock({
  prefix = "",
  requestAtUtc,
  endpoint,
  clientId,
  status,
  contentType,
  bodyLength,
  bodyText,
}) {
  const key = (name) => `${prefix}${name}`;
  const resolvedBodyLength = typeof bodyLength === "number" ? bodyLength : String(bodyText || "").length;
  const lines = [
    `${key("REQUEST_AT_UTC")}=${requestAtUtc}`,
    `${key("ENDPOINT")}=${endpoint}`,
    `${key("CLIENT_ID")}=${clientId}`,
    `${key("HTTP_STATUS")}=${status}`,
    `${key("CONTENT_TYPE")}=${contentType || ""}`,
    `${key("BODY_LENGTH")}=${resolvedBodyLength}`,
    `${key("BODY_RAW_BEGIN")}`,
  ];

  if (resolvedBodyLength > 0) {
    lines.push(bodyText);
  }

  lines.push(`${key("BODY_RAW_END")}`);
  return lines.join("\n");
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();
  return {
    status: response.status,
    contentType,
    bodyText,
  };
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...headers,
    },
  });
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();
  return {
    status: response.status,
    contentType,
    bodyText,
  };
}

async function runAuthDiagnostic(env = process.env) {
  const config = readDiagnosticEnv(env);
  const requestAtUtc = new Date().toISOString();
  const tokenResponse = await postJson(`${config.baseUrl}/auth/createtoken`, {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  });
  const sanitizedTokenBody = sanitizeResponseBody(tokenResponse.bodyText);

  console.log(
    formatDiagnosticBlock({
      requestAtUtc,
      endpoint: "POST /auth/createtoken",
      clientId: maskClientId(config.clientId),
      status: tokenResponse.status,
      contentType: tokenResponse.contentType,
      bodyLength: String(tokenResponse.bodyText || "").length,
      bodyText: sanitizedTokenBody,
    })
  );

  const parsedTokenBody = (() => {
    try {
      return tokenResponse.bodyText ? JSON.parse(tokenResponse.bodyText) : null;
    } catch (_error) {
      return null;
    }
  })();
  const accessToken = parsedTokenBody && (parsedTokenBody.accessToken || parsedTokenBody.token || parsedTokenBody.bearer);
  if (config.balanceEnabled) {
    if (!accessToken) {
      throw new Error("OROPLAY_DIAGNOSTIC_BALANCE=1 requires a token or accessToken from createtoken.");
    }

    const balanceRequestAtUtc = new Date().toISOString();
    const balanceResponse = await getJson(`${config.baseUrl}/agent/balance`, {
      Authorization: `Bearer ${accessToken}`,
    });

    console.log(
      formatDiagnosticBlock({
        prefix: "BALANCE_",
        requestAtUtc: balanceRequestAtUtc,
        endpoint: "GET /agent/balance",
        clientId: maskClientId(config.clientId),
        status: balanceResponse.status,
        contentType: balanceResponse.contentType,
        bodyLength: String(balanceResponse.bodyText || "").length,
        bodyText: sanitizeResponseBody(balanceResponse.bodyText),
      })
    );
  }
}

async function main() {
  try {
    await runAuthDiagnostic();
  } catch (error) {
    console.error(`OroPlay auth diagnostic: FAIL`);
    console.error(maskDiagnosticText(error && error.message ? error.message : "Unknown error."));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  BALANCE_FLAG,
  formatDiagnosticBlock,
  maskClientId,
  readDiagnosticEnv,
  redactDiagnosticValue,
  runAuthDiagnostic,
  sanitizeResponseBody,
  main,
};
