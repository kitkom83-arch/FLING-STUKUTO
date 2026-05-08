const express = require("express");
const auth = require("../middleware/auth");
const withdrawController = require("../controllers/withdraw.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post("/withdrawals", auth, asyncHandler(withdrawController.create));
router.get("/withdrawals", auth, asyncHandler(withdrawController.listMine));

module.exports = router;
