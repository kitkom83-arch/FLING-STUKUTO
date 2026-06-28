const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const { siteAccess } = require("../middleware/siteAccess");
const { requirePermission } = require("../middleware/adminPermission");
const adminController = require("../controllers/admin.controller");
const adminAuditController = require("../controllers/adminAudit.controller");
const adminPermissionController = require("../controllers/adminPermission.controller");
const adminSiteController = require("../controllers/adminSite.controller");
const bankAccountController = require("../controllers/bankAccount.controller");
const bankMockController = require("../controllers/bankMock.controller");
const depositController = require("../controllers/deposit.controller");
const withdrawController = require("../controllers/withdraw.controller");
const promotionAdminDryRunController = require("../controllers/promotionAdminDryRun.controller");
const wheelController = require("../controllers/wheel.controller");
const codeCenterController = require("../controllers/codeCenter.controller");
const { adminHasPermission } = require("../services/adminPermission.service");
const { asyncHandler } = require("../middleware/errorHandler");
const { fail } = require("../utils/response");

const router = express.Router();
const protectedSite = [adminAuth, siteAccess];
const can = (permission) => requirePermission(permission);
const canForSite = (permission) => requirePermission(permission, { siteIdParam: "id" });
const canAny = (permissions) => async (req, res, next) => {
  try {
    for (const permission of permissions) {
      if (await adminHasPermission(req.admin, req.siteId, permission)) return next();
    }
    return fail(res, "Admin permission denied", 403, { permissions });
  } catch (error) {
    return next(error);
  }
};
const canWheelRewardUpdate = async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const keys = Object.keys(body).filter((key) => key !== "reason");
    const permissions =
      keys.length === 1 && keys[0] === "status"
        ? body.status === "active"
          ? ["wheel.reward.enable", "wheel.rewards.status.update"]
          : ["wheel.reward.disable", "wheel.rewards.status.update"]
        : ["wheel.reward.update", "wheel.rewards.update"];
    for (const permission of permissions) {
      if (await adminHasPermission(req.admin, req.siteId, permission)) return next();
    }
    return fail(res, "Admin permission denied", 403, { permissions });
  } catch (error) {
    return next(error);
  }
};
const canAuditLogs = async (req, res, next) => {
  try {
    if (await adminHasPermission(req.admin, req.siteId, "admin.audit.view")) return next();
    if (await adminHasPermission(req.admin, req.siteId, "wheel.audit.view")) {
      req.auditWheelOnly = true;
      return next();
    }
    return fail(res, "Admin permission denied", 403, { permissions: ["admin.audit.view", "wheel.audit.view"] });
  } catch (error) {
    return next(error);
  }
};

