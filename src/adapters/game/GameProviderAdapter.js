class GameProviderAdapter {
  listProviders() {
    throw new Error("Not implemented");
  }

  listGames(providerCode) {
    throw new Error("Not implemented");
  }

  createPlayer(user) {
    throw new Error("Not implemented");
  }

  getBalance(user) {
    throw new Error("Not implemented");
  }

  transferIn(user, amount, reference) {
    throw new Error("Not implemented");
  }

  transferOut(user, amount, reference) {
    throw new Error("Not implemented");
  }

  launchGame(user, gameCode) {
    throw new Error("Not implemented");
  }

  getBetHistory(user, dateRange) {
    throw new Error("Not implemented");
  }
}

module.exports = GameProviderAdapter;
