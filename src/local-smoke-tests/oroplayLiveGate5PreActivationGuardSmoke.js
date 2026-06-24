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
const SMOKE_FILE = "src/local-smoke-tests/oroplayLiveGate5PreActivationGuardSmoke.js";
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
  const scanned = String(text || "");
  const unsafeMarkers = [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object", " Object]"].join("")];
  for (const marker of unsafeMarkers) {
    assert(!scanned.includes(marker), `${label} contains unsafe placeholder copy: ${marker}`);
  }
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
  const disallowedCommandLiteral = new RegExp(
    [
      "postgres(?:ql)?:\\/\\/",
      ["auth", "or", "ization", ":"].join(""),
      "\\bbearer\\s+",
      "clientsecret\\s*[:=]",
      "token\\s*[:=]",
      "password\\s*[:=]",
    ].join("|"),
    "i"
  );

  for (const [key, value] of Object.entries(scripts)) {
    const normalizedKey = String(key || "");
    const normalizedValue = String(value || "");
    const looksLikeSmokeScriptKey =
      /^(smoke:|test:|seed|staging:)/i.test(normalizedKey) &&
      !/\b(token|password|secret|authorization|bearer|clientsecret)\b/i.test(normalizedKey);
    const looksLikeLocalCommandPath =
      /^(node|npm|npx)\s+[\w./:-]+/i.test(normalizedValue) &&
      /(^|[\s/])(src|docs|prisma|staging-scripts|local-smoke-tests)([/\\]|$)/i.test(normalizedValue) &&
      !disallowedCommandLiteral.test(normalizedValue);

    const sanitizedKey = looksLikeSmokeScriptKey ? "__LOCAL_SCRIPT_KEY__" : normalizedKey;
    const sanitizedValue = looksLikeSmokeScriptKey || looksLikeLocalCommandPath ? "__LOCAL_SCRIPT_PATH__" : normalizedValue;
    sanitizedScripts[`${sanitizedKey}_${Object.keys(sanitizedScripts).length}`] = sanitizedValue;
  }

  clone.scripts = sanitizedScripts;
  return JSON.stringify(clone);
}

function normalizeLocalScriptNameLiterals(text) {
  return String(text || "")
    .replace(/\bnpm run smoke:[A-Za-z0-9:_-]{12,}\b/gi, "__LOCAL_NPM_SMOKE__")
    .replace(/\b(smoke|test|seed|staging):[A-Za-z0-9:_-]{12,}\b/g, "__LOCAL_SCRIPT_KEY__")
    .replace(/\bsrc\/local-smoke-tests\/[A-Za-z0-9._-]{12,}\.js\b/gi, "__LOCAL_SCRIPT_PATH__")
    .replace(/\b[A-Za-z0-9._-]{12,}Smoke\.js\b/g, "__LOCAL_SCRIPT_FILE__");
}

