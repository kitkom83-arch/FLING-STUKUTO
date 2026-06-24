"use strict";

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_AGENT_CODE = process.env.OROPLAY_AGENT_CODE || "MAHA289";
const DEFAULT_CURRENCY = process.env.OROPLAY_CURRENCY || "THB";
const DEFAULT_ENDPOINTS = Object.freeze({
  token: ["auth/createtoken", "auth/token", "token", "oauth/token"],
  agentBalance: ["agent/balance", "balance", "agent/account/balance"],
  vendorList: ["vendors/list", "vendor/list", "vendors", "provider/vendors"],
  gameList: ["games/list"],
  createPlayer: ["user/create", "player/create", "player", "user"],
  depositToPlayer: ["user/deposit", "player/deposit", "deposit/player", "player/credit", "deposit"],
  launchGame: ["game/launch-url", "game/launch", "launch", "player/launch"],
  userBalance: ["user/balance", "player/balance", "balance/player", "balance"],
  bettingHistory: ["betting/history/by-date-v2", "betting/history/by-date", "betting/history", "history/betting", "player/history"],
  withdrawAll: ["user/withdraw", "player/withdraw-all", "withdraw/all", "withdraw-all"],
});

class OroplayTransferError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "OroplayTransferError";
    this.details = details;
  }
}

function trimSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function joinPath(baseUrl, path) {
  const safeBase = trimSlash(baseUrl);
  const safePath = String(path || "").trim().replace(/^\/+/, "");
  return `${safeBase}/${safePath}`;
}

function maskTail(value, keep = 4) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= keep) return "***";
  return `${"*".repeat(Math.max(text.length - keep, 3))}${text.slice(-keep)}`;
}

function maskSecret(value) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 6) return "***";
  return `${text.slice(0, 2)}***${text.slice(-2)}`;
}

function maskToken(value) {
  return maskTail(value, 6);
}

function maskDiagnosticText(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const redacted = text
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/client[_-]?secret\s*[:=]\s*["']?[^"'&\s]+["']?/gi, "clientSecret=[REDACTED]")
    .replace(/token\s*[:=]\s*["']?[^"'&\s]+["']?/gi, "token=[REDACTED]");
  if (redacted.length <= 120) return redacted;
  return `${redacted.slice(0, 80)}...${redacted.slice(-20)}`;
}

function stableStringify(value) {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  return Object.keys(value)
    .sort()
    .map((key) => `${key}:${stableStringify(value[key])}`)
    .join("|");
}

function hashLike(value) {
  const text = stableStringify(value);
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function redactValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    if (value.length >= 80) return `[REDACTED:${hashLike(value)}]`;
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(redactValue);
  if (typeof value === "object") {
    const output = {};
    for (const [key, child] of Object.entries(value)) {
      const lower = key.toLowerCase();
      if (
        lower.includes("secret") ||
        lower.includes("token") ||
        lower.includes("password") ||
        lower.includes("authorization") ||
        lower.includes("bearer")
      ) {
        output[key] = maskSecret(child);
      } else {
        output[key] = redactValue(child);
      }
    }
    return output;
  }
  return value;
}

function summarizeResponsePayload(payload) {
  if (!payload || typeof payload !== "object") return redactValue(payload);
  const keys = [
    "success",
    "status",
    "code",
    "message",
    "error",
    "errorCode",
    "balance",
    "currency",
    "agentCode",
    "userName",
    "username",
    "playerId",
    "playerCode",
    "gameCode",
    "vendorCode",
    "launchUrl",
    "url",
    "sessionId",
    "transactionId",
    "historyCount",
  ];
  const summary = {};
  for (const key of keys) {
    if (payload[key] !== undefined) summary[key] = redactValue(payload[key]);
  }
  if (Object.keys(summary).length > 0) return summary;
  return redactValue(payload);
}

function normalizeListPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["message", "data", "items", "list", "rows", "games", "vendors", "history", "histories"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = normalizeListPayload(value);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function parseJsonMaybe(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return { rawText: raw };
  }
}

function normalizeBaseUrl(baseUrl) {
  const text = trimSlash(baseUrl);
  if (!text) throw new OroplayTransferError("OROPLAY_BASE_URL is required.");
  return text;
}

function normalizeEndpointList(value, fallback) {
  if (Array.isArray(value) && value.length > 0) return value.map((item) => String(item || "").replace(/^\/+/, "")).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [String(value).trim().replace(/^\/+/, "")];
  return fallback;
}

function isEnabledFlag(value) {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return false;
  return ["1", "true", "yes", "y", "enabled", "active", "open", "on"].includes(normalized);
}

function isLaunchableStatus(value) {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return false;
  return !["0", "false", "no", "n", "disabled", "inactive", "closed", "off", "suspended", "blocked"].includes(normalized);
}

