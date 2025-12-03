// ==================== ゲームフロー & 初期化 ====================

function initStartScreen() {
  elements.startButton.addEventListener('click', onStart);
}

function getSelectedCountryKey() {
  for (const r of elements.countrySelectRadios) if (r.checked) return r.value;
  return 'usa';
}

function getSelectedChallengeKey() {
  return elements.challengeSelect?.value || 'free';
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
  const challengeKey = getSelectedChallengeKey();
  const parsedBudget = parseBudgetInput(elements.budgetInput.value);
  if (!parsedBudget || isNaN(parsedBudget) || parsedBudget <= 0) {
    elements.startError.textContent = '無効な予算です。例: 200B or 500M';
    return;
  }
  elements.startError.textContent = '';
  startGame(countryKey, parsedBudget, year, challengeKey);
}

async function startGame(countryKey, startingBudget, year, challengeKey) {
  elements.startButton.disabled = true;
  elements.startButton.textContent = '衛星データを読み込み中...';
  try {
    const scaledMapData = await loadOrGenerateMap(countryKey, year);

    // Reset state
    state = {
      ...state,
      countryKey, year,
      turn: 0,
      season: 1,
      seasonTurn: 0,
      budget: startingBudget,
      initialBudget: startingBudget,
      totalFoodValue: 0,
      envScore: 70,
      techPoints: 0,
      eraIndex: 0,
      challenge: challengeKey,
      challengeStatus: challengeKey === 'free' ? 'success' : 'pending',
      challengeProgress: { completed: 0, total: 1, details: [] },
      customPreset: null,
      chartData: [],
      baseMapPotential: scaledMapData,
      currentMapNdvi: JSON.parse(JSON.stringify(scaledMapData)),
      avgNdvi: 0,
      forecast: { next: null, riskNotes: [] },
      history: [],
      unlocked: {},
      unlockedTechNodes: {},
      skillUsed: false,
      skillTier: 1
    };

    const c = COUNTRIES[countryKey];
    populateCrops(c.preferred);

    elements.startScreen.style.display = 'none';
    elements.header.style.display = 'flex';
    elements.gameContainer.style.display = 'grid';
    const displayYear = parseInt(year,10) + 2000;
    elements.selectedCountry.innerHTML = `<span class="flag">${c.flag}</span> <strong>${c.name} (${displayYear}) — Skill: ${c.skill}</strong>`;
    elements.maxTurns.textContent = `${CAMPAIGN.seasonTurnLimit} x${CAMPAIGN.seasons}`;
    if (elements.maxSeasons) elements.maxSeasons.textContent = CAMPAIGN.seasons;
    const challengeInfo = CHALLENGES[challengeKey] || CHALLENGES.free;
    elements.challengeBadge.textContent = `チャレンジ: ${challengeInfo.name} — ${challengeInfo.goal}`;
    evaluateChallengeConditions();
    updateChallengeProgressUI();

    log(`ミッション開始: ${c.name} (${displayYear}年). 初期予算 ${formatUSD(state.budget)}. チャレンジ: ${challengeInfo.name}.`);
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
  state.seasonTurn++;
  if (state.seasonTurn > CAMPAIGN.seasonTurnLimit) {
    if (state.season < CAMPAIGN.seasons) {
      const bonus = Math.round(state.initialBudget * CAMPAIGN.carryBonusRatio);
      state.season += 1;
      state.seasonTurn = 1;
      state.budget += bonus;
      log(`📅 新シーズン(${state.season}/${CAMPAIGN.seasons})に突入。繰越ボーナス ${formatUSD(bonus)} を獲得。`);
    } else {
      endGame();
      return;
    }
  }
  showWorldNews();
  calculateCurrentAverages();
  generateForecast();
  renderUI();
  resetControls();
  log(`--- ターン ${state.seasonTurn} (シーズン${state.season}) ---`);
  elements.unReport.textContent = generateUNReport();
}

function endGame() {
  const C = GAME_CONFIG.scoring;
  elements.finalFood.textContent = formatUSD(state.totalFoodValue);
  elements.finalEnv.textContent = state.envScore;
  elements.finalTech.textContent = ERAS[state.eraIndex];
  finalizeChallengeOutcome();
  const challengeInfo = CHALLENGES[state.challenge] || CHALLENGES.free;
  if (state.challenge !== 'free') {
    const statusText = state.challengeStatus === 'success' ? '達成！' : '未達成';
    elements.finalChallenge.textContent = `チャレンジ「${challengeInfo.name}」: ${statusText} (${challengeInfo.goal})`;
  } else {
    elements.finalChallenge.textContent = '';
  }
  const finalScore = Math.round(state.budget / C.budgetDivisor + state.envScore * C.envScoreMultiplier + state.eraIndex * C.eraMultiplier);
  elements.finalScore.textContent = finalScore;
  elements.gameOverModal.classList.remove('modal-hidden');
  elements.gameOverModal.classList.add('modal-visible');
  log('ミッション完了。');
}

// ==================== イベント登録 ====================
function attachListeners() {
  ['fertilizerSlider', 'irrigationSlider', 'techSlider'].forEach(id => {
    elements[id].addEventListener('input', e => { updateRemainingBudget(); updateSliderVisual(e.target); });
  });
  elements.executeButton.addEventListener('click', executeTurn);
  elements.autoAllocateButton.addEventListener('click', autoNormalize);
  elements.specialSkillButton.addEventListener('click', activateSkill);
  if (elements.presetEnv) elements.presetEnv.addEventListener('click', () => applyPreset({fert:0.45, irri:0.35, tech:0.2}, '環境重視'));
  if (elements.presetRevenue) elements.presetRevenue.addEventListener('click', () => applyPreset({fert:0.55, irri:0.25, tech:0.2}, '収益重視'));
  if (elements.presetTech) elements.presetTech.addEventListener('click', () => applyPreset({fert:0.2, irri:0.25, tech:0.55}, '技術重視'));
  if (elements.presetCustomApply) elements.presetCustomApply.addEventListener('click', applyCustomPreset);
  if (elements.presetCustomSave) elements.presetCustomSave.addEventListener('click', saveCustomPreset);
  elements.replayButton.addEventListener('click', () => location.reload());
  elements.downloadLog.addEventListener('click', downloadHistory);
  elements.onboardingOpenButtons?.forEach(btn => btn.addEventListener('click', openOnboarding));
  if (elements.onboardingClose) elements.onboardingClose.addEventListener('click', closeOnboarding);
}

document.addEventListener('DOMContentLoaded', () => {
  initStartScreen();
  attachListeners();
});
