// ==================== ターン進行 & 計算 ====================

function calculateCurrentAverages() {
  const valid = state.currentMapNdvi.flat().filter(v => v !== null);
  state.avgNdvi = valid.reduce((s,v)=>s+v,0) / (valid.length || 1);
  const country = COUNTRIES[state.countryKey];
  state.soilMoisture = Math.round((0.4 + (Math.random()*0.45)) * 100);
  state.precipitation = Math.round( Math.max(0, (Math.random()*60) * (country.climate==='arid'?0.4:1.0)) );
  state.temperature = Math.round(15 + (Math.random()*20) + (country.climate==='cool'?-5:0) + (country.climate==='tropical'?5:0));
}

function generateForecast() {
  const cfg = GAME_CONFIG.forecast;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const swing = (range) => (Math.random() * range * 2) - range;
  const nextMoisture = clamp(state.soilMoisture + swing(cfg.moistureSwing), 5, 98);
  const nextPrecip = clamp(state.precipitation + swing(cfg.precipSwing), 0, 120);
  const nextTemp = clamp(state.temperature + swing(cfg.tempSwing), -5, 45);
  const riskNotes = [];
  if (nextPrecip < GAME_CONFIG.events.drought.precipThreshold) riskNotes.push('干ばつリスク上昇');
  if (nextTemp > GAME_CONFIG.events.heatwave.tempThreshold) riskNotes.push('熱波に注意');
  if (nextPrecip > GAME_CONFIG.events.rain.precipThreshold) riskNotes.push('恵みの雨の可能性');
  state.forecast = {
    next: {
      soilMoisture: Math.round(nextMoisture),
      precipitation: Math.round(nextPrecip),
      temperature: Math.round(nextTemp)
    },
    riskNotes: riskNotes.length ? riskNotes : ['大きな変化は予想されません']
  };
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
  if (state.techPoints > C.climateShield && !state.unlocked.climateShield) {
    state.unlocked.climateShield = true;
    list.push("🛡️ 気候シールド: 環境劣化を軽減");
  }
  if (state.techPoints > C.aiAdvisors && !state.unlocked.aiAdvisors) {
    state.unlocked.aiAdvisors = true;
    list.push("🤖 AIアドバイザー: 収益計算に微増ボーナス");
  }
  list.forEach(pushUnlock);
  return list;
}

function checkTechTreeUnlocks() {
  const unlockedList = [];
  const tree = GAME_CONFIG.technology.techTree || [];
  tree.forEach(node => {
    if (state.techPoints >= node.required && !state.unlockedTechNodes[node.id]) {
      state.unlockedTechNodes[node.id] = true;
      const msg = `🔓 ${node.name}: ${node.description}`;
      pushUnlock(msg);
      unlockedList.push(msg);
    }
  });
  return unlockedList;
}

function evaluateChallengeConditions() {
  const info = CHALLENGES[state.challenge];
  if (!info) {
    state.challengeStatus = 'success';
    state.challengeProgress = { completed: 0, total: 0, details: [] };
    return;
  }
  const cond = info.conditions || {};
  const details = [];
  let completed = 0; let total = 0;
  const add = (label, met) => { total++; if (met) completed++; details.push({ label, met }); };
  if (cond.envScore !== undefined) add(`環境${cond.envScore}+`, state.envScore >= cond.envScore);
  if (cond.revenueMultiplier !== undefined) add(`総収入x${cond.revenueMultiplier}`, state.totalFoodValue >= state.initialBudget * cond.revenueMultiplier);
  if (cond.techPoints !== undefined) add(`技術${cond.techPoints}+`, state.techPoints >= cond.techPoints);
  if (cond.avgNdvi !== undefined) add(`平均NDVI${cond.avgNdvi}`, state.avgNdvi >= cond.avgNdvi);
  state.challengeProgress = { completed, total, details };
  if (total === 0) {
    state.challengeStatus = 'success';
  } else if (completed === total) {
    state.challengeStatus = 'success';
  } else if (state.challengeStatus !== 'failed') {
    state.challengeStatus = 'pending';
  }
}

function getSkillTierBonuses() {
  const tiers = GAME_CONFIG.technology.skillTiers[state.countryKey] || GAME_CONFIG.technology.skillTiers.default || [];
  let production = 1.0;
  let irrigation = 0;
  let tierLevel = 1;
  tiers.forEach(t => {
    if (state.techPoints >= t.threshold) {
      tierLevel++;
      if (t.production) production *= t.production;
      if (t.irrigation) irrigation += t.irrigation;
    }
  });
  state.skillTier = tierLevel;
  return { production, irrigation };
}

