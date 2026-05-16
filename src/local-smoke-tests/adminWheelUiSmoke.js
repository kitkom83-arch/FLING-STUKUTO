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

function assertNoUnsafeLogging(js) {
  const logLines = js
    .split(/\r?\n/)
    .filter((line) => /\bconsole\.(log|debug|info|warn|error)\b/.test(line));
  for (const line of logLines) {
    if (/Authorization|JWT|token|secret|password|session/i.test(line)) {
      throw new Error("Admin Wheel UI must not log auth/session/secret markers.");
    }
  }
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

function assertNoFrontendSpinPayload(js) {
  const spinWritePattern = /fetch\([^)]*\/member\/wheel\/spin|api\([^)]*\/member\/wheel\/spin/;
  if (spinWritePattern.test(js)) throw new Error("Admin Wheel UI must not call member spin endpoints.");
  if (/body\s*:\s*\{[^}]*rewardId|body\s*:\s*\{[^}]*prizeIndex/s.test(js)) {
    throw new Error("Admin Wheel UI must not submit rewardId or prizeIndex in write payloads.");
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
    "Admin &gt; Lucky Wheel",
    "Lucky Wheel Admin Console",
    "Staging / Mock Admin Console",
    "No real money / no live provider",
    "Response leak warning",
    "Site code",
    "Last updated",
    "Campaign settings",
    "Current campaign summary",
    "campaign-summary-status",
    "Campaign ID",
    "Campaign name",
    "Cost type",
    "Cost amount",
    "Daily spin limit",
    "Start date",
    "End date",
    "Rules text",
    "Rewards",
    "Sort order",
    "Reward type",
    "Reward value",
    "Probability weight",
    "Stock limit",
    "Stock used",
    "Segment color",
    "Image URL",
    "empty",
    "Status",
    "Actions",
    "Spin history",
    "Reward ID",
    "Cost type",
    "Cost amount",
    "IP masked",
    "User agent hash",
    "Spin ID",
    "Reports",
    "Total spins",
    "Rewards issued",
    "Total point/ticket cost",
    "Stock used",
    "Top reward",
    "Empty/no reward count",
    "Reward type summary",
    "Reward stock usage",
    "Daily spin count",
    "Audit history",
    "Actor/admin",
    "Target type",
    "Target ID",
    "Site code",
    "Before/after summary",
    "Reason",
    "Add reward",
    'id="reward-modal" data-modal="reward" data-testid="reward-modal"',
    'id="status-modal" data-modal="status" data-testid="status-modal"',
    'id="confirm-modal" data-modal="confirm" data-testid="confirm-modal"',
    'data-close-modal="reward-modal" data-testid="reward-modal-close"',
    "ไม่พบข้อมูล",
    "กำลังโหลดข้อมูล",
    "Audit history จะเชื่อมกับ admin audit log endpoint เมื่อพร้อม",
  ]);
  assertIncludes("Admin Wheel JS endpoints", js, [
    "/admin/wheel/config",
    "/admin/wheel/campaign",
    "/admin/wheel/rewards",
    "encodeURIComponent(state.editingReward.id)",
    "encodeURIComponent(reward.id)",
    "/admin/wheel/spins",
    "/admin/audit-logs?limit=100",
  ]);
  assertIncludes("Admin Wheel JS safety", js, [
    "SENSITIVE_KEY_PATTERN",
    "IP_KEY_PATTERN",
    "RAW_IPV4_PATTERN",
    "maskIp",
    "sanitizeValue",
    "normalizeConfig",
    "normalizeReward",
    "normalizeSpin",
    "SafeApiError",
    "กรุณาเข้าสู่ระบบแอดมิน",
    "ไม่มีสิทธิ์ใช้งานเมนู Lucky Wheel",
    "ยังไม่พบข้อมูล Lucky Wheel",
    "validateReason",
    "renderCampaignSummary",
    "บันทึกการตั้งค่าแคมเปญสำเร็จ",
    "บันทึกไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง",
    "โหลดข้อมูลไม่สำเร็จ",
    "remainingStock",
    "spinResultLabel",
    "renderReports",
    "renderRewardTypeSummary",
    "renderDailySpinCount",
    "totalSpins > 0",
    "0 %",
    "openSpinDetail",
    "openAuditDetail",
    "confirmAction",
    "openStatusModal",
    "Edit reward",
    "document.getElementById(button.dataset.closeModal)",
    "WHEEL_AUDIT_ACTIONS",
    "wheel.campaign.update",
    "wheel.reward.create",
    "wheel.reward.update",
    "wheel.reward.status.update",
  ]);
  assertIncludes("Admin Wheel JS validation", js, [
    "Campaign name is required",
    "CAMPAIGN_STATUSES.includes",
    "COST_TYPES.includes",
    "Display value is required",
    "Probability weight must be 0 or more",
    "Stock limit must be blank or 0 or more",
    "Stock limit must be greater than or equal to stock used",
    "#16705d",
  ]);
  assertReasonBeforeWrite(js, "const reason = validateCampaign();", "/admin/wheel/campaign", "Campaign save");
  assertReasonBeforeWrite(js, "const reason = validateReward();", "/admin/wheel/rewards", "Reward save");
  assertNoFrontendSpinSelection(js);
  assertNoFrontendSpinPayload(js);
  assertNoUnsafeLogging(js);
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
