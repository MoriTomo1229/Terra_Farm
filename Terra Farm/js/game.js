// ==================== ゲーム設定 ====================
const COUNTRIES = {
  usa: {name:'United States', startingBudget:200000000000, climate:'temperate', preferred:'corn', description:'Large temperate plains — corn and wheat thrive.', flag:'🇺🇸'},
  china: {name:'China', startingBudget:180000000000, climate:'varied', preferred:'rice', description:'Diverse climates — rice dominates irrigated regions.', flag:'🇨🇳'},
  india: {name:'India', startingBudget:120000000000, climate:'tropical', preferred:'rice', description:'Monsoon climates favor rice and diverse crops.', flag:'🇮🇳'},
  brazil: {name:'Brazil', startingBudget:90000000000, climate:'tropical', preferred:'cassava', description:'Large tropics; cassava and soybeans common.', flag:'🇧🇷'},
  egypt: {name:'Egypt', startingBudget:60000000000, climate:'arid', preferred:'barley', description:'Arid river valley — irrigation is crucial.', flag:'🇪🇬'},
  ireland: {name:'Ireland', startingBudget:15000000000, climate:'cool', preferred:'potato', description:'Cool wet climate — potatoes historically important.', flag:'🇮🇪'}
};
const CROPS = {
  rice:{name:'Rice',basePrice:400,yieldFactor:1.0},
  wheat:{name:'Wheat',basePrice:300,yieldFactor:0.95},
  potato:{name:'Potato',basePrice:200,yieldFactor:0.85},
  corn:{name:'Corn',basePrice:250,yieldFactor:1.05},
  barley:{name:'Barley',basePrice:180,yieldFactor:0.8},
  cassava:{name:'Cassava',basePrice:150,yieldFactor:0.7}
};
const ERAS = ['石器時代','青銅器時代','鉄器時代','中世','産業革命','近代','宇宙時代'];
const TURN_COUNT = 10;
const MAP_SIZE = 100;

// ==================== DOM要素の取得 ====================
const $ = s => document.querySelector(s);
const elements = {
  startScreen: $('#start-screen'),
  countrySelectRadios: document.getElementsByName('country'),
  budgetInput: $('#budget-input'),
  yearSelect: $('#year-select'),
  startButton: $('#start-button'),
  startError: $('#start-error'),
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
  turnResultText: $('#turn-result-text'),
  eventText: $('#event-text'),
  log: $('#log'),
  gameOverModal: $('#game-over-modal'),
  finalFood: $('#final-food'),
  finalEnv: $('#final-env'),
  finalTech: $('#final-tech'),
  finalScore: $('#final-score'),
  replayButton: $('#replay-button'),
  downloadLog: $('#download-log')
};

// ==================== ゲーム状態管理 ====================
let state = {
  countryKey: null,
  turn: 0,
  budget: 0,
  totalFoodValue: 0,
  envScore: 70,
  techPoints: 0,
  eraIndex: 0,
  baseMapPotential: [], // 土地の初期ポテンシャル（不変）
  currentMapNdvi: [], // 現在のNDVI（ターン毎に変化）
  avgNdvi: 0, // 現在の平均NDVI
  history: []
};

// ==================== スタート画面のロジック ====================
function initStartScreen() {
  elements.startButton.addEventListener('click', onStart);
}
function getSelectedCountryKey() {
  for (const r of elements.countrySelectRadios) {
    if (r.checked) return r.value;
  }
  return 'usa';
}
function parseBudgetInput(str) {
  if (!str) return null;
  str = str.trim().toUpperCase();
  const m = str.match(/^([0-9]+(?:\.[0-9]+)?)\s*([BM])?$/);
  if (!m) return null;
  let val = parseFloat(m[1]);
  if (m[2] === 'B') val *= 1e9;
  else if (m[2] === 'M') val *= 1e6;
  return Math.round(val);
}
function onStart() {
  const countryKey = getSelectedCountryKey();
  const year = elements.yearSelect.value;
  const parsedBudget = parseBudgetInput(elements.budgetInput.value);

  if (!parsedBudget || isNaN(parsedBudget) || parsedBudget <= 0) {
    elements.startError.textContent = '無効な予算です。例: 200B or 500M';
    return;
  }
  elements.startError.textContent = '';
  startGame(countryKey, parsedBudget, year);
}

