const crypto = require("crypto");

const SUPPORTED_REWARD_TYPES = new Set(["coupon", "box", "diamond", "pending_reward"]);
const SECRET_KEY_PATTERN = /(password|token|secret|authorization|clientSecret|client_secret|apiKey|api_key)/i;
const SECRET_VALUE_PATTERN =
  /(Bearer\s+[^\s]+|postgres(?:ql)?:\/\/[^\s]+|sk-[A-Za-z0-9_-]{12,}|[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})/i;

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function error(message, statusCode = 400, details = {}) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.details = details;
  return err;
}

function sanitize(value) {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SECRET_KEY_PATTERN.test(key))
        .map(([key, item]) => [key, sanitize(item)])
    );
  }
  if (typeof value === "string" && SECRET_VALUE_PATTERN.test(value)) return "[redacted]";
  return value;
}

function normalizeRewardType(value) {
  const type = String(value || "").trim().toLowerCase();
  if (SUPPORTED_REWARD_TYPES.has(type)) return type;
  if (type === "cash_credit") {
    throw error("cash_credit reward requires an explicit guarded ledger implementation before use", 422, {
      rewardType: "cash_credit",
      cashWalletMutation: false,
    });
  }
  throw error("Unsupported reward type", 400, { supportedTypes: [...SUPPORTED_REWARD_TYPES] });
}

function normalizeAmount(value) {
  const amount = Number(value === undefined || value === null || value === "" ? 0 : value);
  if (!Number.isFinite(amount) || amount < 0) throw error("reward amount must be a non-negative number", 400);
  return Number(amount.toFixed(2));
}

function normalizeRewardInput({ siteId, memberId, type, amount = 0, label = "Reward", source, sourceId, reference = null, metadata = {} }) {
  if (!siteId || !memberId) throw error("siteId and memberId are required", 400);
  const rewardType = normalizeRewardType(type);
  const safeSource = String(source || "manual_admin").trim() || "manual_admin";
  const safeSourceId = String(sourceId || createId("source")).trim();
  return {
    id: createId("reward"),
    siteId,
    memberId,
    type: rewardType,
    amount: normalizeAmount(amount),
    label: String(label || rewardType).slice(0, 120),
    status: rewardType === "pending_reward" ? "pending" : "available",
    source: safeSource,
    sourceId: safeSourceId,
    reference: sanitize(reference),
    metadata: sanitize(metadata),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

function publicReward(row) {
  return sanitize({
    id: row.id,
    siteId: row.siteId,
    memberId: row.memberId,
    type: row.type,
    amount: row.amount,
    label: row.label,
    status: row.status,
    source: row.source,
    sourceId: row.sourceId,
    reference: row.reference,
    metadata: row.metadata,
    cashWalletMutation: false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function createMemoryStore() {
  const rewards = [];
  return {
    async addReward(input) {
      const row = normalizeRewardInput(input);
      const duplicate = rewards.find(
        (item) => item.siteId === row.siteId && item.source === row.source && item.sourceId === row.sourceId
      );
      if (duplicate) return publicReward(duplicate);
      rewards.push(row);
      return publicReward(row);
    },

    async listRewards({ siteId, memberId, query = {} }) {
      const type = query.type ? String(query.type).toLowerCase() : null;
      const status = query.status ? String(query.status).toLowerCase() : null;
      const rows = rewards.filter((row) => {
        if (row.siteId !== siteId || row.memberId !== memberId) return false;
        if (type && row.type !== type) return false;
        if (status && row.status !== status) return false;
        return true;
      });
      return { rewards: rows.map(publicReward) };
    },

    async history({ siteId, memberId, query = {} }) {
      const limit = Math.min(Math.max(Number(query.limit || 50), 1), 100);
      const rows = rewards
        .filter((row) => row.siteId === siteId && row.memberId === memberId)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, limit);
      return { history: rows.map(publicReward) };
    },

    async summary({ siteId, memberId }) {
      const rows = rewards.filter((row) => row.siteId === siteId && row.memberId === memberId);
      return summarizeRows(rows);
    },

    resetForSmoke() {
      rewards.splice(0, rewards.length);
    },
  };
}

function summarizeRows(rows) {
  const coupons = rows.filter((row) => row.type === "coupon" && row.status === "available");
  const boxes = rows.filter((row) => row.type === "box" && row.status === "available");
  const pending = rows.filter((row) => row.type === "pending_reward" && row.status === "pending");
  const diamondBalance = rows
    .filter((row) => row.type === "diamond" && row.status === "available")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return sanitize({
    couponCount: coupons.length,
    boxCount: boxes.length,
    diamondBalance: Number(diamondBalance.toFixed(2)),
    pendingRewardCount: pending.length,
    cashWalletMutation: false,
    supportedTypes: [...SUPPORTED_REWARD_TYPES],
  });
}

let store = createMemoryStore();

async function addReward(input) {
  return store.addReward(input);
}

async function listRewards(input) {
  return store.listRewards(input);
}

async function history(input) {
  return store.history(input);
}

async function summary(input) {
  return store.summary(input);
}

function configureStoreForSmoke(nextStore) {
  store = nextStore || createMemoryStore();
}

function resetForSmoke() {
  if (store && typeof store.resetForSmoke === "function") store.resetForSmoke();
}

module.exports = {
  SUPPORTED_REWARD_TYPES,
  addReward,
  listRewards,
  history,
  summary,
  sanitize,
  normalizeRewardInput,
  publicReward,
  summarizeRows,
  configureStoreForSmoke,
  createMemoryStore,
  resetForSmoke,
};
