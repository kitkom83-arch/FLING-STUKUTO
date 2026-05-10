const { z } = require("zod");
const prisma = require("../config/prisma");
const { success } = require("../utils/response");
const { adminCanAccessSite } = require("../middleware/siteAccess");
const { logAdminAction } = require("../services/adminLog.service");

const settingSchema = z.object({
  lineUrl: z.string().optional().nullable(),
  telegramUrl: z.string().optional().nullable(),
  customerServiceUrl: z.string().optional().nullable(),
  announcement: z.string().optional().nullable(),
  maintenanceMode: z.boolean().optional(),
  metadata: z.any().optional().nullable(),
});

const themeSchema = z.object({
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  layoutMode: z.string().optional(),
  customCss: z.any().optional().nullable(),
});

const siteBankAccountSchema = z.object({
  type: z.string().min(1),
  bankCode: z.string().min(1),
  bankName: z.string().min(1),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  phone: z.string().optional().nullable(),
  status: z.string().optional(),
  isDefault: z.boolean().optional(),
  metadata: z.any().optional().nullable(),
  showOnWebsite: z.boolean().optional(),
  mockBalance: z.union([z.string(), z.number()]).optional().nullable(),
  mockCapital: z.union([z.string(), z.number()]).optional().nullable(),
});

const gameProviderSchema = z.object({
  providerCode: z.string().min(1),
  displayName: z.string().min(1),
  status: z.string().optional(),
  agentCode: z.string().optional().nullable(),
  apiBaseUrl: z.string().optional().nullable(),
  apiKeyEncrypted: z.string().optional().nullable(),
  secretEncrypted: z.string().optional().nullable(),
  callbackPath: z.string().optional().nullable(),
  walletMode: z.string().optional(),
  metadata: z.any().optional().nullable(),
});

const paymentConfigSchema = z.object({
  providerCode: z.string().min(1),
  displayName: z.string().min(1),
  status: z.string().optional(),
  merchantId: z.string().optional().nullable(),
  apiBaseUrl: z.string().optional().nullable(),
  apiKeyEncrypted: z.string().optional().nullable(),
  secretEncrypted: z.string().optional().nullable(),
  callbackPath: z.string().optional().nullable(),
  metadata: z.any().optional().nullable(),
});

function maskSecret(value) {
  return value ? "********" : null;
}

function maskConfig(config) {
  if (!config) return config;
  return {
    ...config,
    apiKeyEncrypted: maskSecret(config.apiKeyEncrypted),
    secretEncrypted: maskSecret(config.secretEncrypted),
  };
}

async function requireSite(req, siteId) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) {
    const error = new Error("Site not found");
    error.statusCode = 404;
    throw error;
  }
  if (!(await adminCanAccessSite(req.admin, siteId))) {
    const error = new Error("You do not have access to this site");
    error.statusCode = 403;
    throw error;
  }
  return site;
}

async function listSites(req, res) {
  if (req.admin.role === "super_admin") {
    return success(
      res,
      await prisma.site.findMany({
        include: { domains: true, theme: true, setting: true },
        orderBy: { code: "asc" },
      })
    );
  }

  const accesses = await prisma.adminSiteAccess.findMany({
    where: { adminId: req.admin.id },
    include: { site: { include: { domains: true, theme: true, setting: true } } },
    orderBy: { site: { code: "asc" } },
  });
  return success(res, accesses.map((access) => siteWithAccess(access.site, access)));
}

function siteWithAccess(site, access) {
  return {
    ...site,
    access: {
      role: access.role,
      permissions: access.permissions,
    },
  };
}

async function getSite(req, res) {
  await requireSite(req, req.params.id);
  const site = await prisma.site.findUnique({
    where: { id: req.params.id },
    include: {
      domains: true,
      setting: true,
      theme: true,
      bankAccounts: true,
      gameProviderConfigs: true,
      paymentConfigs: true,
    },
  });
  return success(res, {
    ...site,
    gameProviderConfigs: site.gameProviderConfigs.map(maskConfig),
    paymentConfigs: site.paymentConfigs.map(maskConfig),
  });
}

async function currentConfig(req, res) {
  req.params.id = req.siteId;
  return getSite(req, res);
}

async function updateSettings(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = settingSchema.parse(req.body);
  const before = await prisma.siteSetting.findUnique({ where: { siteId: site.id } });
  const after = await prisma.siteSetting.upsert({
    where: { siteId: site.id },
    update: data,
    create: { siteId: site.id, ...data },
  });
  await logAdminAction({
    admin: req.admin,
    action: "site.settings.update",
    targetType: "site_setting",
    targetId: after.id,
    before,
    after,
    req,
    siteId: site.id,
  });
  return success(res, after);
}

async function updateTheme(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = themeSchema.parse(req.body);
  const before = await prisma.siteTheme.findUnique({ where: { siteId: site.id } });
  const after = await prisma.siteTheme.upsert({
    where: { siteId: site.id },
    update: data,
    create: { siteId: site.id, ...data },
  });
  await logAdminAction({
    admin: req.admin,
    action: "site.theme.update",
    targetType: "site_theme",
    targetId: after.id,
    before,
    after,
    req,
    siteId: site.id,
  });
  return success(res, after);
}

async function listBankAccounts(req, res) {
  const site = await requireSite(req, req.params.id);
  return success(res, await prisma.siteBankAccount.findMany({ where: { siteId: site.id }, orderBy: { createdAt: "asc" } }));
}

function decimalString(value, fieldName) {
  if (value === undefined || value === null || value === "") return undefined;
  const normalized = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized) || !Number.isFinite(Number(normalized))) {
    const error = new Error(`${fieldName} must be a non-negative decimal string`);
    error.statusCode = 400;
    throw error;
  }
  return Number(normalized).toFixed(2);
}

