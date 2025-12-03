// ==================== DOM要素 ====================
const $ = s => document.querySelector(s);
const elements = {
  startScreen: $('#start-screen'),
  countrySelectRadios: document.getElementsByName('country'),
  budgetInput: $('#budget-input'),
  yearSelect: $('#year-select'),
  challengeSelect: $('#challenge-select'),
  startButton: $('#start-button'),
  startError: $('#start-error'),

  newsRoot: $('#news-root'),

  header: $('#main-header'),
  selectedCountry: $('#selected-country'),
  challengeBadge: $('#challenge-badge'),
  gameContainer: $('#game-container'),

  seasonCounter: $('#season-counter'),
  maxSeasons: $('#max-seasons'),
  turnCounter: $('#turn-counter'),
  maxTurns: $('#max-turns'),
  budgetValue: $('#budget-value'),
  totalFoodValue: $('#total-food-value'),
  envScoreValue: $('#env-score-value'),
  eraValue: $('#era-value'),
  techPointsValue: $('#tech-points-value'),
  challengeProgress: $('#challenge-progress'),
  challengeProgressBar: $('#challenge-progress-bar'),
  challengeChecklist: $('#challenge-checklist'),
  cropValue: $('#crop-value'),

  ndviValue: $('#ndvi-value'),
  moistureValue: $('#moisture-value'),
  precipitationValue: $('#precipitation-value'),
  temperatureValue: $('#temperature-value'),
  forecastMoisture: $('#forecast-moisture'),
  forecastPrecipitation: $('#forecast-precipitation'),
  forecastTemperature: $('#forecast-temperature'),
  riskDrought: $('#risk-drought'),
  riskHeatwave: $('#risk-heatwave'),
  riskRain: $('#risk-rain'),

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
  replayButton: $('#replay-button'),
  downloadLog: $('#download-log'),
  unlockList: $('#unlock-list'),
  techTree: $('#tech-tree'),
  upgradeSkill: $('#upgrade-skill'),

  tutorialModal: $('#tutorial-modal'),
  openTutorial: $('#open-tutorial'),
  closeTutorial: $('#close-tutorial'),
  startFromTutorial: $('#start-from-tutorial'),

  seasonModal: $('#season-modal'),
  continueSeason: $('#continue-season'),
  seasonEnv: $('#season-env'),
  seasonTech: $('#season-tech'),
  seasonBudget: $('#season-budget')
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
  if (state.envScore < 35) return "🌍 国連レポート: 環境悪化が深刻です。持続可能性の再考を推奨します。";
  if (state.techPoints > GAME_CONFIG.technology.unlocks.orbitalNet) return "🚀 国連レポート: 技術革新が農業の効率化に顕著な効果。";
  if (state.avgNdvi > 0.65) return "🌱 国連レポート: 植生指数は良好。安定的な食料供給が見込めます。";
  return "📊 国連レポート: おおむね安定していますが、長期的な気候リスクに注意が必要です。";
}

function pushUnlock(text) {
  const li = document.createElement('li');
  li.textContent = text;
  elements.unlockList.appendChild(li);
}

function renderUI() {
  elements.seasonCounter.textContent = state.season;
  elements.maxSeasons.textContent = CAMPAIGN_CONFIG.seasons;
  elements.turnCounter.textContent = state.turn;
  elements.budgetValue.textContent = formatUSD(state.budget);
  elements.totalFoodValue.textContent = formatUSD(state.totalFoodValue);
  elements.envScoreValue.textContent = state.envScore;
  elements.eraValue.textContent = ERAS[state.eraIndex];
  elements.techPointsValue.textContent = state.techPoints.toLocaleString();
  elements.cropValue.textContent = CROPS[elements.cropSelect.value]?.name || '-';
  elements.ndviValue.textContent = state.avgNdvi.toFixed(3);
  elements.moistureValue.textContent = state.soilMoisture;
  elements.precipitationValue.textContent = state.precipitation;
  elements.temperatureValue.textContent = state.temperature;
  elements.forecastMoisture.textContent = state.forecast.soilMoisture;
  elements.forecastPrecipitation.textContent = state.forecast.precipitation;
  elements.forecastTemperature.textContent = state.forecast.temperature;
  setRiskChip(elements.riskDrought, state.forecast.risks.drought);
  setRiskChip(elements.riskHeatwave, state.forecast.risks.heatwave);
  setRiskChip(elements.riskRain, state.forecast.risks.rain);
  updateChallengeProgressUI();
  renderTechTree();
  renderMap();
  renderHistory();
  renderTrendChart();
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
  } else {
    elements.allocationWarning.textContent = '';
    elements.executeButton.disabled = false;
  }
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
    elements.challengeBadge.textContent = `チャレンジ: ${info.name} — ${info.goal}`;
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
  }
  chip.textContent = `${info.name}: ${text}`;

  if (elements.challengeProgressBar) {
    const pct = state.challengeProgress.total ? Math.round((state.challengeProgress.done / state.challengeProgress.total) * 100) : 0;
    elements.challengeProgressBar.style.width = `${pct}%`;
  }
  if (elements.challengeChecklist) {
    elements.challengeChecklist.innerHTML = '';
    (state.challengeProgress.checklist || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.label;
      if (item.done) li.classList.add('done');
      elements.challengeChecklist.appendChild(li);
    });
  }
}

