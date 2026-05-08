const express = require("express");
const healthController = require("../controllers/health.controller");
const authRoutes = require("./auth.routes");
const memberRoutes = require("./member.routes");
const walletRoutes = require("./wallet.routes");
const bankAccountRoutes = require("./bankAccount.routes");
const depositRoutes = require("./deposit.routes");
const withdrawRoutes = require("./withdraw.routes");
const promotionRoutes = require("./promotion.routes");
const gameRoutes = require("./game.routes");
const adminRoutes = require("./admin.routes");
const siteResolver = require("../middleware/siteResolver");
const siteController = require("../controllers/site.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/health", healthController.health);
router.use(siteResolver);
router.get("/site/config", asyncHandler(siteController.config));
router.use("/auth", authRoutes);
router.use(memberRoutes);
router.use(walletRoutes);
router.use(bankAccountRoutes);
router.use(depositRoutes);
router.use(withdrawRoutes);
router.use(promotionRoutes);
router.use(gameRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
