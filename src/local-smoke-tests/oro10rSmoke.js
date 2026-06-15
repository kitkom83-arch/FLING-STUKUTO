"use strict";

const { runOro10rDetailedSmoke } = require("./oro10rFinalApprovalDecisionReviewGateSmoke");

try {
  runOro10rDetailedSmoke({ print: false });
  console.log("ORO-10R smoke: PASS");
} catch (error) {
  console.error("ORO-10R smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
