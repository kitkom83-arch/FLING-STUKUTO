const express = require("express");
const auth = require("../middleware/auth");
const gameController = require("../controllers/game.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/game/providers", auth, asyncHandler(gameController.providers));
router.get("/game/providers/:provider/games", auth, asyncHandler(gameController.games));
router.post("/game/launch/mock", auth, asyncHandler(gameController.launchMock));
router.post("/game/transfer-in/mock", auth, asyncHandler(gameController.transferInMock));
router.post("/game/transfer-out/mock", auth, asyncHandler(gameController.transferOutMock));
router.get("/game/bet-history/mock", auth, asyncHandler(gameController.betHistoryMock));

module.exports = router;