function normalizeMetadata(metadata) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? { ...metadata } : {};
}

function buildBankAccountData(data, existingMetadata = {}) {
  const { showOnWebsite, mockBalance, mockCapital, metadata, ...modelData } = data;
  const nextMetadata = {
    ...normalizeMetadata(existingMetadata),
    ...normalizeMetadata(metadata),
  };

  if (showOnWebsite !== undefined) nextMetadata.showOnWebsite = showOnWebsite;
  const balance = decimalString(mockBalance, "mockBalance");
  const capital = decimalString(mockCapital, "mockCapital");
  if (balance !== undefined) nextMetadata.mockBalance = balance;
  if (capital !== undefined) nextMetadata.mockCapital = capital;

  if (Object.keys(nextMetadata).length > 0) modelData.metadata = nextMetadata;
  return modelData;
}

async function createBankAccount(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = siteBankAccountSchema.parse(req.body);
  const after = await prisma.siteBankAccount.create({ data: { siteId: site.id, ...buildBankAccountData(data) } });
  await logAdminAction({ admin: req.admin, action: "site.bank_account.create", targetType: "site_bank_account", targetId: after.id, after, req, siteId: site.id });
  return success(res, after, 201);
}

async function updateBankAccount(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = siteBankAccountSchema.partial().parse(req.body);
  const before = await prisma.siteBankAccount.findFirst({ where: { id: req.params.bankAccountId, siteId: site.id } });
  if (!before) throwNotFound("Site bank account not found");
  const after = await prisma.siteBankAccount.update({
    where: { id: before.id },
    data: buildBankAccountData(data, before.metadata),
  });
  await logAdminAction({ admin: req.admin, action: "site.bank_account.update", targetType: "site_bank_account", targetId: after.id, before, after, req, siteId: site.id });
  return success(res, after);
}

async function disableBankAccount(req, res) {
  const site = await requireSite(req, req.params.id);
  const before = await prisma.siteBankAccount.findFirst({ where: { id: req.params.bankAccountId, siteId: site.id } });
  if (!before) throwNotFound("Site bank account not found");
  const after = await prisma.siteBankAccount.update({
    where: { id: before.id },
    data: {
      status: "disabled",
      isDefault: false,
      metadata: {
        ...normalizeMetadata(before.metadata),
        showOnWebsite: false,
        disabledAt: new Date().toISOString(),
        safeDelete: true,
      },
    },
  });
  await logAdminAction({
    admin: req.admin,
    action: "site.bank_account.disable",
    targetType: "site_bank_account",
    targetId: after.id,
    before,
    after,
    req,
    siteId: site.id,
  });
  return success(res, after);
}

async function listGameProviders(req, res) {
  const site = await requireSite(req, req.params.id);
  const rows = await prisma.siteGameProviderConfig.findMany({ where: { siteId: site.id }, orderBy: { providerCode: "asc" } });
  return success(res, rows.map(maskConfig));
}

async function createGameProvider(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = gameProviderSchema.parse(req.body);
  const after = await prisma.siteGameProviderConfig.create({ data: { siteId: site.id, ...data } });
  await logAdminAction({ admin: req.admin, action: "site.game_provider.create", targetType: "site_game_provider_config", targetId: after.id, after: maskConfig(after), req, siteId: site.id });
  return success(res, maskConfig(after), 201);
}

async function updateGameProvider(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = gameProviderSchema.partial().parse(req.body);
  const before = await prisma.siteGameProviderConfig.findFirst({ where: { id: req.params.configId, siteId: site.id } });
  if (!before) throwNotFound("Site game provider config not found");
  const after = await prisma.siteGameProviderConfig.update({ where: { id: before.id }, data });
  await logAdminAction({ admin: req.admin, action: "site.game_provider.update", targetType: "site_game_provider_config", targetId: after.id, before: maskConfig(before), after: maskConfig(after), req, siteId: site.id });
  return success(res, maskConfig(after));
}

async function listPaymentConfigs(req, res) {
  const site = await requireSite(req, req.params.id);
  const rows = await prisma.sitePaymentConfig.findMany({ where: { siteId: site.id }, orderBy: { providerCode: "asc" } });
  return success(res, rows.map(maskConfig));
}

async function createPaymentConfig(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = paymentConfigSchema.parse(req.body);
  const after = await prisma.sitePaymentConfig.create({ data: { siteId: site.id, ...data } });
  await logAdminAction({ admin: req.admin, action: "site.payment_config.create", targetType: "site_payment_config", targetId: after.id, after: maskConfig(after), req, siteId: site.id });
  return success(res, maskConfig(after), 201);
}

async function updatePaymentConfig(req, res) {
  const site = await requireSite(req, req.params.id);
  const data = paymentConfigSchema.partial().parse(req.body);
  const before = await prisma.sitePaymentConfig.findFirst({ where: { id: req.params.configId, siteId: site.id } });
  if (!before) throwNotFound("Site payment config not found");
  const after = await prisma.sitePaymentConfig.update({ where: { id: before.id }, data });
  await logAdminAction({ admin: req.admin, action: "site.payment_config.update", targetType: "site_payment_config", targetId: after.id, before: maskConfig(before), after: maskConfig(after), req, siteId: site.id });
  return success(res, maskConfig(after));
}

function throwNotFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
}

module.exports = {
  listSites,
  getSite,
  currentConfig,
  updateSettings,
  updateTheme,
  listBankAccounts,
  createBankAccount,
  updateBankAccount,
  disableBankAccount,
  listGameProviders,
  createGameProvider,
  updateGameProvider,
  listPaymentConfigs,
  createPaymentConfig,
  updatePaymentConfig,
};
