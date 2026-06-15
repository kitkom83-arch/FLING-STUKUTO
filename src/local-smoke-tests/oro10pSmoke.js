"use strict";

const { runOro10pDetailedSmoke } = require("./oro10pFinalApprovalRequestSubmissionGateSmoke");

try {
  runOro10pDetailedSmoke({ print: false });
  console.log("ORO-10P smoke: PASS");
} catch (error) {
  console.error("ORO-10P smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
