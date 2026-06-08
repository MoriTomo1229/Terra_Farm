// ==================== DOM要素 ====================
const $ = s => document.querySelector(s);
const THEME_STORAGE_KEY = 'terra_farm_theme';
const VALID_THEMES = ['dark', 'light', 'signal'];
const elements = {
  startScreen: $('#start-screen'),
  playerNameInput: $('#player-name-input'),
  modeSelect: $('#mode-select'),
  themeSelect: $('#theme-select'),
  themeSelectHeader: $('#theme-select-header'),
  modeHelper: $('#mode-helper'),
  countrySelectRadios: document.getElementsByName('country'),
  budgetInput: $('#budget-input'),
  yearSelect: $('#year-select'),
  challengeSelect: $('#challenge-select'),
  competitionCard: $('#competition-card'),
  competitionEventName: $('#competition-event-name'),
  competitionEventDescription: $('#competition-event-description'),
  competitionStatus: $('#competition-status'),
  competitionEventSummary: $('#competition-event-summary'),
  refreshLeaderboardButton: $('#refresh-leaderboard-button'),
  leaderboardPlayerBest: $('#leaderboard-player-best'),
  leaderboardList: $('#leaderboard-list'),
  leaderboardEmpty: $('#leaderboard-empty'),
  startButton: $('#start-button'),
  startError: $('#start-error'),

  newsRoot: $('#news-root'),

  header: $('#main-header'),
  selectedCountry: $('#selected-country'),
  sessionSummary: $('#session-summary'),
  challengeBadge: $('#challenge-badge'),
  missionPulse: $('#mission-pulse'),
  missionPulseGuidance: $('#mission-pulse-guidance'),
  pulseRisk: $('#pulse-risk'),
  pulseResilience: $('#pulse-resilience'),
  pulseFocus: $('#pulse-focus'),
  gameContainer: $('#game-container'),

  turnCounter: $('#turn-counter'),
  maxTurns: $('#max-turns'),
  budgetValue: $('#budget-value'),
  totalFoodValue: $('#total-food-value'),
  envScoreValue: $('#env-score-value'),
  resilienceValue: $('#resilience-value'),
  climateRiskValue: $('#climate-risk-value'),
  eraValue: $('#era-value'),
  techPointsValue: $('#tech-points-value'),
  challengeProgress: $('#challenge-progress'),
  cropValue: $('#crop-value'),

  ndviValue: $('#ndvi-value'),
  moistureValue: $('#moisture-value'),
  precipitationValue: $('#precipitation-value'),
  temperatureValue: $('#temperature-value'),

  map: $('#map'),
  cropSelect: $('#crop-select'),
  fertilizerSlider: $('#fertilizer-slider'),
  irrigationSlider: $('#irrigation-slider'),
  techSlider: $('#tech-slider'),
  fertilizerValue: $('#fertilizer-value'),
  irrigationValue: $('#irrigation-value'),
  techValue: $('#tech-value'),
  remainingBudget: $('#remaining-budget'),
  allocationWarning: $('#allocation-warning'),
  previewMix: $('#preview-mix'),
  previewRisk: $('#preview-risk'),
  previewOutcome: $('#preview-outcome'),
  previewGuidance: $('#preview-guidance'),
  executeButton: $('#execute-turn-button'),
  autoAllocateButton: $('#auto-allocate-button'),
  specialSkillButton: $('#special-skill'),
  presetEnv: $('#preset-env'),
  presetRevenue: $('#preset-revenue'),
  presetTech: $('#preset-tech'),
  presetCustomApply: $('#preset-custom-apply'),
  presetCustomSave: $('#preset-custom-save'),
  presetCustomLabel: $('#preset-custom-label'),

  turnResultText: $('#turn-result-text'),
  eventText: $('#event-text'),
  unReport: $('#un-report'),
  climatePulseText: $('#climate-pulse-text'),
  climatePulseTags: $('#climate-pulse-tags'),
  log: $('#log'),
  historyPanel: $('#history-panel'),
  historyBody: $('#history-body'),

  trendRevenue: $('#trend-revenue'),
  trendNdvi: $('#trend-ndvi'),
  trendEnv: $('#trend-env'),
  trendTech: $('#trend-tech'),
  trendRevenueLast: $('#trend-revenue-last'),
  trendNdviLast: $('#trend-ndvi-last'),
  trendEnvLast: $('#trend-env-last'),
  trendTechLast: $('#trend-tech-last'),
  trendRevenueLine: $('#trend-revenue-line'),
  trendNdviLine: $('#trend-ndvi-line'),
  trendEnvLine: $('#trend-env-line'),
  trendTechLine: $('#trend-tech-line'),

  gameOverModal: $('#game-over-modal'),
  finalFood: $('#final-food'),
  finalEnv: $('#final-env'),
  finalTech: $('#final-tech'),
  finalChallenge: $('#final-challenge'),
  finalScore: $('#final-score'),
  finalCompetitionStatus: $('#final-competition-status'),
  retrySubmitScore: $('#retry-submit-score'),
  replayButton: $('#replay-button'),
  downloadLog: $('#download-log'),
  unlockList: $('#unlock-list')
};

