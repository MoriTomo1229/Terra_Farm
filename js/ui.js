// ==================== DOM要素 ====================
const $ = s => document.querySelector(s);
const THEME_STORAGE_KEY = 'terra_farm_theme';
const VALID_THEMES = ['dark', 'light', 'signal'];
const CUSTOM_PRESET_STORAGE_KEY = 'terra_farm_custom_preset_v1';
const elements = {
  startScreen: $('#start-screen'),
  playerNameInput: $('#player-name-input'),
  modeSelect: $('#mode-select'),
  themeSelect: $('#theme-select'),
  themeSelectHeader: $('#theme-select-header'),
  langSelect: $('#lang-select'),
  modeHelper: $('#mode-helper'),
  countrySelectRadios: document.getElementsByName('country'),
  countryDetails: $('#country-details'),
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

const NEWS_KEYS = ['news.1', 'news.2', 'news.3', 'news.4', 'news.5', 'news.6'];
function showWorldNews() {
  const key = NEWS_KEYS[Math.floor(Math.random()*NEWS_KEYS.length)];
  const banner = document.createElement('div');
  banner.className = 'news-banner';
  banner.textContent = t(key);
  elements.newsRoot.appendChild(banner);
  setTimeout(()=>banner.remove(), 4200);
}

function generateUNReport() {
  let base = t('un.baseStable');
  if (state.envScore < 35) base = t('un.envCritical');
  else if (state.techPoints > GAME_CONFIG.technology.unlocks.orbitalNet) base = t('un.techInnovation');
  else if (state.avgNdvi > 0.65) base = t('un.ndviGood');

  if (state.mode === 'frontier') {
    if (state.resilienceScore < 45) return base + t('un.frontierResilienceLow');
    if (state.resilienceScore >= 75) return base + t('un.frontierResilienceHigh');
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
  elements.eraValue.textContent = t('era.' + state.eraIndex);
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

function renderCountryDetails() {
  if (!elements.countryDetails) return;
  const key = getSelectedCountryKey();
  const country = COUNTRIES[key];
  elements.countryDetails.textContent = t('start.countryDetails', {
    climate: t('climate.' + country.climate),
    skill: country.skill,
    description: t('country.' + key + '.description'),
    preferred: t('crop.' + country.preferred)
  });
}

function ndviToRgb(v) {
  if (v === null || !Number.isFinite(v)) return [0, 0, 0, 0];
  if (v < 0.2) return [217, 83, 79, 255];
  if (v < 0.35) return [240, 173, 78, 255];
  if (v < 0.5) return [255, 215, 0, 255];
  if (v < 0.65) return [139, 195, 74, 255];
  if (v < 0.8) return [92, 184, 92, 255];
  return [27, 94, 32, 255];
}

function renderMap() {
  const ctx = elements.map.getContext('2d');
  if (!ctx) return;
  const image = ctx.createImageData(MAP_SIZE, MAP_SIZE);
  for (let row = 0; row < MAP_SIZE; row++) {
    for (let col = 0; col < MAP_SIZE; col++) {
      image.data.set(ndviToRgb(state.currentMapNdvi[row][col]), (row * MAP_SIZE + col) * 4);
    }
  }
  ctx.putImageData(image, 0, 0);
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
    opt.setAttribute('data-i18n', 'crop.' + k);
    opt.textContent = t('crop.' + k);
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
    elements.allocationWarning.textContent = t('main.budgetOver');
    elements.executeButton.disabled = true;
  } else if (state.isTurnProcessing) {
    elements.allocationWarning.textContent = t('main.turnProcessing');
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
  if (score >= levels.crisis) return t('risk.crisis');
  if (score >= levels.warning) return t('risk.warning');
  if (score >= levels.caution) return t('risk.caution');
  return t('risk.stable');
}

function renderImpactPreview() {
  if (!elements.previewMix || !elements.previewRisk || !elements.previewOutcome || !elements.previewGuidance) return;
  const budget = Number(state.budget) || 0;
  if (!state.countryKey) {
    elements.previewMix.textContent = t('preview.mixNotSet');
    elements.previewRisk.textContent = '-';
    elements.previewOutcome.textContent = '-';
    elements.previewGuidance.textContent = t('preview.guidanceInit');
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
    ? t('preview.mixAllocated', {fert: fertPct, irri: irriPct, tech: techPct})
    : t('preview.mixUnallocated');
  elements.previewRisk.textContent = `${getRiskLabel(riskAfterPolicy)} ${riskAfterPolicy}`;

  let outcome = total ? t('preview.outcomeBalanced') : t('preview.outcomeWaiting');
  if (fertPct >= 50 && techPct < 25) outcome = t('preview.outcomeShortTerm');
  else if (techPct >= 45) outcome = t('preview.outcomeTech');
  else if (irriPct >= 35 && riskAfterPolicy >= 45) outcome = t('preview.outcomeAdaptation');
  else if (fertPct <= 35 && techPct >= 25 && irriPct >= 25) outcome = t('preview.outcomeRegen');
  else if (spendPct < 20) outcome = t('preview.outcomeReserve');
  elements.previewOutcome.textContent = outcome;

  // executeTurn と同じ比率式で気候ショック耐性を判定
  const adaptationRatio = total > 0 ? (irri + tech) / total : 0;
  const frontCfg = GAME_CONFIG.frontier;
  const underPrepared = adaptationRatio < (frontCfg.adaptationIrrigationRatio + frontCfg.adaptationTechRatio);

  if (total > budget) {
    elements.previewGuidance.textContent = t('preview.guidanceOverBudget');
  } else if (state.mode === 'frontier' && underPrepared) {
    elements.previewGuidance.textContent = t('preview.guidanceFrontierUnderPrepared');
  } else if (state.mode === 'frontier' && outcome === t('preview.outcomeRegen')) {
    elements.previewGuidance.textContent = t('preview.guidanceFrontierRegen');
  } else {
    elements.previewGuidance.textContent = t('preview.guidanceGeneral', {spendPct: spendPct, outcome: outcome});
  }
}

function renderClimatePulseUI() {
  const pulse = state.climatePulse || {
    label: t('preview.outcomeWaiting'),
    message: t('pulse.analyzeWaiting'),
    tags: []
  };
  if (elements.missionPulse) {
    elements.missionPulse.style.display = state.countryKey ? 'grid' : 'none';
  }
  if (elements.missionPulseGuidance) elements.missionPulseGuidance.textContent = pulse.message;
  if (elements.pulseRisk) elements.pulseRisk.textContent = `${pulse.label} ${state.climateRisk || 0}`;
  if (elements.pulseResilience) elements.pulseResilience.textContent = `${state.resilienceScore || 0}`;
  if (elements.pulseFocus) {
    elements.pulseFocus.textContent = pulse.tags?.[0] || t('pulse.observe');
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
  log(t('preset.applied', {label: label}));
}

function saveCustomPreset() {
  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  const sum = fert + irri + tech;
  if (sum <= 0) {
    log(t('preset.customSaveFailZero'));
    return;
  }
  state.customPreset = {
    fertRatio: fert / sum,
    irriRatio: irri / sum,
    techRatio: tech / sum
  };
  try {
    localStorage.setItem(CUSTOM_PRESET_STORAGE_KEY, JSON.stringify(state.customPreset));
  } catch (_) {
    // 保存できない場合もセッション内では使える
  }
  updateCustomPresetLabel();
  log(t('preset.customSaved'));
}

function loadCustomPreset() {
  try {
    const preset = JSON.parse(localStorage.getItem(CUSTOM_PRESET_STORAGE_KEY));
    if (!preset || typeof preset !== 'object') return null;
    const ratios = [preset.fertRatio, preset.irriRatio, preset.techRatio];
    if (!ratios.every(value => Number.isFinite(value) && value >= 0 && value <= 1)) return null;
    if (Math.abs(ratios.reduce((sum, value) => sum + value, 0) - 1) > 1e-6) return null;
    return { fertRatio: ratios[0], irriRatio: ratios[1], techRatio: ratios[2] };
  } catch (_) {
    return null;
  }
}

function applyCustomPreset() {
  if (!state.customPreset) {
    log(t('preset.customNotSet'));
    return;
  }
  const { fertRatio, irriRatio, techRatio } = state.customPreset;
  applyPreset({ fert: fertRatio, irri: irriRatio, tech: techRatio }, t('preset.custom'));
}

function updateCustomPresetLabel() {
  const label = elements.presetCustomLabel;
  if (!label) return;
  if (!state.customPreset) {
    label.textContent = t('control.presetCustomUnset');
    return;
  }
  const { fertRatio, irriRatio, techRatio } = state.customPreset;
  label.textContent = t('preset.customLabel', {fert: Math.round(fertRatio * 100), irri: Math.round(irriRatio * 100), tech: Math.round(techRatio * 100)});
}

function updateChallengeProgressUI() {
  const info = CHALLENGES[state.challenge] || CHALLENGES.free;
  const challengeName = t('challenge.' + (info.key || 'free') + '.name');
  if (elements.challengeBadge) {
    elements.challengeBadge.textContent = t('challenge.badge', {name: challengeName, goal: resolveChallengeGoal(state.challenge)});
  }
  if (!elements.challengeProgress) return;
  const chip = elements.challengeProgress;
  chip.classList.remove('chip-success','chip-failed','chip-pending','chip-neutral');
  let text = t('challenge.statusInProgress');
  if (state.challenge === 'free') {
    chip.classList.add('chip-neutral');
    text = t('challenge.free.short');
  } else if (state.challengeStatus === 'success') {
    chip.classList.add('chip-success');
    text = t('challenge.statusSuccess');
  } else if (state.challengeStatus === 'failed') {
    chip.classList.add('chip-failed');
    text = t('challenge.statusFailed');
  } else {
    chip.classList.add('chip-pending');
    if (state.challenge === 'regen_loop') {
      const ndviDelta = Number.isFinite(state.initialAvgNdvi)
        ? (state.avgNdvi - state.initialAvgNdvi).toFixed(3)
        : '0.000';
      text = t('challenge.regenProgress', {env: state.envScore, ndvi: ndviDelta, res: state.resilienceScore});
    }
  }
  chip.textContent = challengeName + ': ' + text;
}

function renderTrendBars(el, values, colorClass, formatter) {
  if (!el) return;
  el.innerHTML = '';
  if (!values.length) {
    const empty = document.createElement('div');
    empty.className = 'trend-empty';
    empty.textContent = t('trend.noData');
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

function downloadHistory() {
  const country = COUNTRIES[state.countryKey] || {};
  const challengeInfo = CHALLENGES[state.challenge] || CHALLENGES.free;
  const challengeKey = challengeInfo.key || 'free';
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
        name: t('challenge.' + challengeKey + '.name'),
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
    cell.textContent = t('report.historyEmpty');
    row.appendChild(cell);
    elements.historyBody.appendChild(row);
    return;
  }
  const recent = state.history.slice(-6).reverse();
  recent.forEach(entry => {
    const row = document.createElement('tr');
    const alloc = t('history.alloc', {fert: formatUSD(entry.allocations.fertilizer), irri: formatUSD(entry.allocations.irrigation), tech: formatUSD(entry.allocations.tech)});
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
