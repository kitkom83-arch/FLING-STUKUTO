const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

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

function isGitIgnored(relativePath) {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", path.join("apps", "lucky-wheel-game", relativePath)], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch (_error) {
    return false;
  }
}

function isGitTracked(relativePath) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", "--", path.join("apps", "lucky-wheel-game", relativePath)], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch (_error) {
    return false;
  }
}

function assertLocalArtifactPolicy(relativePath) {
  if (!exists(relativePath)) {
    return;
  }
  assert(isGitIgnored(relativePath), `apps/lucky-wheel-game/${relativePath} must stay gitignored when generated locally.`);
  assert(!isGitTracked(relativePath), `apps/lucky-wheel-game/${relativePath} must not be tracked by git.`);
}

function main() {
  assert(exists("package.json"), "apps/lucky-wheel-game/package.json must exist.");
  assert(exists("src"), "apps/lucky-wheel-game/src must exist.");
  assert(exists(".env.example"), "apps/lucky-wheel-game/.env.example must exist.");
  assert(exists(".gitignore"), "apps/lucky-wheel-game/.gitignore must exist.");

  assertLocalArtifactPolicy("node_modules");
  assertLocalArtifactPolicy("dist");
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
