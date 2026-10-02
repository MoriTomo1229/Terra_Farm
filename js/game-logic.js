// ==================== ターン進行 & 計算 ====================

function calculateCurrentAverages() {
  const valid = state.currentMapNdvi.flat().filter(v => v !== null);
  state.avgNdvi = valid.reduce((s,v)=>s+v,0) / (valid.length || 1);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateMapAverage(mapData) {
  const valid = mapData.flat().filter(v => v !== null && Number.isFinite(v));
  return valid.reduce((s, v) => s + v, 0) / (valid.length || 1);
}

function calculateResilienceScore() {
  const baseline = Number.isFinite(state.initialAvgNdvi)
    ? state.initialAvgNdvi
    : state.avgNdvi;
  const ndviScore = clampNumber(50 + ((state.avgNdvi - baseline) * 220), 0, 100);
  const techScore = clampNumber(state.techPoints / 25, 0, 100);
  const liquidityScore = state.initialBudget > 0
    ? clampNumber((state.budget / state.initialBudget) * 100, 0, 100)
    : 50;
  const climateBuffer = clampNumber(100 - (state.climateRisk || 0), 0, 100);

  return Math.round(
    (state.envScore * 0.32) +
    (ndviScore * 0.24) +
    (techScore * 0.16) +
    (liquidityScore * 0.1) +
    (climateBuffer * 0.18)
  );
}

function updateClimatePulse() {
  const dryness = clampNumber(100 - (state.soilMoisture || 0), 0, 100);
  const heat = clampNumber(((state.temperature || 0) - 24) * 4, 0, 100);
  const rainDeficit = clampNumber(30 - (state.precipitation || 0), 0, 30) * 2;
  const envPressure = clampNumber(70 - state.envScore, 0, 70) * 0.45;
  const modeCfg = GAME_CONFIG[state.mode] || {};
  const modeRiskBonus = modeCfg.riskBonus || 0;

  state.climateRisk = clampNumber(Math.round(
    (dryness * 0.32) +
    (heat * 0.28) +
    (rainDeficit * 0.18) +
    envPressure +
    modeRiskBonus
  ), 0, 100);
  state.resilienceScore = calculateResilienceScore();

  const tags = [];
  if (dryness >= 55) tags.push(t('pulse.tagDryness'));
  if (heat >= 45) tags.push(t('pulse.tagHeat'));
  if (rainDeficit >= 32) tags.push(t('pulse.tagRainDeficit'));
  if (state.envScore < 60) tags.push(t('pulse.tagEnvDecline'));
  if (state.resilienceScore < 55) tags.push(t('pulse.tagRegenInsufficient'));
  if (!tags.length) tags.push(t('pulse.tagStable'));

  const riskLevels = (GAME_CONFIG.climatePulse && GAME_CONFIG.climatePulse.riskLevels) || { crisis: 75, warning: 55, caution: 35 };
  let label = t('risk.stable');
  let message = t('pulse.msgStable');
  if (state.climateRisk >= riskLevels.crisis) {
    label = t('risk.crisis');
    message = t('pulse.msgCrisis');
  } else if (state.climateRisk >= riskLevels.warning) {
    label = t('risk.warning');
    message = t('pulse.msgWarning');
  } else if (state.climateRisk >= riskLevels.caution) {
    label = t('risk.caution');
    message = t('pulse.msgCaution');
  }

  state.climatePulse = { label, message, tags };
}

function generateTurnConditions() {
  const country = COUNTRIES[state.countryKey];
  state.soilMoisture = Math.round((0.4 + (gameRandom()*0.45)) * 100);
  state.precipitation = Math.round(Math.max(0, (gameRandom()*60) * (country.climate==='arid'?0.4:1.0)));
  state.temperature = Math.round(15 + (gameRandom()*20) + (country.climate==='cool'?-5:0) + (country.climate==='tropical'?5:0));
  const modeClimateCfg = GAME_CONFIG[state.mode];
  if (modeClimateCfg && typeof modeClimateCfg.temperatureBonus === 'number') {
    const cfg = modeClimateCfg;
    const phase = clampNumber((state.turn - 1) / Math.max(1, (state.turnLimit || cfg.turnLimit) - 1), 0, 1);
    state.soilMoisture = Math.max(8, Math.round(state.soilMoisture - (cfg.moisturePenalty || 0) - ((cfg.moistureRamp || 0) * phase)));
    state.precipitation = Math.max(0, Math.round((state.precipitation * (cfg.precipitationMultiplier ?? 1)) - (cfg.precipitationPenalty || 0)));
    state.temperature = Math.round(state.temperature + (cfg.temperatureBonus || 0) + ((cfg.temperatureRamp || 0) * phase));
  }
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
      msg = t('skill.egypt');
      break;
    case 'usa':
      state.unlocked.agriBoost = true; // 技術効率+20%
      msg = t('skill.usa');
      break;
    case 'india':
      state.unlocked.monsoon = true; // 降水の悪影響が小さく
      msg = t('skill.india');
      break;
    case 'brazil':
      state.unlocked.amazonShield = true; // 環境スコア低下を半減
      msg = t('skill.brazil');
      break;
    case 'china':
      state.unlocked.dragonPlan = true; // 生産+5%
      msg = t('skill.china');
      break;
    case 'ireland':
      state.unlocked.emerald = true; // NDVI自然回復を強化
      msg = t('skill.ireland');
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
    list.push(t('unlock.ecoFertilizer'));
  }
  if (state.techPoints > C.precisionAg && !state.unlocked.precisionAg) {
    state.unlocked.precisionAg = true;
    list.push(t('unlock.precisionAg'));
  }
  if (state.techPoints > C.orbitalNet && !state.unlocked.orbitalNet) {
    state.unlocked.orbitalNet = true;
    list.push(t('unlock.orbitalNet'));
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
    techPoints: state.techPoints,
    resilienceScore: state.resilienceScore,
    climateRisk: state.climateRisk
  });
  const MAX_POINTS = 12;
  if (state.chartData.length > MAX_POINTS) state.chartData.shift();
}

