"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const LIVE_READINESS_DOC = "docs/OROPLAY_LIVE_READINESS.md";
const CURRENT_STATUS_DOC = "docs/OROPLAY_CURRENT_STATUS.md";
const INTEGRATION_PLAN_DOC = "docs/OROPLAY_INTEGRATION_PLAN.md";
const SMOKE_COVERAGE_DOC = "docs/SMOKE_COVERAGE.md";
const PACKAGE_JSON = "package.json";
const SMOKE_FILE = "src/local-smoke-tests/oroplayLiveGate10BExecutionApprovalHoldSmoke.js";
const STATIC_SCAN_FILES = [
  LIVE_READINESS_DOC,
  CURRENT_STATUS_DOC,
  INTEGRATION_PLAN_DOC,
  SMOKE_COVERAGE_DOC,
  PACKAGE_JSON,
  SMOKE_FILE,
];

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), relativePath + " must exist.");
  return fs.readFileSync(filePath, "utf8");
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), label + " missing marker: " + marker);
  }
}

function assertNormalizedIncludes(label, text, markers) {
  const lower = normalize(text);
  for (const marker of markers) {
    assert(lower.includes(marker.toLowerCase()), label + " missing marker: " + marker);
  }
}

function normalizeLocalScriptNameLiterals(text) {
  return String(text || "")
    .replace(/\bnpm run smoke:[A-Za-z0-9:_-]{12,}\b/gi, "__LOCAL_NPM_SMOKE__")
    .replace(/\b(smoke|test|seed|staging):[A-Za-z0-9:_-]{12,}\b/g, "__LOCAL_SCRIPT_KEY__")
    .replace(/\bsrc\/local-smoke-tests\/[A-Za-z0-9._-]{12,}\.js\b/gi, "__LOCAL_SCRIPT_PATH__")
    .replace(/const forbidden = \[[\s\S]*?\];/g, "const forbidden = [];")
    .replace(/\b[A-Za-z0-9._-]{12,}Smoke\.js\b/g, "__LOCAL_SCRIPT_FILE__");
}

function packageJsonSecretScanText(text) {
  let pkg;
  try {
    pkg = JSON.parse(String(text || ""));
  } catch (_error) {
    return String(text || "");
  }

  const clone = JSON.parse(JSON.stringify(pkg));
  const scripts = clone && clone.scripts && typeof clone.scripts === "object" ? clone.scripts : {};
  const sanitizedScripts = {};

  for (const [key, value] of Object.entries(scripts)) {
    const normalizedKey = String(key || "");
    const normalizedValue = String(value || "");
    const looksLikeLocalScript =
      /^(smoke:|test:|seed|staging:)/i.test(normalizedKey) &&
      /^(node|npm|npx)\s+[\w./:-]+/i.test(normalizedValue);
    sanitizedScripts[looksLikeLocalScript ? "__LOCAL_SCRIPT_KEY__" : normalizedKey] = looksLikeLocalScript
      ? "__LOCAL_SCRIPT_PATH__"
      : normalizedValue;
  }

  clone.scripts = sanitizedScripts;
  return JSON.stringify(clone);
}

function gate10BScopedText(label, text) {
  const scanned = String(text || "");
  const gate10BHeading = "## ORO-LIVE-GATE-10B";
  if (label === "package.json") {
    const pkg = JSON.parse(scanned);
    return String((pkg.scripts && pkg.scripts["smoke:oroplay-live-gate-10b"]) || "");
  }

  if (!/^docs\//.test(label) && !/^docs\\/.test(label)) {
    return scanned;
  }

  const start = scanned.indexOf(gate10BHeading);
  if (start === -1) {
    return scanned;
  }

  const next = scanned.indexOf("\n## ", start + gate10BHeading.length);
  return next === -1 ? scanned.slice(start) : scanned.slice(start, next);
}

function assertNoSecretLiteralValues(label, text) {
  const isThisSmokeFile = /oroplayLiveGate10BExecutionApprovalHoldSmoke\.js$/.test(label);
  const scanned =
    label === "package.json"
      ? packageJsonSecretScanText(text)
      : isThisSmokeFile
        ? normalizeLocalScriptNameLiterals(text)
        : gate10BScopedText(label, text);
  const lower = scanned.toLowerCase();
  const authorizationLiteral = new RegExp(["Author", "ization", ":"].join(""), "i");
  const authSchemeLiteral = new RegExp("\\b" + ["Bea", "rer"].join("") + "\\s+", "i");
  const apiKeyShape = new RegExp("\\b" + ["s", "k", "-"].join("") + "[A-Za-z0-9_-]{12,}\\b");
  const secretAssignment = /\b(?:token|secret|password|clientsecret|client_secret)\s*[:=]\s*["'][^"']{6,}["']/i;
  const redactionMarker = String.fromCharCode(42, 42, 42);

  assert(!lower.includes(["postgres", "://"].join("")), label + " contains database URL protocol.");
  assert(!lower.includes(["postgres", "ql://"].join("")), label + " contains database URL protocol.");
  assert(!authorizationLiteral.test(scanned), label + " contains authorization header literal.");
  assert(!authSchemeLiteral.test(scanned), label + " contains auth scheme literal.");
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), label + " contains JWT-shaped value.");
  assert(!apiKeyShape.test(scanned), label + " contains API-key-shaped value.");
  assert(!secretAssignment.test(scanned), label + " contains secret-like assignment.");
  assert(!scanned.includes(redactionMarker), label + " contains forbidden redaction marker.");
}

