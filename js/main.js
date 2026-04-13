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
  const mode = getSelectedMode();
  const playerProfile = persistPlayerProfile(elements.playerNameInput?.value || '');
  const playerName = normalizePlayerName(elements.playerNameInput?.value || '');

  if (mode === 'competition') {
    const event = competitionState.currentEvent;
    if (!event) {
      elements.startError.textContent = '競争モードの大会情報をまだ取得できていません。少し待ってから再試行してください。';
      return;
    }
    if (!playerName) {
      elements.startError.textContent = '競争モードではプレイヤー名の入力が必要です。';
      return;
    }
    elements.startError.textContent = '';
    startGame(event.countryKey, event.startingBudget, event.missionYear, event.challengeKey, {
      mode,
      playerId: playerProfile.id,
      playerName,
      competitionEvent: event
    });
    return;
  }

  const countryKey = getSelectedCountryKey();
  const year = elements.yearSelect.value;
  const challengeKey = getSelectedChallengeKey();
  const parsedBudget = parseBudgetInput(elements.budgetInput.value);
  if (!parsedBudget || isNaN(parsedBudget) || parsedBudget <= 0) {
    elements.startError.textContent = '無効な予算です。例: 200B or 500M';
    return;
  }
  elements.startError.textContent = '';
  startGame(countryKey, parsedBudget, year, challengeKey, {
    mode,
    playerId: playerProfile.id,
    playerName
  });
}

async function startGame(countryKey, startingBudget, year, challengeKey, options = {}) {
  const {
    mode = 'solo',
    playerId = ensurePlayerProfile().id,
    playerName = '',
    competitionEvent = null
  } = options;
  elements.startButton.disabled = true;
  elements.startButton.textContent = '衛星データを読み込み中...';
  try {
    const scaledMapData = await loadOrGenerateMap(countryKey, year, {
      allowFallback: mode !== 'competition'
    });

    // Reset state
    state = {
      ...state,
      mode,
      playerId,
      playerName,
      countryKey, year,
      turn: 0,
      turnLimit: competitionEvent?.turnCount || TURN_COUNT,
      isTurnProcessing: false,
      budget: startingBudget,
      initialBudget: startingBudget,
      finalScore: 0,
      totalFoodValue: 0,
      envScore: 70,
      techPoints: 0,
      eraIndex: 0,
      challenge: challengeKey,
      challengeStatus: challengeKey === 'free' ? 'success' : 'pending',
      customPreset: null,
      chartData: [],
      baseMapPotential: scaledMapData,
      currentMapNdvi: JSON.parse(JSON.stringify(scaledMapData)),
      avgNdvi: 0,
      competitionEventId: competitionEvent?.id || null,
      competitionEventName: competitionEvent?.name || '',
      competitionSeed: competitionEvent?.seed || null,
      simulationVersion: competitionEvent?.rulesetVersion || null,
      randomizer: mode === 'competition'
        ? createSeededRandom(`${competitionEvent.id}:${competitionEvent.seed}:${competitionEvent.rulesetVersion}`)
        : null,
      history: [],
      unlocked: {},
      skillUsed: false
    };

    const c = COUNTRIES[countryKey];
    populateCrops(c.preferred);

    elements.startScreen.style.display = 'none';
    elements.header.style.display = 'flex';
    elements.gameContainer.style.display = 'grid';
    const displayYear = parseInt(year,10) + 2000;
    elements.selectedCountry.innerHTML = `<span class="flag">${c.flag}</span> <strong>${c.name} (${displayYear}) — Skill: ${c.skill}</strong>`;
    elements.maxTurns.textContent = state.turnLimit;
    const challengeInfo = CHALLENGES[challengeKey] || CHALLENGES.free;
    elements.challengeBadge.textContent = `チャレンジ: ${challengeInfo.name} — ${challengeInfo.goal}`;
    renderSessionSummary();
    renderCompetitionFinalStatus('', '');
    updateChallengeProgressUI();

    log(`ミッション開始: ${c.name} (${displayYear}年). 初期予算 ${formatUSD(state.budget)}. チャレンジ: ${challengeInfo.name}. モード: ${mode === 'competition' ? '競争' : '通常'}. ${state.playerName ? `プレイヤー: ${state.playerName}.` : ''}`);
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
  if (state.turn > (state.turnLimit || TURN_COUNT)) {
    endGame();
    return false;
  }
  showWorldNews();
  generateTurnConditions();
  calculateCurrentAverages();
  renderUI();
  resetControls();
  log(`--- ターン ${state.turn} ---`);
  elements.unReport.textContent = generateUNReport();
  return true;
}

function endGame() {
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
  state.finalScore = calculateFinalScore();
  elements.finalScore.textContent = state.finalScore;
  elements.gameOverModal.classList.remove('modal-hidden');
  elements.gameOverModal.classList.add('modal-visible');
  log('ミッション完了。');
  if (state.mode === 'competition') {
    void submitCompetitionResult();
  } else {
    renderCompetitionFinalStatus('', '');
  }
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
  if (elements.modeSelect) elements.modeSelect.addEventListener('change', handleGameModeChange);
  if (elements.themeSelect) elements.themeSelect.addEventListener('change', event => applyTheme(event.target.value));
  if (elements.themeSelectHeader) elements.themeSelectHeader.addEventListener('change', event => applyTheme(event.target.value));
  if (elements.playerNameInput) elements.playerNameInput.addEventListener('blur', () => persistPlayerProfile(elements.playerNameInput.value));
  if (elements.refreshLeaderboardButton) elements.refreshLeaderboardButton.addEventListener('click', () => { void refreshCompetitionLeaderboard(); });
  if (elements.retrySubmitScore) elements.retrySubmitScore.addEventListener('click', () => { void submitCompetitionResult(); });
  elements.replayButton.addEventListener('click', () => location.reload());
  elements.downloadLog.addEventListener('click', downloadHistory);
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getStoredTheme(), { persist: false });
  initStartScreen();
  attachListeners();
  bootstrapCompetition();
});
