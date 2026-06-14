"use strict";

const {
  runOro10dDetailedSmoke,
} = require("./oro10dApprovalChainRolloverReviewRequestBoundarySmoke");

try {
  runOro10dDetailedSmoke({ print: false });
  console.log("ORO-10D smoke: PASS");
} catch (error) {
  console.error("ORO-10D smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