// ==================== UI描画 & ヘルパー ====================

const NEWS_POOL = [
  "🌍 世界の平均気温が0.3°C上昇したと報告されました。",
  "🧪 新しい環境配慮型肥料が国際特許を取得。",
  "🚀 地球観測衛星の運用が拡張。NDVIの精度が向上。",
  "💹 穀物先物が上昇。世界的な需要増が背景。",
  "🌋 火山活動が活発化。日射が一時的に低下の見込み。",
  "🌧️ 大気循環の変化でモンスーンの到来が早まる可能性。"
];
function showWorldNews() {
  const n = NEWS_POOL[Math.floor(Math.random()*NEWS_POOL.length)];
  const banner = document.createElement('div');
  banner.className = 'news-banner';
  banner.textContent = n;
  elements.newsRoot.appendChild(banner);
  setTimeout(()=>banner.remove(), 4200);
}

function generateUNReport() {
  let base = "📊 国連レポート: おおむね安定していますが、長期的な気候リスクに注意が必要です。";
  if (state.envScore < 35) base = "🌍 国連レポート: 環境悪化が深刻です。持続可能性の再考を推奨します。";
  else if (state.techPoints > GAME_CONFIG.technology.unlocks.orbitalNet) base = "🚀 国連レポート: 技術革新が農業の効率化に顕著な効果。";
  else if (state.avgNdvi > 0.65) base = "🌱 国連レポート: 植生指数は良好。安定的な食料供給が見込めます。";

  if (state.mode === 'frontier') {
    if (state.resilienceScore < 45) return base + " フロンティア地域の再生力が不足しています。灌漑と技術投資の下支えが必要です。";
    if (state.resilienceScore >= 75) return base + " 高リスク気候下でも農地の回復力が定着しつつあります。";
  }
  return base;
}

function pushUnlock(text) {
  const li = document.createElement('li');
  li.textContent = text;
  elements.unlockList.appendChild(li);
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : 'dark';
  } catch (_) {
    return 'dark';
  }
}

function syncThemeControls(theme) {
  if (elements.themeSelect) elements.themeSelect.value = theme;
  if (elements.themeSelectHeader) elements.themeSelectHeader.value = theme;
}

function applyTheme(theme, { persist = true } = {}) {
  const nextTheme = VALID_THEMES.includes(theme) ? theme : 'dark';
  document.body.setAttribute('data-theme', nextTheme);
  syncThemeControls(nextTheme);
  if (!persist) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (_) {
    // localStorageが使えない環境では永続化を諦める
  }
}

function renderUI() {
  elements.turnCounter.textContent = state.turn;
  elements.maxTurns.textContent = state.turnLimit || TURN_COUNT;
  elements.budgetValue.textContent = formatUSD(state.budget);
  elements.totalFoodValue.textContent = formatUSD(state.totalFoodValue);
  elements.envScoreValue.textContent = state.envScore;
  if (elements.resilienceValue) elements.resilienceValue.textContent = state.resilienceScore;
  if (elements.climateRiskValue) elements.climateRiskValue.textContent = state.climateRisk;
  elements.eraValue.textContent = ERAS[state.eraIndex];
  elements.techPointsValue.textContent = state.techPoints.toLocaleString();
  elements.cropValue.textContent = CROPS[elements.cropSelect.value]?.name || '-';
  elements.ndviValue.textContent = state.avgNdvi.toFixed(3);
  elements.moistureValue.textContent = state.soilMoisture;
  elements.precipitationValue.textContent = state.precipitation;
  elements.temperatureValue.textContent = state.temperature;
  updateChallengeProgressUI();
  renderMap();
  renderHistory();
  renderTrendChart();
  renderClimatePulseUI();
  updateCustomPresetLabel();
  updateRemainingBudget();
}