function assertNoSecretLiteralValues(label, text) {
  const isSmokeFile = /oroplayLiveGate5PreActivationGuardSmoke\.js$/.test(label);
  const scanned =
    label === "package.json"
      ? packageJsonSecretScanText(text)
      : isSmokeFile
        ? normalizeLocalScriptNameLiterals(text)
        : String(text || "");
  const lower = scanned.toLowerCase();
  const postgresProtocol = ["postgres", "://"].join("");
  const postgresqlProtocol = ["postgres", "ql://"].join("");
  const authorizationLiteral = new RegExp(`${["Author", "ization"].join("")}:`, "i");
  const authSchemeLiteral = new RegExp(`\\b${["Bea", "rer"].join("")}\\s+`, "i");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const apiKeyShape = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{12,}\\b`);
  const secretAssignment = /\b(?:token|secret|password|clientsecret)\s*[:=]\s*["'][^"']{6,}["']/i;
  const tripleStarMarker = String.fromCharCode(42, 42, 42);

  assert(!lower.includes(postgresProtocol), `${label} contains database URL protocol.`);
  assert(!lower.includes(postgresqlProtocol), `${label} contains database URL protocol.`);
  assert(!authorizationLiteral.test(scanned), `${label} contains authorization header literal.`);
  assert(!authSchemeLiteral.test(scanned), `${label} contains auth scheme literal.`);
  assert(!jwtLike.test(scanned), `${label} contains JWT-shaped value.`);
  assert(!apiKeyShape.test(scanned), `${label} contains API-key-shaped value.`);
  assert(!secretAssignment.test(scanned), `${label} contains secret-like assignment.`);
  assert(!scanned.includes(tripleStarMarker), `${label} contains forbidden redaction marker.`);
}

function assertNoImmediateEnablementCommand(label, text) {
  const scanned =
    /oroplayLiveGate5PreActivationGuardSmoke\.js$/.test(label)
      ? normalizeLocalScriptNameLiterals(text)
      : String(text || "");
  const lower = normalize(scanned);
  const forbidden = [
    ["pm2", " restart"].join(""),
    ["set ", "oroplay_enabled=1"].join(""),
    ["export ", "oroplay_enabled=1"].join(""),
    ["$env:", "oroplay_enabled='1'"].join(""),
  ];
  for (const marker of forbidden) {
    assert(!lower.includes(marker), `${label} contains forbidden immediate-enablement marker: ${marker}`);
  }
}

function assertNoLiveClaim(label, text) {
  const lower = normalize(text);
  const forbidden = [
    ["gate 5", "is live"].join(" "),
    ["oroplay-live-gate-5", "is live"].join(" "),
    ["runtime activation", "is enabled"].join(" "),
    ["live transactional traffic", "is enabled"].join(" "),
    ["real money", "is enabled"].join(" "),
    ["real game launch", "is enabled"].join(" "),
  ];
  for (const marker of forbidden) {
    assert(!lower.includes(marker), `${label} contains forbidden live-claim marker: ${marker}`);
  }
}

function assertLiveReadinessDoc(text) {
  assertIncludes("Live readiness doc", text, [
    "## ORO-LIVE-GATE-5 Controlled Activation Plan / Pre-Activation Guard Gate",
    "ORO-LIVE-GATE-5 is a controlled activation plan / pre-activation guard gate only.",
    "### Gate Prerequisites",
    "### Controlled Activation Plan",
    "### Pre-Activation Guard Checklist",
    "### Operator Readiness Checklist",
    "### Live Activation Window Checklist",
    "### Rollback Runbook Template",
    "### Monitoring Checklist",
    "### Health Verification Checklist",
    "### Post-Activation Verification Checklist For Gate 6",
    "### Abort Conditions",
    "### Approval Requirements For Gate 6",
    "Gate 6 only may act as the actual controlled runtime enablement gate after Gate 5 approval.",
    "Runtime activation is still not enabled.",
    "Real money is still not enabled.",
    "Real game launch is still not enabled.",
  ]);

  assertNormalizedIncludes("Live readiness safety", text, [
    "oro-live-gate-1 is closed/pass",
    "oro-live-gate-2 is closed/pass",
    "oro-live-gate-3 is closed/pass",
    "oro-live-gate-4 is closed/pass",
    "provider mutation",
    "deposit",
    "withdraw",
    "withdraw-all",
    "launch game",
    "create user",
    "external network call",
    "controlled activation plan",
    "pre-activation guard checklist",
    "rollback runbook template",
  ]);
}

function assertCurrentStatusDoc(text) {
  assertIncludes("Current status doc", text, [
    "ORO-LIVE-GATE-4 is closed/pass as the runtime activation decision gate.",
    "ORO-LIVE-GATE-5 is current as the controlled activation plan / pre-activation guard gate only.",
    "Live runtime activation is still pending Gate 6 and is not enabled.",
    "Actual controlled runtime enablement must remain a separate Gate 6 after Gate 5 approval.",
  ]);
}

function assertIntegrationPlanDoc(text) {
  assertIncludes("Integration plan doc", text, [
    "## ORO-LIVE-GATE-5 Current",
    "ORO-LIVE-GATE-1 closed/pass. ORO-LIVE-GATE-2 closed/pass. ORO-LIVE-GATE-3 closed/pass. ORO-LIVE-GATE-4 closed/pass. ORO-LIVE-GATE-5 current.",
    "ORO-LIVE-GATE-5 is a controlled activation plan / pre-activation guard gate only.",
    "Gate 6 only may act as the actual controlled runtime enablement gate if Gate 5 passes.",
  ]);
}

function assertSmokeCoverageDoc(text) {
  assertIncludes("Smoke coverage doc", text, [
    "`oroplayLiveGate5PreActivationGuardSmoke.js`",
    "`npm run smoke:oroplay-live-gate-5`",
    "ORO-LIVE-GATE-5 local smoke coverage:",
    "ORO-LIVE-GATE-4 is recorded as closed/pass.",
    "Gate 5 includes controlled activation plan markers.",
    "Gate 5 includes pre-activation guard checklist markers.",
    "Gate 5 includes operator readiness checklist markers.",
    "Gate 5 includes live activation window checklist markers.",
    "Gate 5 includes rollback runbook template markers.",
    "Gate 5 includes monitoring checklist markers.",
    "Gate 5 includes health verification checklist markers.",
    "Gate 5 includes approval requirement markers for Gate 6.",
  ]);
}

function assertPackageRegistration() {
  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-live-gate-5"],
    "node src/local-smoke-tests/oroplayLiveGate5PreActivationGuardSmoke.js",
    "package.json missing ORO-LIVE-GATE-5 smoke script."
  );
}

function assertStaticScans() {
  for (const file of STATIC_SCAN_FILES) {
    const text = readRequired(file);
    assertNoSecretLiteralValues(file, text);
    assertNoUnsafePlaceholderCopy(file, text);
    assertNoLiveClaim(file, text);
    assertNoImmediateEnablementCommand(file, text);
  }
}

function main() {
  const liveReadiness = readRequired(LIVE_READINESS_DOC);
  const currentStatus = readRequired(CURRENT_STATUS_DOC);
  const integrationPlan = readRequired(INTEGRATION_PLAN_DOC);
  const smokeCoverage = readRequired(SMOKE_COVERAGE_DOC);

  assertLiveReadinessDoc(liveReadiness);
  console.log("ORO-LIVE-GATE-5 live readiness doc contract: PASS");

  assertCurrentStatusDoc(currentStatus);
  console.log("ORO-LIVE-GATE-5 current status contract: PASS");

  assertIntegrationPlanDoc(integrationPlan);
  console.log("ORO-LIVE-GATE-5 integration plan contract: PASS");

  assertSmokeCoverageDoc(smokeCoverage);
  console.log("ORO-LIVE-GATE-5 smoke coverage contract: PASS");

  assertPackageRegistration();
  console.log("ORO-LIVE-GATE-5 package registration: PASS");

  assertStaticScans();
  console.log("ORO-LIVE-GATE-5 static safety scan: PASS");

  console.log("ORO-LIVE-GATE-5 controlled activation plan / pre-activation guard smoke: PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("ORO-LIVE-GATE-5 controlled activation plan / pre-activation guard smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
};
