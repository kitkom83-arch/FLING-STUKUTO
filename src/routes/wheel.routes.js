const express = require("express");
const auth = require("../middleware/auth");
const wheelController = require("../controllers/wheel.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/member/wheel/config", auth, asyncHandler(wheelController.memberConfig));
router.post("/member/wheel/spin", auth, asyncHandler(wheelController.spin));
router.get("/member/wheel/history", auth, asyncHandler(wheelController.history));
router.get("/member/wheel/my-rewards", auth, asyncHandler(wheelController.myRewards));

module.exports = router;
