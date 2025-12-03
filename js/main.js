// ==================== ゲームフロー & 初期化 ====================

function initStartScreen() {
  elements.startButton.addEventListener('click', onStart);
  if (elements.openTutorial) elements.openTutorial.addEventListener('click', openTutorial);
  setupTutorial();
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
  if (elements.tutorialModal) elements.tutorialModal.classList.add('modal-hidden');
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
      turnInSeason: 0,
      season: 1,
      maxSeasons: GAME_CONFIG.campaign?.seasons || 1,
      turnsPerSeason: GAME_CONFIG.campaign?.turnsPerSeason || TURN_COUNT,
      budget: startingBudget,
      initialBudget: startingBudget,
      totalFoodValue: 0,
      envScore: 70,
      techPoints: 0,
      eraIndex: 0,
      challenge: challengeKey,
      challengeStatus: challengeKey === 'free' ? 'success' : 'pending',
      challengeProgress: null,
      customPreset: null,
      chartData: [],
      baseMapPotential: scaledMapData,
      currentMapNdvi: JSON.parse(JSON.stringify(scaledMapData)),
      avgNdvi: 0,
      forecast: null,
      history: [],
      unlocked: {},
      skillUsed: false,
      skillTiers: {},
      tutorialCompleted: true
    };

    const c = COUNTRIES[countryKey];
    populateCrops(c.preferred);

    elements.startScreen.style.display = 'none';
    elements.header.style.display = 'flex';
    elements.gameContainer.style.display = 'grid';
    const displayYear = parseInt(year,10) + 2000;
    elements.selectedCountry.innerHTML = `<span class="flag">${c.flag}</span> <strong>${c.name} (${displayYear}) — Skill: ${c.skill}</strong>`;
    elements.maxTurns.textContent = state.turnsPerSeason;
    if (elements.seasonMax) elements.seasonMax.textContent = state.maxSeasons;
    if (elements.seasonTurns) elements.seasonTurns.textContent = state.turnsPerSeason;
    const challengeInfo = CHALLENGES[challengeKey] || CHALLENGES.free;
    elements.challengeBadge.textContent = `チャレンジ: ${challengeInfo.name} — ${challengeInfo.goal}`;
    updateChallengeProgress();
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
  state.turnInSeason++;
  if (state.turnInSeason > state.turnsPerSeason) {
    handleSeasonEnd();
    return;
  }
  showWorldNews();
  calculateCurrentAverages();
  renderUI();
  resetControls();
  log(`--- ターン ${state.turn} ---`);
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

function handleSeasonEnd() {
  if (state.season >= state.maxSeasons) {
    endGame();
    return;
  }
  const bonus = GAME_CONFIG.campaign?.seasonBonus || 0;
  const bonusBudget = Math.round(state.budget * bonus);
  state.budget += bonusBudget;
  const summary = `シーズン${state.season}終了: 収入 ${formatUSD(state.totalFoodValue)} / 環境 ${state.envScore} / 技術Pt ${state.techPoints.toLocaleString()}。ボーナス ${formatUSD(bonusBudget)} を付与。`;
  elements.seasonSummary.textContent = summary;
  elements.seasonModal.classList.remove('modal-hidden');
  elements.seasonModal.classList.add('modal-visible');
  log(summary);
  state.season += 1;
  state.turn = (state.season - 1) * state.turnsPerSeason;
  state.turnInSeason = 0;
  elements.maxTurns.textContent = state.turnsPerSeason;
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
  if (elements.continueSeason) elements.continueSeason.addEventListener('click', () => {
    elements.seasonModal.classList.add('modal-hidden');
    elements.seasonModal.classList.remove('modal-visible');
    nextTurn();
  });
}

// ==================== チュートリアル ====================
let tutorialIndex = 0;
const tutorialSteps = [
  'ようこそ！ 国とミッション年、チャレンジを選んでプレイします。まずは予算を入力しましょう（例: 200B）。',
  'スライダーで肥料・灌漑・技術へ予算を割り振ります。右下の残り予算がマイナスにならないように調整。',
  '国家スキルボタンで国固有の強力な効果を1回発動できます。タイミングを見計らって使いましょう。',
  'チャレンジを選ぶと進行度バーで達成状況を確認できます。条件を満たすとバッジが達成状態になります。',
  '天候ダッシュボードで現在の湿度・降水・気温と次ターン予報を確認し、投資戦略を調整しましょう。'
];

function setupTutorial() {
  if (!elements.tutorialModal) return;
  const updateStep = () => {
    if (!elements.tutorialStep) return;
    elements.tutorialStep.textContent = tutorialSteps[tutorialIndex];
  };
  const closeTutorial = () => {
    elements.tutorialModal.classList.add('modal-hidden');
    elements.tutorialModal.classList.remove('modal-visible');
    state.tutorialCompleted = true;
  };
  elements.tutorialNext?.addEventListener('click', () => {
    tutorialIndex = Math.min(tutorialSteps.length - 1, tutorialIndex + 1);
    updateStep();
  });
  elements.tutorialPrev?.addEventListener('click', () => {
    tutorialIndex = Math.max(0, tutorialIndex - 1);
    updateStep();
  });
  elements.tutorialSkip?.addEventListener('click', closeTutorial);
  elements.openTutorial?.addEventListener('click', openTutorial);
  updateStep();
  openTutorial();
}

function openTutorial() {
  if (!elements.tutorialModal) return;
  tutorialIndex = 0;
  elements.tutorialModal.classList.remove('modal-hidden');
  elements.tutorialModal.classList.add('modal-visible');
  if (elements.tutorialStep) elements.tutorialStep.textContent = tutorialSteps[tutorialIndex];
}

document.addEventListener('DOMContentLoaded', () => {
  initStartScreen();
  attachListeners();
});
