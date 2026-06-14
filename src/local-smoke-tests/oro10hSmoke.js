"use strict";

const {
  runOro10hDetailedSmoke,
} = require("./oro10hApprovalChainRolloverReviewDecisionFinalizationBoundarySmoke");

try {
  runOro10hDetailedSmoke({ print: false });
  console.log("ORO-10H smoke: PASS");
} catch (error) {
  console.error("ORO-10H smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
