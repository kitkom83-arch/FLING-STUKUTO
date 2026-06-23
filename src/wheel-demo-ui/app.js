(function () {
  "use strict";

  const API_BASE = "/api";
  const SITE_CODE = "PG77";
  const DEMO_MEMBER_ID = "demo_member";
  const CAMPAIGN_ID = "wheel_main";
  const STORAGE_KEY = "pg77-lucky-wheel-demo-fallback-v1";
  const FORCE_FALLBACK_PATHS = ["/wheel-demo", "/wheel-demo/", "/member/wheel-demo", "/member/wheel-demo/"];
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
    apiMode: "api",
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

  function isForcedFallbackPath() {
    const path = String(window.location && window.location.pathname ? window.location.pathname : "").trim();
    return FORCE_FALLBACK_PATHS.includes(path);
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
      rewards: FALLBACK_REWARDS.map(function (reward) {
        return {
          id: reward.id,
          label: reward.label,
          type: reward.type,
          displayValue: reward.displayValue,
          segmentColor: reward.segmentColor,
          sortOrder: 1,
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

  async function apiRequest(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: options && options.method ? options.method : "GET",
      headers: headers(),
      body: options && options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json();
    if (!response.ok || !payload || payload.success !== true) {
      throw new Error(payload && payload.message ? payload.message : `Request failed for ${path}`);
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
    els.modePill.textContent = safeText(config && config.mode);
    els.rulesText.textContent = safeText(config && config.rulesText, "No rules text.");
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

  async function loadAll() {
    setBusy(true);
    els.statusText.textContent = "Loading Lucky Wheel demo...";
    try {
      if (isForcedFallbackPath()) {
        const fallbackOnly = fallbackData();
        state.config = fallbackOnly.config;
        state.history = fallbackOnly.history;
        state.rewards = fallbackOnly.rewards;
        state.apiMode = "fallback";
        renderSummary();
        renderWheel();
        renderHistory();
        renderRewards();
        renderResult();
        els.statusText.textContent = "Lucky Wheel demo ready in local mock fallback mode.";
        return;
      }

      const [config, history, rewards] = await Promise.all([
        apiRequest(`/member/wheel/config?campaignId=${encodeURIComponent(CAMPAIGN_ID)}`),
        apiRequest("/member/wheel/history"),
        apiRequest("/member/wheel/my-rewards"),
      ]);
      state.config = config;
      state.history = history;
      state.rewards = rewards;
      state.apiMode = "api";
      renderSummary();
      renderWheel();
      renderHistory();
      renderRewards();
      renderResult();
      els.statusText.textContent = "Lucky Wheel demo ready.";
    } catch (error) {
      const fallback = fallbackData();
      state.config = fallback.config;
      state.history = fallback.history;
      state.rewards = fallback.rewards;
      state.apiMode = "fallback";
      renderSummary();
      renderWheel();
      renderHistory();
      renderRewards();
      renderResult();
      els.statusText.textContent = "Lucky Wheel demo ready in local mock fallback mode.";
    } finally {
      setBusy(false);
    }
  }

  async function spinWheel() {
    setBusy(true);
    els.statusText.textContent = "Spinning...";
    try {
      if (state.apiMode === "fallback") {
        state.latestResult = fallbackSpin();
      } else {
        state.latestResult = await apiRequest("/member/wheel/spin", {
          method: "POST",
          body: { campaignId: CAMPAIGN_ID },
        });
      }
      await loadAll();
      els.statusText.textContent = "Spin completed.";
    } catch (error) {
      els.statusText.textContent = safeText(error.message, "Spin failed.");
    } finally {
      renderResult();
      setBusy(false);
    }
  }

  els.refreshAll.addEventListener("click", function () {
    loadAll().catch(function () {});
  });
  els.spinButton.addEventListener("click", spinWheel);

  loadAll().catch(function () {});
})();
