const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const { siteAccess } = require("../middleware/siteAccess");
const adminController = require("../controllers/admin.controller");
const adminSiteController = require("../controllers/adminSite.controller");
const bankAccountController = require("../controllers/bankAccount.controller");
const bankMockController = require("../controllers/bankMock.controller");
const depositController = require("../controllers/deposit.controller");
const withdrawController = require("../controllers/withdraw.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();
const protectedSite = [adminAuth, siteAccess];

router.post("/auth/login", asyncHandler(adminController.login));
router.get("/me", protectedSite, asyncHandler(adminController.me));
router.get("/logs", protectedSite, asyncHandler(adminController.logs));

router.get("/sites", adminAuth, asyncHandler(adminSiteController.listSites));
router.get("/sites/current/config", protectedSite, asyncHandler(adminSiteController.currentConfig));
router.get("/sites/:id", adminAuth, asyncHandler(adminSiteController.getSite));
router.post("/sites/:id/settings", adminAuth, asyncHandler(adminSiteController.updateSettings));
router.post("/sites/:id/theme", adminAuth, asyncHandler(adminSiteController.updateTheme));
router.get("/sites/:id/bank-accounts", adminAuth, asyncHandler(adminSiteController.listBankAccounts));
router.post("/sites/:id/bank-accounts", adminAuth, asyncHandler(adminSiteController.createBankAccount));
router.put("/sites/:id/bank-accounts/:bankAccountId", adminAuth, asyncHandler(adminSiteController.updateBankAccount));
router.delete("/sites/:id/bank-accounts/:bankAccountId", adminAuth, asyncHandler(adminSiteController.disableBankAccount));
router.get("/sites/:id/game-providers", adminAuth, asyncHandler(adminSiteController.listGameProviders));
router.post("/sites/:id/game-providers", adminAuth, asyncHandler(adminSiteController.createGameProvider));
router.put("/sites/:id/game-providers/:configId", adminAuth, asyncHandler(adminSiteController.updateGameProvider));
router.get("/sites/:id/payment-configs", adminAuth, asyncHandler(adminSiteController.listPaymentConfigs));
router.post("/sites/:id/payment-configs", adminAuth, asyncHandler(adminSiteController.createPaymentConfig));
router.put("/sites/:id/payment-configs/:configId", adminAuth, asyncHandler(adminSiteController.updatePaymentConfig));

router.get("/members", protectedSite, asyncHandler(adminController.listMembers));
router.get("/members/:id", protectedSite, asyncHandler(adminController.getMember));
router.post("/members/:id/block", protectedSite, asyncHandler(adminController.blockMember));
router.post("/members/:id/unblock", protectedSite, asyncHandler(adminController.unblockMember));
router.post("/members/:id/credit/add", protectedSite, asyncHandler(adminController.addCredit));
router.post("/members/:id/credit/remove", protectedSite, asyncHandler(adminController.removeCredit));
router.post("/members/:id/points/add", protectedSite, asyncHandler(adminController.addPoints));
router.post("/members/:id/points/remove", protectedSite, asyncHandler(adminController.removePoints));

router.get("/bank-accounts/pending", protectedSite, asyncHandler(bankAccountController.pending));
router.post("/bank-accounts/:id/approve", protectedSite, asyncHandler(bankAccountController.approve));
router.post("/bank-accounts/:id/reject", protectedSite, asyncHandler(bankAccountController.reject));
router.get("/bank/mock/statements/deposits", protectedSite, asyncHandler(bankMockController.listDepositStatements));
router.get("/bank/mock/statements/withdrawals", protectedSite, asyncHandler(bankMockController.listWithdrawStatements));
router.post("/slip-ocr/mock/verify", protectedSite, asyncHandler(bankMockController.verifySlip));

router.get("/deposits", protectedSite, asyncHandler(depositController.listAdmin));
router.post("/deposits/:id/approve", protectedSite, asyncHandler(depositController.approve));
router.post("/deposits/:id/reject", protectedSite, asyncHandler(depositController.reject));

router.get("/withdrawals", protectedSite, asyncHandler(withdrawController.listAdmin));
router.post("/withdrawals/:id/approve", protectedSite, asyncHandler(withdrawController.approve));
router.post("/withdrawals/:id/reject", protectedSite, asyncHandler(withdrawController.reject));
router.post("/withdrawals/:id/mark-paid", protectedSite, asyncHandler(withdrawController.markPaid));

router.get("/reports/summary", protectedSite, asyncHandler(adminController.reportSummary));
router.get("/reports/deposits", protectedSite, asyncHandler(adminController.reportDeposits));
router.get("/reports/withdrawals", protectedSite, asyncHandler(adminController.reportWithdrawals));
router.get("/reports/wallet-ledger", protectedSite, asyncHandler(adminController.reportWalletLedger));

module.exports = router;
