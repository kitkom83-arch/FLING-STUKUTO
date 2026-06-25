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
const SMOKE_FILE = "src/local-smoke-tests/oroplayLiveGate9FinalOperatorHoldSmoke.js";
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

function assertNoSecretLiteralValues(label, text) {
  const isThisSmokeFile = /oroplayLiveGate9FinalOperatorHoldSmoke\.js$/.test(label);
  const scanned =
    label === "package.json"
      ? packageJsonSecretScanText(text)
      : isThisSmokeFile
        ? normalizeLocalScriptNameLiterals(text)
        : String(text || "");
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

function gate9ScopedText(label, text) {
  const scanned = String(text || "");
  const gate9Heading = "## ORO-LIVE-GATE-9";
  if (label === "package.json") {
    const pkg = JSON.parse(scanned);
    return String((pkg.scripts && pkg.scripts["smoke:oroplay-live-gate-9"]) || "");
  }

  if (!/^docs\//.test(label) && !/^docs\\/.test(label)) {
    return scanned;
  }

  const start = scanned.indexOf(gate9Heading);
  if (start === -1) {
    return scanned;
  }

  const next = scanned.indexOf("\n## ", start + gate9Heading.length);
  return next === -1 ? scanned.slice(start) : scanned.slice(start, next);
}

function assertNoExecutableEnablementCommand(label, text) {
  const scanned = /oroplayLiveGate9FinalOperatorHoldSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : gate9ScopedText(label, text);
  const lower = normalize(scanned);
  const forbidden = [
    ["pm2", " restart"].join(""),
    ["pm2", " reload"].join(""),
    ["export ", "oroplay_enabled=1"].join(""),
    ["set ", "oroplay_enabled=1"].join(""),
    ["$env:", "oroplay_enabled"].join(""),
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
  const scanned = /oroplayLiveGate9FinalOperatorHoldSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : gate9ScopedText(label, text);
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
  const lower = normalize(gate9ScopedText(label, text));
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
    "## ORO-LIVE-GATE-9 Final Runtime Enablement Operator Hold / Execution Approval Boundary",
    "ORO-LIVE-GATE-9 is the final runtime enablement operator hold / execution approval boundary only.",
    "### Gate 9 Prerequisites",
    "### Final Go/No-Go Checklist",
    "### Human Approval Record Template",
    "### Operator Role Checklist",
    "### Operator Two-Person Confirmation Checklist",
    "### Execution Window Checklist",
    "### Rollback Readiness Checklist",
    "### Monitoring Readiness Checklist",
    "### Evidence Capture Checklist",
    "### Post-Execution Verification Checklist",
    "### Emergency Abort Criteria",
    "### Gate 10 Handoff Requirements",
    "Gate 10 only may act as the actual controlled runtime enablement execution gate after Gate 9 approval.",
  ]);

  assertNormalizedIncludes("Live readiness Gate 9 safety", text, [
    "oro-live-gate-7 is closed/pass",
    "oro-live-gate-8 is closed/pass",
    "go/no-go",
    "human approval record template",
    "two-person confirmation checklist",
    "execution window checklist",
    "rollback readiness checklist",
    "monitoring readiness checklist",
    "evidence capture checklist",
    "post-execution verification checklist",
    "emergency abort criteria",
    "gate 10 handoff requirements",
    "gate 10 must be opened as a separate gate after explicit user approval",
    "actual controlled runtime enablement execution gate",
    "live runtime activation is still not enabled",
    "live transactional traffic is still not enabled",
    "real money is still not enabled",
    "real game launch is still not enabled",
  ]);
}

function assertCurrentStatusDoc(text) {
  assertIncludes("Current status doc", text, [
    "ORO-LIVE-GATE-8 is closed/pass as the controlled runtime enablement gate.",
    "ORO-LIVE-GATE-9 is current as the final runtime enablement operator hold / execution approval boundary.",
    "Live runtime activation is still pending Gate 10 and is not enabled.",
    "Gate 9 must keep final operator hold / execution approval separate from actual controlled runtime enablement execution",
  ]);
}

function assertIntegrationPlanDoc(text) {
  assertIncludes("Integration plan doc", text, [
    "## ORO-LIVE-GATE-9 Current",
    "ORO-LIVE-GATE-7 closed/pass. ORO-LIVE-GATE-8 closed/pass. ORO-LIVE-GATE-9 current. ORO-LIVE-GATE-9 is the final runtime enablement operator hold / execution approval boundary.",
    "Gate 9 is an approval boundary only and is separate from actual controlled runtime enablement execution.",
    "Gate 10 only may act as the actual controlled runtime enablement execution gate if Gate 9 passes and receives separate explicit approval.",
  ]);
}

function assertSmokeCoverageDoc(text) {
  assertIncludes("Smoke coverage doc", text, [
    "`oroplayLiveGate9FinalOperatorHoldSmoke.js`",
    "`npm run smoke:oroplay-live-gate-9`",
    "ORO-LIVE-GATE-9 local smoke coverage:",
    "ORO-LIVE-GATE-7 is recorded as closed/pass.",
    "ORO-LIVE-GATE-8 is recorded as closed/pass.",
    "ORO-LIVE-GATE-9 is recorded as the final runtime enablement operator hold / execution approval boundary.",
    "Gate 9 includes final go/no-go checklist markers.",
    "Gate 9 includes human approval record template markers.",
    "Gate 9 includes operator two-person confirmation checklist markers.",
    "Gate 9 includes execution window checklist markers.",
    "Gate 9 includes rollback readiness checklist markers.",
    "Gate 9 includes monitoring readiness checklist markers.",
    "Gate 9 includes evidence capture checklist markers.",
    "Gate 9 includes post-execution verification checklist markers.",
    "Gate 9 includes emergency abort criteria markers.",
    "Gate 9 includes explicit Gate 10 handoff requirement markers.",
    "No actual live enablement command.",
  ]);
}

function assertPackageRegistration() {
  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-live-gate-9"],
    "node src/local-smoke-tests/oroplayLiveGate9FinalOperatorHoldSmoke.js",
    "package.json missing ORO-LIVE-GATE-9 smoke script."
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
  console.log("ORO-LIVE-GATE-9 live readiness doc contract: PASS");

  assertCurrentStatusDoc(currentStatus);
  console.log("ORO-LIVE-GATE-9 current status contract: PASS");

  assertIntegrationPlanDoc(integrationPlan);
  console.log("ORO-LIVE-GATE-9 integration plan contract: PASS");

  assertSmokeCoverageDoc(smokeCoverage);
  console.log("ORO-LIVE-GATE-9 smoke coverage contract: PASS");

  assertPackageRegistration();
  console.log("ORO-LIVE-GATE-9 package registration: PASS");

  assertStaticScans();
  console.log("ORO-LIVE-GATE-9 static safety scan: PASS");

  console.log("ORO-LIVE-GATE-9 final operator hold smoke: PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("ORO-LIVE-GATE-9 final operator hold smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
};
