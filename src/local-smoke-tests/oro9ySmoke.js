"use strict";

const {
  runOro9yDetailedSmoke,
} = require("./oro9yFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySmoke");

try {
  runOro9yDetailedSmoke({ print: false });
  console.log("ORO-9Y smoke: PASS");
} catch (error) {
  console.error("ORO-9Y smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
