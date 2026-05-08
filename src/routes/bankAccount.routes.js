const express = require("express");
const auth = require("../middleware/auth");
const bankAccountController = require("../controllers/bankAccount.controller");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/bank-accounts", auth, asyncHandler(bankAccountController.listMine));
router.post("/bank-accounts", auth, asyncHandler(bankAccountController.createMine));

module.exports = router;
