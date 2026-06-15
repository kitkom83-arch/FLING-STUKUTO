"use strict";

const { runOro10sDetailedSmoke } = require("./oro10sFinalApprovalDecisionRecordGateSmoke");

try {
  runOro10sDetailedSmoke({ print: false });
  console.log("ORO-10S smoke: PASS");
} catch (error) {
  console.error("ORO-10S smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
