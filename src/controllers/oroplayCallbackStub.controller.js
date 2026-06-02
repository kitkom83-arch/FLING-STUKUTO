"use strict";

const {
  buildOroplayCallbackStubResponse,
} = require("../game-provider-mock/oroplayCallbackStubContract");

const STAGING_CALLBACK_STUB_ENV_KEY = "OROPLAY_STAGING_CALLBACK_STUB_ENABLED";

function isStagingCallbackStubEnabled() {
  return String(process.env[STAGING_CALLBACK_STUB_ENV_KEY] || "").trim().toLowerCase() === "true";
}

function sendFailClosedStub(res, callbackType) {
  const stubEnabled = isStagingCallbackStubEnabled();
  const statusCode = stubEnabled ? 501 : 503;
  return res.status(statusCode).json(
    buildOroplayCallbackStubResponse({
      callbackType,
      stubEnabled,
    })
  );
}

function handleOroplayBalanceStub(_req, res) {
  return sendFailClosedStub(res, "balance");
}

function handleOroplayTransactionStub(_req, res) {
  return sendFailClosedStub(res, "transaction");
}

module.exports = {
  handleOroplayBalanceStub,
  handleOroplayTransactionStub,
};
