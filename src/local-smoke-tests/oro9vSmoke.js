"use strict";

const {
  runOro9vDetailedSmoke,
} = require("./oro9vFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationReviewApprovalRecordFinalizationBoundarySmoke");

try {
  runOro9vDetailedSmoke({ print: false });
  console.log("ORO-9V smoke: PASS");
} catch (error) {
  console.error("ORO-9V smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
