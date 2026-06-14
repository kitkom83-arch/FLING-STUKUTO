"use strict";

const {
  runOro10gDetailedSmoke,
} = require("./oro10gApprovalChainRolloverReviewDecisionValidationGateSmoke");

try {
  runOro10gDetailedSmoke({ print: false });
  console.log("ORO-10G smoke: PASS");
} catch (error) {
  console.error("ORO-10G smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
