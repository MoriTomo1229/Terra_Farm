// ==================== ゲームフロー & 初期化 ====================

function initStartScreen() {
  elements.startButton.addEventListener('click', onStart);
}

function getSelectedCountryKey() {
  for (const r of elements.countrySelectRadios) if (r.checked) return r.value;
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

async function startGame(countryKey, startingBudget, year) {
  elements.startButton.disabled = true;
  elements.startButton.textContent = '衛星データを読み込み中...';
  try {
    const scaledMapData = await loadOrGenerateMap(countryKey, year);

    // Reset state
    state = {
      ...state,
      countryKey, year,
      turn: 0,
      budget: startingBudget,
      initialBudget: startingBudget,
      totalFoodValue: 0,
      envScore: 70,
      techPoints: 0,
      eraIndex: 0,
      baseMapPotential: scaledMapData,
      currentMapNdvi: JSON.parse(JSON.stringify(scaledMapData)),
      avgNdvi: 0,
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
  elements.replayButton.addEventListener('click', () => location.reload());
  elements.downloadLog.addEventListener('click', downloadHistory);
}

document.addEventListener('DOMContentLoaded', () => {
  initStartScreen();
  attachListeners();
});
