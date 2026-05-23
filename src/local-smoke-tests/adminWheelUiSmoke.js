const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const HTML_PATH = path.join(ROOT, "src", "admin-wheel-ui", "index.html");
const JS_PATH = path.join(ROOT, "src", "admin-wheel-ui", "app.js");
const CSS_PATH = path.join(ROOT, "src", "admin-wheel-ui", "styles.css");
const APP_PATH = path.join(ROOT, "src", "app.js");
const ADMIN_ROUTES_PATH = path.join(ROOT, "src", "routes", "admin.routes.js");
const PERMISSION_PATH = path.join(ROOT, "src", "services", "adminPermission.service.js");
const WHEEL_SERVICE_PATH = path.join(ROOT, "src", "services", "wheel.service.js");
const AUDIT_CONTROLLER_PATH = path.join(ROOT, "src", "controllers", "adminAudit.controller.js");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    if (!text.includes(marker)) throw new Error(`${label} missing marker: ${marker}`);
  }
}

function visibleTextFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function assertNoRenderedPlaceholderText(label, html) {
  const rendered = visibleTextFromHtml(html);
  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    if (rendered.includes(marker)) throw new Error(`${label} rendered placeholder text: ${marker}`);
  }
}

function assertNoStaticSecret(label, text) {
  const jwtLike = /\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
  const postgresWithCredentials = /postgres(?:ql)?:\/\/[^:\s/]+:[^@\s/]+@/i;
  const forbiddenEnvAssignment = /DATABASE_URL\s*=|LOCAL_ADMIN_PASSWORD\s*=|JWT_SECRET\s*=|AUTHORIZATION\s*=/i;
  if (jwtLike.test(text)) throw new Error(`${label} contains a JWT-like static value.`);
  if (postgresWithCredentials.test(text)) throw new Error(`${label} contains a PostgreSQL credential URL.`);
  if (forbiddenEnvAssignment.test(text)) throw new Error(`${label} contains a sensitive env assignment marker.`);
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

function assertNoFrontendPrizeDecision(js) {
  const forbidden = [
    "Math.random",
    "crypto.getRandomValues",
    "/member/wheel/spin",
    "rewardId: \"wheel_reward",
  ];
  for (const marker of forbidden) {
    if (js.includes(marker)) throw new Error(`Admin Wheel UI must not contain frontend prize decision marker: ${marker}`);
  }
  if (/body\s*:\s*\{[^}]*rewardId|body\s*:\s*\{[^}]*prizeIndex/s.test(js)) {
    throw new Error("Admin Wheel UI must not submit rewardId or prizeIndex in write payloads.");
  }
}

function assertNoAdminForceControls(html, js) {
  const rendered = visibleTextFromHtml(html);
  if (/\b(force reward|force spin|set prizeIndex)\b/i.test(rendered)) {
    throw new Error("Admin Wheel UI must not render force reward/spin controls.");
  }
  if (/force reward|force spin|set prizeIndex/i.test(js)) {
    throw new Error("Admin Wheel UI must not define force reward/spin controls.");
  }
}

function main() {
  const html = read(HTML_PATH);
  const js = read(JS_PATH);
  const css = read(CSS_PATH);
  const app = read(APP_PATH);
  const adminRoutes = read(ADMIN_ROUTES_PATH);
  const permissions = read(PERMISSION_PATH);
  const wheelService = read(WHEEL_SERVICE_PATH);
  const auditController = read(AUDIT_CONTROLLER_PATH);

  assertIncludes("Express app", app, ["/admin-wheel", "/admin/lucky-wheel", "admin-wheel-ui"]);

  assertIncludes("Admin Wheel five sections", html, [
    "Campaign settings",
    "Rewards management",
    "Spin history",
    "Reports",
    "Audit history",
  ]);
  if (/data-tab="claims"/.test(html)) throw new Error("Admin Wheel UI must expose five main tabs only.");

  assertIncludes("Campaign settings", html + js, [
    "campaign-status",
    "campaign-name",
    "campaign-cost-type",
    '<option value="point">point</option>',
    '<option value="ticket">ticket</option>',
    '<option value="free">free</option>',
    "campaign-cost-amount",
    "campaign-daily-limit",
    "campaign-monthly-limit",
    "campaign-start",
    "campaign-end",
    "campaign-rules",
    "campaign-reason",
    "Save Campaign",
    "wheel.campaign.update",
  ]);

  assertIncludes("Rewards management", html + js, [
    "Sort order",
    "Label",
    "Reward type",
    "Reward value",
    "Probability weight",
    "Stock limit",
    "Stock used",
    "Segment color",
    "Image URL",
    "Status",
    "Actions",
    '<option value="credit">credit</option>',
    '<option value="point">point</option>',
    '<option value="ticket">ticket</option>',
    '<option value="physical">physical</option>',
    '<option value="no_reward">no_reward</option>',
    "Add reward",
    "Edit reward",
    "Disable",
    "Enable",
    "reward-reason",
    "Label is required",
    "Probability weight must be 0 or more",
    "Stock limit must be blank or 0 or more",
    "wheel.reward.create",
    "wheel.reward.update",
    "wheel.reward.enable",
    "wheel.reward.disable",
  ]);

  assertIncludes("Spin history", html + js, [
    "Date from",
    "Date to",
    "Member username/member ID",
    "Reward ID",
    "Campaign ID",
    "Status/result",
    "spin id",
    "member id",
    "campaign id",
    "reward id",
    "result snapshot",
    "ip masked",
    "user agent hash",
    "created at",
  ]);

  assertIncludes("Reports", html + js, [
    "Total spins",
    "Total cost used",
    "Total rewards issued",
    "Reward stock used",
    "Top reward",
    "No reward count",
    "Reward summary",
    "Spin count",
    "Probability weight",
    "Actual percent",
    "Remaining stock",
    "totalSpins > 0",
    "0 %",
    "renderRewardSummary",
  ]);

  assertIncludes("Audit history", html + js, [
    "Admin user",
    "Campaign ID",
    "Reward ID",
    "Reason",
    "Target",
    "Metadata",
    "IP / user agent",
    "row.metadata && row.metadata.reason",
    "auditFieldMatches",
    "auditNetwork",
  ]);

  assertIncludes("Admin Wheel endpoints", js, [
    "/admin/permissions/me",
    "/admin/wheel/config",
    "/admin/wheel/campaign",
    "/admin/wheel/rewards",
    "/admin/wheel/spins",
    "/admin/audit-logs?limit=100",
  ]);

  assertIncludes("Permission markers", permissions + adminRoutes + js, [
    "wheel.view",
    "wheel.campaign.update",
    "wheel.reward.create",
    "wheel.reward.update",
    "wheel.reward.enable",
    "wheel.reward.disable",
    "wheel.spin.view",
    "wheel.report.view",
    "wheel.audit.view",
  ]);

  assertIncludes("Permission guards", adminRoutes, [
    'can("wheel.campaign.update")',
    'canAny(["wheel.reward.create", "wheel.rewards.create"])',
    "canWheelRewardUpdate",
    'canAny(["wheel.spin.view", "wheel.spins.view"])',
    "canAuditLogs",
  ]);

  assertIncludes("Backend audit actions", wheelService + auditController, [
    "wheel.campaign.update",
    "wheel.reward.create",
    "wheel.reward.update",
    "wheel.reward.enable",
    "wheel.reward.disable",
    "metadata: {",
    "reason,",
  ]);

  assertReasonBeforeWrite(js, "const reason = validateCampaign();", "/admin/wheel/campaign", "Campaign save");
  assertReasonBeforeWrite(js, "const reason = validateReward();", "/admin/wheel/rewards", "Reward save");
  assertReasonBeforeWrite(js, "const reason = validateReason(els.statusReason", "encodeURIComponent(reward.id)", "Reward enable/disable");
  assertReasonBeforeWrite(js, "const reason = validateReason(els.claimStatusReason", "encodeURIComponent(target.reward.id)}/status", "Reward claim status save");

  assertIncludes("Safety helpers", js, [
    "safeText",
    "numberValue",
    "formatNumber",
    "remainingStock",
    "sanitizeValue",
    "maskIp",
    "SafeApiError",
    "ไม่มีสิทธิ์เข้าถึง",
    "ไม่มีสิทธิ์ดำเนินการนี้",
    "ไม่พบข้อมูล",
  ]);
  assertIncludes("Admin Wheel CSS", css, [".tab-button.active", ".summary-grid", ".permission-panel", ".access-denied", ".permission-disabled", ".table-section", ".badge", ".safe-json"]);

  assertNoFrontendPrizeDecision(js);
  assertNoAdminForceControls(html, js);
  assertNoUnsafeLogging(js);
  assertNoRenderedPlaceholderText("Admin Wheel HTML", html);
  for (const [label, text] of [
    ["Admin Wheel HTML", html],
    ["Admin Wheel JS", js],
    ["Admin Wheel CSS", css],
  ]) {
    assertNoStaticSecret(label, text);
  }

  console.log("Admin Wheel UI five-section render contract: PASS");
  console.log("Admin Wheel UI permission marker contract: PASS");
  console.log("Admin Wheel UI reason/audit contract: PASS");
  console.log("Admin Wheel UI report zero-guard contract: PASS");
  console.log("Admin Wheel UI no frontend prize decision contract: PASS");
  console.log("Admin Wheel UI static secret/placeholder scan: PASS");
  console.log("Admin Wheel UI smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Admin Wheel UI smoke: FAIL");
  console.error(error.message);
  process.exitCode = 1;
}
