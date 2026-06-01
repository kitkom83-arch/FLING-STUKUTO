const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const UAT_DOC = "docs/ADMIN_BANK_ACCOUNT_REVIEW_UAT_CHECKLIST.md";
const RUNBOOK_DOC = "docs/ADMIN_BANK_ACCOUNT_REVIEW_OPERATOR_RUNBOOK.md";
const RELEASE_PACK_DOC = "docs/ADMIN_BANK_ACCOUNT_REVIEW_RELEASE_PACK.md";
const STATIC_SCAN_FILES = [
  UAT_DOC,
  RUNBOOK_DOC,
  RELEASE_PACK_DOC,
  "package.json",
  "src/local-smoke-tests/runAllLocalSmoke.js",
];

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), `${label} missing marker: ${marker}`);
  }
}

function assertNoUnsafePlaceholderCopy(label, text) {
  const scanned = String(text || "")
    .replace(/No `undefined`, `NaN`, or object-string placeholder copy[^\n]*/g, "")
    .replace(/Page does not show `undefined`, `NaN`, or object-string placeholder copy[^\n]*/g, "")
    .replace(/UI shows no `undefined`, no `NaN`, and no dangerous buttons[^\n]*/g, "");
  const unsafeMarkers = [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object", " Object]"].join("")];
  for (const marker of unsafeMarkers) {
    assert(!scanned.includes(marker), `${label} contains unsafe placeholder copy: ${marker}`);
  }
}

