const crypto = require("crypto");
const { success, fail } = require("../utils/response");
const { createOroplayTransferClient } = require("../game-provider-oroplay/oroplayProductionTransferClient");

const SAFE_NODE_ENVS = new Set(["development-local", "test", "staging"]);
const REQUIRED_APP_ENV = "local-test";
const REQUIRED_FLAG = "1";
const REQUIRED_MODE = "transfer";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_DEPOSIT_AMOUNT = 20;
const demoSessions = new Map();

function nowStamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function randomSuffix() {
  return crypto.randomBytes(3).toString("hex");
}

function createDemoUsername() {
  return `oroplay_demo_${nowStamp()}_${randomSuffix()}`;
}

function createDemoDisplayName(username) {
  return `OroPlay Demo ${username.slice(-10)}`;
}

function pruneExpiredSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [sessionId, session] of demoSessions.entries()) {
    if (!session || session.createdAt < cutoff) {
      demoSessions.delete(sessionId);
    }
  }
}

function getDemoSafetyReasons() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const appEnv = String(process.env.APP_ENV || "").trim().toLowerCase();
  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be development-local, test, or staging.");
  }
  if (appEnv !== REQUIRED_APP_ENV) {
    reasons.push("APP_ENV must be local-test.");
  }
  if (String(process.env.OROPLAY_ENABLED || "").trim() !== REQUIRED_FLAG) {
    reasons.push("OROPLAY_ENABLED must be 1.");
  }
  if (String(process.env.OROPLAY_MODE || "").trim().toLowerCase() !== REQUIRED_MODE) {
    reasons.push("OROPLAY_MODE must be transfer.");
  }
  return reasons;
}

function rejectIfBlocked(res) {
  const reasons = getDemoSafetyReasons();
  if (reasons.length > 0) {
    fail(res, "OroPlay local demo is blocked by safety guard.", 503, { reasons });
    return true;
  }
  return false;
}

function createClient() {
  return createOroplayTransferClient();
}

async function getTokenAndClient() {
  const client = createClient();
  const tokenResponse = await client.createToken();
  return { client, token: tokenResponse.token };
}

function safeVendor(vendor) {
  return {
    code: vendor.code,
    name: vendor.name || vendor.code,
    status: vendor.status || (vendor.enabled === false ? "inactive" : "active"),
    enabled: vendor.enabled,
  };
}

function safeGame(game) {
  return {
    code: game.code,
    name: game.name || game.code,
    vendorCode: game.vendorCode,
    category: game.category || "",
    gameType: game.gameType || "",
    status: game.status || (game.launchable === false ? "inactive" : "active"),
    launchable: game.launchable,
  };
}

function rememberSession(data) {
  demoSessions.set(data.sessionId, data);
  return data;
}

function getSession(sessionId) {
  pruneExpiredSessions();
  const session = demoSessions.get(sessionId);
  if (!session) {
    return null;
  }
  return session;
}

function parsePositiveAmount(value, fallback) {
  const parsed = Number(value === undefined || value === null || value === "" ? fallback : value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
}

async function listVendors(_req, res) {
  if (rejectIfBlocked(res)) return;
  try {
    const { client, token } = await getTokenAndClient();
    const vendorList = await client.getVendorList(token);
    return success(res, {
      vendors: vendorList.vendors.map(safeVendor),
    });
  } catch (error) {
    return fail(res, "Unable to load OroPlay vendors.", 502, { reason: error.message });
  }
}

async function listGames(req, res) {
  if (rejectIfBlocked(res)) return;
  const vendorCode = String(req.params.vendorCode || "").trim();
  if (!vendorCode) {
    return fail(res, "vendorCode is required.", 400);
  }

  try {
    const { client, token } = await getTokenAndClient();
    const gameList = await client.getGameList(token, vendorCode);
    return success(res, {
      vendorCode,
      games: gameList.games.map(safeGame),
    });
  } catch (error) {
    return fail(res, "Unable to load OroPlay games.", 502, { reason: error.message });
  }
}

async function createSession(_req, res) {
  if (rejectIfBlocked(res)) return;
  try {
    const { client, token } = await getTokenAndClient();
    const username = createDemoUsername();
    const player = {
      username,
      displayName: createDemoDisplayName(username),
    };
    const created = await client.createPlayer(token, player);
    const sessionId = crypto.randomBytes(12).toString("hex");
    rememberSession({
      sessionId,
      token,
      player: {
        username: created.username || player.username,
        displayName: player.displayName,
        playerId: created.playerId || "",
      },
      createdAt: Date.now(),
      depositAmount: DEFAULT_DEPOSIT_AMOUNT,
      deposited: false,
      balance: null,
    });
    return success(res, {
      sessionId,
      player: {
        username: player.username,
        displayName: player.displayName,
      },
      depositAmount: DEFAULT_DEPOSIT_AMOUNT,
    });
  } catch (error) {
    return fail(res, "Unable to create OroPlay demo user.", 502, { reason: error.message });
  }
}

async function depositSession(req, res) {
  if (rejectIfBlocked(res)) return;
  const session = getSession(String(req.params.sessionId || "").trim());
  if (!session) {
    return fail(res, "Unknown demo session.", 404);
  }

  const amount = parsePositiveAmount(req.body && req.body.amount, DEFAULT_DEPOSIT_AMOUNT);
  if (amount === null) {
    return fail(res, "amount must be a positive number.", 400);
  }

  try {
    const { client, token } = await getTokenAndClient();
    const result = await client.depositToPlayer(token, session.player, amount);
    session.deposited = true;
    session.balance = result.balance;
    session.depositAmount = amount;
    demoSessions.set(session.sessionId, session);
    return success(res, {
      sessionId: session.sessionId,
      username: session.player.username,
      depositAmount: amount,
      balance: result.balance,
    });
  } catch (error) {
    return fail(res, "Unable to deposit OroPlay demo balance.", 502, { reason: error.message });
  }
}

async function launchSession(req, res) {
  if (rejectIfBlocked(res)) return;
  const session = getSession(String(req.params.sessionId || "").trim());
  if (!session) {
    return fail(res, "Unknown demo session.", 404);
  }

  const vendorCode = String((req.body && req.body.vendorCode) || "").trim();
  const gameCode = String((req.body && req.body.gameCode) || "").trim();
  const gameName = String((req.body && req.body.gameName) || "").trim();
  if (!vendorCode || !gameCode) {
    return fail(res, "vendorCode and gameCode are required.", 400);
  }

  try {
    const { client, token } = await getTokenAndClient();
    const launch = await client.launchGame(token, session.player, {
      vendorCode,
      code: gameCode,
      name: gameName || gameCode,
    });
    if (!launch.launchUrl) {
      return fail(res, "OroPlay did not return a launch URL.", 502);
    }
    res.set("Cache-Control", "no-store");
    return res.redirect(302, launch.launchUrl);
  } catch (error) {
    return fail(res, "Unable to launch OroPlay game.", 502, { reason: error.message });
  }
}

module.exports = {
  listVendors,
  listGames,
  createSession,
  depositSession,
  launchSession,
};
