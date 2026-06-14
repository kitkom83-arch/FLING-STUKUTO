"use strict";

const {
  runOro9tDetailedSmoke,
} = require("./oro9tFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalBoundarySmoke");

try {
  runOro9tDetailedSmoke({ print: false });
  console.log("ORO-9T smoke: PASS");
} catch (error) {
  console.error("ORO-9T smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
