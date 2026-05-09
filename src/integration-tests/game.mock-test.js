const assert = require("assert");
const GameProviderAdapter = require("../adapters/game/GameProviderAdapter");

function isDecimalSafe(value) {
  return typeof value === "string" && /^-?\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value));
}

function requireReference(reference) {
  if (!reference || typeof reference !== "string") {
    throw new Error("transfer reference is required");
  }
}

class SandboxGameProviderAdapter extends GameProviderAdapter {
  constructor() {
    super();
    this.players = new Map();
  }

  listProviders() {
    return [{ code: "SANDBOX", name: "Sandbox Games" }];
  }

  listGames(providerCode) {
    if (providerCode !== "SANDBOX") return [];
    return [{ code: "sandbox_slot", name: "Sandbox Slot", category: "slot" }];
  }

  createPlayer(user) {
    const player = {
      providerPlayerId: `SANDBOX-${user.id}`,
      username: user.username || user.phone,
      status: "created",
    };
    this.players.set(user.id, player);
    return player;
  }

  getBalance(user) {
    return {
      userId: user.id,
      balance: "0.00",
      currency: "THB",
    };
  }

  async transferIn(user, amount, reference) {
    requireReference(reference);
    return {
      userId: user.id,
      amount: String(amount),
      reference,
      status: "success",
      balanceChanged: false,
    };
  }

  async transferOut(user, amount, reference) {
    requireReference(reference);
    return {
      userId: user.id,
      amount: String(amount),
      reference,
      status: "success",
      balanceChanged: false,
    };
  }

  launchGame(user, gameCode) {
    return {
      userId: user.id,
      gameCode,
      launchUrl: `https://sandbox.local/launch/${encodeURIComponent(gameCode)}?mode=mock`,
    };
  }

  getBetHistory(user, dateRange) {
    assert.ok(dateRange.from && dateRange.to, "dateRange.from and dateRange.to are required");
    return [
      {
        userId: user.id,
        roundId: "ROUND-SANDBOX-0001",
        betAmount: "10.00",
        winAmount: "0.00",
        profitAmount: "-10.00",
        playedAt: "2026-05-08T10:30:00.000Z",
      },
    ];
  }
}

async function run() {
  const adapter = new SandboxGameProviderAdapter();
  const user = { id: "user_sandbox", username: "sandbox_user", phone: "080****00" };

  const providers = await adapter.listProviders();
  assert.ok(Array.isArray(providers) && providers[0].code, "listProviders must return provider codes");

  const games = await adapter.listGames(providers[0].code);
  assert.ok(Array.isArray(games) && games[0].code, "listGames must return game codes");

  const player = await adapter.createPlayer(user);
  assert.ok(player.providerPlayerId, "createPlayer must return provider player id");

  const balance = await adapter.getBalance(user);
  assert.ok(isDecimalSafe(balance.balance), "getBalance amount must not be NaN");

  await assert.rejects(() => Promise.resolve(adapter.transferIn(user, "10.00")), /reference is required/);
  await assert.rejects(() => Promise.resolve(adapter.transferOut(user, "10.00")), /reference is required/);

  const transferIn = await adapter.transferIn(user, "10.00", "GTR-SANDBOX-IN-0001");
  const transferOut = await adapter.transferOut(user, "5.00", "GTR-SANDBOX-OUT-0001");
  assert.ok(isDecimalSafe(transferIn.amount), "transferIn amount must not be NaN");
  assert.ok(isDecimalSafe(transferOut.amount), "transferOut amount must not be NaN");
  assert.strictEqual(transferIn.balanceChanged, false, "sandbox transferIn must not change real balance");
  assert.strictEqual(transferOut.balanceChanged, false, "sandbox transferOut must not change real balance");

  const launch = await adapter.launchGame(user, games[0].code);
  assert.ok(launch.launchUrl && launch.launchUrl.startsWith("https://sandbox.local/launch/"), "launchGame must return mock launchUrl");

  const bets = await adapter.getBetHistory(user, {
    from: "2026-05-08T00:00:00.000Z",
    to: "2026-05-08T23:59:59.999Z",
  });
  assert.ok(Array.isArray(bets), "getBetHistory must return an array");
  assert.ok(bets.every((bet) => isDecimalSafe(bet.betAmount) && isDecimalSafe(bet.winAmount)), "bet amounts must not be NaN");

  console.log("game integration harness: PASS");
}

run().catch((error) => {
  console.error("game integration harness: FAIL", error.message);
  process.exit(1);
});
