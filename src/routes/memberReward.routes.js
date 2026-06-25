const express = require("express");
const auth = require("../middleware/auth");
const memberRewardController = require("../controllers/memberReward.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/member/rewards", auth, asyncHandler(memberRewardController.listMine));
router.get("/member/rewards/summary", auth, asyncHandler(memberRewardController.summary));
router.get("/member/rewards/history", auth, asyncHandler(memberRewardController.history));

module.exports = router;
