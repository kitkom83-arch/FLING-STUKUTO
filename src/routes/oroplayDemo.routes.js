const express = require("express");
const controller = require("../controllers/oroplayDemo.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/vendors", asyncHandler(controller.listVendors));
router.get("/vendors/:vendorCode/games", asyncHandler(controller.listGames));
router.post("/session", asyncHandler(controller.createSession));
router.post("/session/:sessionId/deposit", asyncHandler(controller.depositSession));
router.post("/session/:sessionId/launch", asyncHandler(controller.launchSession));

module.exports = router;
