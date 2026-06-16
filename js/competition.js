// ==================== 競争モード ====================

const COMPETITION_SIMULATION_VERSION = '2026-04-competition-v1';
const PLAYER_PROFILE_STORAGE_KEY = 'terra_farm_player_profile_v1';
const MAX_PLAYER_NAME_LENGTH = 20;

let competitionState = {
  currentEvent: null,
  leaderboard: [],
  playerEntry: null,
  isLoading: false,
  isSubmitting: false,
  loadError: '',
  playerProfile: {
    id: null,
    displayName: ''
  }
};

function normalizePlayerName(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_PLAYER_NAME_LENGTH);
}

function buildAnonymousPlayerId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `player-${Math.random().toString(36).slice(2, 12)}`;
}

function loadStoredPlayerProfile() {
  try {
    const raw = localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStoredPlayerProfile(profile) {
  try {
    localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorageが使えない環境では永続化を諦める
  }
}

function ensurePlayerProfile() {
  if (competitionState.playerProfile.id) return competitionState.playerProfile;
  const stored = loadStoredPlayerProfile() || {};
  const profile = {
    id: stored.id || buildAnonymousPlayerId(),
    displayName: normalizePlayerName(stored.displayName || '')
  };
  competitionState.playerProfile = profile;
  saveStoredPlayerProfile(profile);
  if (elements.playerNameInput && profile.displayName) {
    elements.playerNameInput.value = profile.displayName;
  }
  return profile;
}

function persistPlayerProfile(displayName) {
  const current = ensurePlayerProfile();
  const normalizedName = normalizePlayerName(displayName);
  const next = {
    id: current.id,
    displayName: normalizedName
  };
  competitionState.playerProfile = next;
  saveStoredPlayerProfile(next);
  return next;
}

function getSelectedMode() {
  return elements.modeSelect?.value || 'solo';
}

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function seededHash() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed) {
  return function seededRandom() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeededRandom(seedString) {
  const seedFactory = xmur3(String(seedString || 'terra-farm'));
  return mulberry32(seedFactory());
}

function gameRandom() {
  return typeof state.randomizer === 'function' ? state.randomizer() : Math.random();
}

function calculateFinalScore(snapshot = state) {
  const C = GAME_CONFIG.scoring;
  return Math.round(
    (snapshot.budget / C.budgetDivisor) +
    (snapshot.envScore * C.envScoreMultiplier) +
    (snapshot.eraIndex * C.eraMultiplier)
  );
}

function formatBudgetInputValue(amount) {
  if (!Number.isFinite(amount)) return '';
  if (Math.abs(amount) >= 1e9) {
    const billions = amount / 1e9;
    return Number.isInteger(billions) ? `${billions}B` : `${billions.toFixed(1)}B`;
  }
  if (Math.abs(amount) >= 1e6) {
    const millions = amount / 1e6;
    return Number.isInteger(millions) ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  return String(Math.round(amount));
}

function setSelectedCountry(countryKey) {
  for (const radio of elements.countrySelectRadios) {
    radio.checked = radio.value === countryKey;
    if (radio.closest('.country-option')) {
      radio.closest('.country-option').classList.toggle('is-locked', getSelectedMode() === 'competition');
    }
  }
}

function applyCompetitionModeToInputs() {
  const competitionMode = getSelectedMode() === 'competition';
  const frontierMode = getSelectedMode() === 'frontier';
  const event = competitionState.currentEvent;
  const hasLockedEvent = competitionMode && !!event;

  for (const radio of elements.countrySelectRadios) {
    radio.disabled = hasLockedEvent;
    const option = radio.closest('.country-option');
    if (option) option.classList.toggle('is-locked', hasLockedEvent);
  }
  if (elements.yearSelect) elements.yearSelect.disabled = hasLockedEvent;
  if (elements.budgetInput) elements.budgetInput.disabled = hasLockedEvent;
  if (elements.challengeSelect) elements.challengeSelect.disabled = hasLockedEvent || frontierMode;

  if (hasLockedEvent) {
    setSelectedCountry(event.countryKey);
    elements.yearSelect.value = event.missionYear;
    elements.budgetInput.value = formatBudgetInputValue(event.startingBudget);
    elements.challengeSelect.value = event.challengeKey;
  } else if (frontierMode && elements.challengeSelect) {
    elements.challengeSelect.value = 'regen_loop';
  }

  if (!elements.modeHelper) return;
  if (competitionMode && event) {
    elements.modeHelper.textContent = `競争モードでは「${event.name}」の条件で固定されます。プレイヤー名を入力して開始してください。`;
  } else if (competitionMode) {
    elements.modeHelper.textContent = '競争モードを準備中です。大会情報の取得を待ってから開始してください。';
  } else if (frontierMode) {
    const modeInfo = PLAY_MODES.frontier;
    elements.modeHelper.textContent = `${modeInfo.name}: ${modeInfo.description} チャレンジは「再生ループ」に固定されます。`;
  } else {
    elements.modeHelper.textContent = '通常プレイでは国・予算・チャレンジを自由に設定できます。';
  }
}

function renderCompetitionSummary(event) {
  if (!elements.competitionEventSummary) return;
  elements.competitionEventSummary.innerHTML = '';
  if (!event) return;

  const country = COUNTRIES[event.countryKey];
  const challenge = CHALLENGES[event.challengeKey] || CHALLENGES.free;
  const summaryRows = [
    ['大会条件', event.name],
    ['国 / 年', `${country?.flag || ''} ${country?.name || event.countryKey} / ${2000 + parseInt(event.missionYear, 10)}`],
    ['初期予算', formatUSD(event.startingBudget)],
    ['チャレンジ', challenge.name],
    ['ターン数', `${event.turnCount} ターン`],
    ['ルール版', event.rulesetVersion]
  ];

  summaryRows.forEach(([label, value]) => {
    const wrap = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    wrap.appendChild(dt);
    wrap.appendChild(dd);
    elements.competitionEventSummary.appendChild(wrap);
  });
}

function renderCompetitionLeaderboard() {
  if (!elements.leaderboardList || !elements.leaderboardEmpty || !elements.leaderboardPlayerBest) return;
  elements.leaderboardList.innerHTML = '';

  const entries = competitionState.leaderboard || [];
  const playerEntry = competitionState.playerEntry;
  elements.leaderboardEmpty.hidden = entries.length > 0;
  elements.leaderboardEmpty.textContent = competitionState.loadError
    ? 'ランキングを取得できませんでした。'
    : 'まだスコアが登録されていません。';

  if (playerEntry) {
    elements.leaderboardPlayerBest.textContent = `自分の記録: ${playerEntry.rank}位 / ${playerEntry.finalScore.toLocaleString()} 点`;
  } else {
    elements.leaderboardPlayerBest.textContent = '自分の記録: 未登録';
  }

  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    item.className = 'leaderboard-item';
    if (playerEntry && playerEntry.anonymousPlayerId === entry.anonymousPlayerId) {
      item.classList.add('is-self');
    }

    const rank = document.createElement('span');
    rank.className = 'leaderboard-rank';
    rank.textContent = `${entry.rank || index + 1}位`;

    const main = document.createElement('div');
    main.className = 'leaderboard-main';

    const name = document.createElement('span');
    name.className = 'leaderboard-name';
    name.textContent = entry.displayName;

    const meta = document.createElement('span');
    meta.className = 'leaderboard-meta';
    const missionYear = entry.missionYear ? `${2000 + parseInt(entry.missionYear, 10)}年` : '';
    meta.textContent = `${missionYear} / 環境 ${entry.envScore} / 技術 ${entry.eraIndex}`;

    const score = document.createElement('span');
    score.className = 'leaderboard-score';
    score.textContent = `${entry.finalScore.toLocaleString()} 点`;

    main.appendChild(name);
    main.appendChild(meta);
    item.appendChild(rank);
    item.appendChild(main);
    item.appendChild(score);
    elements.leaderboardList.appendChild(item);
  });
}

function renderCompetitionCard() {
  if (!elements.competitionCard) return;
  const event = competitionState.currentEvent;

  if (elements.refreshLeaderboardButton) {
    elements.refreshLeaderboardButton.disabled = competitionState.isLoading;
  }

  if (elements.competitionEventName) {
    elements.competitionEventName.textContent = event ? event.name : '競争モード';
  }
  if (elements.competitionEventDescription) {
    elements.competitionEventDescription.textContent = event
      ? event.description
      : '固定シードの大会条件でランキングに挑戦できます。';
  }
  if (elements.competitionStatus) {
    if (competitionState.isLoading) {
      elements.competitionStatus.textContent = '大会情報を読み込み中です...';
    } else if (competitionState.loadError) {
      elements.competitionStatus.textContent = `競争モードを読み込めません: ${competitionState.loadError}`;
    } else if (event) {
      elements.competitionStatus.textContent = '現在の大会条件です。競争モードではこの設定で固定されます。';
    } else {
      elements.competitionStatus.textContent = '利用可能な大会がまだありません。';
    }
  }

  renderCompetitionSummary(event);
  renderCompetitionLeaderboard();
}

function renderCompetitionFinalStatus(text = '', status = '') {
  if (!elements.finalCompetitionStatus || !elements.retrySubmitScore) return;
  elements.finalCompetitionStatus.textContent = text;
  elements.finalCompetitionStatus.classList.remove('is-success', 'is-error', 'is-pending');
  if (status) {
    elements.finalCompetitionStatus.classList.add(`is-${status}`);
  }
  elements.retrySubmitScore.hidden = status !== 'error';
}

function renderSessionSummary() {
  if (!elements.sessionSummary) return;
  const parts = [];
  if (state.playerName) parts.push(`プレイヤー: ${state.playerName}`);
  const modeInfo = PLAY_MODES[state.mode] || PLAY_MODES.solo;
  parts.push(`モード: ${modeInfo.name}`);
  if (state.mode === 'competition' && state.competitionEventName) {
    parts.push(`大会: ${state.competitionEventName}`);
  }
  elements.sessionSummary.textContent = parts.join(' / ');
}

async function fetchCompetitionJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload;
}