function assertNoSecretLiteralValues(label, text) {
  const scanned = String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const databaseUrlAssignment = new RegExp(`${["DATA", "BASE_URL"].join("")}\\s*=`, "i");
  const authorizationLiteral = new RegExp(`${["Author", "ization"].join("")}:`, "i");
  const authSchemeLiteral = new RegExp(`\\b${["Bea", "rer"].join("")}\\s+`, "i");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const apiKeyShape = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const longTokenLike = /\b[A-Za-z0-9_-]{80,}\b/;

  assert(!lower.includes(postgresProtocol), `${label} contains database URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains database URL protocol.`);
  assert(!databaseUrlAssignment.test(scanned), `${label} contains database URL assignment literal.`);
  assert(!authorizationLiteral.test(scanned), `${label} contains authorization header literal.`);
  assert(!authSchemeLiteral.test(scanned), `${label} contains auth scheme literal.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!apiKeyShape.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!longTokenLike.test(scanned), `${label} contains long token-shaped value.`);
}

function assertNoDangerousEnablement(label, text) {
  const scanned = String(text || "");
  const allowedNoRealMoney = scanned.replace(/no real money (enabled|on|active|allowed|approved)/gi, "");
  const forbidden = [
    /real money (enabled|on|active|allowed|approved)/i,
    /production db (enabled|on|active|allowed|approved)/i,
    /live payout (enabled|on|active|allowed|approved)/i,
    /live transfer (enabled|on|active|allowed|approved)/i,
    /provider live (enabled|on|active|allowed|approved)/i,
    /credit\/debit (enabled|on|active|allowed|approved)/i,
    /approve withdrawal (enabled|on|active|allowed|approved)/i,
  ];
  for (const pattern of forbidden) {
    assert(!pattern.test(pattern.source.startsWith("real money") ? allowedNoRealMoney : scanned), `${label} contains dangerous enablement wording.`);
  }
}

function assertUatDoc(text) {
  assertIncludes("UAT checklist", text, [
    "Admin Bank Account Review UAT Checklist",
    "Phase AN",
    "Dashboard loads",
    "Member List loads",
    "Pending Bank Accounts loads",
    "Approve modal opens",
    "Reject modal opens",
    "Reason field is visible",
    "Empty reason validates",
    "Authorized approve with reason succeeds only against local/staging/mock fixtures",
    "Duplicate reviewed account fails safely with `409`",
    "Bank Account Review Audit / Review History",
    "Operator Handoff",
    "No login approve/reject = `401`",
    "No permission approve/reject = `403`",
    "Missing reason = `400`",
    "Response leak scan passes",
    "credit/debit",
    "payout",
    "live transfer",
    "provider live",
    "approve withdrawal",
  ]);
}

function assertRunbookDoc(text) {
  assertIncludes("Operator runbook", text, [
    "Admin Bank Account Review Operator Runbook",
    "Phase AN",
    "`members.bank.view`",
    "`members.bank.approve`",
    "`admin.audit.view`",
    "`member.bank.approve`",
    "`member.bank.reject`",
    "How To Review Pending Accounts",
    "How To Approve",
    "How To Reject",
    "Reason Rules",
    "How To View Review History",
    "How To Read Audit Metadata",
    "`401` unauthenticated",
    "`403` no permission",
    "`409` duplicate reviewed",
    "Escalation Path",
    "Forbidden Actions",
  ]);
}

function assertReleasePackDoc(text) {
  assertIncludes("Release pack", text, [
    "Admin Bank Account Review Release Pack",
    "Phase AL",
    "Phase AM",
    "Phase AN",
    "Release Scope",
    "Endpoints Involved",
    "`GET /api/admin/bank-accounts/pending`",
    "`POST /api/admin/bank-accounts/:id/approve`",
    "`POST /api/admin/bank-accounts/:id/reject`",
    "`members.bank.view`",
    "`members.bank.approve`",
    "`admin.audit.view`",
    "`member.bank.approve`",
    "`member.bank.reject`",
    "npm run smoke:admin-bank-account-review-release-pack",
    "Manual Browser Checklist",
    "Go/No-Go Checklist",
    "Rollback Notes",
    "Safety Boundaries",
  ]);
  assertNormalizedIncludes("Release pack safety", text, [
    "no production DB",
    "no real money",
    "no live provider/payment/bank/SMS/Slip OCR",
    "no migration",
    "no deploy",
    "no credit/debit",
    "no payout",
    "no new runtime write action",
  ]);
}

function assertCrossDocs() {
  const combined = [
    readRequired("docs/API.md"),
    readRequired("docs/API_MAPPING.md"),
    readRequired("docs/AUDIT_LOG_MATRIX.md"),
    readRequired("docs/PERMISSION_MATRIX.md"),
    readRequired("docs/PHASE_ROADMAP.md"),
    readRequired("docs/SMOKE_COVERAGE.md"),
    readRequired("docs/STAGING_UAT.md"),
    readRequired("docs/STAGING_RELEASE_RUNBOOK.md"),
  ].join("\n");
  assertIncludes("Phase AN cross docs", combined, [
    "Phase AN Admin Bank Account Review Release Pack / UAT Checklist",
    "ADMIN_BANK_ACCOUNT_REVIEW_UAT_CHECKLIST.md",
    "ADMIN_BANK_ACCOUNT_REVIEW_OPERATOR_RUNBOOK.md",
    "ADMIN_BANK_ACCOUNT_REVIEW_RELEASE_PACK.md",
    "smoke:admin-bank-account-review-release-pack",
    "members.bank.view",
    "members.bank.approve",
    "member.bank.approve",
    "member.bank.reject",
    "reason required",
    "duplicate reviewed",
  ]);
}

function assertPackageAndRunner() {
  const pkg = JSON.parse(readRequired("package.json"));
  assert.strictEqual(
    pkg.scripts["smoke:admin-bank-account-review-release-pack"],
    "node src/local-smoke-tests/adminBankAccountReviewReleasePackSmoke.js",
    "package.json missing admin bank account review release pack smoke script."
  );
  const runner = readRequired("src/local-smoke-tests/runAllLocalSmoke.js");
  assertIncludes("runAllLocalSmoke", runner, [
    "adminBankAccountReviewReleasePackSmoke.js",
    "admin-bank-account-review-release-pack",
    "adminBankAccountReviewReleasePack",
  ]);
}

function assertStaticScans() {
  for (const file of STATIC_SCAN_FILES) {
    const text = readRequired(file);
    assertNoSecretLiteralValues(file, text);
    assertNoUnsafePlaceholderCopy(file, text);
    assertNoDangerousEnablement(file, text);
  }
}

function main() {
  const uat = readRequired(UAT_DOC);
  const runbook = readRequired(RUNBOOK_DOC);
  const releasePack = readRequired(RELEASE_PACK_DOC);
  console.log("Admin bank account review release pack docs exist: PASS");

  assertUatDoc(uat);
  console.log("Admin bank account review UAT checklist contract: PASS");

  assertRunbookDoc(runbook);
  console.log("Admin bank account review operator runbook contract: PASS");

  assertReleasePackDoc(releasePack);
  console.log("Admin bank account review release pack contract: PASS");

  assertCrossDocs();
  console.log("Admin bank account review cross-doc references: PASS");

  assertPackageAndRunner();
  console.log("Admin bank account review release pack smoke registration: PASS");

  assertStaticScans();
  console.log("Admin bank account review release pack static safety scan: PASS");

  console.log("Admin bank account review release pack smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Admin bank account review release pack smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
