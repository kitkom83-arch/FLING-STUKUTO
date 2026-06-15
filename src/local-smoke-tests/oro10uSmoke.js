"use strict";

const { runOro10uDetailedSmoke, PASS_MESSAGE } = require("./oro10uFinalApprovalDecisionEvidencePackGateSmoke");

runOro10uDetailedSmoke({ print: false });
console.log(PASS_MESSAGE);
