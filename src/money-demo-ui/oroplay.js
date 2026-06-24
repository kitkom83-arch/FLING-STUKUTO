(function () {
  "use strict";

  const API_BASE = "/api/oroplay-demo";

  function safeText(value, fallback) {
    if (value === null || value === undefined || value === "") return fallback || "-";
    return String(value).replace(/[<>]/g, "");
  }

  function apiRequest(path, options) {
    const config = options || {};
    const headers = { Accept: "application/json" };
    if (config.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`${API_BASE}${path}`, {
      method: config.method || "GET",
      headers,
      body: config.body === undefined ? undefined : JSON.stringify(config.body),
    }).then(async (response) => {
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload || payload.success !== true) {
        const error = new Error(payload && payload.message ? payload.message : `Request failed for ${path}`);
        error.status = response.status;
        error.payload = payload;
        throw error;
      }
      return payload.data;
    });
  }

  function setStatus(element, value) {
    if (element) element.textContent = safeText(value);
  }

  function toggleDisabled(state, elements) {
    elements.forEach((element) => {
      if (element) element.disabled = state;
    });
  }

  const els = {
    refreshVendors: document.getElementById("refresh-vendors"),
    createSession: document.getElementById("create-session"),
    depositSession: document.getElementById("deposit-session"),
    launchGame: document.getElementById("launch-game"),
    vendorSelect: document.getElementById("vendor-select"),
    depositAmount: document.getElementById("deposit-amount"),
    vendorCount: document.getElementById("vendor-count"),
    gameCount: document.getElementById("game-count"),
    sessionState: document.getElementById("session-state"),
    selectedGame: document.getElementById("selected-game"),
    sessionBalance: document.getElementById("session-balance"),
    vendorEmpty: document.getElementById("vendor-empty"),
    vendorList: document.getElementById("vendor-list"),
    gameEmpty: document.getElementById("game-empty"),
    gameGrid: document.getElementById("game-grid"),
    statusText: document.getElementById("status-text"),
    sessionSummary: document.getElementById("session-summary"),
    launchForm: document.getElementById("launch-form"),
  };

  const state = {
    busy: false,
    vendors: [],
    games: [],
    selectedVendorCode: "",
    selectedGameCode: "",
    session: null,
  };

  function setBusy(nextBusy) {
    state.busy = nextBusy;
    setBusyUI(nextBusy);
  }

  function setBusyUI(nextBusy) {
    toggleDisabled(nextBusy, [els.refreshVendors, els.createSession, els.depositSession, els.launchGame, els.vendorSelect]);
  }

  function statusLine() {
    setStatus(els.sessionState, state.session ? "ready" : "not_ready");
    setStatus(els.sessionBalance, state.session && state.session.balance !== null ? Number(state.session.balance).toFixed(2) : "-");
    setStatus(els.selectedGame, state.selectedGameCode || "-");
    setStatus(els.vendorCount, state.vendors.length);
    setStatus(els.gameCount, state.games.length);
    setStatus(
      els.sessionSummary,
      state.session
        ? `${state.session.username} / ${state.session.sessionId.slice(-6)}`
        : "No session yet."
    );
  }

  function renderVendors() {
    els.vendorList.innerHTML = "";
    els.vendorSelect.innerHTML = "";
    if (!state.vendors.length) {
      els.vendorEmpty.style.display = "block";
      els.vendorEmpty.textContent = "No vendors available.";
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No vendors available";
      els.vendorSelect.appendChild(option);
      return;
    }
    els.vendorEmpty.style.display = "none";

    if (!state.vendors.some((vendor) => vendor.code === state.selectedVendorCode)) {
      state.selectedVendorCode = state.vendors[0] ? state.vendors[0].code : "";
    }

    state.vendors.forEach((vendor) => {
      const option = document.createElement("option");
      option.value = vendor.code;
      option.textContent = `${vendor.name || vendor.code} (${vendor.code})`;
      els.vendorSelect.appendChild(option);
    });

    state.vendors.forEach((vendor) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `vendor-chip${vendor.code === state.selectedVendorCode ? " active" : ""}`;
      button.textContent = `${vendor.name || vendor.code} (${vendor.code})`;
      button.addEventListener("click", () => {
        if (state.selectedVendorCode === vendor.code) return;
        state.selectedVendorCode = vendor.code;
        state.selectedGameCode = "";
        loadGames(vendor.code).catch(() => {});
        renderVendors();
        renderGames();
        statusLine();
      });
      els.vendorList.appendChild(button);
    });

    if (state.selectedVendorCode) {
      els.vendorSelect.value = state.selectedVendorCode;
    }
  }

  function renderGames() {
    els.gameGrid.innerHTML = "";
    if (!state.games.length) {
      els.gameEmpty.style.display = "block";
      els.gameEmpty.textContent = state.selectedVendorCode ? "No games available for this vendor." : "Select a vendor to load games.";
      return;
    }
    els.gameEmpty.style.display = "none";

    state.games.forEach((game) => {
      const card = document.createElement("article");
      card.className = `game-card${game.code === state.selectedGameCode ? " active" : ""}`;

      const title = document.createElement("h3");
      title.textContent = game.name || game.code;
      card.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "game-meta";
      meta.innerHTML = "";
      const chips = [
        game.code,
        game.vendorCode,
        game.category || game.gameType || "",
        game.launchable === false ? "not launchable" : "launchable",
      ].filter(Boolean);
      chips.forEach((text) => {
        const chip = document.createElement("span");
        chip.className = "mini-pill";
        chip.textContent = text;
        meta.appendChild(chip);
      });
      card.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "game-actions";

      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "secondary";
      selectButton.textContent = game.code === state.selectedGameCode ? "Selected" : "Select";
      selectButton.disabled = game.launchable === false;
      selectButton.addEventListener("click", () => {
        state.selectedGameCode = game.code;
        renderGames();
        statusLine();
      });
      actions.appendChild(selectButton);

      const launchButton = document.createElement("button");
      launchButton.type = "button";
      launchButton.textContent = "Launch";
      launchButton.disabled = game.launchable === false;
      launchButton.addEventListener("click", () => {
        state.selectedGameCode = game.code;
        renderGames();
        launchSelectedGame(game).catch(() => {});
      });
      actions.appendChild(launchButton);

      card.appendChild(actions);
      els.gameGrid.appendChild(card);
    });
  }

  async function loadVendors() {
    setBusy(true);
    els.statusText.textContent = "Loading OroPlay vendors...";
    try {
      const data = await apiRequest("/vendors");
      state.vendors = Array.isArray(data.vendors) ? data.vendors : [];
      if (!state.selectedVendorCode && state.vendors[0]) {
        state.selectedVendorCode = state.vendors[0].code;
      }
      renderVendors();
      await loadGames(state.selectedVendorCode);
      els.statusText.textContent = "OroPlay vendors loaded.";
    } catch (error) {
      els.statusText.textContent = safeText(error.message, "Unable to load vendors.");
      state.vendors = [];
      state.games = [];
      renderVendors();
      renderGames();
    } finally {
      setBusy(false);
      statusLine();
    }
  }

  async function loadGames(vendorCode) {
    if (!vendorCode) {
      state.games = [];
      renderGames();
      statusLine();
      return;
    }
    els.statusText.textContent = `Loading games for ${vendorCode}...`;
    try {
      const data = await apiRequest(`/vendors/${encodeURIComponent(vendorCode)}/games`);
      state.games = Array.isArray(data.games) ? data.games : [];
      if (!state.selectedGameCode || !state.games.some((game) => game.code === state.selectedGameCode)) {
        state.selectedGameCode = state.games[0] ? state.games[0].code : "";
      }
      renderGames();
      statusLine();
      els.statusText.textContent = `Loaded ${state.games.length} games for ${vendorCode}.`;
    } catch (error) {
      state.games = [];
      state.selectedGameCode = "";
      renderGames();
      statusLine();
      els.statusText.textContent = safeText(error.message, "Unable to load games.");
    }
  }

  async function createSession() {
    setBusy(true);
    els.statusText.textContent = "Creating temporary OroPlay test user...";
    try {
      const data = await apiRequest("/session", { method: "POST" });
      state.session = {
        sessionId: data.sessionId,
        username: data.player && data.player.username,
        displayName: data.player && data.player.displayName,
        balance: null,
      };
      setStatus(els.sessionState, "ready");
      els.statusText.textContent = "Temporary OroPlay test user created.";
    } catch (error) {
      state.session = null;
      els.statusText.textContent = safeText(error.message, "Unable to create test user.");
    } finally {
      setBusy(false);
      statusLine();
    }
  }

  async function depositSession() {
    if (!state.session) {
      els.statusText.textContent = "Create a test user before depositing balance.";
      return;
    }
    setBusy(true);
    const amount = String(els.depositAmount.value || "").trim() || "20.00";
    els.statusText.textContent = "Depositing small test balance...";
    try {
      const data = await apiRequest(`/session/${encodeURIComponent(state.session.sessionId)}/deposit`, {
        method: "POST",
        body: { amount },
      });
      state.session.balance = data.balance;
      els.statusText.textContent = "Test balance deposited.";
    } catch (error) {
      els.statusText.textContent = safeText(error.message, "Unable to deposit test balance.");
    } finally {
      setBusy(false);
      statusLine();
    }
  }

  async function launchSelectedGame(gameOverride) {
    if (!state.session) {
      els.statusText.textContent = "Create a test user first.";
      return;
    }
    const game = gameOverride || state.games.find((item) => item.code === state.selectedGameCode);
    if (!game) {
      els.statusText.textContent = "Select a game first.";
      return;
    }
    if (!state.selectedVendorCode) {
      els.statusText.textContent = "Select a vendor first.";
      return;
    }

    els.statusText.textContent = "Opening the game in a new tab...";
    const form = els.launchForm;
    form.innerHTML = "";
    form.action = `${API_BASE}/session/${encodeURIComponent(state.session.sessionId)}/launch`;

    const fields = {
      vendorCode: state.selectedVendorCode,
      gameCode: game.code,
      gameName: game.name || game.code,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    form.submit();
    statusLine();
  }

  els.refreshVendors.addEventListener("click", () => loadVendors().catch(() => {}));
  els.createSession.addEventListener("click", () => createSession().catch(() => {}));
  els.depositSession.addEventListener("click", () => depositSession().catch(() => {}));
  els.launchGame.addEventListener("click", () => launchSelectedGame().catch(() => {}));
  els.vendorSelect.addEventListener("change", () => {
    state.selectedVendorCode = String(els.vendorSelect.value || "").trim();
    state.selectedGameCode = "";
    renderVendors();
    loadGames(state.selectedVendorCode).catch(() => {});
  });

  renderVendors();
  renderGames();
  statusLine();
  loadVendors().catch(() => {});
})();
