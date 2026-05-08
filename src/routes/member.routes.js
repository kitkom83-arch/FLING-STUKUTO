const express = require("express");
const auth = require("../middleware/auth");
const authController = require("../controllers/auth.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/me", auth, asyncHandler(authController.me));

module.exports = router;
