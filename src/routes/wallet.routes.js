const express = require("express");
const auth = require("../middleware/auth");
const walletController = require("../controllers/wallet.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/wallet", auth, asyncHandler(walletController.wallet));
router.get("/wallet/ledger", auth, asyncHandler(walletController.ledger));
router.get("/points", auth, asyncHandler(walletController.points));

module.exports = router;
