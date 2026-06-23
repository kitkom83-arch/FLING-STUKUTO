(function () {
  "use strict";

  const API_BASE = "/api";
  const SITE_CODE = "PG77";
  const DEMO_MEMBER_ID = "demo_member";
  const CAMPAIGN_ID = "wheel_main";
  const STORAGE_KEY = "pg77-lucky-wheel-demo-fallback-v2";
  const LOCAL_API_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
  const FALLBACK_REWARDS = [
    { id: "wheel_reward_demo_1", label: "Mock Credit 10", type: "credit", displayValue: "10 mock credit", amount: 10, segmentColor: "#c96f2d", weight: 35 },
    { id: "wheel_reward_demo_2", label: "Bonus Point 25", type: "point", displayValue: "25 points", amount: 25, segmentColor: "#177245", weight: 25 },
    { id: "wheel_reward_demo_3", label: "Free Ticket", type: "ticket", displayValue: "1 demo ticket", amount: 1, segmentColor: "#245f9c", weight: 20 },
    { id: "wheel_reward_demo_4", label: "No Reward", type: "no_reward", displayValue: "Try again", amount: 0, segmentColor: "#7f6d5c", weight: 20 },
  ];

  const state = {
    config: null,
    history: [],
    rewards: [],
    latestResult: null,
    busy: false,
    apiMode: "local_mock_fallback",
    modeReason: "Initializing local demo mode.",
  };

  const els = {
    refreshAll: document.getElementById("refresh-all"),
    spinButton: document.getElementById("spin-button"),
    campaignName: document.getElementById("campaign-name"),
    campaignStatus: document.getElementById("campaign-status"),
    remainingSpins: document.getElementById("remaining-spins"),
    memberPoints: document.getElementById("member-points"),
    memberCredit: document.getElementById("member-credit"),
    memberTickets: document.getElementById("member-tickets"),
    modePill: document.getElementById("mode-pill"),
    modeDetail: document.getElementById("mode-detail"),
    wheelBoard: document.getElementById("wheel-board"),
    rulesText: document.getElementById("rules-text"),
    resultEmpty: document.getElementById("result-empty"),
    resultCard: document.getElementById("result-card"),
    resultLabel: document.getElementById("result-label"),
    resultValue: document.getElementById("result-value"),
    resultMeta: document.getElementById("result-meta"),
    resultSpinId: document.getElementById("result-spin-id"),
    resultPrizeIndex: document.getElementById("result-prize-index"),
    resultBalanceAfter: document.getElementById("result-balance-after"),
    resultRemainingAfter: document.getElementById("result-remaining-after"),
    historyEmpty: document.getElementById("history-empty"),
    historyRows: document.getElementById("history-rows"),
    rewardsEmpty: document.getElementById("rewards-empty"),
    rewardRows: document.getElementById("reward-rows"),
    statusText: document.getElementById("status-text"),
  };

  function headers() {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Site-Code": SITE_CODE,
      "X-Demo-Member-Id": DEMO_MEMBER_ID,
    };
  }

  function safeText(value, fallback) {
    if (value === null || value === undefined || value === "" || Number.isNaN(value)) return fallback || "-";
    return String(value).replace(/[<>]/g, "");
  }

  function safeNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(safeNumber(value, 0));
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB", { hour12: false });
  }

  function isLocalApiHost() {
    const hostname = String(window.location && window.location.hostname ? window.location.hostname : "").trim().toLowerCase();
    return LOCAL_API_HOSTS.has(hostname);
  }

  function readFallbackState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function writeFallbackState(nextState) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (_error) {
      // Best-effort only for the local demo fallback.
    }
  }

  function fallbackConfigFromStore(store) {
    return {
      campaignId: CAMPAIGN_ID,
      name: "Lucky Wheel Local Demo Fallback",
      status: "active",
      costType: "point",
      costAmount: 0,
      dailySpinLimit: 3,
      remainingSpinsToday: store.remainingSpinsToday,
      memberBalance: {
        points: store.points,
        credit: store.credit,
        tickets: store.tickets,
      },
      rewards: FALLBACK_REWARDS.map(function (reward, index) {
        return {
          id: reward.id,
          label: reward.label,
          type: reward.type,
          displayValue: reward.displayValue,
          segmentColor: reward.segmentColor,
          sortOrder: index + 1,
        };
      }),
      rulesText: "Local mock fallback only. No real payout, no live provider, and no external runtime dependency.",
      serverTime: new Date().toISOString(),
      mode: "local_mock_fallback",
    };
  }

  function fallbackStore() {
    const existing = readFallbackState();
    if (existing && typeof existing === "object") return existing;
    const initial = {
      points: 360,
      credit: 180,
      tickets: 5,
      remainingSpinsToday: 3,
      history: [],
      rewards: [],
    };
    writeFallbackState(initial);
    return initial;
  }

  function fallbackData() {
    const store = fallbackStore();
    return {
      config: fallbackConfigFromStore(store),
      history: Array.isArray(store.history) ? store.history : [],
      rewards: Array.isArray(store.rewards) ? store.rewards : [],
    };
  }

  function chooseFallbackReward() {
    const totalWeight = FALLBACK_REWARDS.reduce(function (sum, reward) {
      return sum + reward.weight;
    }, 0);
    let cursor = 0;
    const roll = Math.random() * totalWeight;
    for (const reward of FALLBACK_REWARDS) {
      cursor += reward.weight;
      if (roll <= cursor) return reward;
    }
    return FALLBACK_REWARDS[FALLBACK_REWARDS.length - 1];
  }

  function fallbackSpin() {
    const store = fallbackStore();
    if (store.remainingSpinsToday <= 0) {
      throw new Error("Daily spin limit reached in local fallback mode.");
    }

    const reward = chooseFallbackReward();
    const spinId = "fallback-spin-" + Date.now();
    const prizeIndex = Math.max(
      FALLBACK_REWARDS.findIndex(function (item) {
        return item.id === reward.id;
      }),
      0
    );

    store.remainingSpinsToday -= 1;
    const historyRow = {
      spinId: spinId,
      createdAt: new Date().toISOString(),
      rewardLabel: reward.label,
      rewardType: reward.type,
      rewardValue: String(reward.amount),
      displayValue: reward.displayValue,
      status: reward.type === "no_reward" ? "no_reward" : "pending",
      prizeIndex: prizeIndex,
    };
    store.history.unshift(historyRow);
    store.history = store.history.slice(0, 12);

    if (reward.type !== "no_reward") {
      store.rewards.unshift({
        id: "fallback-reward-" + Date.now(),
        label: reward.label,
        rewardType: reward.type,
        rewardValue: String(reward.amount),
        status: "pending",
        createdAt: new Date().toISOString(),
        claimedAt: null,
        expiresAt: null,
      });
      store.rewards = store.rewards.slice(0, 12);
    }

    writeFallbackState(store);

    return {
      spinId: spinId,
      rewardId: reward.id,
      prizeIndex: prizeIndex,
      reward: {
        label: reward.label,
        type: reward.type,
        amount: reward.amount,
        displayValue: reward.displayValue,
      },
      remainingSpinsToday: store.remainingSpinsToday,
      balanceAfter: {
        points: store.points,
        credit: store.credit,
        tickets: store.tickets,
      },
    };
  }

  function setBusy(nextBusy) {
    state.busy = nextBusy;
    els.spinButton.disabled = nextBusy;
    els.refreshAll.disabled = nextBusy;
  }

  function setMode(mode, reason) {
    state.apiMode = mode;
    state.modeReason = reason;
  }

  function applyModeUi() {
    const label = state.apiMode === "local_api_backed" ? "local_api_backed" : "local_mock_fallback";
    els.modePill.textContent = label;
    els.modePill.dataset.mode = label;
    if (els.modeDetail) {
      els.modeDetail.textContent = safeText(state.modeReason, "Local mock fallback only.");
    }
  }

  function normalizeApiConfig(config) {
    const safeConfig = config && typeof config === "object" ? config : {};
    const rewards = Array.isArray(safeConfig.rewards) ? safeConfig.rewards : [];
    const balance = safeConfig.memberBalance && typeof safeConfig.memberBalance === "object" ? safeConfig.memberBalance : {};
    return {
      campaignId: safeText(safeConfig.campaignId, CAMPAIGN_ID),
      name: safeText(safeConfig.name, "Lucky Wheel Local API Demo"),
      status: safeText(safeConfig.status, "active"),
      costType: safeText(safeConfig.costType, "point"),
      costAmount: safeNumber(safeConfig.costAmount, 0),
      dailySpinLimit: safeNumber(safeConfig.dailySpinLimit, 0),
      remainingSpinsToday: safeNumber(safeConfig.remainingSpinsToday, 0),
      memberBalance: {
        points: safeNumber(balance.points, 0),
        credit: safeNumber(balance.credit, 0),
        tickets: safeNumber(balance.tickets, 0),
      },
      rewards: rewards.map(function (reward, index) {
        return {
          id: safeText(reward && reward.id, "reward-" + index),
          label: safeText(reward && reward.label, "Reward"),
          type: safeText(reward && reward.type, "unknown"),
          displayValue: safeText(reward && reward.displayValue, safeText(reward && reward.type, "-")),
          segmentColor: safeText(reward && reward.segmentColor, "#8e4316"),
          sortOrder: safeNumber(reward && reward.sortOrder, index + 1),
        };
      }),
      rulesText: safeText(safeConfig.rulesText, "Backend-selected local API demo only."),
      serverTime: safeText(safeConfig.serverTime, new Date().toISOString()),
      mode: "local_api_backed",
    };
  }

  function normalizeHistoryRows(rows) {
    return (Array.isArray(rows) ? rows : []).map(function (row) {
      return {
        createdAt: row && row.createdAt,
        rewardLabel: safeText(row && row.rewardLabel, row && row.label),
        rewardType: safeText(row && row.rewardType, row && row.type),
        status: safeText(row && row.status, "pending"),
        prizeIndex: safeNumber(row && row.prizeIndex, 0),
      };
    });
  }

  function normalizeRewardRows(rows) {
    return (Array.isArray(rows) ? rows : []).map(function (row) {
      return {
        createdAt: row && row.createdAt,
        label: safeText(row && row.label, row && row.rewardLabel),
        rewardType: safeText(row && row.rewardType, row && row.type),
        rewardValue: safeText(row && row.rewardValue, row && row.displayValue),
        status: safeText(row && row.status, "pending"),
      };
    });
  }

  function buildFallbackReason(error) {
    if (!isLocalApiHost()) {
      return "Local API-backed mode is limited to localhost or 127.0.0.1. Using local mock fallback.";
    }
    if (!error) {
      return "Local API context is not ready. Using local mock fallback.";
    }
    const status = error && typeof error.status === "number" ? error.status : null;
    const message = safeText(error && error.message, "Local API context unavailable.");
    if (status === 401) return "Local API member session unavailable. Using local mock fallback.";
    if (status === 403) return "Local API access denied for this member context. Using local mock fallback.";
    if (status === 404 || /site not found/i.test(message)) return "Local API site context unavailable. Using local mock fallback.";
    if (/failed to fetch/i.test(message) || /network/i.test(message)) return "Local API is offline. Using local mock fallback.";
    return "Local API-backed mode unavailable. Using local mock fallback.";
  }

  async function apiRequest(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: options && options.method ? options.method : "GET",
      headers: headers(),
      body: options && options.body ? JSON.stringify(options.body) : undefined,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      const parseError = new Error(`Non-JSON response for ${path}`);
      parseError.status = response.status;
      throw parseError;
    }

    if (!response.ok || !payload || payload.success !== true) {
      const error = new Error(payload && payload.message ? payload.message : `Request failed for ${path}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload.data;
  }

  function renderSummary() {
    const config = state.config;
    const balance = config && config.memberBalance ? config.memberBalance : {};
    els.campaignName.textContent = safeText(config && config.name);
    els.campaignStatus.textContent = safeText(config && config.status);
    els.remainingSpins.textContent = safeText(config && config.remainingSpinsToday, "0");
    els.memberPoints.textContent = formatNumber(balance.points);
    els.memberCredit.textContent = formatNumber(balance.credit);
    els.memberTickets.textContent = formatNumber(balance.tickets);
    els.rulesText.textContent = safeText(config && config.rulesText, "No rules text.");
    applyModeUi();
  }

  function renderWheel() {
    const rewards = state.config && Array.isArray(state.config.rewards) ? state.config.rewards : [];
    els.wheelBoard.innerHTML = "";
    for (const reward of rewards) {
      const card = document.createElement("article");
      card.className = "wheel-slice";
      card.style.background = reward.segmentColor || "#8e4316";
      card.innerHTML = `
        <strong>${safeText(reward.label)}</strong>
        <span>${safeText(reward.type)}</span>
        <span>${safeText(reward.displayValue)}</span>
      `;
      els.wheelBoard.appendChild(card);
    }
  }

  function renderResult() {
    if (!state.latestResult) {
      els.resultEmpty.classList.remove("hidden");
      els.resultCard.classList.add("hidden");
      return;
    }
    const result = state.latestResult;
    els.resultEmpty.classList.add("hidden");
    els.resultCard.classList.remove("hidden");
    els.resultLabel.textContent = safeText(result.reward && result.reward.label);
    els.resultValue.textContent = safeText(result.reward && result.reward.displayValue, safeText(result.reward && result.reward.type));
    els.resultMeta.textContent = `Type: ${safeText(result.reward && result.reward.type)} | Amount: ${formatNumber(result.reward && result.reward.amount)}`;
    els.resultSpinId.textContent = safeText(result.spinId);
    els.resultPrizeIndex.textContent = safeText(result.prizeIndex, "0");
    els.resultBalanceAfter.textContent = `Points ${formatNumber(result.balanceAfter && result.balanceAfter.points)} / Credit ${formatNumber(result.balanceAfter && result.balanceAfter.credit)}`;
    els.resultRemainingAfter.textContent = safeText(result.remainingSpinsToday, "0");
  }

  function renderHistory() {
    const rows = Array.isArray(state.history) ? state.history : [];
    els.historyRows.innerHTML = "";
    els.historyEmpty.style.display = rows.length ? "none" : "block";
    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${safeText(formatDate(row.createdAt))}</td>
        <td>${safeText(row.rewardLabel)}</td>
        <td>${safeText(row.rewardType)}</td>
        <td>${safeText(row.status)}</td>
        <td>${safeText(row.prizeIndex, "0")}</td>
      `;
      els.historyRows.appendChild(tr);
    }
  }

  function renderRewards() {
    const rows = Array.isArray(state.rewards) ? state.rewards : [];
    els.rewardRows.innerHTML = "";
    els.rewardsEmpty.style.display = rows.length ? "none" : "block";
    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${safeText(formatDate(row.createdAt))}</td>
        <td>${safeText(row.label)}</td>
        <td>${safeText(row.rewardType)}</td>
        <td>${safeText(row.rewardValue)}</td>
        <td>${safeText(row.status)}</td>
      `;
      els.rewardRows.appendChild(tr);
    }
  }

  async function loadApiBackedState() {
    const [config, history, rewards] = await Promise.all([
      apiRequest(`/member/wheel/config?campaignId=${encodeURIComponent(CAMPAIGN_ID)}`),
      apiRequest("/member/wheel/history"),
      apiRequest("/member/wheel/my-rewards"),
    ]);

    state.config = normalizeApiConfig(config);
    state.history = normalizeHistoryRows(history);
    state.rewards = normalizeRewardRows(rewards);
    setMode("local_api_backed", "Local API-backed runtime is active with demo member context.");
  }

  function loadFallbackState(reason) {
    const fallback = fallbackData();
    state.config = fallback.config;
    state.history = fallback.history;
    state.rewards = fallback.rewards;
    setMode("local_mock_fallback", reason);
  }

  async function loadAll() {
    setBusy(true);
    els.statusText.textContent = "Loading Lucky Wheel demo...";
    try {
      if (!isLocalApiHost()) {
        loadFallbackState(buildFallbackReason());
      } else {
        try {
          await loadApiBackedState();
        } catch (error) {
          loadFallbackState(buildFallbackReason(error));
        }
      }

      renderSummary();
      renderWheel();
      renderHistory();
      renderRewards();
      renderResult();
      els.statusText.textContent = state.apiMode === "local_api_backed"
        ? "Lucky Wheel demo ready in local API-backed mode."
        : "Lucky Wheel demo ready in local mock fallback mode.";
    } finally {
      setBusy(false);
    }
  }

  async function spinWheel() {
    setBusy(true);
    els.statusText.textContent = "Spinning...";
    try {
      if (state.apiMode === "local_api_backed") {
        try {
          state.latestResult = await apiRequest("/member/wheel/spin", {
            method: "POST",
            body: { campaignId: CAMPAIGN_ID },
          });
          await loadApiBackedState();
          els.statusText.textContent = "Spin completed in local API-backed mode.";
        } catch (error) {
          loadFallbackState(buildFallbackReason(error));
          state.latestResult = fallbackSpin();
          els.statusText.textContent = "Local API context dropped. Switched to local mock fallback mode.";
        }
      } else {
        state.latestResult = fallbackSpin();
        loadFallbackState(state.modeReason || "Local mock fallback mode is active.");
        els.statusText.textContent = "Spin completed in local mock fallback mode.";
      }
    } catch (error) {
      els.statusText.textContent = safeText(error.message, "Spin failed.");
    } finally {
      renderSummary();
      renderWheel();
      renderHistory();
      renderRewards();
      renderResult();
      setBusy(false);
    }
  }

  els.refreshAll.addEventListener("click", function () {
    loadAll().catch(function () {});
  });
  els.spinButton.addEventListener("click", function () {
    spinWheel().catch(function () {});
  });

  loadAll().catch(function () {});
})();
