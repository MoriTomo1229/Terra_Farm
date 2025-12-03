// ==================== ターン進行 & 計算 ====================

function calculateCurrentAverages() {
  const valid = state.currentMapNdvi.flat().filter(v => v !== null);
  state.avgNdvi = valid.reduce((s,v)=>s+v,0) / (valid.length || 1);
  const country = COUNTRIES[state.countryKey];
  state.soilMoisture = Math.round((0.4 + (Math.random()*0.45)) * 100);
  state.precipitation = Math.round( Math.max(0, (Math.random()*60) * (country.climate==='arid'?0.4:1.0)) );
  state.temperature = Math.round(15 + (Math.random()*20) + (country.climate==='cool'?-5:0) + (country.climate==='tropical'?5:0));
  updateForecast();
}

function updateForecast() {
  // シンプルな一歩先予報: 現在値を基準に少し平滑化しつつイベントしきい値でリスクを算出
  const noise = () => (Math.random() - 0.5) * 10;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  state.forecast.soilMoisture = clamp(Math.round(state.soilMoisture * 0.9 + 10 + noise()), 0, 100);
  state.forecast.precipitation = clamp(Math.round(state.precipitation * 0.85 + 8 + noise()), 0, 100);
  state.forecast.temperature = clamp(Math.round(state.temperature * 0.92 + 2 + noise()), -10, 50);
  const E = GAME_CONFIG.events;
  state.forecast.risks = {
    drought: state.forecast.precipitation < E.drought.precipThreshold ? 60 : 25,
    heatwave: state.forecast.temperature > E.heatwave.tempThreshold ? 55 : 20,
    rain: state.forecast.precipitation > E.rain.precipThreshold ? 45 : 15,
  };
}

// ==================== 国家スキル ====================
function activateSkill() {
  if (state.skillUsed) return;
  const key = state.countryKey;
  let msg = '';
  const tier = (SKILL_UPGRADES[key] || [])[state.skillLevel - 1];
  switch (key) {
    case 'egypt':
      state.unlocked.nileBuff = tier?.irrigationBoost || 2;
      msg = `💧 ナイルの恵み: 次のターンの灌漑効果が${state.unlocked.nileBuff}倍！`;
      break;
    case 'usa':
      state.unlocked.agriBoost = true; // 技術効率+20%~
      msg = `🧬 ${tier?.label || 'AgriBoost'}: 技術開発効率が向上！`;
      break;
    case 'india':
      state.unlocked.monsoon = true;
      msg = `🌧️ ${tier?.label || 'Monsoon Mastery'}: 降水のブレを抑制！`;
      break;
    case 'brazil':
      state.unlocked.amazonShield = true;
      msg = `🌳 ${tier?.label || 'Amazon Shield'}: 環境ダメージを軽減！`;
      break;
    case 'china':
      state.unlocked.dragonPlan = true;
      msg = `🐉 ${tier?.label || 'Dragon Plan'}: 生産性に恒久ボーナス！`;
      break;
    case 'ireland':
      state.unlocked.emerald = true;
      msg = `🍀 ${tier?.label || 'Emerald Surge'}: 植生の自然回復が強化！`;
      break;
  }
  state.skillUsed = true;
  elements.specialSkillButton.disabled = true;
  log(msg);
  pushUnlock(msg);
}

function upgradeSkill() {
  const cost = GAME_CONFIG.technology.skillUpgradeCost * state.skillLevel;
  if (state.techPoints < cost) {
    log(`スキル強化には技術ポイントが${cost}必要です。`);
    return;
  }
  const tiers = SKILL_UPGRADES[state.countryKey] || [];
  if (state.skillLevel >= tiers.length) {
    log('これ以上スキルを強化できません。');
    return;
  }
  state.techPoints -= cost;
  state.skillLevel += 1;
  log(`スキルをレベル${state.skillLevel}に強化しました！`);
  pushUnlock(`${tiers[state.skillLevel-1].label} を獲得`);
  renderUI();
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
  if (state.techPoints > C.resilientSeeds && !state.unlocked.resilientSeeds) {
    state.unlocked.resilientSeeds = true;
    list.push("🌾 強靭な種子: 干ばつ時の減衰を10%軽減");
  }
  if (state.techPoints > C.climateControl && !state.unlocked.climateControl) {
    state.unlocked.climateControl = true;
    list.push("❄️ 気候制御: 熱波と干ばつリスクを抑制");
  }
  if (state.techPoints > C.aiAdvisor && !state.unlocked.aiAdvisor) {
    state.unlocked.aiAdvisor = true;
    list.push("🤖 AIアドバイザー: 収量+5%、環境減衰-2");
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
    state.challengeProgress = { done: 0, total: 0, checklist: [] };
    return;
  }
  if (state.challengeStatus === 'success' || state.challengeStatus === 'failed') return;
  const info = CHALLENGES[state.challenge];
  if (!info) return;
  const checklist = info.conditions.map(cond => {
    if (cond.type === 'env') return { label: `環境 ${cond.target}+`, done: state.envScore >= cond.target };
    if (cond.type === 'revenue') return { label: `総収入 ${cond.ratio}x`, done: state.totalFoodValue >= state.initialBudget * cond.ratio };
    if (cond.type === 'era') return { label: `時代 ${cond.targetEra}`, done: ERAS[state.eraIndex] === cond.targetEra || state.eraIndex >= ERAS.indexOf(cond.targetEra) };
    return { label: cond.type, done: false };
  });
  const done = checklist.filter(c => c.done).length;
  state.challengeProgress = { done, total: checklist.length, checklist };
  if (checklist.length > 0 && done === checklist.length) state.challengeStatus = 'success';
}