function ndviToColor(v) {
  if (v === null) return 'transparent';
  if (v < 0.2) return '#d9534f';
  if (v < 0.35) return '#f0ad4e';
  if (v < 0.5) return '#ffd700';
  if (v < 0.65) return '#8bc34a';
  if (v < 0.8) return '#5cb85c';
  return '#1b5e20';
}

function renderMap() {
  elements.map.innerHTML = '';
  requestAnimationFrame(() => {
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < MAP_SIZE; row++) {
      for (let col = 0; col < MAP_SIZE; col++) {
        const d = document.createElement('div');
        const ndviValue = state.currentMapNdvi[row][col];
        d.style.background = ndviValue !== null ? ndviToColor(ndviValue) : 'transparent';
        fragment.appendChild(d);
      }
    }
    elements.map.appendChild(fragment);
  });
}

function formatUSD(n) {
  if (n === null || n === undefined) return '$0';
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  return '$' + n.toLocaleString();
}

function populateCrops(preferred) {
  elements.cropSelect.innerHTML = '';
  const order = [preferred, ...Object.keys(CROPS).filter(k => k !== preferred)];
  order.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = CROPS[k].name;
    elements.cropSelect.appendChild(opt);
  });
}

function resetControls() {
  elements.fertilizerSlider.max = state.budget;
  elements.irrigationSlider.max = state.budget;
  elements.techSlider.max = state.budget;
  elements.fertilizerSlider.value = 0;
  elements.irrigationSlider.value = 0;
  elements.techSlider.value = 0;
  updateRemainingBudget();
  updateSliderVisual(elements.fertilizerSlider);
  updateSliderVisual(elements.irrigationSlider);
  updateSliderVisual(elements.techSlider);
}

