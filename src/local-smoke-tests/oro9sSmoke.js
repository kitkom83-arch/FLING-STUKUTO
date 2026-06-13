"use strict";

const {
  runOro9sDetailedSmoke,
} = require("./oro9sFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewBoundarySmoke");

try {
  runOro9sDetailedSmoke({ print: false });
  console.log("ORO-9S smoke: PASS");
} catch (error) {
  console.error("ORO-9S smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