// ==================== ゲームのメインロジック ====================
async function startGame(countryKey, startingBudget, year) {
  elements.startButton.disabled = true;
  elements.startButton.textContent = '衛星データを読み込み中...';
  try {
    const filePath = `./data/maps/ndvi_${countryKey}${year}.json`;
    const mapResponse = await fetch(filePath);
    if (!mapResponse.ok) throw new Error(`マップデータ(${filePath})が見つかりません`);
    const rawMapData = await mapResponse.json();

    const scaledMapData = rawMapData.map(row => 
      row.map(value => {
        if (value <= -3000) {
          return null;
        }
        return value * 0.0001;
      })
    );

    state = {
      countryKey,
      turn: 0,
      budget: startingBudget,
      totalFoodValue: 0,
      envScore: 70,
      techPoints: 0,
      eraIndex: 0,
      baseMapPotential: scaledMapData,
      currentMapNdvi: JSON.parse(JSON.stringify(scaledMapData)),
      avgNdvi: 0,
      history: []
    };

    const c = COUNTRIES[countryKey];
    populateCrops(c.preferred);
    
    elements.startScreen.style.display = 'none';
    elements.header.style.display = 'flex';
    elements.gameContainer.style.display = 'grid';
    const displayYear = parseInt(year) + 2000;
    elements.selectedCountry.innerHTML = `<span class="flag">${c.flag}</span> <strong>${c.name} (${displayYear})</strong>`;
    elements.maxTurns.textContent = TURN_COUNT;

    log(`ミッション開始: ${c.name} (${displayYear}年). 初期予算 ${formatUSD(state.budget)}.`);
    nextTurn();

  } catch (error) {
    console.error("ゲームの開始に失敗:", error);
    elements.startError.textContent = `データ読み込みエラー: ${error.message}`;
  } finally {
    elements.startButton.disabled = false;
    elements.startButton.textContent = 'ミッション開始';
  }
}

function nextTurn() {
  state.turn++;
  if (state.turn > TURN_COUNT) {
    endGame();
    return;
  }
  calculateCurrentAverages();
  renderUI();
  resetControls();
  log(`--- ターン ${state.turn} ---`);
}

function calculateCurrentAverages() {
    const validCells = state.currentMapNdvi.flat().filter(v => v !== null);
    state.avgNdvi = validCells.reduce((sum, v) => sum + v, 0) / (validCells.length || 1);
    const country = COUNTRIES[state.countryKey];
    state.soilMoisture = Math.round((0.4 + (Math.random()*0.45)) * 100);
    state.precipitation = Math.round( Math.max(0, (Math.random()*60) * (country.climate==='arid'?0.4:1.0)) );
    state.temperature = Math.round(15 + (Math.random()*20) + (country.climate==='cool'?-5:0) + (country.climate==='tropical'?5:0));
}

function executeTurn() {
  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  if (fert + irri + tech > state.budget) {
    elements.allocationWarning.textContent = '予算オーバーです！';
    return;
  }

  // ▼▼▼ 投資効果の計算式を、ターンごとのブーストとして作用するように修正 ▼▼▼
  const budgetForEffects = state.budget > 0 ? state.budget : 1; // 0除算を避ける
  const fertEffect = (fert / budgetForEffects) * 0.15; // 予算の割合に応じてNDVIを最大0.15ブースト
  const irriEffect = (irri / budgetForEffects) * 0.10; // 予算の割合に応じてNDVIを最大0.10ブースト
  // ▲▲▲ ここまで ▲▲▲

  for(let r=0; r < MAP_SIZE; r++) {
    for(let c=0; c < MAP_SIZE; c++) {
        if(state.currentMapNdvi[r][c] !== null) {
            const basePotential = state.baseMapPotential[r][c] || 0;
            const lastTurnNdvi = state.currentMapNdvi[r][c];

            // 1. 自然な状態へ少し戻す（自然回復/減衰）
            let recoveringNdvi = (lastTurnNdvi * 0.95) + (basePotential * 0.05);
            
            // 2. このターンの投資効果を加える
            const irrigationBoost = (1 - basePotential) * irriEffect; // 乾燥地ほど灌漑が効く
            let newNdvi = recoveringNdvi + fertEffect + irrigationBoost;

            // 3. 技術と環境によるボーナス/ペナルティ
            const techBonus = (state.techPoints / 6000); // 技術効果を少し調整
            const envPenalty = ((100 - state.envScore) / 1500); // 環境ペナルティ
            newNdvi += techBonus - envPenalty;

            // 4. 最終的な値を範囲内に収める
            state.currentMapNdvi[r][c] = Math.max(0.05, Math.min(0.95, newNdvi));
        }
    }
  }
  
  calculateCurrentAverages();

  const crop = CROPS[elements.cropSelect.value];
  const eraMultiplier = 1 + state.eraIndex * 0.12;
  const techEffect = 1 + (state.techPoints / 100) * 0.8 + (tech / (state.budget + 1)) * 0.4;
  let production = Math.round((100000 + state.avgNdvi * 500000) * state.avgNdvi * eraMultiplier * techEffect * crop.yieldFactor);

  let event = '';
  if (state.precipitation < 6 && state.temperature > 28 && irri < state.budget * 0.2 && Math.random() < 0.5) {
    production *= 0.55; event = '🚨 干ばつにより生産量が大幅に減少。';
  } else if (state.temperature > 30 && Math.random() < 0.3) {
    production *= 0.75; event = '🦠 熱波による害虫発生で生産量が減少。';
  } else if (state.precipitation > 40 && Math.random() < 0.18) {
    production *= 1.25; event = '☔ 恵みの雨により生産量が増加。';
  }
  production = Math.round(production);
  const revenue = Math.round(production * crop.basePrice);
  
  let envChange = -Math.round(fert / (budgetForEffects) * 15) + Math.round(tech / (budgetForEffects) * 3);
  state.envScore = Math.max(0, Math.min(100, state.envScore + envChange));

  const techGain = Math.round(tech / 1e7 + Math.random() * (tech / 5e7));
  state.techPoints += techGain;
  const thresholds = [0, 50, 120, 240, 500, 1200, 2500];
  state.eraIndex = thresholds.filter(t => state.techPoints >= t).length - 1;

  state.budget = Math.max(0, Math.round(state.budget - (fert + irri + tech) + revenue));
  state.totalFoodValue += revenue;

  elements.turnResultText.textContent = `${crop.name}を${production.toLocaleString()}トン生産、収入: ${formatUSD(revenue)}`;
  elements.eventText.textContent = event || '特に大きなイベントはありませんでした。';
  log(`ターン ${state.turn}: 収入 +${formatUSD(revenue)}. ${event}`);
  
  elements.executeButton.disabled = true;
  setTimeout(() => {
      elements.executeButton.disabled = false;
      nextTurn();
  }, 1200);
}

