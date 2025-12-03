// ==================== ターン進行 & 計算 ====================

function calculateCurrentAverages() {
  const valid = state.currentMapNdvi.flat().filter(v => v !== null);
  state.avgNdvi = valid.reduce((s,v)=>s+v,0) / (valid.length || 1);
  const country = COUNTRIES[state.countryKey];
  state.soilMoisture = Math.round((0.4 + (Math.random()*0.45)) * 100);
  state.precipitation = Math.round( Math.max(0, (Math.random()*60) * (country.climate==='arid'?0.4:1.0)) );
  state.temperature = Math.round(15 + (Math.random()*20) + (country.climate==='cool'?-5:0) + (country.climate==='tropical'?5:0));
  state.forecast = generateForecast(country);
}

function clampVal(v, min, max) { return Math.max(min, Math.min(max, v)); }
function riskLevel(v) { if (v > 0.55) return 'high'; if (v > 0.3) return 'mid'; return 'low'; }

function generateForecast(country) {
  const drift = () => (Math.random() * 14) - 7;
  const soilMoisture = clampVal(state.soilMoisture + drift() + (country.climate === 'arid' ? -5 : 0) + (country.climate === 'tropical' ? 5 : 0), 5, 100);
  const precipitation = clampVal(state.precipitation + drift() + (country.climate === 'arid' ? -6 : 0) + (country.climate === 'tropical' ? 10 : 0), 0, 80);
  const temperature = clampVal(state.temperature + drift() * 0.6 + (country.climate === 'cool' ? -3 : 0) + (country.climate === 'tropical' ? 3 : 0), 2, 48);
  const E = GAME_CONFIG.events;
  const droughtRiskVal = Math.max(0, (E.drought.precipThreshold - precipitation) / 40) + Math.max(0, (temperature - E.drought.tempThreshold) / 28);
  const rainRiskVal = Math.max(0, (precipitation - E.rain.precipThreshold) / 40);
  const heatRiskVal = Math.max(0, (temperature - E.heatwave.tempThreshold) / 24);
  const risks = [];
  if (droughtRiskVal > 0.1) risks.push({ label: '干ばつリスク', level: riskLevel(droughtRiskVal) });
  if (rainRiskVal > 0.1) risks.push({ label: '豪雨/豊作リスク', level: riskLevel(rainRiskVal) });
  if (heatRiskVal > 0.1) risks.push({ label: '熱波リスク', level: riskLevel(heatRiskVal) });
  if (!risks.length) risks.push({ label: '安定した天候', level: 'low' });
  return { soilMoisture, precipitation, temperature, risks, droughtRisk: droughtRiskVal, rainRisk: rainRiskVal, heatRisk: heatRiskVal };
}

// ==================== 国家スキル ====================
function activateSkill() {
  if (state.skillUsed) return;
  const key = state.countryKey;
  let msg = '';
  switch (key) {
    case 'egypt':
      // 次のターン、灌漑効果+100%
      state.unlocked.nileBuff = 2;
      msg = '💧 ナイルの恵み: 次のターンの灌漑効果が2倍！';
      break;
    case 'usa':
      state.unlocked.agriBoost = true; // 技術効率+20%
      msg = '🧬 AgriBoost: 技術開発効率が20%向上！';
      break;
    case 'india':
      state.unlocked.monsoon = true; // 降水の悪影響が小さく
      msg = '🌧️ Monsoon Mastery: 降水のブレを抑制！';
      break;
    case 'brazil':
      state.unlocked.amazonShield = true; // 環境スコア低下を半減
      msg = '🌳 Amazon Shield: 環境ダメージを半減！';
      break;
    case 'china':
      state.unlocked.dragonPlan = true; // 生産+5%
      msg = '🐉 Dragon Plan: 生産性に恒久+5%ボーナス！';
      break;
    case 'ireland':
      state.unlocked.emerald = true; // NDVI自然回復を強化
      msg = '🍀 Emerald Surge: 植生の自然回復が強化！';
      break;
  }
  state.skillUsed = true;
  elements.specialSkillButton.disabled = true;
  log(msg);
  pushUnlock(msg);
}