router.get("/me", protectedSite, asyncHandler(adminController.me));
router.get("/permissions/me", protectedSite, asyncHandler(adminPermissionController.me));
router.get("/permissions", protectedSite, canAny(["admin.roles.view", "admin.manage"]), asyncHandler(adminPermissionController.listPermissions));
router.get(
  "/permissions/catalog",
  protectedSite,
  canAny(["admin.roles.view", "admin.security.view", "admin.manage"]),
  asyncHandler(adminPermissionController.listPermissionCatalog)
);
router.get("/roles", protectedSite, canAny(["admin.roles.view", "admin.manage"]), asyncHandler(adminPermissionController.listRoles));
router.get("/roles/:role", protectedSite, canAny(["admin.roles.view", "admin.manage"]), asyncHandler(adminPermissionController.roleDetail));
router.patch(
  "/roles/:role/permissions",
  protectedSite,
  canAny(["admin.roles.update", "admin.manage"]),
  asyncHandler(adminPermissionController.patchRolePermissions)
);
router.get("/admins/:id/permissions", protectedSite, canAny(["admin.roles.view", "admin.manage"]), asyncHandler(adminPermissionController.getAdmin));
router.patch("/admins/:id/role", protectedSite, canAny(["admin.roles.update", "admin.manage"]), asyncHandler(adminPermissionController.assignAdminRole));
router.get(
  "/work-schedules",
  protectedSite,
  canAny(["admin.workSchedule.view", "admin.schedule.view", "admin.manage"]),
  asyncHandler(adminPermissionController.listWorkSchedules)
);
router.get(
  "/work-schedules/:adminId",
  protectedSite,
  canAny(["admin.workSchedule.view", "admin.schedule.view", "admin.manage"]),
  asyncHandler(adminPermissionController.getWorkSchedule)
);
router.patch(
  "/work-schedules/:adminId",
  protectedSite,
  canAny(["admin.workSchedule.update", "admin.schedule.update", "admin.manage"]),
  asyncHandler(adminPermissionController.patchWorkSchedule)
);
router.post(
  "/work-schedules/:adminId/override",
  protectedSite,
  canAny(["admin.schedule.override", "admin.manage"]),
  asyncHandler(adminPermissionController.postWorkScheduleOverride)
);
router.delete(
  "/work-schedules/:adminId/override",
  protectedSite,
  canAny(["admin.schedule.override", "admin.manage"]),
  asyncHandler(adminPermissionController.deleteWorkScheduleOverride)
);
router.get(
  "/work-schedules/:adminId/audit-logs",
  protectedSite,
  canAny(["admin.workSchedule.view", "admin.schedule.view", "admin.manage"]),
  asyncHandler(adminPermissionController.listWorkScheduleAuditLogs)
);
router.get(
  "/admins/:id/work-schedule",
  protectedSite,
  canAny(["admin.workSchedule.view", "admin.schedule.view", "admin.manage"]),
  asyncHandler(adminPermissionController.getWorkSchedule)
);
router.patch(
  "/admins/:id/work-schedule",
  protectedSite,
  canAny(["admin.workSchedule.update", "admin.schedule.update", "admin.manage"]),
  asyncHandler(adminPermissionController.patchWorkSchedule)
);
router.post(
  "/admins/:id/work-schedule/override",
  protectedSite,
  canAny(["admin.schedule.override", "admin.manage"]),
  asyncHandler(adminPermissionController.postWorkScheduleOverride)
);
router.delete(
  "/admins/:id/work-schedule/override",
  protectedSite,
  canAny(["admin.schedule.override", "admin.manage"]),
  asyncHandler(adminPermissionController.deleteWorkScheduleOverride)
);
router.get("/logs", protectedSite, can("reports.view"), asyncHandler(adminController.logs));
router.get("/audit-logs", protectedSite, canAuditLogs, asyncHandler(adminAuditController.auditLogs));
router.get("/audit-logs/summary", protectedSite, canAuditLogs, asyncHandler(adminAuditController.auditLogsSummary));
router.get("/security-events", protectedSite, can("admin.security.view"), asyncHandler(adminAuditController.securityEvents));
router.get(
  "/security-events/summary",
  protectedSite,
  can("admin.security.view"),
  asyncHandler(adminAuditController.securityEventsSummary)
);

router.get("/wheel/config", protectedSite, canAny(["wheel.view", "wheel.campaign.view"]), asyncHandler(wheelController.adminConfig));
router.patch("/wheel/campaign", protectedSite, can("wheel.campaign.update"), asyncHandler(wheelController.updateCampaign));
router.post("/wheel/rewards", protectedSite, canAny(["wheel.reward.create", "wheel.rewards.create"]), asyncHandler(wheelController.createReward));
router.patch("/wheel/rewards/:id", protectedSite, canWheelRewardUpdate, asyncHandler(wheelController.updateReward));
router.get("/wheel/spins", protectedSite, canAny(["wheel.spin.view", "wheel.spins.view"]), asyncHandler(wheelController.adminSpins));
router.get("/wheel/member-rewards", protectedSite, can("wheel.claims.view"), asyncHandler(wheelController.adminMemberRewards));
router.patch(
  "/wheel/member-rewards/:id/status",
  protectedSite,
  can("wheel.claims.status.update"),
  asyncHandler(wheelController.updateMemberRewardStatus)
);

router.get("/sites", protectedSite, can("settings.website.view"), asyncHandler(adminSiteController.listSites));
router.get("/sites/current/config", protectedSite, can("settings.website.view"), asyncHandler(adminSiteController.currentConfig));
router.get("/sites/:id", adminAuth, canForSite("settings.website.view"), asyncHandler(adminSiteController.getSite));
router.post("/sites/:id/settings", adminAuth, canForSite("settings.website.update"), asyncHandler(adminSiteController.updateSettings));
router.post("/sites/:id/theme", adminAuth, canForSite("settings.website.update"), asyncHandler(adminSiteController.updateTheme));
router.get("/sites/:id/bank-accounts", adminAuth, canForSite("bank.view"), asyncHandler(adminSiteController.listBankAccounts));
router.post("/sites/:id/bank-accounts", adminAuth, canForSite("bank.update"), asyncHandler(adminSiteController.createBankAccount));
router.put("/sites/:id/bank-accounts/:bankAccountId", adminAuth, canForSite("bank.update"), asyncHandler(adminSiteController.updateBankAccount));
router.delete("/sites/:id/bank-accounts/:bankAccountId", adminAuth, canForSite("bank.update"), asyncHandler(adminSiteController.disableBankAccount));
router.get("/sites/:id/game-providers", adminAuth, canForSite("settings.website.view"), asyncHandler(adminSiteController.listGameProviders));
router.post("/sites/:id/game-providers", adminAuth, canForSite("settings.website.update"), asyncHandler(adminSiteController.createGameProvider));
router.put("/sites/:id/game-providers/:configId", adminAuth, canForSite("settings.website.update"), asyncHandler(adminSiteController.updateGameProvider));
router.get("/sites/:id/payment-configs", adminAuth, canForSite("settings.website.view"), asyncHandler(adminSiteController.listPaymentConfigs));
router.post("/sites/:id/payment-configs", adminAuth, canForSite("settings.website.update"), asyncHandler(adminSiteController.createPaymentConfig));
router.put("/sites/:id/payment-configs/:configId", adminAuth, canForSite("settings.website.update"), asyncHandler(adminSiteController.updatePaymentConfig));

