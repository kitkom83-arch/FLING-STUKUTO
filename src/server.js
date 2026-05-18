const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/prisma");

const port = Number(process.env.PORT || env.port || 4000);
const requestedHost = String(process.env.HOST || "0.0.0.0").trim();
const host = ["localhost", "127.0.0.1", "::1"].includes(requestedHost) ? "0.0.0.0" : requestedHost;

const server = app.listen(port, host, () => {
  console.log(`PG77 Real Core API listening on ${host}:${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
