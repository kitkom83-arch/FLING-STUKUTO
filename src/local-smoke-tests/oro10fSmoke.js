"use strict";

const {
  runOro10fDetailedSmoke,
} = require("./oro10fApprovalChainRolloverReviewDecisionIntakeGateSmoke");

try {
  runOro10fDetailedSmoke({ print: false });
  console.log("ORO-10F smoke: PASS");
} catch (error) {
  console.error("ORO-10F smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
