const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const routes = require("./routes");
const adminRoutes = require("./routes/admin.routes");
const oroplayCallbackStubRoutes = require("./routes/oroplayCallbackStub.routes");
const adminController = require("./controllers/admin.controller");
const healthController = require("./controllers/health.controller");
const {
  handleOroplayBalanceStub,
  handleOroplayTransactionStub,
} = require("./controllers/oroplayCallbackStub.controller");
const siteResolver = require("./middleware/siteResolver");
const { asyncHandler, notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const adminUiDir = path.join(__dirname, "admin-ui");
const adminWheelUiDir = path.join(__dirname, "admin-wheel-ui");
const adminAuditUiDir = path.join(__dirname, "admin-audit-ui");
const memberWheelDemoUiDir = path.join(__dirname, "wheel-demo-ui");
const moneyDemoUiDir = path.join(__dirname, "money-demo-ui");

function corsOrigin(origin, callback) {
  if (!origin && env.nodeEnv === "development") return callback(null, true);
  if (env.corsOrigins.includes("*") && env.nodeEnv !== "production") return callback(null, true);
  if (origin && env.corsOrigins.includes(origin)) return callback(null, true);
  return callback(null, false);
}

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    // Dev allows configured localhost/file clients; production must set explicit origins.
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.get(["/health", "/api/health"], asyncHandler(healthController.health));

function sendAdminUi(_req, res) {
  res.sendFile(path.join(adminUiDir, "index.html"));
}

function sendAdminWheelUi(_req, res) {
  res.sendFile(path.join(adminWheelUiDir, "index.html"));
}

function sendAdminAuditUi(_req, res) {
  res.sendFile(path.join(adminAuditUiDir, "index.html"));
}

function sendMemberWheelDemoUi(_req, res) {
  res.sendFile(path.join(memberWheelDemoUiDir, "index.html"));
}

function sendMemberMoneyDemoUi(_req, res) {
  res.sendFile(path.join(moneyDemoUiDir, "member.html"));
}

function sendAdminMoneyDemoUi(_req, res) {
  res.sendFile(path.join(moneyDemoUiDir, "admin.html"));
}

function staticGetHead(route, dir, options) {
  const middleware = express.static(dir, options);
  app.use(route, (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    return middleware(req, res, next);
  });
}

app.post("/admin/auth/login", asyncHandler(adminController.login));
app.use("/admin", (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") return next();
  return siteResolver(req, res, (error) => {
    if (error) return next(error);
    return adminRoutes(req, res, next);
  });
});

app.get(["/admin", "/admin/", "/admin/roles", "/admin/roles/", "/admin/work-schedules", "/admin/work-schedules/"], sendAdminUi);
app.get(["/admin/audit-security", "/admin/audit-security/"], sendAdminAuditUi);
app.get(["/admin-wheel", "/admin-wheel/", "/admin/lucky-wheel", "/admin/lucky-wheel/"], sendAdminWheelUi);
app.get(["/wheel-demo", "/wheel-demo/", "/member/wheel-demo", "/member/wheel-demo/"], sendMemberWheelDemoUi);
app.get(["/member-money-demo", "/member-money-demo/"], sendMemberMoneyDemoUi);
app.get(["/admin-money-demo", "/admin-money-demo/"], sendAdminMoneyDemoUi);
staticGetHead("/admin/work-schedules", adminUiDir, { index: "index.html" });
staticGetHead("/admin/roles", adminUiDir, { index: "index.html" });
staticGetHead("/admin/audit-security", adminAuditUiDir, { index: "index.html" });
staticGetHead("/admin-wheel", adminWheelUiDir, { index: "index.html" });
staticGetHead("/admin/lucky-wheel", adminWheelUiDir, { index: "index.html" });
staticGetHead("/wheel-demo", memberWheelDemoUiDir, { index: "index.html" });
staticGetHead("/member/wheel-demo", memberWheelDemoUiDir, { index: "index.html" });
staticGetHead("/member-money-demo", moneyDemoUiDir, { index: "member.html" });
staticGetHead("/admin-money-demo", moneyDemoUiDir, { index: "admin.html" });
// ORO-5N: internal fail-closed OroPlay callback staging mount only.
app.use("/api/oroplay", oroplayCallbackStubRoutes);
// ORO-5S: public aliases reuse the existing fail-closed no-mutation handlers.
app.post('/api/balance', handleOroplayBalanceStub);
app.post('/api/transaction', handleOroplayTransactionStub);
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