function buildConfig(overrides = {}) {
  const baseUrl = normalizeBaseUrl(overrides.baseUrl || process.env.OROPLAY_BASE_URL);
  const clientId = String(overrides.clientId || process.env.OROPLAY_CLIENT_ID || "").trim();
  const clientSecret = String(overrides.clientSecret || process.env.OROPLAY_CLIENT_SECRET || "").trim();
  if (!clientId) throw new OroplayTransferError("OROPLAY_CLIENT_ID is required.");
  if (!clientSecret) throw new OroplayTransferError("OROPLAY_CLIENT_SECRET is required.");
  return {
    baseUrl,
    clientId,
    clientSecret,
    agentCode: String(overrides.agentCode || process.env.OROPLAY_AGENT_CODE || DEFAULT_AGENT_CODE).trim() || DEFAULT_AGENT_CODE,
    currency: String(overrides.currency || process.env.OROPLAY_CURRENCY || DEFAULT_CURRENCY).trim() || DEFAULT_CURRENCY,
    timeoutMs: Number(overrides.timeoutMs || process.env.OROPLAY_TIMEOUT_MS || DEFAULT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    endpoints: {
      token: normalizeEndpointList(overrides.endpoints && overrides.endpoints.token, DEFAULT_ENDPOINTS.token),
      agentBalance: normalizeEndpointList(overrides.endpoints && overrides.endpoints.agentBalance, DEFAULT_ENDPOINTS.agentBalance),
      vendorList: normalizeEndpointList(overrides.endpoints && overrides.endpoints.vendorList, DEFAULT_ENDPOINTS.vendorList),
      gameList: normalizeEndpointList(overrides.endpoints && overrides.endpoints.gameList, DEFAULT_ENDPOINTS.gameList),
      createPlayer: normalizeEndpointList(overrides.endpoints && overrides.endpoints.createPlayer, DEFAULT_ENDPOINTS.createPlayer),
      depositToPlayer: normalizeEndpointList(overrides.endpoints && overrides.endpoints.depositToPlayer, DEFAULT_ENDPOINTS.depositToPlayer),
      launchGame: normalizeEndpointList(overrides.endpoints && overrides.endpoints.launchGame, DEFAULT_ENDPOINTS.launchGame),
      userBalance: normalizeEndpointList(overrides.endpoints && overrides.endpoints.userBalance, DEFAULT_ENDPOINTS.userBalance),
      bettingHistory: normalizeEndpointList(overrides.endpoints && overrides.endpoints.bettingHistory, DEFAULT_ENDPOINTS.bettingHistory),
      withdrawAll: normalizeEndpointList(overrides.endpoints && overrides.endpoints.withdrawAll, DEFAULT_ENDPOINTS.withdrawAll),
    },
  };
}

function buildHeaders(token, clientId, clientSecret) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Client-Id": clientId,
    "X-Client-Secret": clientSecret,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function buildTokenBody(config) {
  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  };
}

function buildPlayerBody(config, player) {
  return {
    userCode: player.username,
  };
}

function buildDepositBody(config, player, amount, token) {
  return {
    userCode: player.username,
    balance: Number(amount),
    orderNo: `dep-${player.username}`,
  };
}

function buildLaunchBody(config, player, game, token) {
  return {
    vendorCode: game.vendorCode,
    gameCode: game.code,
    userCode: player.username,
    language: "en",
  };
}

function buildWithdrawAllBody(config, player, token, balance) {
  return {
    userCode: player.username,
    balance: Number(balance),
    orderNo: `wd-${player.username}`,
  };
}

