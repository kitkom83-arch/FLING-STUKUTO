const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(text.includes(marker), `${label} missing marker: ${marker}`);
  }
}

function assertNotIncludes(label, text, markers) {
  for (const marker of markers) {
    assert(!text.includes(marker), `${label} must not include marker: ${marker}`);
  }
}

function functionBody(text, functionName) {
  const startMarker = `async function ${functionName}`;
  const start = text.indexOf(startMarker);
  assert(start >= 0, `Missing function ${functionName}`);
  const signatureEnd = text.indexOf(") {", start);
  assert(signatureEnd >= 0, `Missing signature end for ${functionName}`);
  const bodyStart = signatureEnd + 2;
  assert(bodyStart >= 0, `Missing body for ${functionName}`);
  let depth = 0;
  for (let index = bodyStart; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(bodyStart, index + 1);
    }
  }
  throw new Error(`Could not parse body for ${functionName}`);
}

function assertNoWriteCalls(label, text) {
  const forbidden = [
    ".create(",
    ".createMany(",
    ".update(",
    ".updateMany(",
    ".upsert(",
    ".delete(",
    ".deleteMany(",
    ".$transaction(",
    "logAdminAction(",
    "fetch(",
  ];
  assertNotIncludes(label, text, forbidden);
}

function main() {
  const routes = read("src/routes/admin.routes.js");
  const controller = read("src/controllers/admin.controller.js");
  const service = read("src/services/member.service.js");
  const html = read("src/admin-ui/index.html");
  const js = read("src/admin-ui/app.js");
  const apiDocs = read("docs/API.md");
  const smokeDocs = read("docs/SMOKE_COVERAGE.md");

  assertIncludes("admin route", routes, [
    'router.get("/members/:id/history", protectedSite, can("members.view"), asyncHandler(adminController.getMemberHistory));',
  ]);
  assertIncludes("admin controller", controller, [
    "async function getMemberHistory(req, res)",
    "memberService.getMemberHistory(req.params.id, req.query, req.siteId)",
    "getMemberHistory,",
  ]);

  const historyBody = functionBody(service, "getMemberHistory");
  assertIncludes("member history service", historyBody, [
    "prisma.user.findFirst",
    "prisma.depositTransaction.findMany",
    "prisma.withdrawTransaction.findMany",
    "prisma.promotionClaim.findMany",
    "prisma.turnoverRequirement.findMany",
    "prisma.gameSession.findMany",
    "prisma.gameTransfer.findMany",
    "prisma.pointLedger.findMany",
    "prisma.gameBetHistoryMock.findMany",
    "noWriteActions: true",
    "noLiveProviderCalls: true",
  ]);
  assertNoWriteCalls("member history service", historyBody);
  assertNotIncludes("member history service sensitive fields", historyBody, [
    "passwordHash",
    "launchUrl",
    "apiKeyEncrypted",
    "secretEncrypted",
    "slipFileUrl",
    "ipAddress",
    "userAgent",
  ]);

  assertIncludes("admin member history HTML", html, [
    "GET /api/admin/members/:id/history",
    "history-play-rows",
    "history-pre-promotion-rows",
    "history-referral-source",
    "history-usage-rows",
    "history-debt-rows",
    "ไม่พบข้อมูลจาก API read-only",
  ]);
  assertIncludes("admin member history JS", js, [
    "/admin/members/${encodeURIComponent(memberId)}/history",
    "renderHistoryPlay",
    "renderHistoryPrePromotion",
    "renderHistoryReferral",
    "renderHistoryUsage",
    "renderHistoryDebt",
    "ต้องมี permission reports.view",
    "ต้องมี permission wheel.spin.view หรือ wheel.spins.view",
    "ต้องมี permission wheel.claims.view",
  ]);

  assertNotIncludes("admin member history UI forbidden endpoints", `${html}\n${js}`, [
    "/api/game/bet-history/mock",
    "/api/me",
    "/api/wallet/ledger",
    "/api/deposits",
    "/api/withdrawals",
    "/api/member/wheel",
    "/admin/members/:id/block",
    "/admin/members/:id/unblock",
    "/admin/members/:id/credit/add",
    "/admin/members/:id/credit/remove",
    "/admin/members/:id/points/add",
    "/admin/members/:id/points/remove",
  ]);

  assertIncludes("API docs", apiDocs, [
    "GET | `/admin/members/:id/history`",
    "Admin Member Detail history supplemental read-only payload",
    "No wallet/credit/debit/write action",
  ]);
  assertIncludes("Smoke docs", smokeDocs, [
    "adminMemberHistoryReadOnlySmoke.js",
    "smoke:admin-member-history-read-only",
    "GET /api/admin/members/:id/history",
  ]);

  console.log("Admin member history read-only static/API integration smoke: PASS");
}

main();
