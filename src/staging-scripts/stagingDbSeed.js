const { assertStagingSafety } = require("./stagingSafety");
const { main: seedMain, disconnect } = require("../../prisma/seed");

async function main() {
  try {
    assertStagingSafety({ label: "Staging DB seed safety guard" });
    await seedMain();
    console.log("Staging demo seed: PASS");
  } catch (error) {
    console.error("Staging demo seed: FAIL");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
