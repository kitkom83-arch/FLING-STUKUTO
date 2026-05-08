const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { success } = require("../utils/response");
const { hashPassword, verifyPassword } = require("../utils/password");
const { ensureWallet, getWalletSummary } = require("../services/wallet.service");
const { publicUser } = require("../services/member.service");

const registerSchema = z.object({
  phone: z.string().min(6),
  username: z.string().optional().nullable(),
  password: z.string().min(6),
  bank_code: z.string().min(1),
  bank_account_number: z.string().min(1),
  bank_account_name: z.string().min(1),
  referral_source: z.string().optional().nullable(),
  accept_bonus: z.boolean().default(false),
  accept_terms: z.literal(true),
});

const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

function signMemberToken(user) {
  return jwt.sign(
    { sub: user.id, type: "member", phone: user.phone, siteId: user.siteId, siteCode: user.site && user.site.code },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        phone: data.phone,
        siteId: req.siteId,
        username: data.username || null,
        passwordHash,
        referralSource: data.referral_source || null,
        acceptBonus: data.accept_bonus,
        acceptTerms: data.accept_terms,
        status: "active",
        bankAccounts: {
          create: {
            bankCode: data.bank_code,
            accountNumber: data.bank_account_number,
            accountName: data.bank_account_name,
            status: "pending",
            siteId: req.siteId,
          },
        },
        walletAccount: {
          create: {
            siteId: req.siteId,
            balance: "0.00",
            currency: "THB",
          },
        },
      },
      include: { bankAccounts: true, walletAccount: true },
    });
    return created;
  });

  return success(
    res,
    {
      token: signMemberToken(user),
      user: publicUser(user),
      wallet: await getWalletSummary(user.id, req.siteId),
    },
    201
  );
}

async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findFirst({
    where: {
      siteId: req.siteId,
      OR: [{ phone: data.phone }, { username: data.phone }],
    },
    include: { site: true },
  });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    const error = new Error("Invalid phone or password");
    error.statusCode = 400;
    throw error;
  }
  if (user.status === "blocked") {
    const error = new Error("User is blocked");
    error.statusCode = 403;
    throw error;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await ensureWallet(user.id, prisma, req.siteId);

  return success(res, {
    token: signMemberToken(user),
    user: publicUser(user),
    wallet: await getWalletSummary(user.id, req.siteId),
  });
}

async function me(req, res) {
  return success(res, {
    user: publicUser(req.user),
    wallet: await getWalletSummary(req.user.id, req.siteId),
  });
}

module.exports = {
  register,
  login,
  me,
};
