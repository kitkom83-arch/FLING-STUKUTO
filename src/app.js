const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

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

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