function updateRemainingBudget() {
  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  const remaining = state.budget - (fert + irri + tech);
  elements.fertilizerValue.textContent = formatUSD(fert);
  elements.irrigationValue.textContent = formatUSD(irri);
  elements.techValue.textContent = formatUSD(tech);
  elements.remainingBudget.textContent = formatUSD(remaining);
  if (remaining < 0) {
    elements.allocationWarning.textContent = '予算オーバーです！';
    elements.executeButton.disabled = true;
  } else if (state.isTurnProcessing) {
    elements.allocationWarning.textContent = 'ターン処理中です...';
    elements.executeButton.disabled = true;
  } else {
    elements.allocationWarning.textContent = '';
    elements.executeButton.disabled = false;
  }
  renderImpactPreview();
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getRiskLabel(score) {
  const levels = (GAME_CONFIG.climatePulse && GAME_CONFIG.climatePulse.riskLevels) || { crisis: 75, warning: 55, caution: 35 };
  if (score >= levels.crisis) return '危機';
  if (score >= levels.warning) return '警戒';
  if (score >= levels.caution) return '注意';
  return '安定';
}

function renderImpactPreview() {
  if (!elements.previewMix || !elements.previewRisk || !elements.previewOutcome || !elements.previewGuidance) return;
  const budget = Number(state.budget) || 0;
  if (!state.countryKey) {
    elements.previewMix.textContent = '未設定';
    elements.previewRisk.textContent = '-';
    elements.previewOutcome.textContent = '-';
    elements.previewGuidance.textContent = 'ミッション開始後、スライダー操作に合わせて政策の狙いを表示します。';
    return;
  }

  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  const total = fert + irri + tech;
  const safeTotal = Math.max(total, 1);
  const fertPct = clampPercent((fert / safeTotal) * 100);
  const irriPct = clampPercent((irri / safeTotal) * 100);
  const techPct = clampPercent((tech / safeTotal) * 100);
  const spendPct = budget > 0 ? clampPercent((total / budget) * 100) : (total > 0 ? 100 : 0);
  const riskPressure = state.climateRisk || 0;
  const adaptationCoverage = Math.min(100, Math.round((irriPct * 0.55) + (techPct * 0.45)));
  const riskAfterPolicy = Math.max(0, Math.round(riskPressure - adaptationCoverage * 0.28));

  elements.previewMix.textContent = total
    ? `肥${fertPct}% / 灌${irriPct}% / 技${techPct}%`
    : '未配分';
  elements.previewRisk.textContent = `${getRiskLabel(riskAfterPolicy)} ${riskAfterPolicy}`;

  let outcome = total ? 'バランス' : '待機';
  if (fertPct >= 50 && techPct < 25) outcome = '短期収益';
  else if (techPct >= 45) outcome = '技術蓄積';
  else if (irriPct >= 35 && riskAfterPolicy >= 45) outcome = '気候適応';
  else if (fertPct <= 35 && techPct >= 25 && irriPct >= 25) outcome = '再生バランス';
  else if (spendPct < 20) outcome = '温存';
  elements.previewOutcome.textContent = outcome;

  // executeTurn と同じ比率式で気候ショック耐性を判定
  const adaptationRatio = total > 0 ? (irri + tech) / total : 0;
  const frontCfg = GAME_CONFIG.frontier;
  const underPrepared = adaptationRatio < (frontCfg.adaptationIrrigationRatio + frontCfg.adaptationTechRatio);

  if (total > budget) {
    elements.previewGuidance.textContent = '予算を超過しています。自動配分かプリセットで比率を調整してください。';
  } else if (state.mode === 'frontier' && underPrepared) {
    elements.previewGuidance.textContent = 'フロンティアでは灌漑と技術の合計比率が低く、次ターンの気候ショックに弱くなります。';
  } else if (state.mode === 'frontier' && outcome === '再生バランス') {
    elements.previewGuidance.textContent = '再生ループ向きの配分です。収益を確保しながら環境とレジリエンスを戻しやすい構成です。';
  } else {
    elements.previewGuidance.textContent = `投資予定は現在予算の${spendPct}%です。${outcome}寄りの政策として進行します。`;
  }
}

function renderClimatePulseUI() {
  const pulse = state.climatePulse || {
    label: '待機',
    message: 'ターン開始後、気候条件を解析します。',
    tags: []
  };
  if (elements.missionPulse) {
    elements.missionPulse.style.display = state.countryKey ? 'grid' : 'none';
  }
  if (elements.missionPulseGuidance) elements.missionPulseGuidance.textContent = pulse.message;
  if (elements.pulseRisk) elements.pulseRisk.textContent = `${pulse.label} ${state.climateRisk || 0}`;
  if (elements.pulseResilience) elements.pulseResilience.textContent = `${state.resilienceScore || 0}`;
  if (elements.pulseFocus) {
    elements.pulseFocus.textContent = pulse.tags?.[0] || '観測';
  }
  if (elements.climatePulseText) elements.climatePulseText.textContent = pulse.message;
  if (!elements.climatePulseTags) return;
  elements.climatePulseTags.innerHTML = '';
  (pulse.tags || []).forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'pulse-tag';
    chip.textContent = tag;
    elements.climatePulseTags.appendChild(chip);
  });
}

function autoNormalize() {
  let f = Number(elements.fertilizerSlider.value) || 1;
  let i = Number(elements.irrigationSlider.value) || 1;
  let t = Number(elements.techSlider.value) || 1;
  let sum = f + i + t;
  if (sum === 0) return;
  const budget = state.budget;
  elements.fertilizerSlider.value = Math.round((f/sum) * budget);
  elements.irrigationSlider.value = Math.round((i/sum) * budget);
  elements.techSlider.value = budget - elements.fertilizerSlider.value - elements.irrigationSlider.value;
  updateRemainingBudget();
  updateSliderVisual(elements.fertilizerSlider);
  updateSliderVisual(elements.irrigationSlider);
  updateSliderVisual(elements.techSlider);
}

function updateSliderVisual(slider){
  const p = slider.max > 0 ? (slider.value / slider.max) * 100 : 0;
  slider.style.setProperty('--percent', `${p}%`);
}

function applyPreset(ratios, label){
  const budget = state.budget;
  if (!budget) return;
  const fert = Math.round(budget * ratios.fert);
  const irri = Math.round(budget * ratios.irri);
  const tech = Math.max(0, budget - fert - irri);
  elements.fertilizerSlider.value = fert;
  elements.irrigationSlider.value = irri;
  elements.techSlider.value = tech;
  updateRemainingBudget();
  updateSliderVisual(elements.fertilizerSlider);
  updateSliderVisual(elements.irrigationSlider);
  updateSliderVisual(elements.techSlider);
  log(`プリセット適用: ${label}`);
}

