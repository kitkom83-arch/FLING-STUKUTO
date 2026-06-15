"use strict";

const { runOro10vDetailedSmoke, PASS_MESSAGE } = require("./oro10vFinalApprovalDecisionEvidencePackVerificationGateSmoke");

runOro10vDetailedSmoke({ print: false });
console.log(PASS_MESSAGE);