function setRiskChip(el, pct) {
  if (!el) return;
  el.textContent = pct ? `${pct}%` : '-';
  el.classList.remove('chip-success','chip-failed','chip-neutral','chip-pending');
  if (pct >= 60) el.classList.add('chip-failed');
  else if (pct >= 40) el.classList.add('chip-pending');
  else el.classList.add('chip-neutral');
}

function renderTechTree() {
  if (!elements.techTree) return;
  const unlocks = GAME_CONFIG.technology.unlocks;
  const entries = [
    { key: 'ecoFertilizer', label: 'エコ肥料', threshold: unlocks.ecoFertilizer },
    { key: 'resilientSeeds', label: '強靭な種子', threshold: unlocks.resilientSeeds },
    { key: 'precisionAg', label: '精密農業', threshold: unlocks.precisionAg },
    { key: 'climateControl', label: '気候制御', threshold: unlocks.climateControl },
    { key: 'orbitalNet', label: '軌道ネット', threshold: unlocks.orbitalNet },
    { key: 'aiAdvisor', label: 'AIアドバイザー', threshold: unlocks.aiAdvisor },
  ];
  elements.techTree.innerHTML = '';
  entries.forEach(e => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = e.label;
    const status = document.createElement('span');
    const unlocked = state.unlocked[e.key];
    status.textContent = unlocked ? '取得済み' : `必要: ${e.threshold}`;
    status.className = `tech-badge ${unlocked ? 'tech-unlocked' : 'tech-locked'}`;
    li.appendChild(span);
    li.appendChild(status);
    elements.techTree.appendChild(li);
  });

  if (elements.upgradeSkill) {
    elements.upgradeSkill.disabled = state.techPoints < GAME_CONFIG.technology.skillUpgradeCost * state.skillLevel;
  }
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

function showTutorial() {
  if (!elements.tutorialModal) return;
  elements.tutorialModal.classList.remove('modal-hidden');
  elements.tutorialModal.classList.add('modal-visible');
}

function hideTutorial() {
  if (!elements.tutorialModal) return;
  elements.tutorialModal.classList.add('modal-hidden');
  elements.tutorialModal.classList.remove('modal-visible');
  state.tutorialSeen = true;
}

function showSeasonModal(budgetPreview) {
  if (!elements.seasonModal) return;
  elements.seasonEnv.textContent = state.envScore;
  elements.seasonTech.textContent = state.techPoints;
  elements.seasonBudget.textContent = formatUSD(budgetPreview);
  elements.seasonModal.classList.remove('modal-hidden');
  elements.seasonModal.classList.add('modal-visible');
}

function hideSeasonModal() {
  if (!elements.seasonModal) return;
  elements.seasonModal.classList.add('modal-hidden');
  elements.seasonModal.classList.remove('modal-visible');
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
      countryKey: state.countryKey,
      countryName: country.name || '-',
      missionYear: state.year ? 2000 + parseInt(state.year, 10) : null,
      startingBudget: state.initialBudget,
      remainingBudget: state.budget,
      turnsPlayed: state.history.length,
      turnLimit: TURN_COUNT,
      totalFoodValue: state.totalFoodValue,
      skillUsed: state.skillUsed,
      challenge: {
        key: state.challenge,
        name: challengeInfo.name,
        goal: challengeInfo.goal,
        status: state.challengeStatus
      }
    },
    turns: state.history,
    chartData: state.chartData
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'terra_farm_log.json';
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
    cell.colSpan = 5;
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
      entry.envScore
    ].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    elements.historyBody.appendChild(row);
  });
}
