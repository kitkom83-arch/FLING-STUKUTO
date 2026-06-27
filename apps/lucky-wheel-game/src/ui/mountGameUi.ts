import type { GameScreen, LuckyWheelState } from '../game/simulation/store';
import { luckyWheelStore } from '../game/simulation/store';
import { getWheelApiMode } from '../game/services/wheelApi';
import type { SpinResult } from '../game/services/wheelApi';

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
    return '';
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
    ${state.modalResult ? renderResultModal(state.modalResult) : ''}
  `;
}

function renderMainControls(state: LuckyWheelState): string {
  const modeLabel = getWheelApiMode() === 'api' ? 'API backend' : 'mock backend';
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
    <nav class="bottom-nav" aria-label="Lucky Wheel navigation">
      <button type="button" data-screen="rewards"><span class="nav-glyph rewards"></span><span>My Rewards</span></button>
      <button type="button" data-screen="rules"><span class="nav-glyph rules"></span><span>Rules</span></button>
      <button type="button" data-screen="history"><span class="nav-glyph history"></span><span>History</span></button>
    </nav>
    <div class="spin-helper">${state.isSpinning ? 'Backend result received - wheel resolving' : `Tap SPIN to request a ${modeLabel} result`}</div>
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
    return '<div class="empty-state">No rewards yet.</div>';
  }

  return `
    <div class="list-stack">
      ${state.rewards
        .map(
          (reward) => `
            <article class="reward-row">
              <div class="reward-icon ${reward.type}"></div>
              <div>
                <h3>${escapeHtml(reward.label)}</h3>
                <p>${escapeHtml(formatAmount(reward.amount, reward.type))} - ${escapeHtml(reward.createdAt)}</p>
              </div>
              <span class="status ${reward.status}">${reward.status}</span>
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
  return `
    <aside class="safe-message" role="status" aria-live="polite">
      <span>${escapeHtml(message)}</span>
      <button type="button" data-close-message aria-label="Dismiss message">×</button>
    </aside>
  `;
}

function renderHistory(state: LuckyWheelState): string {
  if (state.history.length === 0) {
    return '<div class="empty-state">No spins yet.</div>';
  }

  return `
    <div class="list-stack">
      ${state.history
        .map(
          (item) => `
            <article class="history-row">
              <span class="history-index">#${item.prizeIndex + 1}</span>
              <div>
                <h3>${escapeHtml(item.label)}</h3>
                <p>${escapeHtml(formatAmount(item.amount, item.type))} - ${escapeHtml(item.createdAt)}</p>
              </div>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderResultModal(result: SpinResult): string {
  return `
    <div class="modal-backdrop" role="presentation">
      <section class="result-modal" role="dialog" aria-modal="true" aria-label="Prize result">
        <button type="button" class="modal-close" data-close-result aria-label="Close result">×</button>
        <div class="result-image ${result.rewardType}"></div>
        <span class="result-kicker">Prize Result</span>
        <h2>${escapeHtml(result.rewardLabel)}</h2>
        <p>${escapeHtml(formatAmount(result.amount, result.rewardType))}</p>
        <span class="result-meta">${formatRewardType(result.rewardType)}</span>
        <button type="button" data-close-result>OK</button>
      </section>
    </div>
  `;
}

function formatRewardType(type: SpinResult['rewardType']): string {
  if (type === 'none' || type === 'retry') {
    return 'Demo outcome';
  }
  return `Demo ${type} reward`;
}

function formatAmount(amount: number, type: SpinResult['rewardType']): string {
  if (type === 'none') {
    return 'No reward this spin';
  }
  if (type === 'retry') {
    return 'Try again on another spin';
  }
  if (type === 'jackpot') {
    return `${amount} mock jackpot points`;
  }
  if (type === 'item') {
    return `${amount} item`;
  }
  return `${amount} ${type}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
