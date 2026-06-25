const crypto = require("crypto");
const memberRewardWallet = require("./memberRewardWallet.service");

const ACTIVE_STATUSES = new Set(["active"]);
const CAMPAIGN_STATUSES = new Set(["draft", "active", "inactive"]);
const campaigns = [];
const codes = [];
const redeemLogs = [];

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

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 48);
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw error("Invalid campaign date", 400);
  return date.toISOString();
}

function isExpired(campaign, now = new Date()) {
  return Boolean(campaign.expiresAt && new Date(campaign.expiresAt).getTime() < now.getTime());
}

function hasStarted(campaign, now = new Date()) {
  return !campaign.startsAt || new Date(campaign.startsAt).getTime() <= now.getTime();
}

function publicCampaign(row) {
  return memberRewardWallet.sanitize({
    id: row.id,
    siteId: row.siteId,
    name: row.name,
    status: row.status,
    reward: row.reward,
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    maxRedemptions: row.maxRedemptions,
    perMemberLimit: row.perMemberLimit,
    createdBy: row.createdBy,
    codeCount: codes.filter((code) => code.campaignId === row.id).length,
    redeemedCount: codes.filter((code) => code.campaignId === row.id && code.status === "redeemed").length,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function publicCode(row) {
  return memberRewardWallet.sanitize({
    id: row.id,
    campaignId: row.campaignId,
    code: row.code,
    status: row.status,
    redeemedBy: row.redeemedBy,
    redeemedAt: row.redeemedAt,
    createdAt: row.createdAt,
  });
}

function publicRedeemLog(row) {
  return memberRewardWallet.sanitize(row);
}

function normalizeReward(input = {}) {
  return {
    type: String(input.type || "").trim().toLowerCase(),
    amount: Number(input.amount || 0),
    label: String(input.label || input.type || "Reward").slice(0, 120),
    metadata: memberRewardWallet.sanitize(input.metadata || {}),
  };
}

async function createCampaign({ siteId, siteCode = null, admin = null, body = {} }) {
  const name = String(body.name || "").trim();
  if (!name) throw error("campaign name is required", 400);
  const status = String(body.status || "draft").trim().toLowerCase();
  if (!CAMPAIGN_STATUSES.has(status)) throw error("Invalid campaign status", 400);
  const reward = normalizeReward(body.reward || body);
  if (!memberRewardWallet.SUPPORTED_REWARD_TYPES.has(reward.type)) {
    if (reward.type === "cash_credit") {
      throw error("cash_credit reward requires an explicit guarded ledger implementation before use", 422);
    }
    throw error("Unsupported campaign reward type", 400, { supportedTypes: [...memberRewardWallet.SUPPORTED_REWARD_TYPES] });
  }

  const campaign = {
    id: createId("campaign"),
    siteId,
    siteCode,
    name,
    status,
    reward,
    startsAt: normalizeDate(body.startsAt || body.startAt),
    expiresAt: normalizeDate(body.expiresAt || body.endAt),
    maxRedemptions: Math.max(Number(body.maxRedemptions || body.max_redemptions || 0), 0),
    perMemberLimit: Math.max(Number(body.perMemberLimit || body.per_member_limit || 1), 1),
    createdBy: admin ? { id: admin.id, username: admin.username, role: admin.role } : null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  campaigns.push(campaign);
  return { campaign: publicCampaign(campaign) };
}

async function listCampaigns({ siteId, query = {} }) {
  const status = query.status ? String(query.status).toLowerCase() : null;
  return {
    campaigns: campaigns
      .filter((row) => row.siteId === siteId && (!status || row.status === status))
      .map(publicCampaign),
  };
}

async function generateCodes({ siteId, campaignId, admin = null, body = {} }) {
  const campaign = campaigns.find((row) => row.siteId === siteId && row.id === campaignId);
  if (!campaign) throw error("Campaign not found", 404);
  const count = Math.min(Math.max(Number(body.count || 1), 1), 100);
  const prefix = normalizeCode(body.prefix || campaign.name.slice(0, 4) || "CODE").slice(0, 12) || "CODE";
  const created = [];
  for (let index = 0; index < count; index += 1) {
    let codeValue = "";
    do {
      codeValue = `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    } while (codes.some((row) => row.siteId === siteId && row.code === codeValue));
    const row = {
      id: createId("code"),
      siteId,
      campaignId,
      code: codeValue,
      status: "active",
      createdBy: admin ? { id: admin.id, username: admin.username } : null,
      redeemedBy: null,
      redeemedAt: null,
      createdAt: nowIso(),
    };
    codes.push(row);
    created.push(publicCode(row));
  }
  return { campaign: publicCampaign(campaign), codes: created };
}

function assertRedeemable({ campaign, codeRow, userId }) {
  const now = new Date();
  if (!ACTIVE_STATUSES.has(campaign.status)) throw error("Campaign is not active", 409, { campaignStatus: campaign.status });
  if (!hasStarted(campaign, now)) throw error("Campaign has not started", 409);
  if (isExpired(campaign, now)) throw error("Campaign is expired", 409);
  if (codeRow.status !== "active") throw error("Code is not redeemable", 409, { codeStatus: codeRow.status });
  if (campaign.maxRedemptions > 0) {
    const campaignRedeems = redeemLogs.filter((row) => row.campaignId === campaign.id && row.status === "success").length;
    if (campaignRedeems >= campaign.maxRedemptions) throw error("Campaign redemption limit reached", 409);
  }
  const memberRedeems = redeemLogs.filter(
    (row) => row.campaignId === campaign.id && row.memberId === userId && row.status === "success"
  ).length;
  if (memberRedeems >= campaign.perMemberLimit) throw error("Member redemption limit reached", 409);
}

async function redeemCode({ siteId, userId, body = {} }) {
  const codeValue = normalizeCode(body.code);
  if (!codeValue) throw error("code is required", 400);
  const codeRow = codes.find((row) => row.siteId === siteId && row.code === codeValue);
  if (!codeRow) throw error("Code not found", 404);
  const campaign = campaigns.find((row) => row.siteId === siteId && row.id === codeRow.campaignId);
  if (!campaign) throw error("Campaign not found", 404);

  assertRedeemable({ campaign, codeRow, userId });

  const log = {
    id: createId("redeem"),
    siteId,
    campaignId: campaign.id,
    codeId: codeRow.id,
    code: codeRow.code,
    memberId: userId,
    rewardType: campaign.reward.type,
    rewardAmount: campaign.reward.amount,
    status: "success",
    result: "reward_wallet_created",
    createdAt: nowIso(),
  };
  const reward = await memberRewardWallet.addReward({
    siteId,
    memberId: userId,
    type: campaign.reward.type,
    amount: campaign.reward.amount,
    label: campaign.reward.label,
    source: "code_center",
    sourceId: log.id,
    reference: { campaignId: campaign.id, codeId: codeRow.id, code: codeRow.code },
    metadata: campaign.reward.metadata,
  });
  codeRow.status = "redeemed";
  codeRow.redeemedBy = userId;
  codeRow.redeemedAt = nowIso();
  log.rewardId = reward.id;
  redeemLogs.push(log);
  return {
    redeem: publicRedeemLog(log),
    reward,
    cashWalletMutation: false,
  };
}

async function listRedeemLogs({ siteId, query = {} }) {
  const memberId = query.memberId || query.member_id || null;
  const rows = redeemLogs.filter((row) => row.siteId === siteId && (!memberId || row.memberId === memberId));
  return { redeemLogs: rows.map(publicRedeemLog) };
}

function resetForSmoke() {
  campaigns.splice(0, campaigns.length);
  codes.splice(0, codes.length);
  redeemLogs.splice(0, redeemLogs.length);
  memberRewardWallet.resetForSmoke();
}

module.exports = {
  createCampaign,
  listCampaigns,
  generateCodes,
  redeemCode,
  listRedeemLogs,
  resetForSmoke,
};
