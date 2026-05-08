const express = require("express");
const auth = require("../middleware/auth");
const promotionController = require("../controllers/promotion.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/promotions", asyncHandler(promotionController.list));
router.post("/promotions/:id/claim", auth, asyncHandler(promotionController.claim));

module.exports = router;
