const express = require("express");
const wheelMemberAuth = require("../middleware/wheelMemberAuth");
const wheelController = require("../controllers/wheel.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/member/wheel/config", wheelMemberAuth, asyncHandler(wheelController.memberConfig));
router.post("/member/wheel/spin", wheelMemberAuth, asyncHandler(wheelController.spin));
router.get("/member/wheel/history", wheelMemberAuth, asyncHandler(wheelController.history));
router.get("/member/wheel/my-rewards", wheelMemberAuth, asyncHandler(wheelController.myRewards));

module.exports = router;