function buildLeaderboardUrl(eventId) {
  const params = new URLSearchParams();
  if (eventId) params.set('eventId', eventId);
  const playerId = ensurePlayerProfile().id;
  if (playerId) params.set('playerId', playerId);
  return `/api/leaderboard?${params.toString()}`;
}

async function loadCompetitionLobby() {
  ensurePlayerProfile();
  competitionState.isLoading = true;
  competitionState.loadError = '';
  renderCompetitionCard();
  try {
    const playerId = ensurePlayerProfile().id;
    const data = await fetchCompetitionJson(`/api/competition/current?playerId=${encodeURIComponent(playerId)}`);
    competitionState.currentEvent = data.event || null;
    competitionState.leaderboard = data.leaderboard || [];
    competitionState.playerEntry = data.playerEntry || null;
    competitionState.loadError = '';
  } catch (error) {
    competitionState.currentEvent = null;
    competitionState.leaderboard = [];
    competitionState.playerEntry = null;
    competitionState.loadError = error.message;
  } finally {
    competitionState.isLoading = false;
    renderCompetitionCard();
    applyCompetitionModeToInputs();
  }
}

async function refreshCompetitionLeaderboard() {
  const eventId = competitionState.currentEvent?.id;
  if (!eventId) {
    await loadCompetitionLobby();
    return;
  }
  competitionState.isLoading = true;
  renderCompetitionCard();
  try {
    const data = await fetchCompetitionJson(buildLeaderboardUrl(eventId));
    competitionState.leaderboard = data.leaderboard || [];
    competitionState.playerEntry = data.playerEntry || null;
    competitionState.loadError = '';
  } catch (error) {
    competitionState.loadError = error.message;
  } finally {
    competitionState.isLoading = false;
    renderCompetitionCard();
  }
}

