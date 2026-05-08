const express = require("express");
const auth = require("../middleware/auth");
const depositController = require("../controllers/deposit.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post("/deposits", auth, asyncHandler(depositController.create));
router.get("/deposits", auth, asyncHandler(depositController.listMine));

module.exports = router;