router.get("/members", protectedSite, can("members.view"), asyncHandler(adminController.listMembers));
router.get("/members/:id/history", protectedSite, can("members.view"), asyncHandler(adminController.getMemberHistory));
router.get("/members/:id", protectedSite, can("members.view"), asyncHandler(adminController.getMember));
router.post("/members/:id/block", protectedSite, can("members.update"), asyncHandler(adminController.blockMember));
router.post("/members/:id/unblock", protectedSite, can("members.update"), asyncHandler(adminController.unblockMember));
router.post("/members/:id/credit/add", protectedSite, can("members.update"), asyncHandler(adminController.addCredit));
router.post("/members/:id/credit/remove", protectedSite, can("members.update"), asyncHandler(adminController.removeCredit));
router.post("/members/:id/points/add", protectedSite, can("members.update"), asyncHandler(adminController.addPoints));
router.post("/members/:id/points/remove", protectedSite, can("members.update"), asyncHandler(adminController.removePoints));

router.get("/bank-accounts/pending", protectedSite, can("members.bank.view"), asyncHandler(bankAccountController.pending));
router.post("/bank-accounts/:id/approve", protectedSite, can("members.bank.approve"), asyncHandler(bankAccountController.approve));
router.post("/bank-accounts/:id/reject", protectedSite, can("members.bank.approve"), asyncHandler(bankAccountController.reject));
router.get("/bank/mock/statements/deposits", protectedSite, can("bank.view"), asyncHandler(bankMockController.listDepositStatements));
router.get("/bank/mock/statements/withdrawals", protectedSite, can("bank.view"), asyncHandler(bankMockController.listWithdrawStatements));
router.post("/slip-ocr/mock/verify", protectedSite, can("bank.view"), asyncHandler(bankMockController.verifySlip));

router.get("/deposits", protectedSite, can("deposits.view"), asyncHandler(depositController.listAdmin));
router.post("/deposits/:id/approve", protectedSite, can("deposits.approve"), asyncHandler(depositController.approve));
router.post("/deposits/:id/reject", protectedSite, can("deposits.approve"), asyncHandler(depositController.reject));

router.get("/withdrawals", protectedSite, can("withdrawals.view"), asyncHandler(withdrawController.listAdmin));
router.post("/withdrawals/:id/approve", protectedSite, can("withdrawals.approve"), asyncHandler(withdrawController.approve));
router.post("/withdrawals/:id/reject", protectedSite, can("withdrawals.approve"), asyncHandler(withdrawController.reject));
router.post("/withdrawals/:id/mark-paid", protectedSite, can("withdrawals.approve"), asyncHandler(withdrawController.markPaid));

router.get("/reports/summary", protectedSite, can("reports.view"), asyncHandler(adminController.reportSummary));
router.get("/reports/deposits", protectedSite, can("reports.view"), asyncHandler(adminController.reportDeposits));
router.get("/reports/withdrawals", protectedSite, can("reports.view"), asyncHandler(adminController.reportWithdrawals));
router.get("/reports/wallet-ledger", protectedSite, can("reports.view"), asyncHandler(adminController.reportWalletLedger));
router.get("/promotions", protectedSite, can("settings.promotion.view"), asyncHandler(adminController.listPromotionConfigs));
router.post("/promotions/:id/dry-run", protectedSite, canAny(["settings.promotion.write", "settings.promotion.manage"]), asyncHandler(promotionAdminDryRunController.promotionAdminDryRun));

router.get("/code-center/campaigns", protectedSite, can("code_center.view"), asyncHandler(codeCenterController.adminListCampaigns));
router.post("/code-center/campaigns", protectedSite, can("code_center.manage"), asyncHandler(codeCenterController.adminCreateCampaign));
router.post("/code-center/campaigns/:id/codes", protectedSite, can("code_center.manage"), asyncHandler(codeCenterController.adminGenerateCodes));
router.get("/code-center/redeem-logs", protectedSite, can("code_center.view"), asyncHandler(codeCenterController.adminRedeemLogs));

module.exports = router;
