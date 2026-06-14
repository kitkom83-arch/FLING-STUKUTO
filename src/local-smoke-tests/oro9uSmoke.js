"use strict";

const {
  runOro9uDetailedSmoke,
} = require("./oro9uFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordBoundarySmoke");

try {
  runOro9uDetailedSmoke({ print: false });
  console.log("ORO-9U smoke: PASS");
} catch (error) {
  console.error("ORO-9U smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