function evaluateRegenLoop() {
  const cfg = GAME_CONFIG.frontier;
  const recoveredNdvi = state.avgNdvi >= state.initialAvgNdvi + cfg.ndviGainGoal;
  const recoveredEnv = state.envScore >= cfg.envGoal;
  const resilient = state.resilienceScore >= cfg.resilienceGoal;
  return recoveredNdvi && recoveredEnv && resilient;
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
  } else if (state.challenge === 'regen_loop') {
    state.challengeStatus = evaluateRegenLoop() ? 'success' : 'pending';
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
  } else if (state.challenge === 'regen_loop') {
    state.challengeStatus = evaluateRegenLoop() ? 'success' : 'failed';
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
    elements.allocationWarning.textContent = t('main.budgetOver');
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
  let techEff = Math.min(C.production.techEfficiencyCap, 1 + state.techPoints * C.production.techPointFactor) + (tech / (state.budget + 1)) * C.production.techInvestmentFactor;
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
    production = Math.round(production * E.drought.penalty); event = t('event.drought');
  } else if (state.temperature > E.heatwave.tempThreshold && gameRandom() < E.heatwave.chance * monsoonMitigation) {
    production = Math.round(production * E.heatwave.penalty); event = t('event.heatwave');
  } else if (state.precipitation > E.rain.precipThreshold && gameRandom() < E.rain.chance) {
    production = Math.round(production * E.rain.bonus); event = t('event.rain');
  } else if (gameRandom() < E.random.chance) {
    const r = gameRandom();
    if (r < E.random.sandstorm.chance) { production = Math.round(production * E.random.sandstorm.penalty); event = t('event.sandstorm'); }
    else if (r < E.random.sandstorm.chance + E.random.commsFailure.chance) { elements.ndviValue.textContent = '？'; event = t('event.commsFailure'); }
    else { state.envScore = Math.max(0, state.envScore - E.random.industrialPollution.penalty); event = t('event.industrialPollution'); }
  }

  const modeClimateCfg2 = GAME_CONFIG[state.mode];
  if (modeClimateCfg2 && typeof modeClimateCfg2.adaptationIrrigationRatio === 'number') {
    const cfg = modeClimateCfg2;
    const adaptationRatio = (irri + tech) / Math.max(fert + irri + tech, 1);
    const underPrepared = adaptationRatio < ((cfg.adaptationIrrigationRatio || 0) + (cfg.adaptationTechRatio || 0));
    if (state.climateRisk >= 70 && underPrepared && gameRandom() < 0.42) {
      production = Math.round(production * 0.84);
      state.envScore = Math.max(0, state.envScore - 2);
      const shockText = t('event.frontierShock');
      event = event ? `${event} ${shockText}` : shockText;
    }
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
  if (typeof updateClimatePulse === 'function') updateClimatePulse();
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
    resilienceScore: state.resilienceScore,
    climateRisk: state.climateRisk,
    climatePulse: state.climatePulse?.label || '',
    revenue,
    totalFoodValue: state.totalFoodValue,
    budgetRemaining: state.budget,
    era: ERAS[state.eraIndex],
    conditions: {
      soilMoisture: state.soilMoisture,
      precipitation: state.precipitation,
      temperature: state.temperature
    },
    event: event || t('event.none'),
    newUnlocks
  });
  if (typeof renderHistory === 'function') renderHistory();
  if (typeof renderTrendChart === 'function') renderTrendChart();
  if (typeof updateChallengeProgressUI === 'function') updateChallengeProgressUI();

  // 結果表示
  elements.turnResultText.textContent = t('turn.result', {crop: crop.name, production: production.toLocaleString(), revenue: formatUSD(revenue)});
  elements.eventText.textContent = event || t('event.none');
  log(t('turn.log', {turn: state.turn, revenue: formatUSD(revenue), event: event || t('turn.logNoEvent')}));

  // 次ターンへ
  elements.executeButton.disabled = true;
  setTimeout(() => {
    const hasNextTurn = nextTurn();
    state.isTurnProcessing = false;
    if (hasNextTurn && typeof updateRemainingBudget === 'function') updateRemainingBudget();
  }, 1100);
}
