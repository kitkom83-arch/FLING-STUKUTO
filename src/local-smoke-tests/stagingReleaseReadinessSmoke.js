const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PACKAGE_JSON = path.join(ROOT, "package.json");
const DOCS = [
  "docs/STAGING_RELEASE_RUNBOOK.md",
  "docs/STAGING_DEPLOY.md",
  "docs/STAGING_UAT.md",
  "docs/SMOKE_COVERAGE.md",
  "docs/ADMIN_OPERATOR_HANDOFF_FINAL.md",
];
const RELATED_SCAN_FILES = [
  ...DOCS,
  "package.json",
  "src/staging-scripts/stagingReleaseGateSmoke.js",
  "src/staging-scripts/stagingUatSmoke.js",
  "src/staging-scripts/stagingRolePermissionUatSmoke.js",
  "src/local-smoke-tests/adminOperatorHandoffSmoke.js",
  "src/local-smoke-tests/adminBrowserRoutesSmoke.js",
  "src/local-smoke-tests/stagingReleaseReadinessSmoke.js",
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function assertPolicyEquivalent(label, text, pattern, description) {
  assert(pattern.test(normalize(text)), `${label} missing policy: ${description}`);
}

function stripAllowedChecklistCopy(text) {
  return String(text || "")
    .replace(/No `undefined`, `NaN`, or `\[object Object\]` appears[^\n]*/g, "")
    .replace(/no `undefined`, `NaN`, or `\[object Object\]` appears[^\n]*/gi, "")
    .replace(/Confirm no `undefined`, `NaN`, `\[object Object\]`[^\n]*/g, "")
    .replace(/Confirms rendered HTML has no `undefined`, `NaN`, `\[object Object\]`[^\n]*/g, "")
    .replace(/no visible `NaN`, `undefined`, or `\[object Object\]`[^\n]*/gi, "")
    .replace(/no unexpected `undefined`, `NaN`, or `\[object Object\]`[^\n]*/gi, "")
    .replace(/without `NaN` or `undefined`[^\n]*/gi, "")
    .replace(/never show `NaN`, `undefined`[^\n]*/gi, "")
    .replace(/never show `NaN` or `undefined`[^\n]*/gi, "")
    .replace(/ไม่พบ `undefined`, `NaN`, หรือ `\[object Object\]`[^\n]*/g, "");
}

function assertNoUnexpectedPlaceholderCopy(label, text) {
  const scanned = stripAllowedChecklistCopy(text);
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    assert(!scanned.includes(marker), `${label} contains unexpected placeholder copy: ${marker}`);
  }
}

function assertNoSecretShapedValues(label, text) {
  const scanned = String(text || "");
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const bearerValue = /\bBearer\s+[A-Za-z0-9._-]{12,}/i;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const mongoConnection = /mongodb(?:\+srv)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const openAiKey = new RegExp(`\\b${["s", "k", "-"].join("")}[A-Za-z0-9_-]{16,}\\b`);
  const rawConnectionString = /\b(?:mysql|redis):\/\/[^:\s/]+:[^@\s/]+@/i;

  assert(!jwtLike.test(scanned), `${label} contains a JWT-shaped value.`);
  assert(!bearerValue.test(scanned), `${label} contains a bearer credential value.`);
  assert(!postgresWithCredentials.test(scanned), `${label} contains a PostgreSQL credential URL.`);
  assert(!mongoConnection.test(scanned), `${label} contains a MongoDB credential URL.`);
  assert(!openAiKey.test(scanned), `${label} contains an API key-shaped value.`);
  assert(!rawConnectionString.test(scanned), `${label} contains a raw credential connection string.`);
}

