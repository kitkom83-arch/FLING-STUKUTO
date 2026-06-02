"use strict";

const express = require("express");
const {
  handleOroplayBalanceStub,
  handleOroplayTransactionStub,
} = require("../controllers/oroplayCallbackStub.controller");

const router = express.Router();

router.post("/balance", handleOroplayBalanceStub);
router.post("/transaction", handleOroplayTransactionStub);

module.exports = router;
