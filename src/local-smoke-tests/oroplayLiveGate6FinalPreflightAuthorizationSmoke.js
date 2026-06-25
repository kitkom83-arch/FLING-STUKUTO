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
const SMOKE_FILE = "src/local-smoke-tests/oroplayLiveGate6FinalPreflightAuthorizationSmoke.js";
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
  const isSmokeFile = /oroplayLiveGate6FinalPreflightAuthorizationSmoke\.js$/.test(label);
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
    /oroplayLiveGate6FinalPreflightAuthorizationSmoke\.js$/.test(label)
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
    ["gate 6", "is live"].join(" "),
    ["oroplay-live-gate-6", "is live"].join(" "),
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
    "## ORO-LIVE-GATE-6 Controlled Runtime Enablement Authorization / Final Preflight Gate",
    "ORO-LIVE-GATE-6 is a controlled runtime enablement authorization / final preflight gate only.",
    "### Gate Prerequisites",
    "### Final Authorization Record Template",
    "### Final Preflight Checklist",
    "### Final Operator Sign-Off Checklist",
    "### Rollback Proof Checklist",
    "### Monitoring Proof Checklist",
    "### Health Verification Proof Checklist",
    "### Emergency Abort Criteria",
    "### Gate 7 Handoff Requirements",
    "### Gate 7 Manual Execution Constraints",
    "Gate 7 only may act as the actual controlled runtime enablement gate after Gate 6 approval.",
    "Runtime activation is still not enabled.",
    "Real money is still not enabled.",
    "Real game launch is still not enabled.",
  ]);

  assertNormalizedIncludes("Live readiness safety", text, [
    "oro-live-gate-1 is closed/pass",
    "oro-live-gate-2 is closed/pass",
    "oro-live-gate-3 is closed/pass",
    "oro-live-gate-4 is closed/pass",
    "oro-live-gate-5 is closed/pass",
    "final authorization record",
    "final preflight checklist",
    "rollback proof",
    "monitoring proof",
    "health verification proof",
    "gate 7 must be treated as the actual controlled runtime enablement gate",
  ]);
}

function assertCurrentStatusDoc(text) {
  assertIncludes("Current status doc", text, [
    "ORO-LIVE-GATE-5 is closed/pass as the controlled activation plan / pre-activation guard gate only.",
    "ORO-LIVE-GATE-6 is current as the controlled runtime enablement authorization / final preflight gate only.",
    "Live runtime activation is still pending Gate 7 and is not enabled.",
    "Actual controlled runtime enablement must remain a separate Gate 7 after Gate 6 approval.",
  ]);
}

function assertIntegrationPlanDoc(text) {
  assertIncludes("Integration plan doc", text, [
    "## ORO-LIVE-GATE-6 Current",
    "ORO-LIVE-GATE-1 closed/pass. ORO-LIVE-GATE-2 closed/pass. ORO-LIVE-GATE-3 closed/pass. ORO-LIVE-GATE-4 closed/pass. ORO-LIVE-GATE-5 closed/pass. ORO-LIVE-GATE-6 current.",
    "ORO-LIVE-GATE-6 is the controlled runtime enablement authorization / final preflight gate only.",
    "Gate 7 only may act as the actual controlled runtime enablement gate if Gate 6 passes.",
  ]);
}

function assertSmokeCoverageDoc(text) {
  assertIncludes("Smoke coverage doc", text, [
    "`oroplayLiveGate6FinalPreflightAuthorizationSmoke.js`",
    "`npm run smoke:oroplay-live-gate-6`",
    "ORO-LIVE-GATE-6 local smoke coverage:",
    "ORO-LIVE-GATE-5 is recorded as closed/pass.",
    "Gate 6 includes final authorization record template markers.",
    "Gate 6 includes final preflight checklist markers.",
    "Gate 6 includes final operator sign-off checklist markers.",
    "Gate 6 includes rollback proof checklist markers.",
    "Gate 6 includes monitoring proof checklist markers.",
    "Gate 6 includes health verification proof checklist markers.",
    "Gate 6 includes exact Gate 7 handoff requirement markers.",
  ]);
}

function assertPackageRegistration() {
  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-live-gate-6"],
    "node src/local-smoke-tests/oroplayLiveGate6FinalPreflightAuthorizationSmoke.js",
    "package.json missing ORO-LIVE-GATE-6 smoke script."
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
  console.log("ORO-LIVE-GATE-6 live readiness doc contract: PASS");

  assertCurrentStatusDoc(currentStatus);
  console.log("ORO-LIVE-GATE-6 current status contract: PASS");

  assertIntegrationPlanDoc(integrationPlan);
  console.log("ORO-LIVE-GATE-6 integration plan contract: PASS");

  assertSmokeCoverageDoc(smokeCoverage);
  console.log("ORO-LIVE-GATE-6 smoke coverage contract: PASS");

  assertPackageRegistration();
  console.log("ORO-LIVE-GATE-6 package registration: PASS");

  assertStaticScans();
  console.log("ORO-LIVE-GATE-6 static safety scan: PASS");

  console.log("ORO-LIVE-GATE-6 final preflight authorization smoke: PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("ORO-LIVE-GATE-6 final preflight authorization smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
};
