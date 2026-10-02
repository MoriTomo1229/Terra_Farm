const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers');

async function prepare(country = 'usa', seed = 'balance') {
  const game = loadGame();
  await game.run(`(async () => {
    state.countryKey = '${country}';
    state.mode = 'solo';
    state.initialBudget = COUNTRIES[state.countryKey].startingBudget;
    state.budget = state.initialBudget;
    state.randomizer = createSeededRandom('${seed}');
    state.baseMapPotential = await loadOrGenerateMap(state.countryKey, '05', {allowFallback: false});
    state.currentMapNdvi = JSON.parse(JSON.stringify(state.baseMapPotential));
    state.initialAvgNdvi = calculateMapAverage(state.currentMapNdvi);
    elements.cropSelect.value = COUNTRIES[state.countryKey].preferred;
    renderHistory = renderTrendChart = updateChallengeProgressUI = updateRemainingBudget = () => {};
  })()`);
  return game;
}

function playTurn(game, ratios = [0, 0, 0]) {
  game.run(`state.turn++; state.isTurnProcessing = false; generateTurnConditions();
    elements.fertilizerSlider.value = Math.floor(state.budget * ${ratios[0]});
    elements.irrigationSlider.value = Math.floor(state.budget * ${ratios[1]});
    elements.techSlider.value = Math.floor(state.budget * ${ratios[2]});
    executeTurn();`);
}

test('予算は投資を引いて生産量×価格の収益を加える', async () => {
  const game = await prepare();
  game.run('state.randomizer = () => 0.5;');
  const budget = game.run('state.budget');
  playTurn(game, [0.2, 0.3, 0.5]);
  const revenue = game.run('state.history[0].revenue');
  const expected = game.run(`Math.round(
    (GAME_CONFIG.production.base + state.avgNdvi * GAME_CONFIG.production.ndviMultiplier) * state.avgNdvi *
    (1 + 0.5 * GAME_CONFIG.production.techInvestmentFactor) * CROPS.corn.yieldFactor
  ) * CROPS.corn.basePrice`);
  assert.equal(revenue, expected);
  assert.equal(game.run('state.budget'), revenue);
  assert.equal(game.run('state.totalFoodValue'), revenue);
  assert.ok(revenue > budget * 0.1, '全額配分後も元予算の10%以上の収入を確保する');
  assert.ok(game.run('state.techPoints') >= 2500, 'リバランス後も技術解放に到達できる');
});

test('成長ドライブが全6か国で達成可能で、技術投資が放置より高得点になる', async () => {
  for (const country of ['usa', 'china', 'india', 'brazil', 'egypt', 'ireland']) {
    const invested = await prepare(country);
    const idle = await prepare(country);
    invested.run("state.challenge = 'growth_drive'");
    for (let turn = 0; turn < 10; turn++) {
      playTurn(invested, [0.2, 0.25, 0.55]);
      playTurn(idle);
    }
    invested.run('finalizeChallengeOutcome()');
    assert.equal(invested.run('state.challengeStatus'), 'success', country);
    assert.ok(invested.run('calculateFinalScore()') > idle.run('calculateFinalScore()'), country);
    assert.ok(invested.run('state.budget') > 0, country);
  }
});

test('固定シードで10ターンの結果が再現する', async () => {
  const first = await prepare('usa', 'tournament');
  const second = await prepare('usa', 'tournament');
  for (let turn = 0; turn < 10; turn++) {
    playTurn(first, [0.2, 0.25, 0.55]);
    playTurn(second, [0.2, 0.25, 0.55]);
  }
  assert.equal(first.run('JSON.stringify(state.history)'), second.run('JSON.stringify(state.history)'));
});

test('全額プリセット・自動配分で旧スケールの即時資金崩壊が起きない', async () => {
  for (const ratios of [[0.45, 0.35, 0.2], [0.55, 0.25, 0.2], [0.2, 0.25, 0.55], [1/3, 1/3, 1/3]]) {
    const game = await prepare();
    const initial = game.run('state.budget');
    playTurn(game, ratios);
    assert.ok(game.run('state.budget') >= initial * 0.1);
    assert.ok(game.run('state.history[0].revenue') > 0);
  }
});

test('スコアは初期予算に対する比率を使い経済点を上限付きで評価する', () => {
  const { run } = loadGame();
  const score = scale => run(`calculateFinalScore({initialBudget: 200e6 * ${scale}, budget: 100e6 * ${scale}, totalFoodValue: 400e6 * ${scale}, envScore: 80, eraIndex: 2})`);
  assert.equal(score(1), 12500);
  assert.equal(score(1), score(1000));
  assert.equal(run('calculateFinalScore({initialBudget: 1, budget: 1e12, totalFoodValue: 1e12, envScore: 80, eraIndex: 2})'), 16000);
});

test('チャレンジは境界値で成功し、未達は進行中→失敗となる', () => {
  const { run } = loadGame();
  for (const [challenge, passing, failing] of [
    ['env_guard', 'state.envScore = 80', 'state.envScore = 79'],
    ['growth_drive', 'state.initialBudget = 100; state.totalFoodValue = 180', 'state.totalFoodValue = 179'],
    ['regen_loop', 'state.envScore = 78; state.initialAvgNdvi = 0.5; state.avgNdvi = 0.53; state.resilienceScore = 70', 'state.resilienceScore = 69']
  ]) {
    run(`state.challenge = '${challenge}'; ${passing}; updateChallengeProgress()`);
    assert.equal(run('state.challengeStatus'), 'success', challenge);
    run('finalizeChallengeOutcome()');
    assert.equal(run('state.challengeStatus'), 'success', challenge);
    run(`${failing}; updateChallengeProgress()`);
    assert.equal(run('state.challengeStatus'), 'pending', challenge);
    run('finalizeChallengeOutcome()');
    assert.equal(run('state.challengeStatus'), 'failed', challenge);
  }
  run("state.challenge = 'free'; finalizeChallengeOutcome()");
  assert.equal(run('state.challengeStatus'), 'success');
});

test('二重実行と予算超過を拒否する', async () => {
  const game = await prepare();
  playTurn(game);
  game.run('executeTurn()');
  assert.equal(game.run('state.history.length'), 1);
  game.run('state.isTurnProcessing = false; elements.fertilizerSlider.value = state.budget + 1; executeTurn()');
  assert.equal(game.run('state.history.length'), 1);
});

test('新ゲーム開始時も保存済みカスタム配分を保持する', async () => {
  const game = loadGame();
  game.run(`state.customPreset = {fertRatio: 0.2, irriRatio: 0.3, techRatio: 0.5};
    nextTurn = () => {}; elements.challengeSelect.value = 'free';`);
  await game.run("startGame('usa', 200e6, '05', 'free', {playerId: 'test-player'})");
  assert.equal(game.run('state.customPreset.techRatio'), 0.5);
  assert.equal(game.run('state.budget'), 200e6);
  assert.equal(game.run('elements.startError.textContent'), '');
});