function assertPackageScripts() {
  const pkg = JSON.parse(read("package.json"));
  const scripts = pkg.scripts || {};
  assert.strictEqual(
    scripts["smoke:staging-release-gate"],
    "node src/staging-scripts/stagingReleaseGateSmoke.js",
    "package.json missing smoke:staging-release-gate script."
  );
  assert.strictEqual(
    scripts["smoke:staging-uat"],
    "node src/staging-scripts/stagingUatSmoke.js",
    "package.json missing smoke:staging-uat script."
  );
  assert.strictEqual(
    scripts["smoke:staging-role-permission-uat"],
    "node src/staging-scripts/stagingRolePermissionUatSmoke.js",
    "package.json missing smoke:staging-role-permission-uat script."
  );
  assert.strictEqual(
    scripts["smoke:admin-operator-handoff"],
    "node src/local-smoke-tests/adminOperatorHandoffSmoke.js",
    "package.json missing smoke:admin-operator-handoff script."
  );
  assert.strictEqual(
    scripts["smoke:staging-release-readiness"],
    "node src/local-smoke-tests/stagingReleaseReadinessSmoke.js",
    "package.json missing smoke:staging-release-readiness script."
  );
  assert(
    String(scripts.check || "").includes("node --check src/staging-scripts/stagingReleaseGateSmoke.js"),
    "npm run check must syntax-check stagingReleaseGateSmoke.js."
  );
  assert(
    String(scripts.check || "").includes("node --check src/local-smoke-tests/stagingReleaseReadinessSmoke.js"),
    "npm run check must syntax-check stagingReleaseReadinessSmoke.js."
  );
}

function assertDocsExist() {
  for (const doc of DOCS) {
    assert(fs.existsSync(path.join(ROOT, doc)), `${doc} must exist.`);
  }
}

function assertRunbookPolicy() {
  const runbook = read("docs/STAGING_RELEASE_RUNBOOK.md");
  assertPolicyEquivalent(
    "runbook",
    runbook,
    /release gate\s*=\s*run after every deploy|run after every staging deploy/,
    "Release gate run after every deploy"
  );
  assertPolicyEquivalent(
    "runbook",
    runbook,
    /full uat\s*=\s*run after seed\/reset|run only after seed reset/,
    "Full UAT run after seed/reset"
  );
  assertPolicyEquivalent("runbook", runbook, /role permission uat/, "Role Permission UAT");
  assertIncludes("runbook commands", runbook, [
    "npm run smoke:staging-release-gate",
    "npm run smoke:staging-uat",
    "npm run smoke:staging-role-permission-uat",
    "npm install && npx prisma generate",
    "npm start",
  ]);
  assertPolicyEquivalent("runbook", runbook, /seed command\s*=\s*temporary only|seed command is temporary only/, "seed temporary only");
  assertPolicyEquivalent(
    "runbook",
    runbook,
    /change render start command back to `npm start`|start command back to `npm start`/,
    "after seed set Start Command back to npm start"
  );
  assertPolicyEquivalent("runbook", runbook, /rollback checklist/, "rollback checklist");
  assertPolicyEquivalent("runbook", runbook, /incident checklist/, "incident checklist");
}

function assertSafetyWording() {
  const combined = DOCS.map(read).join("\n");
  const normalized = normalize(combined);
  assert(normalized.includes("no production db") || normalized.includes("no production database"), "docs must state no production DB.");
  assert(normalized.includes("no real money"), "docs must state no real money.");
  assert(
    /no live provider[,/ ]+payment[,/ ]+bank[,/ ]+sms[,/ ]+or slip ocr|no live provider\/payment\/bank\/sms\/slip ocr/.test(
      normalized
    ),
    "docs must state no live provider/payment/bank/SMS/Slip OCR."
  );
  assert(/no secret leak|secret leak/.test(normalized), "docs must mention secret leak safety.");
  assert(
    /does not consume member wheel spin|does not consume a member wheel spin|ไม่ consume member wheel spin/.test(
      normalized
    ),
    "docs must state release gate does not consume member spin."
  );
}

function assertStaticSecretScan() {
  for (const file of RELATED_SCAN_FILES) {
    const text = read(file);
    if (file.startsWith("docs/")) assertNoUnexpectedPlaceholderCopy(file, text);
    assertNoSecretShapedValues(file, text);
  }
}

function main() {
  assertPackageScripts();
  console.log("Release readiness scripts: PASS");

  assertDocsExist();
  console.log("Release readiness docs exist: PASS");

  assertRunbookPolicy();
  console.log("Release readiness policy: PASS");

  assertSafetyWording();
  console.log("Release readiness safety wording: PASS");

  assertStaticSecretScan();
  console.log("Release readiness static secret scan: PASS");

  console.log("Staging release readiness smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Staging release readiness smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
