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
const SMOKE_FILE = "src/local-smoke-tests/oroplayLiveGate10ACommandPacketDryRunSmoke.js";
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
  const isThisSmokeFile = /oroplayLiveGate10ACommandPacketDryRunSmoke\.js$/.test(label);
  const scanned =
    label === "package.json"
      ? packageJsonSecretScanText(text)
      : isThisSmokeFile
        ? normalizeLocalScriptNameLiterals(text)
        : gate10AScopedText(label, text);
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

function gate10AScopedText(label, text) {
  const scanned = String(text || "");
  const gate10AHeading = "## ORO-LIVE-GATE-10A";
  if (label === "package.json") {
    const pkg = JSON.parse(scanned);
    return String((pkg.scripts && pkg.scripts["smoke:oroplay-live-gate-10a"]) || "");
  }

  if (!/^docs\//.test(label) && !/^docs\\/.test(label)) {
    return scanned;
  }

  const start = scanned.indexOf(gate10AHeading);
  if (start === -1) {
    return scanned;
  }

  const next = scanned.indexOf("\n## ", start + gate10AHeading.length);
  return next === -1 ? scanned.slice(start) : scanned.slice(start, next);
}

function assertNoExecutableEnablementCommand(label, text) {
  const scanned = /oroplayLiveGate10ACommandPacketDryRunSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : gate10AScopedText(label, text);
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
  const scanned = /oroplayLiveGate10ACommandPacketDryRunSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : gate10AScopedText(label, text);
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
  const lower = normalize(gate10AScopedText(label, text));
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
    "## ORO-LIVE-GATE-10A Final Runtime Enablement Execution Command Packet Dry-Run Gate",
    "ORO-LIVE-GATE-10A is the final runtime enablement execution command packet dry-run gate only.",
    "### Gate 10A Prerequisites",
    "### Final Command Packet Review Checklist",
    "### Dry-Run / Rehearsal Checklist",
    "### Operator Confirmation Checklist",
    "### Rollback Command Review Checklist",
    "### Monitoring Command Review Checklist",
    "### Evidence Capture Checklist",
    "### Pre-Execution No-Go Checklist",
    "### Emergency Abort Criteria",
    "### Post-Command Expected Evidence Checklist",
    "### Gate 10B Handoff Requirements",
    "Gate 10B only may act as the actual controlled runtime enablement execution gate after Gate 10A approval and separate explicit user approval.",
  ]);

  assertNormalizedIncludes("Live readiness Gate 10A safety", text, [
    "oro-live-gate-7 is closed/pass",
    "oro-live-gate-8 is closed/pass",
    "oro-live-gate-9 is closed/pass",
    "final command packet review checklist",
    "dry-run / rehearsal checklist",
    "operator confirmation checklist",
    "rollback command review checklist",
    "monitoring command review checklist",
    "evidence capture checklist",
    "pre-execution no-go checklist",
    "emergency abort criteria",
    "post-command expected evidence checklist",
    "gate 10b handoff requirements",
    "gate 10a is command packet review / dry-run / rehearsal only",
    "actual controlled runtime enablement execution gate",
    "live runtime activation is still not enabled",
    "live transactional traffic is still not enabled",
    "real money is still not enabled",
    "real game launch is still not enabled",
  ]);
}

function assertCurrentStatusDoc(text) {
  assertIncludes("Current status doc", text, [
    "ORO-LIVE-GATE-9 is closed/pass as the final runtime enablement operator hold / execution approval boundary.",
    "ORO-LIVE-GATE-10A is current as the final runtime enablement execution command packet dry-run gate only.",
    "Live runtime activation is still pending Gate 10B and is not enabled.",
    "Gate 10A must keep command packet dry-run/rehearsal review separate from actual controlled runtime enablement execution",
    "Gate 10B only may act as the actual controlled runtime enablement execution gate if Gate 10A passes and receives separate explicit user approval.",
  ]);
}

function assertIntegrationPlanDoc(text) {
  assertIncludes("Integration plan doc", text, [
    "## ORO-LIVE-GATE-10A Current",
    "ORO-LIVE-GATE-7 closed/pass. ORO-LIVE-GATE-8 closed/pass. ORO-LIVE-GATE-9 closed/pass. ORO-LIVE-GATE-10A current. ORO-LIVE-GATE-10A is the final runtime enablement execution command packet dry-run gate only.",
    "Gate 10A is command packet dry-run/rehearsal only and is separate from actual controlled runtime enablement execution.",
    "Gate 10B only may act as the actual controlled runtime enablement execution gate if Gate 10A passes and receives separate explicit user approval.",
  ]);
}

function assertSmokeCoverageDoc(text) {
  assertIncludes("Smoke coverage doc", text, [
    "`oroplayLiveGate10ACommandPacketDryRunSmoke.js`",
    "`npm run smoke:oroplay-live-gate-10a`",
    "ORO-LIVE-GATE-10A local smoke coverage:",
    "ORO-LIVE-GATE-7 is recorded as closed/pass.",
    "ORO-LIVE-GATE-8 is recorded as closed/pass.",
    "ORO-LIVE-GATE-9 is recorded as closed/pass.",
    "ORO-LIVE-GATE-10A is recorded as the final runtime enablement execution command packet dry-run gate.",
    "Gate 10A includes final command packet review checklist markers.",
    "Gate 10A includes dry-run/rehearsal checklist markers.",
    "Gate 10A includes operator confirmation checklist markers.",
    "Gate 10A includes rollback command review checklist markers.",
    "Gate 10A includes monitoring command review checklist markers.",
    "Gate 10A includes evidence capture checklist markers.",
    "Gate 10A includes pre-execution no-go checklist markers.",
    "Gate 10A includes emergency abort criteria markers.",
    "Gate 10A includes post-command expected evidence checklist markers.",
    "Gate 10A includes explicit Gate 10B handoff requirement markers.",
    "No actual live enablement command.",
  ]);
}

function assertPackageRegistration() {
  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-live-gate-10a"],
    "node src/local-smoke-tests/oroplayLiveGate10ACommandPacketDryRunSmoke.js",
    "package.json missing ORO-LIVE-GATE-10A smoke script."
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
  console.log("ORO-LIVE-GATE-10A live readiness doc contract: PASS");

  assertCurrentStatusDoc(currentStatus);
  console.log("ORO-LIVE-GATE-10A current status contract: PASS");

  assertIntegrationPlanDoc(integrationPlan);
  console.log("ORO-LIVE-GATE-10A integration plan contract: PASS");

  assertSmokeCoverageDoc(smokeCoverage);
  console.log("ORO-LIVE-GATE-10A smoke coverage contract: PASS");

  assertPackageRegistration();
  console.log("ORO-LIVE-GATE-10A package registration: PASS");

  assertStaticScans();
  console.log("ORO-LIVE-GATE-10A static safety scan: PASS");

  console.log("ORO-LIVE-GATE-10A command packet dry-run smoke: PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("ORO-LIVE-GATE-10A command packet dry-run smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
};
