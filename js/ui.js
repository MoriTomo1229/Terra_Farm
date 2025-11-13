// ==================== DOM要素 ====================
const $ = s => document.querySelector(s);
const elements = {
  startScreen: $('#start-screen'),
  countrySelectRadios: document.getElementsByName('country'),
  budgetInput: $('#budget-input'),
  yearSelect: $('#year-select'),
  startButton: $('#start-button'),
  startError: $('#start-error'),

  newsRoot: $('#news-root'),

  header: $('#main-header'),
  selectedCountry: $('#selected-country'),
  gameContainer: $('#game-container'),

  turnCounter: $('#turn-counter'),
  maxTurns: $('#max-turns'),
  budgetValue: $('#budget-value'),
  totalFoodValue: $('#total-food-value'),
  envScoreValue: $('#env-score-value'),
  eraValue: $('#era-value'),
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
  executeButton: $('#execute-turn-button'),
  autoAllocateButton: $('#auto-allocate-button'),
  specialSkillButton: $('#special-skill'),

  turnResultText: $('#turn-result-text'),
  eventText: $('#event-text'),
  unReport: $('#un-report'),
  log: $('#log'),

  gameOverModal: $('#game-over-modal'),
  finalFood: $('#final-food'),
  finalEnv: $('#final-env'),
  finalTech: $('#final-tech'),
  finalScore: $('#final-score'),
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
  elements.turnCounter.textContent = state.turn;
  elements.budgetValue.textContent = formatUSD(state.budget);
  elements.totalFoodValue.textContent = formatUSD(state.totalFoodValue);
  elements.envScoreValue.textContent = state.envScore;
  elements.eraValue.textContent = ERAS[state.eraIndex];
  elements.cropValue.textContent = CROPS[elements.cropSelect.value]?.name || '-';
  elements.ndviValue.textContent = state.avgNdvi.toFixed(3);
  elements.moistureValue.textContent = state.soilMoisture;
  elements.precipitationValue.textContent = state.precipitation;
  elements.temperatureValue.textContent = state.temperature;
  renderMap();
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

function addToMiniGraph(value){
  const bar = document.createElement('div');
  bar.style.width = '10px';
  bar.style.height = `${Math.min(80, Math.log10(value+10)*18)}px`;
  bar.style.background = '#00bfff';
  bar.style.borderRadius = '3px 3px 0 0';
  document.getElementById('mini-graph').appendChild(bar);
}

function downloadHistory() {
  const blob = new Blob([JSON.stringify(state.history, null, 2)], { type: 'application/json' });
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
