import type { GameScreen, LuckyWheelState } from '../game/simulation/store';
import { luckyWheelStore } from '../game/simulation/store';
import { getWheelApiMode } from '../game/services/wheelApi';
import type { SpinResult } from '../game/services/wheelApi';

const CONFIG_LOADING_MARKER = 'config-loading';
const AUTH_MISSING_MARKER = 'auth-missing';
const BACKEND_ERROR_MARKER = 'backend-error';
const NETWORK_ERROR_MARKER = 'network-error';

export function mountGameUi(root: HTMLDivElement): void {
  luckyWheelStore.subscribe((state) => {
    root.innerHTML = renderUi(state);
    bindUi(root, state);
  });
}

function bindUi(root: HTMLDivElement, state: LuckyWheelState): void {
  root.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach((button) => {
    button.addEventListener('click', () => {
      luckyWheelStore.setScreen(button.dataset.screen as GameScreen);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-back-main]').forEach((button) => {
    button.addEventListener('click', () => luckyWheelStore.setScreen('main'));
  });

  root.querySelectorAll<HTMLButtonElement>('[data-close-result]').forEach((button) => {
    button.addEventListener('click', () => luckyWheelStore.closeResult());
  });

  root.querySelectorAll<HTMLButtonElement>('[data-close-message]').forEach((button) => {
    button.addEventListener('click', () => luckyWheelStore.closeMessage());
  });

  if (state.isSpinning) {
    root.classList.add('is-spinning');
  } else {
    root.classList.remove('is-spinning');
  }
}

function renderUi(state: LuckyWheelState): string {
  if (state.isLoading) {
    return renderLoadingState();
  }

  return `
    <div class="hud-top">
      <div class="balance-strip" aria-label="Player demo balances">
        <span class="balance-pill"><span>Credit</span><strong>${state.creditBalance}</strong></span>
        <span class="balance-pill"><span>Points</span><strong>${state.pointsBalance}</strong></span>
        <span class="balance-pill"><span>Tickets</span><strong>${state.ticketBalance}</strong></span>
      </div>
      <div class="spin-badge" aria-label="Remaining spins">x${state.remainingSpins}</div>
    </div>
    ${state.screen === 'main' ? renderMainControls(state) : renderScreen(state)}
    ${state.errorMessage ? renderSafeMessage(state.errorMessage) : ''}
    ${state.modalResult ? renderResultModal(state, state.modalResult) : ''}
  `;
}

function renderMainControls(state: LuckyWheelState): string {
  const isApiMode = getWheelApiMode() === 'api';
  const modeLabel = isApiMode ? 'API backend' : 'local preview';
  const featuredSegments = state.wheelSegments.slice(0, 4);
  return `
    <section class="reward-preview" aria-label="Current wheel rewards">
      <div>
        <span>Reward Lineup</span>
        <strong>${escapeHtml(state.campaignName)}</strong>
      </div>
      <div class="segment-chips">
        ${featuredSegments.map((segment) => `<span>${escapeHtml(segment.shortLabel)}</span>`).join('')}
      </div>
    </section>
    <section class="campaign-status-card" aria-label="Lucky Wheel status" data-wheel-state="campaign-ready">
      <div>
        <span>Campaign Status</span>
        <strong>${state.isSpinning ? 'Submitting spin to backend' : 'Ready for member spin'}</strong>
      </div>
      <p>${state.isSpinning ? 'Waiting for the backend-selected result and wheel animation to finish.' : `Tap SPIN to request a ${modeLabel} result for this campaign.`}</p>
      <small data-wheel-state="result-backend-sync">${isApiMode ? 'My Rewards and History refresh from backend endpoints after a successful spin.' : 'Preview mode keeps the same UI flow without changing the production contract.'}</small>
    </section>
    <nav class="bottom-nav" aria-label="Lucky Wheel navigation">
      <button type="button" data-screen="rewards"><span class="nav-glyph rewards"></span><span>My Rewards</span></button>
      <button type="button" data-screen="rules"><span class="nav-glyph rules"></span><span>Rules</span></button>
      <button type="button" data-screen="history"><span class="nav-glyph history"></span><span>History</span></button>
    </nav>
    <div class="spin-helper">${state.isSpinning ? 'Backend result received. Resolving wheel animation.' : 'SPIN sends only the campaign ID and waits for the backend-selected result.'}</div>
    <div class="member-demo-link-row">
      <a class="member-demo-link" href="/member-money-demo/">Back to Member Demo</a>
      <span>Return and tap Refresh Data after a spin to refresh the wallet view.</span>
    </div>
  `;
}

function renderScreen(state: LuckyWheelState): string {
  const title = state.screen === 'rewards' ? 'My Rewards' : state.screen === 'rules' ? 'Rules' : 'Spin History';
  return `
    <section class="panel-screen" aria-label="${title}">
      <header>
        <button type="button" class="icon-button" data-back-main aria-label="Back">‹</button>
        <h2>${title}</h2>
      </header>
      ${state.screen === 'rewards' ? renderRewards(state) : ''}
      ${state.screen === 'rules' ? renderRules(state) : ''}
      ${state.screen === 'history' ? renderHistory(state) : ''}
    </section>
  `;
}

function renderRewards(state: LuckyWheelState): string {
  if (state.rewards.length === 0) {
    return `
      <section class="empty-state-card" data-wheel-state="rewards-empty-state">
        <span>My Rewards</span>
        <h3>No rewards yet</h3>
        <p>Your backend-confirmed rewards will appear here after a successful spin.</p>
      </section>
    `;
  }

  return `
    <div class="list-stack">
      <div class="list-intro" data-wheel-state="rewards-backend-list">
        <span>Member Rewards</span>
        <p>${getWheelApiMode() === 'api' ? 'These reward rows are refreshed from the backend member reward list.' : 'Preview reward rows follow the same frontend layout without changing the live API contract.'}</p>
      </div>
      ${state.rewards
        .map(
          (reward) => `
            <article class="reward-row">
              <div class="reward-icon ${reward.type}"></div>
              <div class="reward-copy">
                <h3>${escapeHtml(reward.label)}</h3>
                <p>${escapeHtml(formatRewardTypeLabel(reward.type))} · ${escapeHtml(formatAmount(reward.amount, reward.type))}</p>
                <small>${escapeHtml(formatRewardStatusSummary(reward.status))} · ${escapeHtml(reward.createdAt)}</small>
              </div>
              <span class="status ${reward.status}">${escapeHtml(formatRewardStatusLabel(reward.status))}</span>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderRules(state: LuckyWheelState): string {
  return `
    <div class="rules-copy">
      ${
        state.rulesText
          ? `<article class="rule-card featured-rule">
              <span>PG</span>
              <div>
                <h3>Campaign Rules</h3>
                <p>${escapeHtml(state.rulesText)}</p>
              </div>
            </article>`
          : ''
      }
      <article class="rule-card">
        <span>01</span>
        <div>
          <h3>Demo Rewards Only</h3>
          <p>This prototype demonstrates a festival lucky wheel flow with safe demo rewards only.</p>
        </div>
      </article>
      <article class="rule-card">
        <span>02</span>
        <div>
          <h3>Backend Result Driven</h3>
          <p>The frontend does not randomize outcomes. It animates to the prizeIndex returned by the selected backend mode.</p>
        </div>
      </article>
      <article class="rule-card">
        <span>03</span>
        <div>
          <h3>Prototype Safety</h3>
          <p>No real money, real reward payout, payment provider, or external reward service is connected.</p>
        </div>
      </article>
      <article class="rule-card">
        <span>04</span>
        <div>
          <h3>Spin Limit Placeholder</h3>
          <p>Demo starts with three spins. Prize stock, daily limit, and spin cost are placeholders for backend integration.</p>
        </div>
      </article>
    </div>
  `;
}

function renderSafeMessage(message: string): string {
  const state = classifyUiMessage(message);
  return `
    <aside class="safe-message ${state.kind}" role="status" aria-live="polite" data-wheel-state="${state.marker}">
      <div>
        <strong>${escapeHtml(state.title)}</strong>
        <span>${escapeHtml(state.detail)}</span>
      </div>
      <button type="button" data-close-message aria-label="Dismiss message">×</button>
    </aside>
  `;
}

function renderHistory(state: LuckyWheelState): string {
  if (state.history.length === 0) {
    return `
      <section class="empty-state-card" data-wheel-state="history-empty-state">
        <span>Spin History</span>
        <h3>No spin history yet</h3>
        <p>Your latest backend-selected result will appear here after the first successful spin.</p>
      </section>
    `;
  }

  return `
    <div class="list-stack">
      <div class="list-intro" data-wheel-state="history-backend-list">
        <span>Recent Spins</span>
        <p>${getWheelApiMode() === 'api' ? 'History rows are refreshed from the backend spin history endpoint.' : 'Preview history follows the same layout while backend mode stays source of truth.'}</p>
      </div>
      ${state.history
        .map(
          (item) => `
            <article class="history-row">
              <span class="history-index">#${item.prizeIndex + 1}</span>
              <div class="reward-copy">
                <h3>${escapeHtml(item.label)}</h3>
                <p>${escapeHtml(formatRewardTypeLabel(item.type))} · ${escapeHtml(formatAmount(item.amount, item.type))}</p>
                <small>Recorded ${escapeHtml(item.createdAt)}</small>
              </div>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderResultModal(state: LuckyWheelState, result: SpinResult): string {
  const resultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="modal-backdrop" role="presentation">
      <section class="result-modal" role="dialog" aria-modal="true" aria-label="Prize result">
        <button type="button" class="modal-close" data-close-result aria-label="Close result">×</button>
        <div class="result-image ${result.rewardType}"></div>
        <span class="result-kicker">Prize Result</span>
        <h2>${escapeHtml(result.rewardLabel)}</h2>
        <p>${escapeHtml(formatAmount(result.amount, result.rewardType))}</p>
        <span class="result-meta">${escapeHtml(formatRewardTypeLabel(result.rewardType))}</span>
        <div class="result-detail-grid" data-wheel-state="spin-result-details">
          <div><span>Reward Type</span><strong>${escapeHtml(formatRewardTypeLabel(result.rewardType))}</strong></div>
          <div><span>Value</span><strong>${escapeHtml(formatAmount(result.amount, result.rewardType))}</strong></div>
          <div><span>Campaign</span><strong>${escapeHtml(state.campaignName)}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(formatResultStatusMessage(result))}</strong></div>
          <div><span>Shown</span><strong>${escapeHtml(resultTime)}</strong></div>
          <div><span>Sync</span><strong>${escapeHtml(getResultSyncMessage())}</strong></div>
        </div>
        <button type="button" data-close-result>OK</button>
      </section>
    </div>
  `;
}

function renderLoadingState(): string {
  return `
    <section class="state-card state-card-loading" aria-label="Lucky Wheel loading state" data-wheel-state="${CONFIG_LOADING_MARKER}">
      <span>Config Loading</span>
      <h2>Loading Lucky Wheel</h2>
      <p>Fetching campaign config and member-ready UI before the wheel opens.</p>
      <div class="state-card-pulse" aria-hidden="true"></div>
    </section>
  `;
}

function formatRewardTypeLabel(type: SpinResult['rewardType']): string {
  if (type === 'none' || type === 'retry') {
    return type === 'retry' ? 'Retry' : 'No Reward';
  }
  if (type === 'item') {
    return 'Item';
  }
  if (type === 'jackpot') {
    return 'Jackpot';
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatAmount(amount: number, type: SpinResult['rewardType']): string {
  if (type === 'none') {
    return 'No reward this spin';
  }
  if (type === 'retry') {
    return 'Try again on another spin';
  }
  if (type === 'jackpot') {
    return amount > 0 ? `${amount} jackpot points` : 'Jackpot reward';
  }
  if (type === 'item') {
    return amount > 0 ? `${amount} item` : 'Item reward';
  }
  return amount > 0 ? `${amount} ${formatRewardTypeLabel(type).toLowerCase()}` : formatRewardTypeLabel(type);
}

function formatRewardStatusLabel(status: 'pending' | 'claimed' | 'expired'): string {
  if (status === 'claimed') {
    return 'Claimed';
  }
  if (status === 'expired') {
    return 'Expired';
  }
  return 'Pending';
}

function formatRewardStatusSummary(status: 'pending' | 'claimed' | 'expired'): string {
  if (status === 'claimed') {
    return 'Reward already processed';
  }
  if (status === 'expired') {
    return 'Reward is no longer available';
  }
  return 'Waiting for reward action';
}

function formatResultStatusMessage(result: SpinResult): string {
  if (result.rewardType === 'none') {
    return 'Backend returned no reward';
  }
  if (result.rewardType === 'retry') {
    return 'Backend returned retry reward';
  }
  return 'Backend selected reward ready';
}

function getResultSyncMessage(): string {
  return getWheelApiMode() === 'api'
    ? 'History and My Rewards refresh from backend'
    : 'Preview flow stays local-only';
}

function classifyUiMessage(message: string): { marker: string; kind: string; title: string; detail: string } {
  const lower = message.toLowerCase();
  if (lower.includes('session unavailable') || lower.includes('sign in again')) {
    return {
      marker: AUTH_MISSING_MARKER,
      kind: 'auth-missing',
      title: 'Login required',
      detail: 'Sign in from Member Demo first, then reopen Lucky Wheel.'
    };
  }
  if (lower.includes('spin is not available') || lower.includes('not available right now')) {
    return {
      marker: BACKEND_ERROR_MARKER,
      kind: 'backend-error',
      title: 'Campaign unavailable',
      detail: message
    };
  }
  return {
    marker: NETWORK_ERROR_MARKER,
    kind: 'network-error',
    title: 'Local server or network issue',
    detail: 'Lucky Wheel could not reach the backend. Check the local server and try again.'
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
