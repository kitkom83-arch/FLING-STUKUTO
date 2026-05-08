const dotenv = require("dotenv");

dotenv.config();

function optionalEnv(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function modeEnv(name) {
  return optionalEnv(name) || "mock";
}

const defaultDevCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4000",
  "http://127.0.0.1:5173",
  "https://your-netlify-site.netlify.app",
];

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  publicApiBaseUrl: optionalEnv("PUBLIC_API_BASE_URL") || "http://localhost:4000",
  corsOrigins: (process.env.CORS_ORIGIN || defaultDevCorsOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  gameProvider: {
    mode: modeEnv("GAME_PROVIDER_MODE"),
    apiBaseUrl: optionalEnv("GAME_PROVIDER_API_BASE_URL"),
    agentCode: optionalEnv("GAME_PROVIDER_AGENT_CODE"),
    apiKey: optionalEnv("GAME_PROVIDER_API_KEY"),
    secret: optionalEnv("GAME_PROVIDER_SECRET"),
  },
  paymentProvider: {
    mode: modeEnv("PAYMENT_PROVIDER_MODE"),
    apiBaseUrl: optionalEnv("PAYMENT_API_BASE_URL"),
    merchantId: optionalEnv("PAYMENT_MERCHANT_ID"),
    apiKey: optionalEnv("PAYMENT_API_KEY"),
    secret: optionalEnv("PAYMENT_SECRET"),
  },
  bankStatement: {
    mode: modeEnv("BANK_STATEMENT_MODE"),
    apiBaseUrl: optionalEnv("BANK_API_BASE_URL"),
    apiKey: optionalEnv("BANK_API_KEY"),
  },
  smsProvider: {
    mode: modeEnv("SMS_PROVIDER_MODE"),
    apiBaseUrl: optionalEnv("SMS_API_BASE_URL"),
    apiKey: optionalEnv("SMS_API_KEY"),
  },
  slipOcr: {
    mode: modeEnv("SLIP_OCR_MODE"),
    apiBaseUrl: optionalEnv("SLIP_OCR_API_BASE_URL"),
    apiKey: optionalEnv("SLIP_OCR_API_KEY"),
  },
};

env.gameProviderMode = env.gameProvider.mode;
env.paymentProviderMode = env.paymentProvider.mode;
env.smsProviderMode = env.smsProvider.mode;
env.slipOcrMode = env.slipOcr.mode;

if (!Number.isFinite(env.port) || env.port <= 0) {
  throw new Error("PORT must be a valid positive number");
}

if (env.nodeEnv === "production" && env.jwtSecret === "development-only-change-me") {
  throw new Error("JWT_SECRET must be configured in production");
}

if (env.nodeEnv === "production" && env.corsOrigins.includes("*")) {
  throw new Error("CORS_ORIGIN must not be wildcard in production");
}

module.exports = env;
