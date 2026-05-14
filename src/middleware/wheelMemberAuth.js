const auth = require("./auth");
const env = require("../config/env");
const prisma = require("../config/prisma");
const { fail } = require("../utils/response");

const DEMO_MEMBER_HEADER = "x-demo-member-id";
const DEMO_MEMBER_ID = "demo_member";
const DEMO_MEMBER_POINTS = "360.00";
const DEMO_MEMBER_BALANCE = "180.00";
const DISABLED_PASSWORD_HASH = "local-wheel-demo-login-disabled";
const MEMBER_SESSION_MESSAGE = "Member session unavailable. Please sign in again.";
const SAFE_NODE_ENVS = new Set(["development-local", "test"]);
const PRODUCTION_ENVS = new Set(["prod", "production", "live"]);

function normalized(value) {
  return String(value || "").trim().toLowerCase();
}

function externalModesAreMock() {
  return [
    env.gameProvider.mode,
    env.paymentProvider.mode,
    env.bankStatement.mode,
    env.smsProvider.mode,
    env.slipOcr.mode,
  ].every((mode) => normalized(mode || "mock") === "mock");
}

function localDemoMemberAllowed() {
  const nodeEnv = normalized(env.nodeEnv);
  const appEnv = normalized(env.appEnv);
  if (PRODUCTION_ENVS.has(nodeEnv) || PRODUCTION_ENVS.has(appEnv)) return false;
  return SAFE_NODE_ENVS.has(nodeEnv) && appEnv === "local-test" && externalModesAreMock();
}

function hasBearerAuth(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = String(header).split(" ");
  return scheme === "Bearer" && Boolean(token);
}

function requestedDemoMember(req) {
  return normalized(req.headers[DEMO_MEMBER_HEADER]) === DEMO_MEMBER_ID;
}

async function ensureDemoMember(siteId) {
  const demoPhone = `wheel-demo-${siteId}`;
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { siteId_username: { siteId, username: DEMO_MEMBER_ID } },
      update: {
        phone: demoPhone,
        passwordHash: DISABLED_PASSWORD_HASH,
        status: "active",
        points: DEMO_MEMBER_POINTS,
        referralSource: "local-wheel-demo",
        acceptBonus: false,
        acceptTerms: true,
      },
      create: {
        siteId,
        phone: demoPhone,
        username: DEMO_MEMBER_ID,
        passwordHash: DISABLED_PASSWORD_HASH,
        referralSource: "local-wheel-demo",
        acceptBonus: false,
        acceptTerms: true,
        status: "active",
        points: DEMO_MEMBER_POINTS,
      },
    });

    await tx.walletAccount.upsert({
      where: { userId: user.id },
      update: {
        siteId,
        balance: DEMO_MEMBER_BALANCE,
        currency: "THB",
      },
      create: {
        siteId,
        userId: user.id,
        balance: DEMO_MEMBER_BALANCE,
        currency: "THB",
      },
    });

    return user;
  });
}

async function wheelMemberAuth(req, res, next) {
  try {
    if (requestedDemoMember(req) && localDemoMemberAllowed()) {
      req.user = await ensureDemoMember(req.siteId);
      req.demoMember = { id: DEMO_MEMBER_ID, localOnly: true };
      return next();
    }

    if (hasBearerAuth(req)) {
      return auth(req, res, next);
    }

    return fail(res, MEMBER_SESSION_MESSAGE, 401);
  } catch (error) {
    return next(error);
  }
}

module.exports = wheelMemberAuth;
