const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const { siteAccess } = require("../middleware/siteAccess");
const { requirePermission } = require("../middleware/adminPermission");
const adminController = require("../controllers/admin.controller");
const adminPermissionController = require("../controllers/adminPermission.controller");
const adminSiteController = require("../controllers/adminSite.controller");
const bankAccountController = require("../controllers/bankAccount.controller");
const bankMockController = require("../controllers/bankMock.controller");
const depositController = require("../controllers/deposit.controller");
const withdrawController = require("../controllers/withdraw.controller");
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

router.post("/auth/login", asyncHandler(adminController.login));
router.get("/me", protectedSite, asyncHandler(adminController.me));
router.get("/permissions/me", protectedSite, asyncHandler(adminPermissionController.me));
router.get("/permissions", protectedSite, can("admin.manage"), asyncHandler(adminPermissionController.listPermissions));
router.get("/roles", protectedSite, can("admin.manage"), asyncHandler(adminPermissionController.listRoles));
router.get("/admins/:id/permissions", protectedSite, can("admin.manage"), asyncHandler(adminPermissionController.getAdmin));
router.patch("/admins/:id/role", protectedSite, can("admin.manage"), asyncHandler(adminPermissionController.assignAdminRole));
router.get(
  "/admins/:id/work-schedule",
  protectedSite,
  canAny(["admin.schedule.view", "admin.manage"]),
  asyncHandler(adminPermissionController.getWorkSchedule)
);
router.patch(
  "/admins/:id/work-schedule",
  protectedSite,
  canAny(["admin.schedule.update", "admin.manage"]),
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
router.get("/members/:id", protectedSite, can("members.view"), asyncHandler(adminController.getMember));
router.post("/members/:id/block", protectedSite, can("members.update"), asyncHandler(adminController.blockMember));
router.post("/members/:id/unblock", protectedSite, can("members.update"), asyncHandler(adminController.unblockMember));
router.post("/members/:id/credit/add", protectedSite, can("members.update"), asyncHandler(adminController.addCredit));
router.post("/members/:id/credit/remove", protectedSite, can("members.update"), asyncHandler(adminController.removeCredit));
router.post("/members/:id/points/add", protectedSite, can("members.update"), asyncHandler(adminController.addPoints));
router.post("/members/:id/points/remove", protectedSite, can("members.update"), asyncHandler(adminController.removePoints));

router.get("/bank-accounts/pending", protectedSite, can("bank.view"), asyncHandler(bankAccountController.pending));
router.post("/bank-accounts/:id/approve", protectedSite, can("bank.update"), asyncHandler(bankAccountController.approve));
router.post("/bank-accounts/:id/reject", protectedSite, can("bank.update"), asyncHandler(bankAccountController.reject));
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

module.exports = router;
