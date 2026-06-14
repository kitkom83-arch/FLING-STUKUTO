"use strict";

const {
  runOro9xDetailedSmoke,
} = require("./oro9xFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke");

try {
  runOro9xDetailedSmoke({ print: false });
  console.log("ORO-9X smoke: PASS");
} catch (error) {
  console.error("ORO-9X smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