// ==================== 技術アンロック ====================
function checkUnlocks() {
  const list = [];
  const C = GAME_CONFIG.technology.unlocks;
  if (state.techPoints > C.ecoFertilizer && !state.unlocked.ecoFertilizer) {
    state.unlocked.ecoFertilizer = true;
    list.push("🌱 エコ肥料: 肥料による環境悪化が半減");
  }
  if (state.techPoints > C.ecoFertilizer2 && !state.unlocked.ecoFertilizer2) {
    state.unlocked.ecoFertilizer2 = true;
    list.push("🌱 エコ肥料Lv2: 環境ダメージを大幅軽減");
  }
  if (state.techPoints > C.precisionAg && !state.unlocked.precisionAg) {
    state.unlocked.precisionAg = true;
    list.push("📡 精密農業: NDVIの上限がわずかに上昇（0.98）");
  }
  if (state.techPoints > C.precisionAg2 && !state.unlocked.precisionAg2) {
    state.unlocked.precisionAg2 = true;
    list.push("📡 精密農業Lv2: NDVI上限をさらに引き上げ");
  }
  if (state.techPoints > C.orbitalNet && !state.unlocked.orbitalNet) {
    state.unlocked.orbitalNet = true;
    list.push("🛰️ 軌道ネット: 収量に+8%の補正");
  }
  if (state.techPoints > C.researchLab && !state.unlocked.researchLab) {
    state.unlocked.researchLab = true;
    list.push("🔬 研究ラボ: 技術獲得が向上");
  }

  if (!state.unlocked.skillUpgrade && state.techPoints > 1500) {
    state.unlocked.skillUpgrade = true;
    list.push("🏅 国家スキル強化: 基礎生産と環境管理が改善");
  }
  list.forEach(pushUnlock);
  return list;
}

function computeChallengeProgress() {
  if (!state.challenge || state.challenge === 'free') {
    return { value: 1, detail: 'フリープレイ', status: 'success' };
  }
  const initial = state.initialBudget || 1;
  let value = 0;
  let detail = '';
  let status = state.challengeStatus;
  switch (state.challenge) {
    case 'env_guard':
      value = state.envScore / 80;
      detail = `環境 ${state.envScore}/80`;
      if (state.envScore >= 80) status = 'success';
      break;
    case 'growth_drive':
      value = state.totalFoodValue / (initial * 1.8);
      detail = `総収入 ${formatUSD(state.totalFoodValue)} / 目標 ${formatUSD(initial * 1.8)}`;
      if (state.totalFoodValue >= initial * 1.8) status = 'success';
      break;
    case 'tech_surge':
      value = state.techPoints / 2000;
      detail = `技術Pt ${state.techPoints.toLocaleString()} / 2000`;
      if (state.techPoints >= 2000) status = 'success';
      break;
    case 'revenue_marathon':
      value = state.totalFoodValue / (initial * 2.5);
      detail = `総収入 ${formatUSD(state.totalFoodValue)} / 目標 ${formatUSD(initial * 2.5)}`;
      if (state.totalFoodValue >= initial * 2.5) status = 'success';
      break;
    case 'balanced_future':
      value = (state.envScore / 75 + state.techPoints / 800) / 2;
      detail = `環境 ${state.envScore}/75, 技術 ${state.techPoints}/800`;
      if (state.envScore >= 75 && state.techPoints >= 800) status = 'success';
      break;
    default:
      value = 0;
      detail = '未定義のチャレンジ';
  }
  return { value: Math.max(0, Math.min(1, value)), detail, status };
}

function pushChartPoint(revenue) {
  state.chartData.push({
    turn: state.turn,
    revenue,
    avgNdvi: Number(state.avgNdvi.toFixed(3)),
    envScore: state.envScore,
    techPoints: state.techPoints
  });
  const MAX_POINTS = 12;
  if (state.chartData.length > MAX_POINTS) state.chartData.shift();
}

function updateChallengeProgress() {
  const progress = computeChallengeProgress();
  state.challengeProgress = { value: progress.value, detail: progress.detail };
  state.challengeStatus = progress.status;
}

function finalizeChallengeOutcome() {
  const progress = computeChallengeProgress();
  if (progress.status === 'success') {
    state.challengeStatus = 'success';
  } else if (state.challenge && state.challenge !== 'free') {
    state.challengeStatus = 'failed';
  }
}