function collectTechEffects() {
  const effects = { productionMultiplier: 1, revenueMultiplier: 1, irrigationBoost: 0, envLossReduction: 0, envBonus: 0 };
  const tree = GAME_CONFIG.technology.techTree || [];
  tree.forEach(node => {
    if (state.unlockedTechNodes[node.id]) {
      const e = node.effect || {};
      if (e.productionMultiplier) effects.productionMultiplier *= e.productionMultiplier;
      if (e.revenueMultiplier) effects.revenueMultiplier *= e.revenueMultiplier;
      if (e.irrigationBoost) effects.irrigationBoost += e.irrigationBoost;
      if (e.envLossReduction) effects.envLossReduction = Math.max(effects.envLossReduction, e.envLossReduction);
      if (e.envBonus) effects.envBonus += e.envBonus;
    }
  });
  if (state.unlocked.climateShield) effects.envLossReduction = Math.max(effects.envLossReduction, 0.12);
  if (state.unlocked.aiAdvisors) effects.revenueMultiplier *= 1.03;
  return effects;
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
  if (state.challengeStatus === 'failed') return;
  evaluateChallengeConditions();
}

function finalizeChallengeOutcome() {
  if (!state.challenge || state.challenge === 'free') {
    state.challengeStatus = 'success';
    return;
  }
  if (state.challengeStatus === 'success') return;
  evaluateChallengeConditions();
  if (state.challengeProgress.total && state.challengeProgress.completed < state.challengeProgress.total) {
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
  const skillBonus = getSkillTierBonuses();
  const techEffects = collectTechEffects();

  // 国家スキルの一時バフ
  if (state.unlocked.nileBuff) {
    irriEffect *= state.unlocked.nileBuff;
    delete state.unlocked.nileBuff; // 1ターン限定
  }
  irriEffect *= (1 + skillBonus.irrigation + techEffects.irrigationBoost);

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
  techEff *= skillBonus.production * techEffects.productionMultiplier;
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

  if (droughtRisk && irri < state.budget * E.drought.irriBudgetRatio && Math.random() < E.drought.chance * monsoonMitigation) {
    production = Math.round(production * E.drought.penalty); event = '🚨 干ばつにより生産量が大幅に減少。';
  } else if (state.temperature > E.heatwave.tempThreshold && Math.random() < E.heatwave.chance * monsoonMitigation) {
    production = Math.round(production * E.heatwave.penalty); event = '🦠 熱波による害虫発生で生産量が減少。';
  } else if (state.precipitation > E.rain.precipThreshold && Math.random() < E.rain.chance) {
    production = Math.round(production * E.rain.bonus); event = '☔ 恵みの雨により生産量が増加。';
  } else if (Math.random() < E.random.chance) {
    const r = Math.random();
    if (r < E.random.sandstorm.chance) { production = Math.round(production * E.random.sandstorm.penalty); event = '🌪️ 砂嵐が発生し、植生が損傷。'; }
    else if (r < E.random.sandstorm.chance + E.random.commsFailure.chance) { elements.ndviValue.textContent = '？'; event = '🛰️ 衛星通信障害 — 一部データが欠落。'; }
    else { state.envScore = Math.max(0, state.envScore - E.random.industrialPollution.penalty); event = '🏭 近隣の工業活動により環境スコア低下。'; }
  }

  let revenue = Math.round(production * crop.basePrice);
  revenue = Math.round(revenue * techEffects.revenueMultiplier);

  // 環境スコア変化
  let envChange = -Math.round(safeFertShare * C.environment.fertPenalty) + Math.round((safeTechShare * C.environment.techBonus) + (safeIrriShare * C.environment.irriBonus));
  if (state.unlocked.ecoFertilizer) envChange = Math.round(envChange * C.environment.ecoFertilizerMultiplier);
  if (state.unlocked.amazonShield && envChange < 0) envChange = Math.round(envChange * C.environment.amazonShieldMultiplier);
  if (envChange < 0 && techEffects.envLossReduction) envChange = Math.round(envChange * (1 - techEffects.envLossReduction));
  state.envScore = Math.max(0, Math.min(100, state.envScore + envChange));
  if (techEffects.envBonus) state.envScore = Math.min(100, state.envScore + techEffects.envBonus);

  // 技術ポイント
  let techGain = Math.round(tech / C.technology.techGainDivisor + Math.random() * (tech / C.technology.techGainRandomDivisor));
  if (state.unlocked.agriBoost) techGain = Math.round(techGain * C.technology.agriBoostMultiplier);
  state.techPoints += techGain;

  state.eraIndex = C.technology.eraThresholds.filter(t => state.techPoints >= t).length - 1;

  // 予算更新
  state.budget = Math.max(0, Math.round(state.budget - (fert + irri + tech) + revenue));
  state.totalFoodValue += revenue;
  pushChartPoint(revenue);
  updateChallengeProgress();

  const newUnlocks = [...checkUnlocks(), ...checkTechTreeUnlocks()];
  state.history.push({
    turn: state.turn,
    turnInSeason: state.seasonTurn,
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
    forecast: state.forecast.next,
    challengeProgress: state.challengeProgress,
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
