"use strict";

const {
  runOro9zDetailedSmoke,
} = require("./oro9zFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke");

try {
  runOro9zDetailedSmoke({ print: false });
  console.log("ORO-9Z smoke: PASS");
} catch (error) {
  console.error("ORO-9Z smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
