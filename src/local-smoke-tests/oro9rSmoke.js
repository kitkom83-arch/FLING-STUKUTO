"use strict";

const {
  runOro9rDetailedSmoke,
} = require("./oro9rFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke");

try {
  runOro9rDetailedSmoke({ print: false });
  console.log("ORO-9R smoke: PASS");
} catch (error) {
  console.error("ORO-9R smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