function assertNoUnsafePlaceholderCopy(label, text) {
  const scanned = String(text || "");
  const unsafeMarkers = [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object", " Object]"].join("")];
  for (const marker of unsafeMarkers) {
    assert(!scanned.includes(marker), label + " contains unsafe placeholder copy: " + marker);
  }
}

function assertNoExecutableEnablementCommand(label, text) {
  const scanned = /oroplayLiveGate10BExecutionApprovalHoldSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : gate10BScopedText(label, text);
  const lower = normalize(scanned);
  const forbidden = [
    ["pm2", " restart"].join(""),
    ["pm2", " reload"].join(""),
    ["export ", "oroplay_enabled=1"].join(""),
    ["set ", "oroplay_enabled=1"].join(""),
    ["$env:", "oroplay_enabled"].join(""),
    ["source ", "~"].join(""),
    ["export ", "oroplay_mode=production"].join(""),
    ["set ", "oroplay_mode=production"].join(""),
    ["$env:", "oroplay_mode"].join(""),
    ["systemctl", " restart"].join(""),
  ];

  for (const marker of forbidden) {
    assert(!lower.includes(marker), label + " contains forbidden executable enablement marker: " + marker);
  }
}

function assertNoRuntimeCalls(label, text) {
  const scanned = /oroplayLiveGate10BExecutionApprovalHoldSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : gate10BScopedText(label, text);
  const lower = normalize(scanned);
  const forbidden = [
    "fetch(",
    "axios.",
    "http.request",
    "https.request",
    "prisma.",
    "new prisma",
    "databaseurl",
    "process.env.oroplay",
    "process.env.client",
    "process.env.token",
    "process.env.password",
    "process.env.secret",
    "provider.post",
    "provider.put",
    "provider.patch",
    "provider.delete",
    "/deposit",
    "/withdraw",
    "/withdrawall",
    "/launch",
    "/createuser",
  ];

  for (const marker of forbidden) {
    assert(!lower.includes(marker), label + " contains forbidden runtime-call marker: " + marker);
  }
}

function assertNoEnabledClaims(label, text) {
  const lower = normalize(gate10BScopedText(label, text));
  const forbidden = [
    ["runtime activation", "is enabled"].join(" "),
    ["live runtime", "is enabled"].join(" "),
    ["live transactional traffic", "is enabled"].join(" "),
    ["real money", "is enabled"].join(" "),
    ["real game launch", "is enabled"].join(" "),
    ["live traffic", "opened"].join(" "),
    ["live traffic", "is open"].join(" "),
  ];

  for (const marker of forbidden) {
    assert(!lower.includes(marker), label + " contains forbidden enabled-claim marker: " + marker);
  }
}

function assertLiveReadinessDoc(text) {
  assertIncludes("Live readiness doc", text, [
    "## ORO-LIVE-GATE-10B Actual Runtime Enablement Execution Approval + Operator Hold Gate",
    "ORO-LIVE-GATE-10B is the actual runtime enablement execution approval + operator hold gate only.",
    "### Gate 10B Prerequisites",
    "### Final Approval Decision Record",
    "### Go/No-Go Decision Matrix",
    "### Two-Person Confirmation Requirement",
    "### Operator Identity / Role Checklist",
    "### Execution Window Approval Checklist",
    "### Gate 10A Command Packet Acceptance Checklist",
    "### Rollback Readiness Acceptance Checklist",
    "### Monitoring Readiness Acceptance Checklist",
    "### Emergency Abort Acceptance Checklist",
    "### Evidence Capture Acceptance Checklist",
    "### Post-Execution Verification Acceptance Checklist",
    "### Next Actual Execution Gate Handoff Requirements",
    "The next gate only may act as the actual controlled runtime enablement execution gate after Gate 10B approval and separate explicit user approval.",
  ]);

  assertNormalizedIncludes("Live readiness Gate 10B safety", text, [
    "oro-live-gate-7 is closed/pass",
    "oro-live-gate-8 is closed/pass",
    "oro-live-gate-9 is closed/pass",
    "oro-live-gate-10a is closed/pass",
    "final approval decision record",
    "go/no-go decision matrix",
    "two-person confirmation requirement",
    "operator identity / role checklist",
    "execution window approval checklist",
    "gate 10a command packet acceptance checklist",
    "rollback readiness acceptance checklist",
    "monitoring readiness acceptance checklist",
    "emergency abort acceptance checklist",
    "evidence capture acceptance checklist",
    "post-execution verification acceptance checklist",
    "next actual execution gate handoff requirements",
    "gate 10b is final approval boundary / operator hold only",
    "live runtime activation is still not enabled",
    "live transactional traffic is still not enabled",
    "real money is still not enabled",
    "real game launch is still not enabled",
  ]);
}

