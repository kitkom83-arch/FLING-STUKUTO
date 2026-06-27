const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const appDir = path.join(repoRoot, "apps", "lucky-wheel-game");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(appDir, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(appDir, relativePath), "utf8"));
}

function main() {
  assert(exists("package.json"), "apps/lucky-wheel-game/package.json must exist.");
  assert(exists("src"), "apps/lucky-wheel-game/src must exist.");
  assert(exists(".env.example"), "apps/lucky-wheel-game/.env.example must exist.");
  assert(exists(".gitignore"), "apps/lucky-wheel-game/.gitignore must exist.");

  assert(!exists("node_modules"), "apps/lucky-wheel-game/node_modules must not be imported.");
  assert(!exists("dist"), "apps/lucky-wheel-game/dist must not be imported.");
  assert(!exists(".env.local"), "apps/lucky-wheel-game/.env.local must not be imported.");
  assert(!exists("5555"), "apps/lucky-wheel-game/5555 must not be imported.");

  const packageJson = readJson("package.json");
  assert(packageJson.scripts && packageJson.scripts.build, "lucky-wheel-game package.json must define a build script.");
  assert(packageJson.scripts && packageJson.scripts.dev, "lucky-wheel-game package.json must define a dev script.");

  console.log("Lucky Wheel game source import smoke: PASS");
}

try {
  main();
} catch (error) {
  console.error("Lucky Wheel game source import smoke: FAIL");
  console.error(error.message);
  process.exit(1);
}
