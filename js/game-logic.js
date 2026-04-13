// ==================== ターン進行 & 計算 ====================

function calculateCurrentAverages() {
  const valid = state.currentMapNdvi.flat().filter(v => v !== null);
  state.avgNdvi = valid.reduce((s,v)=>s+v,0) / (valid.length || 1);
}

function generateTurnConditions() {
  const country = COUNTRIES[state.countryKey];
  state.soilMoisture = Math.round((0.4 + (gameRandom()*0.45)) * 100);
  state.precipitation = Math.round(Math.max(0, (gameRandom()*60) * (country.climate==='arid'?0.4:1.0)));
  state.temperature = Math.round(15 + (gameRandom()*20) + (country.climate==='cool'?-5:0) + (country.climate==='tropical'?5:0));
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
  if (state.techPoints > C.precisionAg && !state.unlocked.precisionAg) {
    state.unlocked.precisionAg = true;
    list.push("📡 精密農業: NDVIの上限がわずかに上昇（0.98）");
  }
  if (state.techPoints > C.orbitalNet && !state.unlocked.orbitalNet) {
    state.unlocked.orbitalNet = true;
    list.push("🛰️ 軌道ネット: 収量に+8%の補正");
  }
  list.forEach(pushUnlock);
  return list;
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
  if (!state.challenge || state.challenge === 'free') {
    state.challengeStatus = 'success';
    return;
  }
  if (state.challenge === 'env_guard') {
    state.challengeStatus = state.envScore >= 80 ? 'success' : 'pending';
  } else if (state.challenge === 'growth_drive') {
    state.challengeStatus = state.totalFoodValue >= state.initialBudget * 1.8 ? 'success' : 'pending';
  } else {
    state.challengeStatus = 'pending';
  }
}

function finalizeChallengeOutcome() {
  if (!state.challenge || state.challenge === 'free') {
    state.challengeStatus = 'success';
    return;
  }
  if (state.challenge === 'env_guard') {
    state.challengeStatus = state.envScore >= 80 ? 'success' : 'failed';
  } else if (state.challenge === 'growth_drive') {
    state.challengeStatus = state.totalFoodValue >= state.initialBudget * 1.8 ? 'success' : 'failed';
  } else {
    state.challengeStatus = 'failed';
  }
}

// ==================== ターン実行 ====================
function executeTurn() {
  if (state.isTurnProcessing) return;
  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  const country = COUNTRIES[state.countryKey];
  if (fert + irri + tech > state.budget) {
    elements.allocationWarning.textContent = '予算オーバーです！';
    return;
  }
  state.isTurnProcessing = true;
  if (typeof updateRemainingBudget === 'function') updateRemainingBudget();

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

        const baseCap = state.unlocked.precisionAg ? basePotential + C.map.precisionAgBaseCapBonus : basePotential + C.map.baseCapBonus;
        const hardCap = state.unlocked.precisionAg ? C.map.precisionAgHardCap : C.map.hardCap;
        const cap = Math.min(baseCap, hardCap);
        const headroom = Math.max(0, cap - recovering);

        const fertMomentum = headroom * fertEffect * (C.map.fertMomentum.base + precipitationBoost * C.map.fertMomentum.precipitationFactor + gameRandom() * C.map.fertMomentum.randomFactor);
        const irrigationMomentum = headroom * irriEffect * (C.map.irriMomentum.base + dryness * C.map.irriMomentum.drynessFactor + heatStress * C.map.irriMomentum.heatStressFactor + gameRandom() * C.map.irriMomentum.randomFactor);
        let newNdvi = recovering + fertMomentum + irrigationMomentum;

        const envPenalty = ((100 - state.envScore) / C.map.envPenaltyDivisor);
        const climateDrag = (dryness * C.map.climateDrag.dryness) + (heatStress * C.map.climateDrag.heatStress) - (precipitationBoost * C.map.climateDrag.precipitation);
        const erosion = Math.max(0, last - basePotential) * C.map.erosionFactor;
        newNdvi += techLevelBoost + techInvestmentBoost - envPenalty - climateDrag - erosion;
        newNdvi += (gameRandom() - 0.5) * C.map.noiseFactor; // 小さな気象ノイズ

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

  // ランダムイベント（環境・気象）
  let event = '';
  const E = C.events;
  const droughtRisk = (state.precipitation < E.drought.precipThreshold && state.temperature > E.drought.tempThreshold);
  const monsoonMitigation = state.unlocked.monsoon ? E.monsoonMitigation : 1.0;

  if (droughtRisk && irri < state.budget * E.drought.irriBudgetRatio && gameRandom() < E.drought.chance * monsoonMitigation) {
    production = Math.round(production * E.drought.penalty); event = '🚨 干ばつにより生産量が大幅に減少。';
  } else if (state.temperature > E.heatwave.tempThreshold && gameRandom() < E.heatwave.chance * monsoonMitigation) {
    production = Math.round(production * E.heatwave.penalty); event = '🦠 熱波による害虫発生で生産量が減少。';
  } else if (state.precipitation > E.rain.precipThreshold && gameRandom() < E.rain.chance) {
    production = Math.round(production * E.rain.bonus); event = '☔ 恵みの雨により生産量が増加。';
  } else if (gameRandom() < E.random.chance) {
    const r = gameRandom();
    if (r < E.random.sandstorm.chance) { production = Math.round(production * E.random.sandstorm.penalty); event = '🌪️ 砂嵐が発生し、植生が損傷。'; }
    else if (r < E.random.sandstorm.chance + E.random.commsFailure.chance) { elements.ndviValue.textContent = '？'; event = '🛰️ 衛星通信障害 — 一部データが欠落。'; }
    else { state.envScore = Math.max(0, state.envScore - E.random.industrialPollution.penalty); event = '🏭 近隣の工業活動により環境スコア低下。'; }
  }

  const revenue = Math.round(production * crop.basePrice);

  // 環境スコア変化
  let envChange = -Math.round(safeFertShare * C.environment.fertPenalty) + Math.round((safeTechShare * C.environment.techBonus) + (safeIrriShare * C.environment.irriBonus));
  if (state.unlocked.ecoFertilizer) envChange = Math.round(envChange * C.environment.ecoFertilizerMultiplier);
  if (state.unlocked.amazonShield && envChange < 0) envChange = Math.round(envChange * C.environment.amazonShieldMultiplier);
  state.envScore = Math.max(0, Math.min(100, state.envScore + envChange));

  // 技術ポイント
  let techGain = Math.round(tech / C.technology.techGainDivisor + gameRandom() * (tech / C.technology.techGainRandomDivisor));
  if (state.unlocked.agriBoost) techGain = Math.round(techGain * C.technology.agriBoostMultiplier);
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
    const hasNextTurn = nextTurn();
    state.isTurnProcessing = false;
    if (hasNextTurn && typeof updateRemainingBudget === 'function') updateRemainingBudget();
  }, 1100);
}
