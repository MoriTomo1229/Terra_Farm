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
      elements.startError.textContent = t('main.competitionNotReady');
      return;
    }
    if (!playerName) {
      elements.startError.textContent = t('main.competitionNameRequired');
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
  const challengeKey = mode === 'frontier' ? 'regen_loop' : getSelectedChallengeKey();
  const parsedBudget = parseBudgetInput(elements.budgetInput.value);
  if (!parsedBudget || isNaN(parsedBudget) || parsedBudget <= 0) {
    elements.startError.textContent = t('main.invalidBudget');
    return;
  }
  elements.startError.textContent = '';
  const frontierOptions = mode === 'frontier'
    ? {
        turnLimit: GAME_CONFIG.frontier.turnLimit,
        initialEnvScore: GAME_CONFIG.frontier.initialEnvScore
      }
    : {};
  startGame(countryKey, parsedBudget, year, challengeKey, {
    mode,
    playerId: playerProfile.id,
    playerName,
    ...frontierOptions
  });
}

async function startGame(countryKey, startingBudget, year, challengeKey, options = {}) {
  const {
    mode = 'solo',
    playerId = ensurePlayerProfile().id,
    playerName = '',
    competitionEvent = null,
    turnLimit = null,
    initialEnvScore = 70
  } = options;
  elements.startButton.disabled = true;
  elements.startButton.textContent = t('start.loadingButton');
  try {
    const scaledMapData = await loadOrGenerateMap(countryKey, year, {
      allowFallback: mode !== 'competition'
    });
    const initialAvgNdvi = typeof calculateMapAverage === 'function'
      ? calculateMapAverage(scaledMapData)
      : 0;

    // Reset state
    state = {
      ...state,
      mode,
      playerId,
      playerName,
      countryKey, year,
      turn: 0,
      turnLimit: competitionEvent?.turnCount || turnLimit || TURN_COUNT,
      isTurnProcessing: false,
      budget: startingBudget,
      initialBudget: startingBudget,
      finalScore: 0,
      totalFoodValue: 0,
      envScore: initialEnvScore,
      techPoints: 0,
      eraIndex: 0,
      challenge: challengeKey,
      challengeStatus: challengeKey === 'free' ? 'success' : 'pending',
      customPreset: null,
      chartData: [],
      initialAvgNdvi,
      resilienceScore: 50,
      climateRisk: 0,
      climatePulse: null,
      soilMoisture: 0,
      precipitation: 0,
      temperature: 0,
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
    if (elements.missionPulse) elements.missionPulse.style.display = 'grid';
    elements.gameContainer.style.display = 'grid';
    document.body.setAttribute('data-play-mode', mode);
    const displayYear = parseInt(year,10) + 2000;
    elements.selectedCountry.innerHTML = `<span class="flag">${c.flag}</span> <strong>${c.name} (${displayYear}) — Skill: ${c.skill}</strong>`;
    elements.maxTurns.textContent = state.turnLimit;
    const challengeInfo = CHALLENGES[challengeKey] || CHALLENGES.free;
    elements.challengeBadge.textContent = t('challenge.badge', { name: t('challenge.' + challengeInfo.key + '.name'), goal: resolveChallengeGoal(challengeKey) });
    renderSessionSummary();
    renderCompetitionFinalStatus('', '');
    updateChallengeProgressUI();

    const modeInfo = PLAY_MODES[mode] || PLAY_MODES.solo;
    const playerPart = state.playerName ? t('session.player', { name: state.playerName }) + ' ' : '';
    log(t('main.missionStart', { country: c.name, year: displayYear, budget: formatUSD(state.budget), challenge: t('challenge.' + challengeInfo.key + '.name'), mode: t('mode.' + mode + '.logName'), player: playerPart }));
    nextTurn();

  } catch (error) {
    console.error("ゲームの開始に失敗:", error);
    elements.startError.textContent = t('main.loadError', { message: error.message });
  } finally {
    elements.startButton.disabled = false;
    elements.startButton.textContent = t('start.startButton');
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
  if (typeof updateClimatePulse === 'function') updateClimatePulse();
  renderUI();
  resetControls();
  log(t('turn.logSeparator', { turn: state.turn }));
  elements.unReport.textContent = generateUNReport();
  return true;
}

function endGame() {
  if (typeof updateClimatePulse === 'function') updateClimatePulse();
  elements.finalFood.textContent = formatUSD(state.totalFoodValue);
  elements.finalEnv.textContent = state.envScore;
  elements.finalTech.textContent = t('era.' + state.eraIndex);
  finalizeChallengeOutcome();
  const challengeInfo = CHALLENGES[state.challenge] || CHALLENGES.free;
  if (state.challenge !== 'free') {
    const statusText = state.challengeStatus === 'success' ? t('challenge.statusAchieved') : t('challenge.statusNotAchieved');
    elements.finalChallenge.textContent = t('challenge.finalResult', { name: t('challenge.' + state.challenge + '.name'), status: statusText, goal: resolveChallengeGoal(state.challenge) });
  } else {
    elements.finalChallenge.textContent = '';
  }
  state.finalScore = calculateFinalScore();
  elements.finalScore.textContent = state.finalScore;
  elements.gameOverModal.classList.remove('modal-hidden');
  elements.gameOverModal.classList.add('modal-visible');
  log(t('main.missionComplete'));
  if (state.mode === 'competition') {
    // スコア送信前に確認。キャンセルした場合は「スコアを再送信」ボタンから後で送信可
    if (confirm(t('comp.confirmSubmit', {score: state.finalScore}))) {
      void submitCompetitionResult();
    } else {
      renderCompetitionFinalStatus(t('comp.submitSkipped'), '');
    }
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
  if (elements.cropSelect) elements.cropSelect.addEventListener('change', () => {
    if (state.countryKey) renderUI();
    else renderImpactPreview();
  });
  if (elements.presetEnv) elements.presetEnv.addEventListener('click', () => applyPreset({fert:0.45, irri:0.35, tech:0.2}, t('control.presetEnv')));
  if (elements.presetRevenue) elements.presetRevenue.addEventListener('click', () => applyPreset({fert:0.55, irri:0.25, tech:0.2}, t('control.presetRevenue')));
  if (elements.presetTech) elements.presetTech.addEventListener('click', () => applyPreset({fert:0.2, irri:0.25, tech:0.55}, t('control.presetTech')));
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

  // Language selector
  if (elements.langSelect) elements.langSelect.addEventListener('change', function (event) { setLocale(event.target.value); });
}

/** Sync language selector to the given locale */
function syncLangControls(locale) {
  if (elements.langSelect) elements.langSelect.value = locale;
}

document.addEventListener('DOMContentLoaded', function () {
  initLocale();
  applyTheme(getStoredTheme(), { persist: false });
  initStartScreen();
  attachListeners();
  bootstrapCompetition();
});
