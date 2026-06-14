"use strict";

const {
  runOro10eDetailedSmoke,
} = require("./oro10eApprovalChainRolloverReviewRequestSubmissionGateSmoke");

try {
  runOro10eDetailedSmoke({ print: false });
  console.log("ORO-10E smoke: PASS");
} catch (error) {
  console.error("ORO-10E smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
