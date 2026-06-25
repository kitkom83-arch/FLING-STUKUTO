const express = require("express");
const auth = require("../middleware/auth");
const codeCenterController = require("../controllers/codeCenter.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post("/code-center/redeem", auth, asyncHandler(codeCenterController.redeem));
router.get("/code-center/redeem-logs", auth, asyncHandler(codeCenterController.myRedeemLogs));

module.exports = router;