function saveCustomPreset() {
  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  const sum = fert + irri + tech;
  if (sum <= 0) {
    log('カスタム保存失敗: スライダーがゼロのため保存できません。');
    return;
  }
  state.customPreset = {
    fertRatio: fert / sum,
    irriRatio: irri / sum,
    techRatio: tech / sum
  };
  updateCustomPresetLabel();
  log('カスタムプリセットを保存しました。');
}

function applyCustomPreset() {
  if (!state.customPreset) {
    log('カスタムプリセットが未設定です。');
    return;
  }
  const { fertRatio, irriRatio, techRatio } = state.customPreset;
  applyPreset({ fert: fertRatio, irri: irriRatio, tech: techRatio }, 'カスタム');
}

function updateCustomPresetLabel() {
  const label = elements.presetCustomLabel;
  if (!label) return;
  if (!state.customPreset) {
    label.textContent = 'カスタム未設定';
    return;
  }
  const { fertRatio, irriRatio, techRatio } = state.customPreset;
  label.textContent = `カスタム: 肥${Math.round(fertRatio * 100)}% / 灌${Math.round(irriRatio * 100)}% / 技${Math.round(techRatio * 100)}%`;
}

function updateChallengeProgressUI() {
  const info = CHALLENGES[state.challenge] || CHALLENGES.free;
  if (elements.challengeBadge) {
    elements.challengeBadge.textContent = `チャレンジ: ${info.name} — ${resolveChallengeGoal(state.challenge)}`;
  }
  if (!elements.challengeProgress) return;
  const chip = elements.challengeProgress;
  chip.classList.remove('chip-success','chip-failed','chip-pending','chip-neutral');
  let text = '進行中';
  if (state.challenge === 'free') {
    chip.classList.add('chip-neutral');
    text = 'フリー';
  } else if (state.challengeStatus === 'success') {
    chip.classList.add('chip-success');
    text = '達成';
  } else if (state.challengeStatus === 'failed') {
    chip.classList.add('chip-failed');
    text = '未達成';
  } else {
    chip.classList.add('chip-pending');
    if (state.challenge === 'regen_loop') {
      const ndviDelta = Number.isFinite(state.initialAvgNdvi)
        ? (state.avgNdvi - state.initialAvgNdvi).toFixed(3)
        : '0.000';
      text = `環${state.envScore} / NDVI ${ndviDelta} / 再${state.resilienceScore}`;
    }
  }
  chip.textContent = `${info.name}: ${text}`;
}

function renderTrendBars(el, values, colorClass, formatter) {
  if (!el) return;
  el.innerHTML = '';
  if (!values.length) {
    const empty = document.createElement('div');
    empty.className = 'trend-empty';
    empty.textContent = 'データなし';
    el.appendChild(empty);
    return;
  }
  const max = Math.max(...values.map(v => Math.abs(v)), 1);
  values.forEach(v => {
    const bar = document.createElement('div');
    const h = Math.max(6, (Math.abs(v)/max) * 80);
    bar.className = `trend-bar ${colorClass}`;
    bar.style.height = `${h}px`;
    bar.title = formatter(v);
    el.appendChild(bar);
  });
}

function renderTrendChart() {
  const points = state.chartData || [];
  const last = points[points.length - 1] || {};
  const revenueVals = points.map(p => p.revenue || 0);
  const ndviVals = points.map(p => p.avgNdvi || 0);
  const envVals = points.map(p => p.envScore || 0);
  const techVals = points.map(p => p.techPoints || 0);
  renderTrendBars(elements.trendRevenue, revenueVals, 'bar-revenue', formatUSD);
  renderTrendBars(elements.trendNdvi, ndviVals, 'bar-ndvi', v => v.toFixed(3));
  renderTrendBars(elements.trendEnv, envVals, 'bar-env', v => v.toFixed(0));
  renderTrendBars(elements.trendTech, techVals, 'bar-tech', v => v.toLocaleString());
  renderTrendLine(elements.trendRevenueLine, revenueVals, 'line-revenue', 'dot-revenue');
  renderTrendLine(elements.trendNdviLine, ndviVals, 'line-ndvi', 'dot-ndvi');
  renderTrendLine(elements.trendEnvLine, envVals, 'line-env', 'dot-env');
  renderTrendLine(elements.trendTechLine, techVals, 'line-tech', 'dot-tech');
  if (elements.trendRevenueLast) elements.trendRevenueLast.textContent = last.revenue ? formatUSD(last.revenue) : '-';
  if (elements.trendNdviLast) elements.trendNdviLast.textContent = last.avgNdvi ? last.avgNdvi.toFixed(3) : '-';
  if (elements.trendEnvLast) elements.trendEnvLast.textContent = Number.isFinite(last.envScore) ? last.envScore : '-';
  if (elements.trendTechLast) elements.trendTechLast.textContent = Number.isFinite(last.techPoints) ? last.techPoints.toLocaleString() : '-';
}