function assertCurrentStatusDoc(text) {
  assertIncludes("Current status doc", text, [
    "ORO-LIVE-GATE-10A is closed/pass as the final runtime enablement execution command packet dry-run gate only.",
    "ORO-LIVE-GATE-10B is current as the actual runtime enablement execution approval + operator hold gate only.",
    "Live runtime activation is still pending the next actual execution gate and is not enabled.",
    "Gate 10B must keep final approval/operator hold separate from actual controlled runtime enablement execution",
    "The next gate only may act as the actual controlled runtime enablement execution gate if Gate 10B passes and receives separate explicit user approval.",
  ]);
}

function assertIntegrationPlanDoc(text) {
  assertIncludes("Integration plan doc", text, [
    "## ORO-LIVE-GATE-10B Current",
    "ORO-LIVE-GATE-7 closed/pass. ORO-LIVE-GATE-8 closed/pass. ORO-LIVE-GATE-9 closed/pass. ORO-LIVE-GATE-10A closed/pass. ORO-LIVE-GATE-10B current. ORO-LIVE-GATE-10B is the actual runtime enablement execution approval + operator hold gate only.",
    "Gate 10B is approval/operator-hold only and is separate from actual controlled runtime enablement execution.",
    "The next gate only may act as the actual controlled runtime enablement execution gate if Gate 10B passes and receives separate explicit user approval.",
  ]);
}

function assertSmokeCoverageDoc(text) {
  assertIncludes("Smoke coverage doc", text, [
    "`oroplayLiveGate10BExecutionApprovalHoldSmoke.js`",
    "`npm run smoke:oroplay-live-gate-10b`",
    "ORO-LIVE-GATE-10B local smoke coverage:",
    "ORO-LIVE-GATE-7 is recorded as closed/pass.",
    "ORO-LIVE-GATE-8 is recorded as closed/pass.",
    "ORO-LIVE-GATE-9 is recorded as closed/pass.",
    "ORO-LIVE-GATE-10A is recorded as closed/pass.",
    "ORO-LIVE-GATE-10B is recorded as the actual runtime enablement execution approval + operator hold gate.",
    "Gate 10B includes final approval decision record markers.",
    "Gate 10B includes go/no-go decision matrix markers.",
    "Gate 10B includes two-person confirmation markers.",
    "Gate 10B includes operator identity/role checklist markers.",
    "Gate 10B includes execution window approval checklist markers.",
    "Gate 10B includes Gate 10A command packet acceptance checklist markers.",
    "Gate 10B includes rollback readiness acceptance checklist markers.",
    "Gate 10B includes monitoring readiness acceptance checklist markers.",
    "Gate 10B includes emergency abort acceptance checklist markers.",
    "Gate 10B includes evidence capture acceptance checklist markers.",
    "Gate 10B includes post-execution verification acceptance checklist markers.",
    "Gate 10B includes explicit next gate handoff requirement markers for actual execution only.",
    "No actual live enablement command.",
  ]);
}

function assertPackageRegistration() {
  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-live-gate-10b"],
    "node src/local-smoke-tests/oroplayLiveGate10BExecutionApprovalHoldSmoke.js",
    "package.json missing ORO-LIVE-GATE-10B smoke script."
  );
}

function assertStaticScans() {
  for (const file of STATIC_SCAN_FILES) {
    const text = readRequired(file);
    assertNoSecretLiteralValues(file, text);
    assertNoUnsafePlaceholderCopy(file, text);
    assertNoExecutableEnablementCommand(file, text);
    assertNoRuntimeCalls(file, text);
    assertNoEnabledClaims(file, text);
  }
}

function main() {
  const liveReadiness = readRequired(LIVE_READINESS_DOC);
  const currentStatus = readRequired(CURRENT_STATUS_DOC);
  const integrationPlan = readRequired(INTEGRATION_PLAN_DOC);
  const smokeCoverage = readRequired(SMOKE_COVERAGE_DOC);

  assertLiveReadinessDoc(liveReadiness);
  console.log("ORO-LIVE-GATE-10B live readiness doc contract: PASS");

  assertCurrentStatusDoc(currentStatus);
  console.log("ORO-LIVE-GATE-10B current status contract: PASS");

  assertIntegrationPlanDoc(integrationPlan);
  console.log("ORO-LIVE-GATE-10B integration plan contract: PASS");

  assertSmokeCoverageDoc(smokeCoverage);
  console.log("ORO-LIVE-GATE-10B smoke coverage contract: PASS");

  assertPackageRegistration();
  console.log("ORO-LIVE-GATE-10B package registration: PASS");

  assertStaticScans();
  console.log("ORO-LIVE-GATE-10B static safety scan: PASS");

  console.log("ORO-LIVE-GATE-10B execution approval hold smoke: PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("ORO-LIVE-GATE-10B execution approval hold smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
};