function endGame() {
  elements.finalFood.textContent = formatUSD(state.totalFoodValue);
  elements.finalEnv.textContent = state.envScore;
  elements.finalTech.textContent = ERAS[state.eraIndex];
  const finalScore = Math.round(state.budget / 1e6 + state.envScore * 100 + state.eraIndex * 1000);
  elements.finalScore.textContent = finalScore;
  elements.gameOverModal.classList.remove('modal-hidden');
  elements.gameOverModal.classList.add('modal-visible');
  log('ミッション完了。');
}

// ==================== UI更新と描画 ====================
function renderUI() {
  elements.turnCounter.textContent = state.turn;
  elements.budgetValue.textContent = formatUSD(state.budget);
  elements.totalFoodValue.textContent = formatUSD(state.totalFoodValue);
  elements.envScoreValue.textContent = state.envScore;
  elements.eraValue.textContent = ERAS[state.eraIndex];
  elements.cropValue.textContent = CROPS[elements.cropSelect.value].name;
  elements.ndviValue.textContent = state.avgNdvi.toFixed(3);
  elements.moistureValue.textContent = state.soilMoisture;
  elements.precipitationValue.textContent = state.precipitation;
  elements.temperatureValue.textContent = state.temperature;
  renderMap();
  updateRemainingBudget();
}

function renderMap() {
  elements.map.innerHTML = '';
  requestAnimationFrame(() => {
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < MAP_SIZE; row++) {
      for (let col = 0; col < MAP_SIZE; col++) {
        const d = document.createElement('div');
        const ndviValue = state.currentMapNdvi[row][col];
        if (ndviValue !== null) {
          d.style.background = ndviToColor(ndviValue);
        } else {
          d.style.background = 'transparent';
        }
        fragment.appendChild(d);
      }
    }
    elements.map.appendChild(fragment);
  });
}

function ndviToColor(v) {
  if (v === null) return 'transparent';
  if (v < 0.2) return '#d9534f'; // 不毛 (赤)
  if (v < 0.35) return '#f0ad4e'; // やや不毛 (オレンジ)
  if (v < 0.5) return '#ffd700';  // 草地 (ゴールド)
  if (v < 0.65) return '#8bc34a'; // 緑 (ライトグリーン)
  if (v < 0.8) return '#5cb85c';  // 濃い緑 (グリーン)
  return '#1b5e20';               // 非常に濃い緑 (ダークグリーン)
}

// ==================== ヘルパー関数とイベントリスナー ====================
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
    let sum = (Number(elements.fertilizerSlider.value) || 1) + (Number(elements.irrigationSlider.value) || 1) + (Number(elements.techSlider.value) || 1);
    const budget = state.budget;
    elements.fertilizerSlider.value = Math.round(((Number(elements.fertilizerSlider.value) || 1)/sum) * budget);
    elements.irrigationSlider.value = Math.round(((Number(elements.irrigationSlider.value) || 1)/sum) * budget);
    elements.techSlider.value = budget - elements.fertilizerSlider.value - elements.irrigationSlider.value;
    updateRemainingBudget();
}

function downloadHistory() {
  const blob = new Blob([JSON.stringify(state.history, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'farm_commander_log.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function log(msg) {
  const p = document.createElement('p');
  p.textContent = msg;
  elements.log.appendChild(p);
  elements.log.scrollTop = elements.log.scrollHeight;
}

function attachListeners() {
  ['fertilizerSlider', 'irrigationSlider', 'techSlider'].forEach(id => elements[id].addEventListener('input', updateRemainingBudget));
  elements.executeButton.addEventListener('click', executeTurn);
  elements.autoAllocateButton.addEventListener('click', autoNormalize);
  elements.replayButton.addEventListener('click', () => location.reload());
  elements.downloadLog.addEventListener('click', downloadHistory);
}

document.addEventListener('DOMContentLoaded', () => {
  initStartScreen();
  attachListeners();
});

