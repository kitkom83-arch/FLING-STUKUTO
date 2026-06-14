"use strict";

const {
  runOro9wDetailedSmoke,
} = require("./oro9wFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySmoke");

try {
  runOro9wDetailedSmoke({ print: false });
  console.log("ORO-9W smoke: PASS");
} catch (error) {
  console.error("ORO-9W smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
