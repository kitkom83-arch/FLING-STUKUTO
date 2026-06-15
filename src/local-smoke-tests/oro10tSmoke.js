"use strict";

const { runOro10tDetailedSmoke } = require("./oro10tFinalApprovalDecisionRecordVerificationGateSmoke");

try {
  runOro10tDetailedSmoke({ print: false });
  console.log("ORO-10T smoke: PASS");
} catch (error) {
  console.error("ORO-10T smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
