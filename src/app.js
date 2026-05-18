const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const adminUiDir = path.join(__dirname, "admin-ui");
const adminWheelUiDir = path.join(__dirname, "admin-wheel-ui");

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

function sendAdminUi(_req, res) {
  res.sendFile(path.join(adminUiDir, "index.html"));
}

function sendAdminWheelUi(_req, res) {
  res.sendFile(path.join(adminWheelUiDir, "index.html"));
}

app.get(["/admin", "/admin/", "/admin/roles", "/admin/roles/", "/admin/work-schedules", "/admin/work-schedules/"], sendAdminUi);
app.get(["/admin-wheel", "/admin-wheel/", "/admin/lucky-wheel", "/admin/lucky-wheel/"], sendAdminWheelUi);
app.use("/admin/work-schedules", express.static(adminUiDir, { index: "index.html" }));
app.use("/admin/roles", express.static(adminUiDir, { index: "index.html" }));
app.use("/admin/audit-security", express.static(path.join(__dirname, "admin-audit-ui"), { index: "index.html" }));
app.use("/admin-wheel", express.static(adminWheelUiDir, { index: "index.html" }));
app.use("/admin/lucky-wheel", express.static(adminWheelUiDir, { index: "index.html" }));
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
