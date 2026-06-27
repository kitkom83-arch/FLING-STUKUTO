const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DOC_PATH = "docs/BACKOFFICE_DEMO_API_MAPPING.md";
const COVERAGE_PATH = "docs/SMOKE_COVERAGE.md";

function readRequired(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  assert(fs.existsSync(filePath), `${relativePath} must exist.`);
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function main() {
  const doc = readRequired(DOC_PATH);
  const pkg = JSON.parse(readRequired("package.json"));
  const coverage = readRequired(COVERAGE_PATH);

  assertIncludes("Mapping doc headings", doc, [
    "# BACKOFFICE_DEMO_API_MAPPING",
    "## Mapping Table",
    "| Demo menu/page | UI intent | Existing PG77 route/API | Existing controller/service | Existing admin UI surface | Status | Risk/safety notes | Recommended next phase |",
  ]);

  assertIncludes("Mapping doc status labels", doc, [
    "`READY_TO_CONNECT`",
    "`PARTIAL`",
    "`MOCK_ONLY`",
    "`MISSING_BACKEND`",
    "`OUT_OF_SCOPE_NOW`",
  ]);

  assertIncludes("Lucky Wheel route mapping", doc, [
    "GET /api/admin/wheel/config",
    "PATCH /api/admin/wheel/campaign",
    "POST /api/admin/wheel/rewards",
    "PATCH /api/admin/wheel/rewards/:id",
    "GET /api/member/wheel/config",
    "POST /api/member/wheel/spin",
    "GET /api/member/wheel/history",
    "GET /api/member/wheel/my-rewards",
    "Member spin payload must remain `{ campaignId }`.",
    "Frontend must not choose the reward result itself.",
  ]);

  assertIncludes("Demo reference warning markers", doc, [
    "`New project.zip` is a static UI/mock reference only, not a backend source.",
    "Do not copy demo files over the real app",
    "do not import the zip into this repo",
  ]);

  assertIncludes("Safety boundary markers", doc, [
    "no production DB",
    "no live provider",
    "no live payment/bank/SMS/slip OCR path",
    "no deploy",
  ]);

  assert.strictEqual(
    pkg.scripts["smoke:backoffice-demo-api-mapping"],
    "node src/local-smoke-tests/backofficeDemoApiMappingSmoke.js",
    "package.json missing smoke:backoffice-demo-api-mapping script."
  );

  assertIncludes("Smoke coverage entry", coverage, [
    "backofficeDemoApiMappingSmoke.js",
    "smoke:backoffice-demo-api-mapping",
    "Backoffice demo API mapping contract smoke",
  ]);

  assertIncludes("Smoke coverage section", coverage, [
    "## 17C. smoke:backoffice-demo-api-mapping Coverage",
    "New project.zip is a UI/mock reference only and not a backend source of truth.",
  ]);

  console.log("Backoffice demo API mapping doc exists: PASS");
  console.log("Backoffice demo API mapping status labels: PASS");
  console.log("Backoffice demo API mapping Lucky Wheel routes: PASS");
  console.log("Backoffice demo API mapping safety warnings: PASS");
  console.log("Backoffice demo API mapping package/docs wiring: PASS");
  console.log("Backoffice demo API mapping smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Backoffice demo API mapping smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
