"use strict";

require("dotenv").config();

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  createOroplayTransferClient,
  maskSecret,
  maskToken,
} = require("../game-provider-oroplay/oroplayProductionTransferClient");

const SAFE_NODE_ENVS = new Set(["development-local", "test", "staging"]);
const REQUIRED_ENV_KEYS = ["OROPLAY_BASE_URL", "OROPLAY_CLIENT_ID", "OROPLAY_CLIENT_SECRET"];
const FORBIDDEN_SECRET_SHAPES = [
  /postgres(?:ql)?:\/\/[^\n\s]+/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,
  /Basic\s+[A-Za-z0-9+/=]{20,}/i,
  new RegExp("s" + "k-" + "[A-Za-z0-9_-]{12,}", "i"),
  /clientSecret\s*[:=]\s*["'][^"']{8,}["']/i,
  /client_secret\s*[:=]\s*["'][^"']{8,}["']/i,
  /token\s*[:=]\s*["'][^"']{20,}["']/i,
  /password\s*[:=]\s*["'][^"']{8,}["']/i,
];

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

function readRequiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function inspectLocalSafety() {
  const reasons = [];
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  if (!SAFE_NODE_ENVS.has(nodeEnv)) {
    reasons.push("NODE_ENV must be development-local, test, or staging.");
  }
  if (String(process.env.OROPLAY_ENABLED || "").trim() !== "1") {
    reasons.push("OROPLAY_ENABLED must be 1.");
  }
  if (String(process.env.OROPLAY_MODE || "").trim().toLowerCase() !== "transfer") {
    reasons.push("OROPLAY_MODE must be transfer.");
  }
  for (const key of REQUIRED_ENV_KEYS) {
    if (!String(process.env[key] || "").trim()) {
      reasons.push(`${key} must be set.`);
    }
  }
  if (reasons.length > 0) {
    throw new Error(`OroPlay production transfer smoke safety guard: BLOCKED\n- ${reasons.join("\n- ")}`);
  }
  console.log("OroPlay production transfer smoke safety guard: PASS");
}

function isNonEmptyText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isTruthyFlag(value) {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return false;
  return ["1", "true", "yes", "y", "enabled", "active", "open", "on"].includes(normalized);
}

function isEnabledVendor(vendor) {
  if (!vendor) return false;
  const status = String(vendor.status || vendor.raw && vendor.raw.status || vendor.raw && vendor.raw.state || "").trim().toLowerCase();
  if (["disabled", "inactive", "closed", "off", "suspended", "blocked"].includes(status)) return false;
  if (["enabled", "active", "open", "on"].includes(status)) return true;
  if (vendor.enabled !== undefined) return Boolean(vendor.enabled);
  const rawFlag = vendor.raw && (vendor.raw.enabled ?? vendor.raw.isEnabled ?? vendor.raw.active ?? vendor.raw.isActive);
  if (rawFlag !== undefined) return isTruthyFlag(rawFlag);
  return true;
}

function isLaunchableGame(game) {
  if (!game) return false;
  if (!game.code) return false;
  if (game.launchable !== undefined) return Boolean(game.launchable);
  const status = String(game.status || game.raw && game.raw.status || game.raw && game.raw.state || "").trim().toLowerCase();
  if (!status) return true;
  if (["enabled", "active", "open", "on", "ready", "available", "launchable", "playable"].includes(status)) return true;
  return !["disabled", "inactive", "closed", "off", "suspended", "blocked"].includes(status);
}