function renderTrendLine(svgEl, values, lineClass, dotClass) {
  if (!svgEl) return;
  svgEl.innerHTML = '';
  if (!values.length) return;
  const width = 120, height = 80, pad = 6;
  const max = Math.max(...values.map(v => Math.abs(v)), 1);
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = pad + step * i;
    const y = height - pad - (Math.abs(v) / max) * (height - pad * 2);
    return { x, y };
  });
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const ns = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  path.setAttribute('class', `trend-line-path ${lineClass}`);
  svgEl.appendChild(path);
  const last = points[points.length - 1];
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', last.x.toFixed(2));
  circle.setAttribute('cy', last.y.toFixed(2));
  circle.setAttribute('r', 3.5);
  circle.setAttribute('class', `trend-line-dot ${dotClass}`);
  svgEl.appendChild(circle);
}

function addToMiniGraph(value){
  const bar = document.createElement('div');
  bar.style.width = '10px';
  bar.style.height = `${Math.min(80, Math.log10(value+10)*18)}px`;
  bar.style.background = '#00bfff';
  bar.style.borderRadius = '3px 3px 0 0';
  document.getElementById('mini-graph').appendChild(bar);
}

function downloadHistory() {
  const country = COUNTRIES[state.countryKey] || {};
  const challengeInfo = CHALLENGES[state.challenge] || CHALLENGES.free;
  const payload = {
    meta: {
      mode: state.mode || 'solo',
      playerId: state.playerId || null,
      playerName: state.playerName || '',
      countryKey: state.countryKey,
      countryName: country.name || '-',
      missionYear: state.year ? 2000 + parseInt(state.year, 10) : null,
      startingBudget: state.initialBudget,
      remainingBudget: state.budget,
      finalScore: state.finalScore || 0,
      turnsPlayed: state.history.length,
      turnLimit: state.turnLimit || TURN_COUNT,
      totalFoodValue: state.totalFoodValue,
      skillUsed: state.skillUsed,
      initialAvgNdvi: state.initialAvgNdvi,
      finalAvgNdvi: state.avgNdvi,
      resilienceScore: state.resilienceScore,
      climateRisk: state.climateRisk,
      competition: state.mode === 'competition' ? {
        eventId: state.competitionEventId,
        eventName: state.competitionEventName,
        seed: state.competitionSeed,
        simulationVersion: state.simulationVersion
      } : null,
      challenge: {
        key: state.challenge,
        name: challengeInfo.name,
        goal: resolveChallengeGoal(state.challenge),
        status: state.challengeStatus
      }
    },
    turns: state.history,
    chartData: state.chartData
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const suffix = state.mode === 'competition' && state.competitionEventId
    ? `competition_${state.competitionEventId}`
    : 'solo';
  a.download = `terra_farm_${suffix}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function log(msg) {
  const p = document.createElement('p');
  p.textContent = msg;
  elements.log.appendChild(p);
  elements.log.scrollTop = elements.log.scrollHeight;
}
function renderHistory() {
  if (!elements.historyBody) return;
  elements.historyBody.innerHTML = '';
  if (!state.history.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'history-empty';
    cell.textContent = 'まだ履歴がありません。';
    row.appendChild(cell);
    elements.historyBody.appendChild(row);
    return;
  }
  const recent = state.history.slice(-6).reverse();
  recent.forEach(entry => {
    const row = document.createElement('tr');
    const alloc = `肥:${formatUSD(entry.allocations.fertilizer)} / 灌:${formatUSD(entry.allocations.irrigation)} / 技:${formatUSD(entry.allocations.tech)}`;
    [
      entry.turn,
      alloc,
      entry.avgNdvi.toFixed(3),
      formatUSD(entry.revenue),
      entry.envScore,
      `${entry.climateRisk ?? '-'} / ${entry.resilienceScore ?? '-'}`
    ].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    elements.historyBody.appendChild(row);
  });
}
