const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const HTML_PATH = path.join(ROOT, "src", "admin-wheel-ui", "index.html");
const JS_PATH = path.join(ROOT, "src", "admin-wheel-ui", "app.js");
const CSS_PATH = path.join(ROOT, "src", "admin-wheel-ui", "styles.css");
const APP_PATH = path.join(ROOT, "src", "app.js");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) throw new Error(`${label} missing marker: ${marker}`);
  }
}

function assertNoStaticSecret(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  if (jwtLike.test(text)) throw new Error(`${label} contains a JWT-like static value.`);
  if (postgresWithCredentials.test(text)) throw new Error(`${label} contains a PostgreSQL credential URL.`);
  if (/DATABASE_URL\s*=|LOCAL_ADMIN_PASSWORD\s*=|JWT_SECRET\s*=/.test(text)) throw new Error(`${label} contains an env assignment marker.`);
}

function assertReasonBeforeWrite(js, reasonMarker, writeMarker, label) {
  const reasonIndex = js.indexOf(reasonMarker);
  const writeIndex = js.indexOf(writeMarker);
  if (reasonIndex === -1 || writeIndex === -1 || reasonIndex > writeIndex) {
    throw new Error(`${label} must validate reason before write API call.`);
  }
}

function assertNoFrontendSpinSelection(js) {
  const forbidden = [
    "Math.random",
    "crypto.getRandomValues",
    "/member/wheel/spin",
    "body: { campaignId",
    "campaignId: \"wheel_main\"",
  ];
  for (const marker of forbidden) {
    if (js.includes(marker)) throw new Error(`Admin Wheel UI must not contain frontend spin selection marker: ${marker}`);
  }
}

function main() {
  const html = read(HTML_PATH);
  const js = read(JS_PATH);
  const css = read(CSS_PATH);
  const app = read(APP_PATH);

  assertIncludes("Express app", app, ["/admin/lucky-wheel", "admin-wheel-ui"]);
  assertIncludes("Admin Wheel HTML", html, [
    "Admin Lucky Wheel",
    "Admin &gt; Services",
    "Lucky Wheel",
    "Campaign settings",
    "Rewards",
    "Spin history",
    "Reports",
    "Audit history",
    "Reason",
    "Create reward",
    "ไม่พบข้อมูล",
    "Audit history จะเชื่อมกับ admin audit log endpoint เมื่อพร้อม",
  ]);
  assertIncludes("Admin Wheel JS endpoints", js, [
    "/admin/wheel/config",
    "/admin/wheel/campaign",
    "/admin/wheel/rewards",
    "/admin/wheel/spins",
    "/admin/audit-logs?limit=100",
  ]);
  assertIncludes("Admin Wheel JS safety", js, [
    "SENSITIVE_KEY_PATTERN",
    "sanitizeValue",
    "validateReason",
    "บันทึกการตั้งค่าแคมเปญสำเร็จ",
    "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง",
    "โหลดข้อมูลไม่สำเร็จ",
    "remainingStock",
    "renderReports",
    "openSpinDetail",
    "openAuditDetail",
    "Edit reward",
    "WHEEL_AUDIT_ACTIONS",
  ]);
  assertReasonBeforeWrite(js, "const reason = validateCampaign();", "/admin/wheel/campaign", "Campaign save");
  assertReasonBeforeWrite(js, "const reason = validateReward();", "/admin/wheel/rewards", "Reward save");
  assertNoFrontendSpinSelection(js);
  assertIncludes("Admin Wheel CSS", css, [".tab-button.active", ".summary-grid", ".table-section", ".badge", ".safe-json"]);
  assertNoStaticSecret("Admin Wheel HTML", html);
  assertNoStaticSecret("Admin Wheel JS", js);
  assertNoStaticSecret("Admin Wheel CSS", css);

  console.log("Admin Wheel UI static route contract: PASS");
  console.log("Admin Wheel UI endpoint contract: PASS");
  console.log("Admin Wheel UI reason validation contract: PASS");
  console.log("Admin Wheel UI frontend spin safety: PASS");
  console.log("Admin Wheel UI smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Admin Wheel UI smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
