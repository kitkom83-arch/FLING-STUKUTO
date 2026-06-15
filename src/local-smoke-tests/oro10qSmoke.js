"use strict";

const { runOro10qDetailedSmoke } = require("./oro10qFinalApprovalDecisionIntakeGateSmoke");

try {
  runOro10qDetailedSmoke({ print: false });
  console.log("ORO-10Q smoke: PASS");
} catch (error) {
  console.error("ORO-10Q smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
