const crypto = require("crypto");
const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { toDecimal } = require("../utils/money");
const { pagination } = require("../utils/query");
const { logAdminAction, maskIp, sanitizeAdminLogData } = require("./adminLog.service");

const DEFAULT_CAMPAIGN_ID = "wheel_main";
const DEMO_TICKET_BALANCE = 5;
const SAFE_PROVIDER_MODES = new Set(["mock", "sandbox", "disabled"]);
const SAFE_APP_ENVS = new Set(["development", "development-local", "local-test", "staging", "stage", "test", "testing", "qa", "sandbox"]);
const LIVE_APP_ENVS = new Set(["prod", "production", "live"]);
const CAMPAIGN_STATUSES = new Set(["active", "inactive", "draft"]);
const COST_TYPES = new Set(["point", "ticket", "mock_credit"]);
const REWARD_TYPES = new Set(["credit", "point", "ticket", "item", "no_reward"]);
const REWARD_STATUSES = new Set(["active", "inactive"]);
const FORBIDDEN_SPIN_INPUTS = ["rewardId", "reward_id", "prizeIndex", "prize_index", "probabilityWeight", "probability_weight", "rewardValue", "reward_value"];
const SECRET_VALUE_PATTERNS = [
  /postgres(?:ql)?:\/\/[^\s"']+/i,
  /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
  new RegExp(`${["Be", "arer"].join("")}\\s+[^\\s"']+`, "i"),
];

function assertWheelSafeRuntime() {
  const appEnv = String(env.appEnv || "local-test").trim().toLowerCase();
  const nodeEnv = String(env.nodeEnv || "").trim().toLowerCase();
  const modes = [
    ["GAME_PROVIDER_MODE", env.gameProvider.mode],
    ["PAYMENT_PROVIDER_MODE", env.paymentProvider.mode],
    ["BANK_STATEMENT_MODE", env.bankStatement.mode],
    ["SMS_PROVIDER_MODE", env.smsProvider.mode],
    ["SLIP_OCR_MODE", env.slipOcr.mode],
  ];

  if (LIVE_APP_ENVS.has(appEnv)) {
    const error = new Error("Lucky Wheel is blocked outside staging/mock mode");
    error.statusCode = 403;
    throw error;
  }
  if (nodeEnv === "production" && !["staging", "stage", "test", "testing", "qa", "sandbox"].includes(appEnv)) {
    const error = new Error("Lucky Wheel requires explicit staging/test APP_ENV when NODE_ENV is production");
    error.statusCode = 403;
    throw error;
  }
  if (!SAFE_APP_ENVS.has(appEnv)) {
    const error = new Error("Lucky Wheel requires staging/local/test APP_ENV");
    error.statusCode = 403;
    throw error;
  }
  for (const [key, modeValue] of modes) {
    const mode = String(modeValue || "mock").trim().toLowerCase();
    if (!SAFE_PROVIDER_MODES.has(mode)) {
      const error = new Error(`${key} must be mock, sandbox, or disabled for Lucky Wheel MVP`);
      error.statusCode = 403;
      throw error;
    }
  }
}

function assertNoSecretString(value, label) {
  if (typeof value !== "string") return;
  if (SECRET_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
    const error = new Error(`${label} contains a secret-shaped value`);
    error.statusCode = 400;
    throw error;
  }
}

function assertAllowed(value, allowed, label) {
  if (!allowed.has(value)) {
    const error = new Error(`${label} is invalid`);
    error.statusCode = 400;
    throw error;
  }
}

function normalizeReason(reason) {
  const value = String(reason || "").trim();
  if (!value || value.length > 500) {
    const error = new Error("reason is required and must be 1-500 characters");
    error.statusCode = 400;
    throw error;
  }
  assertNoSecretString(value, "reason");
  return value;
}

function parseNonNegativeDecimal(value, label) {
  const decimal = toDecimal(value);
  if (decimal.lt(0)) {
    const error = new Error(`${label} must be greater than or equal to 0`);
    error.statusCode = 400;
    throw error;
  }
  return decimal;
}

function parseNullableDecimal(value, label) {
  if (value === null || value === undefined || value === "") return null;
  return parseNonNegativeDecimal(value, label);
}

function parseNonNegativeInt(value, label) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    const error = new Error(`${label} must be a non-negative integer`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function parseDateOrNull(value, label) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error(`${label} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function nowInRange(campaign, now = new Date()) {
  if (campaign.startAt && campaign.startAt > now) return false;
  if (campaign.endAt && campaign.endAt < now) return false;
  return true;
}

function startOfUtcDay(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function startOfUtcMonth(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function decimalString(value) {
  if (value instanceof Prisma.Decimal) return value.toFixed(2);
  return toDecimal(value || 0).toFixed(2);
}

function decimalNumber(value) {
  return Number(decimalString(value));
}

function publicReward(reward) {
  return {
    id: reward.id,
    label: reward.label,
    type: reward.rewardType,
    displayValue: reward.displayValue,
    segmentColor: reward.segmentColor,
    imageUrl: reward.imageUrl,
    sortOrder: reward.sortOrder,
  };
}

function spinReward(reward) {
  return {
    label: reward.label,
    type: reward.rewardType,
    amount: decimalNumber(reward.rewardValue),
    displayValue: reward.displayValue,
  };
}

function adminReward(reward) {
  return {
    id: reward.id,
    campaignId: reward.campaignId,
    label: reward.label,
    rewardType: reward.rewardType,
    rewardValue: decimalString(reward.rewardValue),
    displayValue: reward.displayValue,
    probabilityWeight: reward.probabilityWeight,
    stockLimit: reward.stockLimit,
    stockUsed: reward.stockUsed,
    segmentColor: reward.segmentColor,
    imageUrl: reward.imageUrl,
    sortOrder: reward.sortOrder,
    status: reward.status,
    createdAt: reward.createdAt,
    updatedAt: reward.updatedAt,
  };
}

function adminCampaign(campaign) {
  return {
    id: campaign.id,
    siteId: campaign.siteId,
    name: campaign.name,
    status: campaign.status,
    costType: campaign.costType,
    costAmount: decimalString(campaign.costAmount),
    dailySpinLimit: campaign.dailySpinLimit,
    monthlySpinLimit: campaign.monthlySpinLimit,
    startAt: campaign.startAt,
    endAt: campaign.endAt,
    rulesText: campaign.rulesText,
    showHistory: campaign.showHistory,
    maxWheelCredit: campaign.maxWheelCredit ? decimalString(campaign.maxWheelCredit) : null,
    minDepositRequired: campaign.minDepositRequired ? decimalString(campaign.minDepositRequired) : null,
    minTurnoverRequired: campaign.minTurnoverRequired ? decimalString(campaign.minTurnoverRequired) : null,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

function resultSnapshot(reward) {
  return sanitizeAdminLogData({
    rewardId: reward.id,
    label: reward.label,
    rewardType: reward.rewardType,
    rewardValue: decimalString(reward.rewardValue),
    displayValue: reward.displayValue,
    segmentColor: reward.segmentColor,
    sortOrder: reward.sortOrder,
    noRealPayout: true,
    source: "wheel",
  });
}

function userAgentHash(req) {
  const value = req && req.headers ? req.headers["user-agent"] : null;
  if (!value) return null;
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

async function memberBalance(userId, siteId, tx = prisma) {
  const [user, wallet] = await Promise.all([
    tx.user.findFirst({ where: { id: userId, siteId } }),
    tx.walletAccount.findUnique({ where: { userId } }),
  ]);
  if (!user) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }
  return {
    points: decimalNumber(user.points),
    tickets: DEMO_TICKET_BALANCE,
    credit: decimalNumber(wallet ? wallet.balance : 0),
  };
}

async function activeCampaign(siteId, campaignId = DEFAULT_CAMPAIGN_ID, tx = prisma) {
  const campaign = await tx.wheelCampaign.findFirst({
    where: { id: campaignId, siteId },
    include: { rewards: { orderBy: { sortOrder: "asc" } } },
  });
  if (!campaign) {
    const error = new Error("Wheel campaign not found");
    error.statusCode = 404;
    throw error;
  }
  return campaign;
}

async function remainingSpinsToday(memberId, campaign, tx = prisma) {
  if (!campaign.dailySpinLimit) return null;
  const count = await tx.wheelSpin.count({
    where: {
      memberId,
      campaignId: campaign.id,
      createdAt: { gte: startOfUtcDay() },
    },
  });
  return Math.max(campaign.dailySpinLimit - count, 0);
}

async function assertSpinLimits(memberId, campaign, tx = prisma) {
  const todayCount = await tx.wheelSpin.count({
    where: {
      memberId,
      campaignId: campaign.id,
      createdAt: { gte: startOfUtcDay() },
    },
  });
  if (campaign.dailySpinLimit > 0 && todayCount >= campaign.dailySpinLimit) {
    const error = new Error("Daily spin limit reached");
    error.statusCode = 400;
    throw error;
  }
  if (campaign.monthlySpinLimit) {
    const monthCount = await tx.wheelSpin.count({
      where: {
        memberId,
        campaignId: campaign.id,
        createdAt: { gte: startOfUtcMonth() },
      },
    });
    if (monthCount >= campaign.monthlySpinLimit) {
      const error = new Error("Monthly spin limit reached");
      error.statusCode = 400;
      throw error;
    }
  }
}

function chooseReward(activeRewards) {
  const eligibleRewards = activeRewards.filter(
    (reward) =>
      reward.status === "active" &&
      reward.probabilityWeight > 0 &&
      (reward.stockLimit === null || reward.stockUsed < reward.stockLimit)
  );
  const totalWeight = eligibleRewards.reduce((sum, reward) => sum + reward.probabilityWeight, 0);
  if (eligibleRewards.length === 0 || totalWeight <= 0) {
    const error = new Error("No rewards available");
    error.statusCode = 400;
    throw error;
  }
  const roll = crypto.randomInt(0, totalWeight);
  let cursor = 0;
  for (const reward of eligibleRewards) {
    cursor += reward.probabilityWeight;
    if (roll < cursor) return reward;
  }
  return eligibleRewards[eligibleRewards.length - 1];
}

async function assertSpendableBalance(user, campaign, tx) {
  const cost = toDecimal(campaign.costAmount);
  if (cost.lte(0)) return;
  if (campaign.costType === "point") {
    if (toDecimal(user.points).lt(cost)) {
      const error = new Error("Not enough points");
      error.statusCode = 400;
      throw error;
    }
    return;
  }
  if (campaign.costType === "ticket") {
    if (DEMO_TICKET_BALANCE < Number(cost)) {
      const error = new Error("Not enough tickets");
      error.statusCode = 400;
      throw error;
    }
    return;
  }
  if (campaign.costType === "mock_credit") {
    const wallet = await tx.walletAccount.findUnique({ where: { userId: user.id } });
    if (toDecimal(wallet ? wallet.balance : 0).lt(cost)) {
      const error = new Error("Not enough mock credit");
      error.statusCode = 400;
      throw error;
    }
  }
}

async function applySpinCost({ tx, user, campaign, spinId }) {
  const cost = toDecimal(campaign.costAmount);
  if (cost.lte(0) || campaign.costType !== "point") return user;
  const before = toDecimal(user.points);
  const after = before.minus(cost);
  const updated = await tx.user.update({
    where: { id: user.id },
    data: { points: after },
  });
  await tx.pointLedger.create({
    data: {
      siteId: user.siteId,
      userId: user.id,
      before,
      amount: cost.negated(),
      after,
      reason: "Lucky Wheel mock spin cost",
      referenceType: "wheel_spin",
      referenceId: spinId,
      createdByType: "system",
      createdById: null,
    },
  });
  return updated;
}

async function getMemberConfig({ siteId, userId, campaignId = DEFAULT_CAMPAIGN_ID }) {
  assertWheelSafeRuntime();
  const campaign = await activeCampaign(siteId, campaignId);
  const rewards = campaign.rewards.filter((reward) => reward.status === "active").sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    campaignId: campaign.id,
    name: campaign.name,
    status: campaign.status,
    costType: campaign.costType,
    costAmount: decimalNumber(campaign.costAmount),
    dailySpinLimit: campaign.dailySpinLimit,
    remainingSpinsToday: await remainingSpinsToday(userId, campaign),
    memberBalance: await memberBalance(userId, siteId),
    rewards: rewards.map(publicReward),
    rulesText: campaign.rulesText,
    serverTime: new Date(),
    mode: "staging_mock_only",
  };
}

async function spin({ siteId, userId, body, req }) {
  assertWheelSafeRuntime();
  for (const key of FORBIDDEN_SPIN_INPUTS) {
    if (Object.prototype.hasOwnProperty.call(body || {}, key)) {
      const error = new Error("Frontend must not submit reward result fields");
      error.statusCode = 400;
      throw error;
    }
  }

  const campaignId = body && body.campaignId ? String(body.campaignId) : DEFAULT_CAMPAIGN_ID;

  return prisma.$transaction(async (tx) => {
    const campaign = await activeCampaign(siteId, campaignId, tx);
    if (campaign.status !== "active" || !nowInRange(campaign)) {
      const error = new Error("Campaign not active");
      error.statusCode = 400;
      throw error;
    }
    const user = await tx.user.findFirst({ where: { id: userId, siteId } });
    if (!user) {
      const error = new Error("Staging demo member unavailable");
      error.statusCode = 404;
      throw error;
    }
    await assertSpendableBalance(user, campaign, tx);
    await assertSpinLimits(user.id, campaign, tx);

    const activeRewards = campaign.rewards.filter((reward) => reward.status === "active").sort((a, b) => a.sortOrder - b.sortOrder);
    const reward = chooseReward(activeRewards);
    const prizeIndex = Math.max(activeRewards.findIndex((item) => item.id === reward.id), 0);

    if (reward.stockLimit !== null) {
      const updatedStock = await tx.wheelReward.updateMany({
        where: { id: reward.id, stockLimit: { not: null }, stockUsed: { lt: reward.stockLimit } },
        data: { stockUsed: { increment: 1 } },
      });
      if (updatedStock.count !== 1) {
        const error = new Error("Selected reward is no longer available");
        error.statusCode = 409;
        throw error;
      }
    }

    const snapshot = resultSnapshot(reward);
    const spinRow = await tx.wheelSpin.create({
      data: {
        siteId,
        memberId: user.id,
        campaignId: campaign.id,
        rewardId: reward.id,
        prizeIndex,
        spinCostType: campaign.costType,
        spinCostAmount: campaign.costAmount,
        resultSnapshot: snapshot,
        ipAddressMasked: maskIp(req && req.ip),
        userAgentHash: userAgentHash(req),
      },
    });

    await applySpinCost({ tx, user, campaign, spinId: spinRow.id });

    if (reward.rewardType !== "no_reward") {
      await tx.memberReward.create({
        data: {
          siteId,
          memberId: user.id,
          source: "wheel",
          sourceId: spinRow.id,
          rewardType: reward.rewardType,
          rewardValue: reward.rewardValue,
          label: reward.label,
          status: "pending",
        },
      });
    }

    return {
      spinId: spinRow.id,
      rewardId: reward.id,
      prizeIndex,
      reward: spinReward(reward),
      remainingSpinsToday: await remainingSpinsToday(user.id, campaign, tx),
      balanceAfter: await memberBalance(user.id, siteId, tx),
    };
  });
}

async function history({ siteId, userId, query = {} }) {
  assertWheelSafeRuntime();
  const { skip, take } = pagination(query, { limit: 20, maxLimit: 100 });
  const rows = await prisma.wheelSpin.findMany({
    where: { siteId, memberId: userId },
    include: { reward: true, memberReward: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
  return rows.map((row) => ({
    spinId: row.id,
    createdAt: row.createdAt,
    rewardLabel: row.resultSnapshot && row.resultSnapshot.label ? row.resultSnapshot.label : row.reward.label,
    rewardType: row.resultSnapshot && row.resultSnapshot.rewardType ? row.resultSnapshot.rewardType : row.reward.rewardType,
    rewardValue: row.resultSnapshot && row.resultSnapshot.rewardValue ? row.resultSnapshot.rewardValue : decimalString(row.reward.rewardValue),
    displayValue: row.resultSnapshot && row.resultSnapshot.displayValue ? row.resultSnapshot.displayValue : row.reward.displayValue,
    status: row.memberReward ? row.memberReward.status : "no_reward",
    prizeIndex: row.prizeIndex,
  }));
}

async function myRewards({ siteId, userId, query = {} }) {
  assertWheelSafeRuntime();
  const { skip, take } = pagination(query, { limit: 20, maxLimit: 100 });
  const rows = await prisma.memberReward.findMany({
    where: { siteId, memberId: userId, source: "wheel" },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    rewardType: row.rewardType,
    rewardValue: decimalString(row.rewardValue),
    status: row.status,
    createdAt: row.createdAt,
    claimedAt: row.claimedAt,
    expiresAt: row.expiresAt,
  }));
}

async function adminConfig(siteId) {
  assertWheelSafeRuntime();
  const campaign = await activeCampaign(siteId, DEFAULT_CAMPAIGN_ID);
  const [totalSpins, totalRewardsIssued] = await Promise.all([
    prisma.wheelSpin.count({ where: { siteId, campaignId: campaign.id } }),
    prisma.memberReward.count({ where: { siteId, source: "wheel" } }),
  ]);
  const rewards = campaign.rewards.sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    campaign: adminCampaign(campaign),
    rewards: rewards.map(adminReward),
    summary: {
      totalSpins,
      totalRewardsIssued,
      totalStockUsed: rewards.reduce((sum, reward) => sum + reward.stockUsed, 0),
      activeRewardCount: rewards.filter((reward) => reward.status === "active").length,
    },
  };
}

function campaignUpdateData(body) {
  const data = {};
  if (body.status !== undefined) {
    assertAllowed(body.status, CAMPAIGN_STATUSES, "status");
    data.status = body.status;
  }
  if (body.name !== undefined) {
    const name = String(body.name || "").trim();
    if (!name) {
      const error = new Error("name is required");
      error.statusCode = 400;
      throw error;
    }
    assertNoSecretString(name, "name");
    data.name = name;
  }
  if (body.costType !== undefined) {
    assertAllowed(body.costType, COST_TYPES, "costType");
    data.costType = body.costType;
  }
  if (body.costAmount !== undefined) data.costAmount = parseNonNegativeDecimal(body.costAmount, "costAmount");
  if (body.dailySpinLimit !== undefined) data.dailySpinLimit = parseNonNegativeInt(body.dailySpinLimit, "dailySpinLimit");
  if (body.monthlySpinLimit !== undefined) data.monthlySpinLimit = parseNonNegativeInt(body.monthlySpinLimit, "monthlySpinLimit");
  if (body.startAt !== undefined) data.startAt = parseDateOrNull(body.startAt, "startAt");
  if (body.endAt !== undefined) data.endAt = parseDateOrNull(body.endAt, "endAt");
  if (body.rulesText !== undefined) {
    assertNoSecretString(body.rulesText, "rulesText");
    data.rulesText = body.rulesText === null ? null : String(body.rulesText).slice(0, 2000);
  }
  if (body.showHistory !== undefined) data.showHistory = Boolean(body.showHistory);
  if (body.minDepositRequired !== undefined) data.minDepositRequired = parseNullableDecimal(body.minDepositRequired, "minDepositRequired");
  if (body.minTurnoverRequired !== undefined) data.minTurnoverRequired = parseNullableDecimal(body.minTurnoverRequired, "minTurnoverRequired");
  if (data.startAt && data.endAt && data.startAt >= data.endAt) {
    const error = new Error("startAt must be before endAt");
    error.statusCode = 400;
    throw error;
  }
  return data;
}

async function updateCampaign({ siteId, siteCode, admin, body, req }) {
  assertWheelSafeRuntime();
  const reason = normalizeReason(body && body.reason);
  const data = campaignUpdateData(body || {});
  return prisma.$transaction(async (tx) => {
    const before = await activeCampaign(siteId, DEFAULT_CAMPAIGN_ID, tx);
    const mergedStart = data.startAt === undefined ? before.startAt : data.startAt;
    const mergedEnd = data.endAt === undefined ? before.endAt : data.endAt;
    if (mergedStart && mergedEnd && mergedStart >= mergedEnd) {
      const error = new Error("startAt must be before endAt");
      error.statusCode = 400;
      throw error;
    }
    const after = await tx.wheelCampaign.update({
      where: { id: before.id },
      data,
      include: { rewards: { orderBy: { sortOrder: "asc" } } },
    });
    await logAdminAction({
      tx,
      admin,
      action: "wheel.campaign.update",
      targetType: "wheel_campaign",
      targetId: before.id,
      before: adminCampaign(before),
      after: adminCampaign(after),
      metadata: {
        reason,
        targetCampaignId: before.id,
        actor: { id: admin.id, username: admin.username, role: admin.role },
        siteCode,
      },
      req,
      siteId,
    });
    return adminCampaign(after);
  });
}

function rewardData(body, { partial = false } = {}) {
  const data = {};
  if (!partial || body.label !== undefined) {
    const label = String(body.label || "").trim();
    if (!label) {
      const error = new Error("label is required");
      error.statusCode = 400;
      throw error;
    }
    assertNoSecretString(label, "label");
    data.label = label;
  }
  if (!partial || body.rewardType !== undefined) {
    assertAllowed(body.rewardType, REWARD_TYPES, "rewardType");
    data.rewardType = body.rewardType;
  }
  if (!partial || body.rewardValue !== undefined) data.rewardValue = parseNonNegativeDecimal(body.rewardValue, "rewardValue");
  if (!partial || body.displayValue !== undefined) {
    const displayValue = String(body.displayValue || "").trim();
    if (!displayValue) {
      const error = new Error("displayValue is required");
      error.statusCode = 400;
      throw error;
    }
    assertNoSecretString(displayValue, "displayValue");
    data.displayValue = displayValue;
  }
  if (!partial || body.probabilityWeight !== undefined) {
    data.probabilityWeight = parseNonNegativeInt(body.probabilityWeight, "probabilityWeight");
  }
  if (!partial || body.stockLimit !== undefined) data.stockLimit = parseNonNegativeInt(body.stockLimit, "stockLimit");
  if (!partial || body.segmentColor !== undefined) {
    const segmentColor = String(body.segmentColor || "").trim();
    if (!segmentColor) {
      const error = new Error("segmentColor is required");
      error.statusCode = 400;
      throw error;
    }
    data.segmentColor = segmentColor;
  }
  if (body.imageUrl !== undefined) {
    assertNoSecretString(body.imageUrl, "imageUrl");
    data.imageUrl = body.imageUrl === null || body.imageUrl === "" ? null : String(body.imageUrl);
  }
  if (!partial || body.sortOrder !== undefined) {
    const sortOrder = parseNonNegativeInt(body.sortOrder, "sortOrder");
    if (sortOrder === 0) {
      const error = new Error("sortOrder must be at least 1");
      error.statusCode = 400;
      throw error;
    }
    data.sortOrder = sortOrder;
  }
  if (!partial || body.status !== undefined) {
    assertAllowed(body.status || "active", REWARD_STATUSES, "status");
    data.status = body.status || "active";
  }
  return data;
}

async function createReward({ siteId, siteCode, admin, body, req }) {
  assertWheelSafeRuntime();
  const reason = normalizeReason(body && body.reason);
  const data = rewardData(body || {});
  return prisma.$transaction(async (tx) => {
    const campaign = await activeCampaign(siteId, DEFAULT_CAMPAIGN_ID, tx);
    const created = await tx.wheelReward.create({
      data: {
        id: body.id ? String(body.id).trim() : `wheel_reward_${Date.now()}_${crypto.randomInt(1000, 9999)}`,
        campaignId: campaign.id,
        ...data,
      },
    });
    await logAdminAction({
      tx,
      admin,
      action: "wheel.reward.create",
      targetType: "wheel_reward",
      targetId: created.id,
      after: adminReward(created),
      metadata: {
        reason,
        targetRewardId: created.id,
        targetCampaignId: campaign.id,
        actor: { id: admin.id, username: admin.username, role: admin.role },
        siteCode,
      },
      req,
      siteId,
    });
    return adminReward(created);
  });
}

async function updateReward({ siteId, siteCode, admin, rewardId, body, req }) {
  assertWheelSafeRuntime();
  const reason = normalizeReason(body && body.reason);
  const data = rewardData(body || {}, { partial: true });
  delete data.stockUsed;
  return prisma.$transaction(async (tx) => {
    const before = await tx.wheelReward.findFirst({
      where: { id: rewardId, campaign: { siteId } },
    });
    if (!before) {
      const error = new Error("Wheel reward not found");
      error.statusCode = 404;
      throw error;
    }
    if (data.stockLimit !== undefined && data.stockLimit !== null && data.stockLimit < before.stockUsed) {
      const error = new Error("stockLimit cannot be lower than stockUsed");
      error.statusCode = 400;
      throw error;
    }
    const after = await tx.wheelReward.update({ where: { id: before.id }, data });
    await logAdminAction({
      tx,
      admin,
      action: "wheel.reward.update",
      targetType: "wheel_reward",
      targetId: before.id,
      before: adminReward(before),
      after: adminReward(after),
      metadata: {
        reason,
        targetRewardId: before.id,
        targetCampaignId: before.campaignId,
        actor: { id: admin.id, username: admin.username, role: admin.role },
        siteCode,
      },
      req,
      siteId,
    });
    return adminReward(after);
  });
}

async function listAdminSpins({ siteId, query = {} }) {
  assertWheelSafeRuntime();
  const { skip, take } = pagination(query, { limit: 50, maxLimit: 100 });
  const where = { siteId };
  if (query.campaignId) where.campaignId = String(query.campaignId);
  if (query.memberId) where.memberId = String(query.memberId);
  if (query.rewardType) where.reward = { rewardType: String(query.rewardType) };
  if (query.username) {
    where.member = { username: { contains: String(query.username), mode: "insensitive" } };
  }
  const dateFrom = parseDateOrNull(query.dateFrom || query.date_from, "dateFrom");
  const dateTo = parseDateOrNull(query.dateTo || query.date_to, "dateTo");
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const rows = await prisma.wheelSpin.findMany({
    where,
    include: {
      campaign: { select: { id: true, name: true } },
      reward: true,
      member: { select: { id: true, username: true, phone: true } },
      memberReward: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  return rows.map((row) => ({
    id: row.id,
    time: row.createdAt,
    member: {
      id: row.member.id,
      username: row.member.username,
      phone: row.member.phone,
    },
    campaign: row.campaign,
    reward: {
      id: row.reward.id,
      label: row.reward.label,
      rewardType: row.reward.rewardType,
      rewardValue: decimalString(row.reward.rewardValue),
      displayValue: row.reward.displayValue,
      status: row.memberReward ? row.memberReward.status : "no_reward",
    },
    cost: {
      type: row.spinCostType,
      amount: decimalString(row.spinCostAmount),
    },
    prizeIndex: row.prizeIndex,
    ipAddressMasked: row.ipAddressMasked,
    result: row.resultSnapshot,
  }));
}

module.exports = {
  DEFAULT_CAMPAIGN_ID,
  assertWheelSafeRuntime,
  getMemberConfig,
  spin,
  history,
  myRewards,
  adminConfig,
  updateCampaign,
  createReward,
  updateReward,
  listAdminSpins,
};
