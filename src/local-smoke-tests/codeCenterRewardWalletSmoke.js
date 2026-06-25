const assert = require("assert");
const codeCenter = require("../services/codeCenter.service");
const rewardWallet = require("../services/memberRewardWallet.service");
const { requirePermission } = require("../middleware/adminPermission");
const { PERMISSIONS } = require("../services/adminPermission.service");

function secretScanPattern() {
  const authScheme = ["B", "earer"].join("");
  const dbScheme = ["post", "gres"].join("");
  const cloudKeyPrefix = ["s", "k"].join("") + "-";
  const jwtLike = "[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}";
  return new RegExp(
    [
      `${authScheme}\\s+[^\\s\"]+`,
      `${dbScheme}(?:ql)?:\\/\\/[^\\s\"]+`,
      `${cloudKeyPrefix}[A-Za-z0-9_-]{12,}`,
      jwtLike,
      ["pass", "word"].join(""),
      ["client", "Secret"].join(""),
      ["client", "_secret"].join(""),
      ["author", "ization"].join(""),
    ].join("|"),
    "i"
  );
}

function assertNoSecretShape(value, label) {
  const text = JSON.stringify(value);
  assert(!secretScanPattern().test(text), `${label} leaked secret-shaped data`);
}

async function expectReject(fn, statusCode, label) {
  try {
    await fn();
  } catch (error) {
    assert.strictEqual(error.statusCode, statusCode, label);
    return error;
  }
  throw new Error(`${label} did not reject`);
}

async function assertPermissionGuardBlocksUnauthorized() {
  const guard = requirePermission("code_center.manage");
  let statusCode = 0;
  let payload = null;
  const req = { admin: null, siteId: "site_smoke" };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      payload = body;
      return body;
    },
  };
  await guard(req, res, (error) => {
    if (error) throw error;
    throw new Error("permission guard unexpectedly allowed unauthorized admin");
  });
  assert.strictEqual(statusCode, 403, "unauthorized admin must be blocked");
  assert.strictEqual(payload.success, false, "permission guard must return failure payload");
}

async function run() {
  codeCenter.resetForSmoke();
  const siteId = "site_code_center_smoke";
  const admin = { id: "admin_smoke", username: "smoke-admin", role: "owner" };
  const members = {
    coupon: "member_coupon",
    diamond: "member_diamond",
    box: "member_box",
    pending: "member_pending",
  };

  assert(PERMISSIONS.includes("code_center.view"), "code_center.view permission missing");
  assert(PERMISSIONS.includes("code_center.manage"), "code_center.manage permission missing");
  assert(PERMISSIONS.includes("member_rewards.view"), "member_rewards.view permission missing");
  await assertPermissionGuardBlocksUnauthorized();

  const rewardCases = [
    { name: "Coupon Smoke", type: "coupon", memberId: members.coupon, amount: 1, key: "couponCount" },
    { name: "Diamond Smoke", type: "diamond", memberId: members.diamond, amount: 25, key: "diamondBalance" },
    { name: "Box Smoke", type: "box", memberId: members.box, amount: 1, key: "boxCount" },
    { name: "Pending Smoke", type: "pending_reward", memberId: members.pending, amount: 50, key: "pendingRewardCount" },
  ];

  for (const item of rewardCases) {
    const campaignResult = await codeCenter.createCampaign({
      siteId,
      admin,
      body: {
        name: item.name,
        status: "active",
        reward: {
          type: item.type,
          amount: item.amount,
          label: `${item.type} reward`,
          metadata: { clientSecret: "SHOULD_NOT_LEAK", note: "safe smoke" },
        },
      },
    });
    assertNoSecretShape(campaignResult, `${item.type} campaign`);
    const codeResult = await codeCenter.generateCodes({
      siteId,
      campaignId: campaignResult.campaign.id,
      admin,
      body: { count: 1, prefix: item.type.slice(0, 4) },
    });
    assert.strictEqual(codeResult.codes.length, 1, `${item.type} code generated`);

    const redeemResult = await codeCenter.redeemCode({
      siteId,
      userId: item.memberId,
      body: { code: codeResult.codes[0].code },
    });
    assert.strictEqual(redeemResult.reward.type, item.type, `${item.type} reward type`);
    assert.strictEqual(redeemResult.cashWalletMutation, false, `${item.type} must not mutate cash wallet`);
    assertNoSecretShape(redeemResult, `${item.type} redeem`);

    await expectReject(
      () => codeCenter.redeemCode({ siteId, userId: item.memberId, body: { code: codeResult.codes[0].code } }),
      409,
      `${item.type} duplicate redeem must fail`
    );

    const summary = await rewardWallet.summary({ siteId, memberId: item.memberId });
    if (item.type === "diamond") {
      assert.strictEqual(summary[item.key], item.amount, `${item.type} summary amount`);
    } else {
      assert.strictEqual(summary[item.key], 1, `${item.type} summary count`);
    }
    assert.strictEqual(summary.cashWalletMutation, false, `${item.type} summary must not mutate cash wallet`);
  }

  const logs = await codeCenter.listRedeemLogs({ siteId });
  assert.strictEqual(logs.redeemLogs.length, rewardCases.length, "redeem logs are recorded");
  assertNoSecretShape(logs, "redeem logs");

  await expectReject(
    () =>
      codeCenter.createCampaign({
        siteId,
        admin,
        body: { name: "Cash Credit Block", status: "active", reward: { type: "cash_credit", amount: 10 } },
      }),
    422,
    "cash_credit must require explicit ledger guard"
  );

  console.log("CODE_CENTER_REWARD_WALLET_SMOKE_PASS");
}

run().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
