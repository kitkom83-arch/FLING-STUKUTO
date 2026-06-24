"use strict";

const assert = require("assert");
const {
  formatDiagnosticBlock,
  maskClientId,
  readDiagnosticEnv,
  redactDiagnosticValue,
  sanitizeResponseBody,
} = require("../staging-scripts/oroplayAuthDiagnostic");

function assertRedacted(value, message) {
  assert(!String(value).includes("abc123SECRET"), message);
  assert(!String(value).includes("sensitive-fixture-token-123456"), message);
}

function testRedaction() {
  const input = JSON.stringify({
    token: "abc123SECRET",
    accessToken: "sensitive-fixture-token-123456",
    bearer: "sensitive-fixture-token-123456",
    nested: {
      authorization: "sensitive-fixture-token-123456",
      message: "sensitive-fixture-token-123456",
    },
  });

  const sanitized = sanitizeResponseBody(input);
  assertRedacted(sanitized, "Sanitized JSON should redact auth-like values.");
  assert.strictEqual(typeof sanitized, "string");

  const rawToken = sanitizeResponseBody("abc123SECRET");
  assert(!String(rawToken).includes("abc123SECRET"), "Raw token-shaped body should be redacted.");
}

function testEmptyBody() {
  const block = formatDiagnosticBlock({
    requestAtUtc: "2026-06-25T00:00:00.000Z",
    endpoint: "POST /auth/createtoken",
    clientId: maskClientId("MAHA289"),
    status: 401,
    contentType: "",
    bodyText: "",
  });

  assert(block.includes("BODY_LENGTH=0"), "Empty body must report BODY_LENGTH=0.");
  assert(block.includes("BODY_RAW_BEGIN"), "Body block marker missing.");
  assert(block.includes("BODY_RAW_END"), "Body block marker missing.");
}

function testMissingEnvFailsSafely() {
  assert.throws(
    () =>
      readDiagnosticEnv({
        NODE_ENV: "staging",
        APP_ENV: "staging",
      }),
    /Missing required env/,
    "Missing env should fail safely."
  );
}

function testSafeDiagnosticsShape() {
  const sanitized = redactDiagnosticValue({
    token: "abc123SECRET",
    accessToken: "sensitive-fixture-token-123456",
    nested: {
      authorization: "sensitive-fixture-token-123456",
      body: "ok",
    },
  });
  const text = JSON.stringify(sanitized);
  assert(!text.includes("abc123SECRET"), "token should be redacted.");
  assert(!text.includes("real-token-123456"), "access token should be redacted.");
  assert(!text.includes("sensitive-fixture-token-123456"), "auth fixture token should be redacted.");
}

function main() {
  testRedaction();
  testEmptyBody();
  testMissingEnvFailsSafely();
  testSafeDiagnosticsShape();
  console.log("OroPlay auth diagnostic sanitizer smoke: PASS");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("OroPlay auth diagnostic sanitizer smoke: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
  testEmptyBody,
  testMissingEnvFailsSafely,
  testRedaction,
  testSafeDiagnosticsShape,
};
