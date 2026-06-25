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
const SMOKE_FILE = "src/local-smoke-tests/oroplayLiveGate8ControlledRuntimeEnablementSmoke.js";
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
  const isThisSmokeFile = /oroplayLiveGate8ControlledRuntimeEnablementSmoke\.js$/.test(label);
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

  assert(!lower.includes(["postgres", "://"].join("")), label + " contains database URL protocol.");
  assert(!lower.includes(["postgres", "ql://"].join("")), label + " contains database URL protocol.");
  assert(!authorizationLiteral.test(scanned), label + " contains authorization header literal.");
  assert(!authSchemeLiteral.test(scanned), label + " contains auth scheme literal.");
  assert(!/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/.test(scanned), label + " contains JWT-shaped value.");
  assert(!apiKeyShape.test(scanned), label + " contains API-key-shaped value.");
  assert(!secretAssignment.test(scanned), label + " contains secret-like assignment.");
}

function assertNoUnsafePlaceholderCopy(label, text) {
  const scanned = String(text || "");
  const unsafeMarkers = [["un", "defined"].join(""), ["N", "aN"].join(""), ["[object", " Object]"].join("")];
  for (const marker of unsafeMarkers) {
    assert(!scanned.includes(marker), label + " contains unsafe placeholder copy: " + marker);
  }
}

function assertNoExecutableEnablementCommand(label, text) {
  const scanned = /oroplayLiveGate8ControlledRuntimeEnablementSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : String(text || "");
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
  const scanned = /oroplayLiveGate8ControlledRuntimeEnablementSmoke\.js$/.test(label)
    ? normalizeLocalScriptNameLiterals(text)
    : gate8ScopedText(label, text);
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

function gate8ScopedText(label, text) {
  const scanned = String(text || "");
  const gate8Heading = "## ORO-LIVE-GATE-8";
  if (label === "package.json") {
    const pkg = JSON.parse(scanned);
    return String((pkg.scripts && pkg.scripts["smoke:oroplay-live-gate-8"]) || "");
  }

  if (!/^docs\//.test(label) && !/^docs\\/.test(label)) {
    return scanned;
  }

  const start = scanned.indexOf(gate8Heading);
  if (start === -1) {
    return scanned;
  }

  const next = scanned.indexOf("\n## ", start + gate8Heading.length);
  return next === -1 ? scanned.slice(start) : scanned.slice(start, next);
}

function assertNoEnabledClaims(label, text) {
  const lower = normalize(text);
  const forbidden = [
    ["runtime activation", "is enabled"].join(" "),
    ["live runtime", "is enabled"].join(" "),
    ["live transactional traffic", "is enabled"].join(" "),
    ["real money", "is enabled"].join(" "),
    ["real game launch", "is enabled"].join(" "),
    ["live transaction test", "approved"].join(" "),
  ];

  for (const marker of forbidden) {
    assert(!lower.includes(marker), label + " contains forbidden enabled-claim marker: " + marker);
  }
}

function assertLiveReadinessDoc(text) {
  assertIncludes("Live readiness doc", text, [
    "## ORO-LIVE-GATE-8 Controlled Runtime Enablement Gate",
    "ORO-LIVE-GATE-8 is the controlled runtime enablement gate.",
    "### Gate 8 Prerequisites",
    "### Gate 8 Human Hold Point Before Runtime Command",
    "### Gate 8 Manual Operator Execution Boundary",
    "### Gate 8 Rollback Steps",
    "### Gate 8 Monitoring Steps",
    "### Gate 8 Post-Enable Verification",
    "### Gate 8 Live Transaction Test Separation",
    "### Gate 8 Prohibited Actions",
    "### Gate 8 Outcome",
  ]);

  assertNormalizedIncludes("Live readiness Gate 8 safety", text, [
    "oro-live-gate-7 is closed/pass",
    "human hold point before runtime command",
    "rollback steps",
    "monitoring steps",
    "post-enable verification",
    "runtime enablement is separate from live transaction testing",
    "no deposit",
    "no withdraw",
    "no withdraw-all",
    "no launch game",
    "no create user",
    "provider mutation endpoint",
    "separate explicit user approval",
    "manual operator execution",
  ]);
}

function assertCurrentStatusDoc(text) {
  assertIncludes("Current status doc", text, [
    "ORO-LIVE-GATE-7 is closed/pass as the controlled runtime enablement command review / manual execution packet gate only.",
    "ORO-LIVE-GATE-8 is current as the controlled runtime enablement gate.",
    "Live runtime enablement is pending manual operator execution and is not enabled from local/CI.",
    "Live transactional traffic remains off until a separate user approval is issued for a live transaction test.",
  ]);
}

function assertIntegrationPlanDoc(text) {
  assertIncludes("Integration plan doc", text, [
    "## ORO-LIVE-GATE-8 Current",
    "ORO-LIVE-GATE-7 closed/pass. ORO-LIVE-GATE-8 current. ORO-LIVE-GATE-8 is the controlled runtime enablement gate.",
    "Gate 8 is enablement-only and separates runtime enablement from any live transaction test.",
    "Any live transaction test after runtime enablement requires a separate explicit user approval and a separate evidence packet.",
  ]);
}

function assertSmokeCoverageDoc(text) {
  assertIncludes("Smoke coverage doc", text, [
    "`oroplayLiveGate8ControlledRuntimeEnablementSmoke.js`",
    "`npm run smoke:oroplay-live-gate-8`",
    "ORO-LIVE-GATE-8 local smoke coverage:",
    "ORO-LIVE-GATE-7 is recorded as closed/pass.",
    "ORO-LIVE-GATE-8 is recorded as a controlled runtime enablement gate.",
    "Gate 8 includes a human hold point before any runtime command.",
    "Gate 8 includes rollback steps.",
    "Gate 8 includes monitoring steps.",
    "Gate 8 includes post-enable verification.",
    "Gate 8 separates runtime enablement from live transaction testing.",
    "No env secret read.",
  ]);
}

function assertPackageRegistration() {
  const pkg = JSON.parse(readRequired(PACKAGE_JSON));
  assert.strictEqual(
    pkg.scripts["smoke:oroplay-live-gate-8"],
    "node src/local-smoke-tests/oroplayLiveGate8ControlledRuntimeEnablementSmoke.js",
    "package.json missing ORO-LIVE-GATE-8 smoke script."
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
  console.log("ORO-LIVE-GATE-8 live readiness doc contract: PASS");

  assertCurrentStatusDoc(currentStatus);
  console.log("ORO-LIVE-GATE-8 current status contract: PASS");

  assertIntegrationPlanDoc(integrationPlan);
  console.log("ORO-LIVE-GATE-8 integration plan contract: PASS");

  assertSmokeCoverageDoc(smokeCoverage);
  console.log("ORO-LIVE-GATE-8 smoke coverage contract: PASS");

  assertPackageRegistration();
  console.log("ORO-LIVE-GATE-8 package registration: PASS");

  assertStaticScans();
  console.log("ORO-LIVE-GATE-8 static safety scan: PASS");

  console.log("ORO-LIVE-GATE-8 controlled runtime enablement smoke: PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("ORO-LIVE-GATE-8 controlled runtime enablement smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
};