function buildCompetitionSubmissionPayload() {
  return {
    eventId: state.competitionEventId,
    anonymousPlayerId: state.playerId,
    displayName: state.playerName,
    mission: {
      countryKey: state.countryKey,
      missionYear: state.year,
      challengeKey: state.challenge,
      startingBudget: state.initialBudget,
      turnLimit: state.turnLimit,
      seed: state.competitionSeed,
      simulationVersion: state.simulationVersion
    },
    result: {
      finalScore: state.finalScore,
      remainingBudget: state.budget,
      totalFoodValue: state.totalFoodValue,
      envScore: state.envScore,
      eraIndex: state.eraIndex,
      challengeStatus: state.challengeStatus,
      turnsPlayed: state.history.length,
      history: state.history,
      chartData: state.chartData
    }
  };
}

async function submitCompetitionResult() {
  if (state.mode !== 'competition' || !state.competitionEventId || competitionState.isSubmitting) return;
  competitionState.isSubmitting = true;
  renderCompetitionFinalStatus('ランキングへ送信中です...', 'pending');
  try {
    const payload = buildCompetitionSubmissionPayload();
    const data = await fetchCompetitionJson('/api/leaderboard', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    competitionState.leaderboard = data.leaderboard || competitionState.leaderboard;
    competitionState.playerEntry = data.playerEntry || data.entry || competitionState.playerEntry;
    renderCompetitionCard();
    if (data.improved) {
      renderCompetitionFinalStatus(`ランキング登録完了。現在 ${data.rank} 位で自己ベスト更新です。`, 'success');
    } else {
      renderCompetitionFinalStatus(`送信完了。今回のスコアでは自己ベストを更新せず、現在順位は ${data.rank} 位です。`, 'success');
    }
  } catch (error) {
    renderCompetitionFinalStatus(`ランキング送信に失敗しました: ${error.message}`, 'error');
  } finally {
    competitionState.isSubmitting = false;
  }
}

function handleGameModeChange() {
  applyCompetitionModeToInputs();
  if (elements.startError) elements.startError.textContent = '';
}

function bootstrapCompetition() {
  ensurePlayerProfile();
  renderCompetitionCard();
  applyCompetitionModeToInputs();
  renderCompetitionFinalStatus('', '');
  void loadCompetitionLobby();
}