// ==================== ターン実行 ====================
function executeTurn() {
  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  const country = COUNTRIES[state.countryKey];
  if (fert + irri + tech > state.budget) {
    elements.allocationWarning.textContent = '予算オーバーです！';
    return;
  }

  const C = GAME_CONFIG;
  const baselineBudget = state.initialBudget || country?.startingBudget || 1;
  const investmentNormalizer = Math.max(C.investment.minNormalizer, baselineBudget * C.investment.normalizerRatio);
  let fertShare = fert / investmentNormalizer;
  let irriShare = irri / investmentNormalizer;
  const techShare = tech / investmentNormalizer;
  fertShare = Number.isFinite(fertShare) ? fertShare : 0;
  irriShare = Number.isFinite(irriShare) ? irriShare : 0;
  const safeFertShare = Math.min(C.investment.fertShareCap, Math.max(0, fertShare));
  const safeIrriShare = Math.min(C.investment.irriShareCap, Math.max(0, irriShare));
  const safeTechShare = Math.min(C.investment.techShareCap, Math.max(0, techShare));

  let fertEffect = safeFertShare * C.investment.fertEffect;
  let irriEffect = safeIrriShare * C.investment.irriEffect;
  const techInvestmentBoost = Math.min(C.investment.techInvestmentBoostCap, safeTechShare * C.investment.techInvestmentBoost);
  const techLevelBoost = Math.min(C.map.techLevelBoost, state.techPoints / C.map.techLevelBoostDivisor);

  // 国家スキルの一時バフ
  if (state.unlocked.nileBuff) {
    irriEffect *= state.unlocked.nileBuff;
    delete state.unlocked.nileBuff; // 1ターン限定
  }

  const dryness = Math.max(0, 1 - (state.soilMoisture / 100));
  const heatStress = Math.max(0, (state.temperature - 26) / 32);
  const precipitationBoost = Math.max(0, (state.precipitation - 25) / 60);

  // マップ更新
  for(let r=0; r<MAP_SIZE; r++) {
    for(let c=0; c<MAP_SIZE; c++) {
      if(state.currentMapNdvi[r][c] !== null) {
        const basePotential = state.baseMapPotential[r][c] || 0;
        const last = state.currentMapNdvi[r][c];

        // 自然回復/減衰
        const recoveryFactor = state.unlocked.emerald ? C.map.emeraldRecoveryFactor : C.map.recoveryFactor;
        let recovering = (last * recoveryFactor) + (basePotential * (1 - recoveryFactor));

        let baseCap = basePotential + C.map.baseCapBonus;
        let hardCap = C.map.hardCap;
        if (state.unlocked.precisionAg) {
          baseCap = basePotential + C.map.precisionAgBaseCapBonus;
          hardCap = C.map.precisionAgHardCap;
        }
        if (state.unlocked.precisionAg2) {
          baseCap = basePotential + C.map.precisionAg2BaseCapBonus;
          hardCap = C.map.precisionAg2HardCap;
        }
        const cap = Math.min(baseCap, hardCap);
        const headroom = Math.max(0, cap - recovering);

        const fertMomentum = headroom * fertEffect * (C.map.fertMomentum.base + precipitationBoost * C.map.fertMomentum.precipitationFactor + Math.random() * C.map.fertMomentum.randomFactor);
        const irrigationMomentum = headroom * irriEffect * (C.map.irriMomentum.base + dryness * C.map.irriMomentum.drynessFactor + heatStress * C.map.irriMomentum.heatStressFactor + Math.random() * C.map.irriMomentum.randomFactor);
        let newNdvi = recovering + fertMomentum + irrigationMomentum;

        const envPenalty = ((100 - state.envScore) / C.map.envPenaltyDivisor);
        const climateDrag = (dryness * C.map.climateDrag.dryness) + (heatStress * C.map.climateDrag.heatStress) - (precipitationBoost * C.map.climateDrag.precipitation);
        const erosion = Math.max(0, last - basePotential) * C.map.erosionFactor;
        newNdvi += techLevelBoost + techInvestmentBoost - envPenalty - climateDrag - erosion;
        newNdvi += (Math.random() - 0.5) * C.map.noiseFactor; // 小さな気象ノイズ

        if (!Number.isFinite(newNdvi)) newNdvi = basePotential;
        state.currentMapNdvi[r][c] = Math.max(C.map.minNdvi, Math.min(cap, newNdvi));
      }
    }
  }

  calculateCurrentAverages();

  // 生産量計算
  const crop = CROPS[elements.cropSelect.value];
  const eraMultiplier = 1 + state.eraIndex * C.production.eraMultiplier;
  let techEff = 1 + state.techPoints * C.production.techPointFactor + (tech / (state.budget + 1)) * C.production.techInvestmentFactor;
  if (state.unlocked.agriBoost) techEff *= C.production.agriBoostMultiplier;
  let regionFactor = 1.0;
  if (country.climate === 'arid') regionFactor = C.production.climateFactors.arid;
  if (country.climate === 'tropical') regionFactor = C.production.climateFactors.tropical;

  let production = Math.round((C.production.base + state.avgNdvi * C.production.ndviMultiplier) * state.avgNdvi * eraMultiplier * techEff * crop.yieldFactor * regionFactor);
  if (state.unlocked.dragonPlan) production = Math.round(production * C.production.dragonPlanMultiplier);
  if (state.unlocked.orbitalNet) production = Math.round(production * C.production.orbitalNetMultiplier);
  if (state.unlocked.skillUpgrade) production = Math.round(production * C.production.skillUpgradeMultiplier);

  // ランダムイベント（環境・気象）
  let event = '';
  const E = C.events;
  const droughtRisk = (state.precipitation < E.drought.precipThreshold && state.temperature > E.drought.tempThreshold);
  const monsoonMitigation = state.unlocked.monsoon ? E.monsoonMitigation : 1.0;

  const droughtChance = E.drought.chance * monsoonMitigation * (1 + (state.forecast?.droughtRisk || 0) / 2);
  const heatwaveChance = E.heatwave.chance * monsoonMitigation * (1 + (state.forecast?.heatRisk || 0) / 2);
  const rainChance = E.rain.chance * (1 + (state.forecast?.rainRisk || 0) / 3);

  if (droughtRisk && irri < state.budget * E.drought.irriBudgetRatio && Math.random() < droughtChance) {
    production = Math.round(production * E.drought.penalty); event = '🚨 干ばつにより生産量が大幅に減少。';
  } else if (state.temperature > E.heatwave.tempThreshold && Math.random() < heatwaveChance) {
    production = Math.round(production * E.heatwave.penalty); event = '🦠 熱波による害虫発生で生産量が減少。';
  } else if (state.precipitation > E.rain.precipThreshold && Math.random() < rainChance) {
    production = Math.round(production * E.rain.bonus); event = '☔ 恵みの雨により生産量が増加。';
  } else if (Math.random() < E.random.chance) {
    const r = Math.random();
    if (r < E.random.sandstorm.chance) { production = Math.round(production * E.random.sandstorm.penalty); event = '🌪️ 砂嵐が発生し、植生が損傷。'; }
    else if (r < E.random.sandstorm.chance + E.random.commsFailure.chance) { elements.ndviValue.textContent = '？'; event = '🛰️ 衛星通信障害 — 一部データが欠落。'; }
    else { state.envScore = Math.max(0, state.envScore - E.random.industrialPollution.penalty); event = '🏭 近隣の工業活動により環境スコア低下。'; }
  }

  const revenue = Math.round(production * crop.basePrice);

  // 環境スコア変化
  let envChange = -Math.round(safeFertShare * C.environment.fertPenalty) + Math.round((safeTechShare * C.environment.techBonus) + (safeIrriShare * C.environment.irriBonus));
  if (state.unlocked.ecoFertilizer2) envChange = Math.round(envChange * C.environment.ecoFertilizerTier2Multiplier);
  else if (state.unlocked.ecoFertilizer) envChange = Math.round(envChange * C.environment.ecoFertilizerMultiplier);
  if (state.unlocked.amazonShield && envChange < 0) envChange = Math.round(envChange * C.environment.amazonShieldMultiplier);
  if (state.unlocked.skillUpgrade && envChange < 0) envChange = Math.round(envChange * C.environment.skillUpgradeEnvMultiplier);
  state.envScore = Math.max(0, Math.min(100, state.envScore + envChange));

  // 技術ポイント
  let techGain = Math.round(tech / C.technology.techGainDivisor + Math.random() * (tech / C.technology.techGainRandomDivisor));
  if (state.unlocked.agriBoost) techGain = Math.round(techGain * C.technology.agriBoostMultiplier);
  if (state.unlocked.researchLab) techGain = Math.round(techGain * C.technology.researchLabMultiplier);
  state.techPoints += techGain;

  state.eraIndex = C.technology.eraThresholds.filter(t => state.techPoints >= t).length - 1;

  // 予算更新
  state.budget = Math.max(0, Math.round(state.budget - (fert + irri + tech) + revenue));
  state.totalFoodValue += revenue;
  pushChartPoint(revenue);
  updateChallengeProgress();

  const newUnlocks = checkUnlocks();
  state.history.push({
    turn: state.turn,
    season: state.season,
    crop: crop.name,
    allocations: {
      fertilizer: fert,
      irrigation: irri,
      tech
    },
    avgNdvi: Number(state.avgNdvi.toFixed(3)),
    envScore: state.envScore,
    techPoints: state.techPoints,
    revenue,
    totalFoodValue: state.totalFoodValue,
    budgetRemaining: state.budget,
    era: ERAS[state.eraIndex],
    conditions: {
      soilMoisture: state.soilMoisture,
      precipitation: state.precipitation,
      temperature: state.temperature
    },
    event: event || '特に大きなイベントはありませんでした。',
    newUnlocks
  });
  if (typeof renderHistory === 'function') renderHistory();
  if (typeof renderTrendChart === 'function') renderTrendChart();
  if (typeof updateChallengeProgressUI === 'function') updateChallengeProgressUI();

  // 結果表示
  elements.turnResultText.textContent = `${crop.name}を${production.toLocaleString()}トン生産、収入: ${formatUSD(revenue)}`;
  elements.eventText.textContent = event || '特に大きなイベントはありませんでした。';
  log(`ターン ${state.turn}: 収入 +${formatUSD(revenue)}. ${event || 'イベントなし'}`);

  // ミニグラフ棒追加
  addToMiniGraph(revenue);

  // 次ターンへ
  elements.executeButton.disabled = true;
  setTimeout(() => {
    elements.executeButton.disabled = false;
    nextTurn();
  }, 1100);
}