async function fetchJson(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    const payload = parseJsonMaybe(text);
    return { response, payload, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function requestCandidate(config, candidatePath, options) {
  const url = joinPath(config.baseUrl, candidatePath);
  return fetchJson(
    url,
    {
      method: options.method || "GET",
      headers: buildHeaders(options.token, config.clientId, config.clientSecret),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    },
    config.timeoutMs
  ).then((responseEnvelope) => ({ url, ...responseEnvelope }));
}

function buildAttemptDetails(endpoint, result, error) {
  if (error) {
    return {
      endpoint,
      url: result && result.url ? result.url : null,
      status: null,
      success: false,
      errorCode: null,
      message: maskDiagnosticText(error && error.message ? error.message : "Request failed."),
    };
  }

  const summary = summarizeResponsePayload(result.payload);
  return {
    endpoint,
    url: result.url,
    status: result.response ? result.response.status : null,
    success: Boolean(result.response && result.response.ok),
    errorCode: firstDefined(summary && summary.errorCode, summary && summary.code) || null,
    message: maskDiagnosticText(firstDefined(summary && summary.message, summary && summary.error, result.text) || ""),
  };
}

async function requestWithFallback(config, endpointName, options = {}) {
  const candidates = config.endpoints[endpointName] || [];
  if (candidates.length === 0) {
    throw new OroplayTransferError(`No candidate endpoints configured for ${endpointName}.`);
  }

  const attempts = [];
  for (const candidate of candidates) {
    let result;
    try {
      result = await requestCandidate(config, candidate, options);
    } catch (error) {
      attempts.push(buildAttemptDetails(candidate, null, error));
      continue;
    }

    const attempt = buildAttemptDetails(candidate, result, null);
    attempts.push(attempt);
    if (result.response && result.response.ok) {
      return { ...result, endpoint: candidate, attempts };
    }
  }

  throw new OroplayTransferError(`No candidate endpoint succeeded for ${endpointName}.`, {
    endpointName,
    attempts,
  });
}

function resolveToken(payload) {
  if (!payload || typeof payload !== "object") return null;
  return (
    String(
      firstDefined(
        payload.access_token,
        payload.accessToken,
        payload.token,
        payload.authToken,
        payload.data && payload.data.access_token,
        payload.data && payload.data.accessToken,
        payload.data && payload.data.token,
        payload.result && payload.result.token,
        payload.result && payload.result.access_token
      ) || ""
    ).trim() || null
  );
}

function normalizeGameList(payload, fallbackVendorCode = "") {
  const rows = normalizeListPayload(payload);
  return rows
    .map((row) => ({
      raw: row,
      code: String(firstDefined(row && row.gameCode, row && row.game_code, row && row.code, row && row.id, row && row.gameId) || "").trim(),
      name: String(firstDefined(row && row.gameName, row && row.game_name, row && row.name, row && row.title) || "").trim(),
      vendorCode: String(firstDefined(row && row.vendorCode, row && row.vendor_code, row && row.providerCode, row && row.provider_code, row && row.vendor, fallbackVendorCode) || "").trim(),
      category: String(firstDefined(row && row.category, row && row.type, row && row.gameType, row && row.game_type) || "").trim(),
      gameType: String(firstDefined(row && row.gameType, row && row.game_type, row && row.type, row && row.category) || "").trim(),
      status: String(firstDefined(row && row.status, row && row.state, row && row.gameStatus, row && row.game_status) || "").trim(),
      launchable:
        firstDefined(row && row.launchable, row && row.isLaunchable, row && row.enabled, row && row.isEnabled, row && row.active, row && row.isActive, row && row.status, row && row.state) === undefined
          ? undefined
          : isLaunchableStatus(firstDefined(row && row.launchable, row && row.isLaunchable, row && row.enabled, row && row.isEnabled, row && row.active, row && row.isActive, row && row.status, row && row.state)),
    }))
    .filter((row) => row.code);
}

function normalizeVendorList(payload) {
  const rows = normalizeListPayload(payload);
  return rows
    .map((row) => ({
      raw: row,
      code: String(firstDefined(row && row.vendorCode, row && row.vendor_code, row && row.code, row && row.id, row && row.providerCode) || "").trim(),
      name: String(firstDefined(row && row.vendorName, row && row.vendor_name, row && row.name, row && row.title) || "").trim(),
      status: String(firstDefined(row && row.status, row && row.state, row && row.vendorStatus, row && row.vendor_status) || "").trim(),
      enabled:
        firstDefined(row && row.enabled, row && row.isEnabled, row && row.active, row && row.isActive, row && row.status, row && row.state) === undefined
          ? undefined
          : isEnabledFlag(firstDefined(row && row.enabled, row && row.isEnabled, row && row.active, row && row.isActive, row && row.status, row && row.state)),
    }))
    .filter((row) => row.code);
}

function normalizeBalance(payload) {
  if (payload === null || payload === undefined) return null;

  if (typeof payload === "number") {
    return Number.isFinite(payload) ? payload : null;
  }

  if (typeof payload === "string") {
    const numeric = Number(payload);
    return Number.isFinite(numeric) ? numeric : null;
  }

  if (typeof payload !== "object") return null;

  const value = firstDefined(
    payload.balance,
    payload.availableBalance,
    payload.currentBalance,
    payload.walletBalance,
    payload.credit,
    payload.amount,
    payload.message
  );

  if (value === null || value === undefined) return null;

  if (typeof value === "object") {
    return normalizeBalance(value);
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeHistory(payload) {
  const rows = normalizeListPayload(payload);
  return rows.map((row) => ({
    raw: row,
    transactionId: String(firstDefined(row && row.transactionId, row && row.transaction_id, row && row.id, row && row.refId, row && row.referenceId) || "").trim(),
    gameCode: String(firstDefined(row && row.gameCode, row && row.game_code, row && row.code) || "").trim(),
    amount: Number(firstDefined(row && row.amount, row && row.betAmount, row && row.winAmount, row && row.transactionAmount, row && row.value) || 0),
    createdAt: String(firstDefined(row && row.createdAt, row && row.created_at, row && row.time, row && row.timestamp) || "").trim(),
    status: String(firstDefined(row && row.status, row && row.result) || "").trim(),
  }));
}

function createOroplayTransferClient(overrides = {}) {
  const config = buildConfig(overrides);
  return {
    config: Object.freeze({ ...config, clientSecret: maskSecret(config.clientSecret), clientId: maskSecret(config.clientId) }),
    rawConfig: config,
    maskToken,
    maskSecret,
    summarizeResponsePayload,
    async createToken() {
      const result = await requestWithFallback(config, "token", {
        method: "POST",
        body: buildTokenBody(config),
      });
      const token = resolveToken(result.payload);
      if (!token) {
        throw new OroplayTransferError("OroPlay token response did not include a usable token.", {
          endpoint: result.endpoint,
          response: summarizeResponsePayload(result.payload),
        });
      }
      return {
        endpoint: result.endpoint,
        token,
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async getAgentBalance(token) {
      const result = await requestWithFallback(config, "agentBalance", {
        method: "GET",
        token,
      });
      return {
        endpoint: result.endpoint,
        balance: normalizeBalance(result.payload),
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async getVendorList(token) {
      const result = await requestWithFallback(config, "vendorList", {
        method: "GET",
        token,
      });
      return {
        endpoint: result.endpoint,
        vendors: normalizeVendorList(result.payload),
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async getGameList(token, vendorCode) {
      const normalizedVendorCode = String(vendorCode || "").trim();
      if (!normalizedVendorCode) {
        throw new OroplayTransferError("vendorCode is required for OroPlay games/list.");
      }
      const result = await requestWithFallback(config, "gameList", {
        method: "POST",
        token,
        body: {
          vendorCode: normalizedVendorCode,
          language: "en",
        },
      });
      return {
        endpoint: result.endpoint,
        vendorCode: normalizedVendorCode,
        games: normalizeGameList(result.payload, normalizedVendorCode),
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async createPlayer(token, player) {
      const result = await requestWithFallback(config, "createPlayer", {
        method: "POST",
        token,
        body: buildPlayerBody(config, player),
      });
      return {
        endpoint: result.endpoint,
        payload: summarizeResponsePayload(result.payload),
        playerId: String(firstDefined(result.payload && result.payload.playerId, result.payload && result.payload.playerCode, result.payload && result.payload.userName, result.payload && result.payload.username, player.username) || player.username),
        username: player.username,
      };
    },
    async depositToPlayer(token, player, amount) {
      const result = await requestWithFallback(config, "depositToPlayer", {
        method: "POST",
        token,
        body: buildDepositBody(config, player, amount, token),
      });
      return {
        endpoint: result.endpoint,
        balance: normalizeBalance(result.payload),
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async launchGame(token, player, game) {
      const result = await requestWithFallback(config, "launchGame", {
        method: "POST",
        token,
        body: buildLaunchBody(config, player, game, token),
      });
      return {
        endpoint: result.endpoint,
        launchUrl: String(firstDefined(
          result.payload && result.payload.launchUrl,
          result.payload && result.payload.launch_url,
          result.payload && result.payload.url,
          result.payload && result.payload.link,
          typeof (result.payload && result.payload.message) === "string" ? result.payload.message : null
        ) || "").trim(),
        sessionId: String(firstDefined(result.payload && result.payload.sessionId, result.payload && result.payload.session_id, result.payload && result.payload.transactionId) || "").trim(),
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async getUserBalance(token, player) {
      const result = await requestWithFallback(config, "userBalance", {
        method: "POST",
        token,
        body: {
          userCode: player.username,
        },
      });
      return {
        endpoint: result.endpoint,
        balance: normalizeBalance(result.payload),
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async getBettingHistory(token, player) {
      const result = await requestWithFallback(config, "bettingHistory", {
        method: "POST",
        token,
        body: {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, ""),
          limit: 10,
        },
      });
      return {
        endpoint: result.endpoint,
        history: normalizeHistory(result.payload),
        payload: summarizeResponsePayload(result.payload),
      };
    },
    async withdrawAll(token, player, balance) {
      const result = await requestWithFallback(config, "withdrawAll", {
        method: "POST",
        token,
        body: buildWithdrawAllBody(config, player, token, balance),
      });
      return {
        endpoint: result.endpoint,
        balance: normalizeBalance(result.payload),
        payload: summarizeResponsePayload(result.payload),
      };
    },
  };
}

module.exports = {
  OroplayTransferError,
  createOroplayTransferClient,
  maskSecret,
  maskToken,
  maskDiagnosticText,
  normalizeBalance,
  normalizeGameList,
  normalizeHistory,
  normalizeVendorList,
  summarizeResponsePayload,
};