function finalizeChallengeOutcome() {
  if (!state.challenge || state.challenge === 'free') {
    state.challengeStatus = 'success';
    return;
  }
  if (state.challengeStatus === 'success') return;
  updateChallengeProgress();
  if (state.challengeProgress.total > 0 && state.challengeProgress.done === state.challengeProgress.total) {
    state.challengeStatus = 'success';
  } else {
    state.challengeStatus = 'failed';
  }
}

// ==================== ターン実行 ====================
function executeTurn() {
  const fert = Number(elements.fertilizerSlider.value) || 0;
  const irri = Number(elements.irrigationSlider.value) || 0;
  const tech = Number(elements.techSlider.value) || 0;
  const country = COUNTRIES[state.countryKey];
  const skillTier = (SKILL_UPGRADES[state.countryKey] || [])[state.skillLevel - 1] || {};
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
        const recoveryFactor = state.unlocked.emerald ? (skillTier.recovery || C.map.emeraldRecoveryFactor) : C.map.recoveryFactor;
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
  if (state.unlocked.agriBoost) techEff *= (skillTier.multiplier || C.production.agriBoostMultiplier);
  let regionFactor = 1.0;
  if (country.climate === 'arid') regionFactor = C.production.climateFactors.arid;
  if (country.climate === 'tropical') regionFactor = C.production.climateFactors.tropical;

  let production = Math.round((C.production.base + state.avgNdvi * C.production.ndviMultiplier) * state.avgNdvi * eraMultiplier * techEff * crop.yieldFactor * regionFactor);
  if (state.unlocked.dragonPlan) production = Math.round(production * (skillTier.multiplier || C.production.dragonPlanMultiplier));
  if (state.unlocked.orbitalNet) production = Math.round(production * C.production.orbitalNetMultiplier);
  if (state.unlocked.aiAdvisor) production = Math.round(production * 1.05);

  // ランダムイベント（環境・気象）
  let event = '';
  const E = C.events;
  const droughtRisk = (state.precipitation < E.drought.precipThreshold && state.temperature > E.drought.tempThreshold);
  const monsoonMitigation = state.unlocked.monsoon ? (skillTier.mitigation || E.monsoonMitigation) : 1.0;
  const droughtPenalty = state.unlocked.resilientSeeds ? (E.drought.penalty + (1 - E.drought.penalty) * 0.1) : E.drought.penalty;
  const climateRiskMod = state.unlocked.climateControl ? 0.75 : 1;

  if (droughtRisk && irri < state.budget * E.drought.irriBudgetRatio && Math.random() < E.drought.chance * monsoonMitigation * climateRiskMod) {
    production = Math.round(production * droughtPenalty); event = '🚨 干ばつにより生産量が大幅に減少。';
  } else if (state.temperature > E.heatwave.tempThreshold && Math.random() < E.heatwave.chance * monsoonMitigation * climateRiskMod) {
    production = Math.round(production * E.heatwave.penalty); event = '🦠 熱波による害虫発生で生産量が減少。';
  } else if (state.precipitation > E.rain.precipThreshold && Math.random() < E.rain.chance) {
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
  if (state.unlocked.ecoFertilizer) envChange = Math.round(envChange * C.environment.ecoFertilizerMultiplier);
  if (state.unlocked.amazonShield && envChange < 0) envChange = Math.round(envChange * (skillTier.envMultiplier || C.environment.amazonShieldMultiplier));
  if (state.unlocked.aiAdvisor) envChange += 2;
  state.envScore = Math.max(0, Math.min(100, state.envScore + envChange));

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
    elements.executeButton.disabled = false;
    nextTurn();
  }, 1100);
}