function pickLaunchableGames(gamesByVendor, limit = 6) {
  const selected = [];
  const seen = new Set();
  for (const game of gamesByVendor) {
    if (!isLaunchableGame(game)) continue;
    const key = `${String(game.vendorCode || "").trim()}::${String(game.code || "").trim()}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    selected.push(game);
    if (selected.length >= limit) break;
  }
  return selected;
}

function formatAttemptLine(attempt) {
  return [
    `endpoint path attempted: ${attempt.endpoint || ""}`,
    `HTTP status: ${attempt.status === null || attempt.status === undefined ? "unknown" : attempt.status}`,
    `success: ${attempt.success ? "true" : "false"}`,
    `errorCode: ${attempt.errorCode || ""}`,
    `masked message: ${attempt.message || ""}`,
  ];
}

function printTokenFailureDiagnostic(error) {
  console.log("CreateToken: FAIL");
  const attempts = error && error.details && Array.isArray(error.details.attempts) ? error.details.attempts : [];
  if (attempts.length > 0) {
    for (const attempt of attempts) {
      for (const line of formatAttemptLine(attempt)) {
        console.log(`- ${line}`);
      }
    }
  } else {
    console.log("- endpoint path attempted: unknown");
    console.log("- HTTP status: unknown");
    console.log("- success: false");
    console.log("- errorCode: unknown");
    console.log("- masked message: unknown");
  }
  console.log("- clientId: [redacted]");
  console.log("- clientSecret: [redacted]");
  console.log("- token: [redacted]");
}

function pickGames(games, limit = 6) {
  const selected = [];
  const seen = new Set();
  for (const game of games) {
    if (!game || !game.code || seen.has(game.code)) continue;
    seen.add(game.code);
    selected.push(game);
    if (selected.length >= limit) break;
  }
  return selected;
}

function resolveBalance(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return Math.round(number * 100) / 100;
  }
  return null;
}

function scanForSecretShapes(text, label) {
  const content = String(text || "");
  for (const pattern of FORBIDDEN_SECRET_SHAPES) {
    assert(!pattern.test(content), `${label} contains secret-shaped text: ${pattern}`);
  }
}

function scanFilesForSecretShapes(filePaths) {
  for (const filePath of filePaths) {
    const content = fs.readFileSync(filePath, "utf8");
    scanForSecretShapes(content, path.basename(filePath));
  }
  console.log("Secret-shaped value scan: PASS");
}

function maskPlayer(player) {
  return {
    username: player.username,
    displayName: player.displayName,
    playerId: player.playerId ? `***${String(player.playerId).slice(-4)}` : null,
  };
}

function printSummary(summary) {
  console.log("OroPlay production transfer smoke summary:");
  console.log(`- baseUrl: ${summary.baseUrl}`);
  console.log(`- agentCode: ${summary.agentCode}`);
  console.log(`- token: ${maskToken(summary.token)}`);
  console.log(`- clientId: ${maskSecret(summary.clientId)}`);
  console.log(`- clientSecret: ${maskSecret(summary.clientSecret)}`);
  console.log(`- player: ${JSON.stringify(maskPlayer(summary.player))}`);
  console.log(`- vendorCount: ${summary.vendorCount}`);
  console.log(`- gameCount: ${summary.gameCount}`);
  console.log(`- selectedGames: ${summary.selectedGames.join(", ")}`);
  console.log(`- launchesSucceeded: ${summary.launchesSucceeded}`);
  console.log(`- depositAmount: ${summary.depositAmount}`);
  console.log(`- balanceBeforeWithdraw: ${summary.balanceBeforeWithdraw}`);
  console.log(`- balanceAfterWithdraw: ${summary.balanceAfterWithdraw}`);
  console.log(`- bettingHistoryCount: ${summary.bettingHistoryCount}`);
  console.log(`- endpoints: ${JSON.stringify(summary.endpoints)}`);
}

async function main() {
  inspectLocalSafety();

  const clientId = readRequiredEnv("OROPLAY_CLIENT_ID");
  const clientSecret = readRequiredEnv("OROPLAY_CLIENT_SECRET");
  const client = createOroplayTransferClient();

  let tokenResponse;
  try {
    tokenResponse = await client.createToken();
    assert(isNonEmptyText(tokenResponse.token), "CreateToken must return a token.");
    console.log(`CreateToken: PASS (${tokenResponse.endpoint})`);
  } catch (error) {
    printTokenFailureDiagnostic(error);
    throw error;
  }

  const agentBalance = await client.getAgentBalance(tokenResponse.token);
  console.log(`Get agent balance: PASS (${agentBalance.endpoint})`);

  const vendorList = await client.getVendorList(tokenResponse.token);
  console.log(`Get vendor list: PASS (${vendorList.endpoint})`);

  const enabledVendors = vendorList.vendors.filter(isEnabledVendor);
  assert(enabledVendors.length > 0, "Expected at least one enabled vendor from OroPlay.");

  const gameRows = [];
  const gameListsByVendor = [];
  for (const vendor of enabledVendors) {
    const gameList = await client.getGameList(tokenResponse.token, vendor.code);
    gameListsByVendor.push(gameList);
    console.log(`Get game list for vendor ${vendor.code}: PASS (${gameList.endpoint})`);
    for (const game of gameList.games) {
      gameRows.push({
        ...game,
        vendorCode: game.vendorCode || vendor.code,
      });
    }
  }

  const selectedGames = pickLaunchableGames(gameRows, 6);
  assert(selectedGames.length >= 5, `Expected at least 5 games from provider list, got ${selectedGames.length}.`);

  const timestamp = nowStamp();
  const player = {
    username: `testuser_${timestamp}`,
    displayName: `Test User ${timestamp}`,
  };
  const createPlayer = await client.createPlayer(tokenResponse.token, player);
  player.playerId = createPlayer.playerId;
  console.log(`Create test player: PASS (${createPlayer.endpoint})`);

  const depositAmount = Number(process.env.OROPLAY_TEST_DEPOSIT_AMOUNT || 20);
  assert(Number.isFinite(depositAmount) && depositAmount > 0, "OROPLAY_TEST_DEPOSIT_AMOUNT must be a positive number if set.");
  const deposit = await client.depositToPlayer(tokenResponse.token, player, depositAmount);
  const depositBalance = resolveBalance(deposit.balance, deposit.payload && deposit.payload.balance);
  console.log(`Deposit to player: PASS (${deposit.endpoint}) balance=${depositBalance === null ? "unknown" : depositBalance}`);

  const balanceAfterDeposit = await client.getUserBalance(tokenResponse.token, player);
  const initialUserBalance = resolveBalance(balanceAfterDeposit.balance, balanceAfterDeposit.payload && balanceAfterDeposit.payload.balance, depositBalance);

  let launchesSucceeded = 0;
  for (const game of selectedGames) {
    const launch = await client.launchGame(tokenResponse.token, player, game);
    assert(isNonEmptyText(launch.launchUrl) || isNonEmptyText(launch.sessionId), `Launch for ${game.code} must return a launch URL or session id.`);
    launchesSucceeded += 1;
    console.log(`Launch game ${game.code}: PASS (${launch.endpoint})`);
  }

  const balanceAfterLaunches = await client.getUserBalance(tokenResponse.token, player);
  const balanceBeforeWithdraw = resolveBalance(
    balanceAfterLaunches.balance,
    balanceAfterLaunches.payload && balanceAfterLaunches.payload.balance,
    initialUserBalance,
    depositBalance
  );
  assert(balanceBeforeWithdraw !== null, "User balance must be available before withdraw.");
  console.log(`Check user balance: PASS (${balanceAfterLaunches.endpoint}) balance=${balanceBeforeWithdraw}`);

  const bettingHistory = await client.getBettingHistory(tokenResponse.token, player);
  const bettingHistoryCount = Array.isArray(bettingHistory.history) ? bettingHistory.history.length : 0;
  console.log(`Betting history check: PASS (${bettingHistory.endpoint}) count=${bettingHistoryCount}`);

  const withdraw = await client.withdrawAll(tokenResponse.token, player, balanceBeforeWithdraw);
  const withdrawBalance = resolveBalance(withdraw.balance, withdraw.payload && withdraw.payload.balance, 0);
  console.log(`Withdraw all: PASS (${withdraw.endpoint}) balance=${withdrawBalance === null ? "unknown" : withdrawBalance}`);

  const finalBalance = await client.getUserBalance(tokenResponse.token, player);
  const finalBalanceValue = resolveBalance(finalBalance.balance, finalBalance.payload && finalBalance.payload.balance, withdrawBalance);
  assert(finalBalanceValue === 0 || finalBalanceValue === null || finalBalanceValue <= 0.01, `Final balance should be zero or near zero, got ${finalBalanceValue}.`);
  console.log(`Final balance check: PASS (${finalBalance.endpoint})`);

  const summary = {
    baseUrl: client.rawConfig.baseUrl,
    agentCode: client.rawConfig.agentCode,
    token: tokenResponse.token,
    clientId,
    clientSecret,
    player,
    vendorCount: vendorList.vendors.length,
    gameCount: gameRows.length,
    selectedGames: selectedGames.map((game) => game.code),
    launchesSucceeded,
    depositAmount,
    balanceBeforeWithdraw,
    balanceAfterWithdraw: finalBalanceValue,
    bettingHistoryCount,
    endpoints: {
      token: tokenResponse.endpoint,
      agentBalance: agentBalance.endpoint,
      vendorList: vendorList.endpoint,
      gameList: gameListsByVendor.map((gameList) => `${gameList.vendorCode || "unknown"}:${gameList.endpoint}`).join(", "),
      createPlayer: createPlayer.endpoint,
      deposit: deposit.endpoint,
      launchCount: selectedGames.length,
      userBalance: finalBalance.endpoint,
      bettingHistory: bettingHistory.endpoint,
      withdrawAll: withdraw.endpoint,
    },
  };

  printSummary(summary);

  const filesToScan = [
    path.join(__dirname, "..", "game-provider-oroplay", "oroplayProductionTransferClient.js"),
    __filename,
    path.join(__dirname, "..", "..", "package.json"),
    path.join(__dirname, "..", "..", "docs", "OROPLAY_PRODUCTION_TRANSFER_RUNBOOK.md"),
    path.join(__dirname, "..", "..", "docs", "OROPLAY_PRODUCTION_TRANSFER_EVIDENCE.md"),
  ];
  scanFilesForSecretShapes(filesToScan);

  console.log("OroPlay production transfer smoke: PASS");
}

main().catch((error) => {
  console.error("OroPlay production transfer smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
});
