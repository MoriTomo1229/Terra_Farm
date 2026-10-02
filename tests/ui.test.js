const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers');

test('開始画面で初期予算を補完し国変更でも補完、手動入力も解析できる', () => {
  const { run } = loadGame();
  run('initStartScreen()');
  assert.equal(run('elements.budgetInput.value'), '200M');
  run("setSelectedCountry('ireland'); updateSelectedCountry();");
  assert.equal(run('elements.budgetInput.value'), '15M');
  assert.equal(run("parseBudgetInput('25.5M')"), 25500000);
  assert.equal(run("parseBudgetInput('2B')"), 2e9);
  assert.equal(run("parseBudgetInput('bad')"), null);
  assert.equal(run("parseBudgetInput('999999999999999999999999999999B')"), null);
  run("elements.budgetInput.value = '25M'; elements.modeSelect.value = 'frontier'; handleGameModeChange();");
  assert.equal(run('elements.budgetInput.value'), '25M');
  run("competitionState.currentEvent = LOCAL_COMPETITION_EVENT; elements.modeSelect.value = 'competition'; applyCompetitionModeToInputs();");
  assert.equal(run('elements.budgetInput.disabled'), true);
  assert.equal(run('elements.budgetInput.value'), '200M');
  assert.ok(run('elements.countryDetails.textContent').includes('AgriBoost'));
  run("elements.modeSelect.value = 'solo'; handleGameModeChange();");
  assert.equal(run('elements.budgetInput.disabled'), false);
  assert.equal(run('elements.budgetInput.value'), '200M');
});

test('カスタム配分を保存・復元し、保存禁止でも操作を続けられる', () => {
  const game = loadGame();
  game.run('elements.fertilizerSlider.value = 20; elements.irrigationSlider.value = 30; elements.techSlider.value = 50; saveCustomPreset();');
  const restored = loadGame(game.storage);
  restored.run('state.customPreset = loadCustomPreset(); state.budget = 100; applyCustomPreset();');
  assert.equal(Number(restored.run('elements.techSlider.value')), 50);
  assert.equal(Number(restored.run('elements.fertilizerSlider.value')), 20);
  game.run("localStorage.setItem = () => { throw new Error('禁止'); }; saveCustomPreset();");
  assert.equal(game.run('state.customPreset.techRatio'), 0.5);
});

test('破損・負値・文字列・不正な合計の保存配分を拒否する', () => {
  for (const raw of ['broken', 'null', '{}', '{"fertRatio":-1,"irriRatio":1,"techRatio":1}', '{"fertRatio":"0.2","irriRatio":0.3,"techRatio":0.5}', '{"fertRatio":0.2,"irriRatio":0.2,"techRatio":0.2}']) {
    const { run } = loadGame(new Map([['terra_farm_custom_preset_v1', raw]]));
    assert.equal(run('loadCustomPreset()'), null);
  }
  const { run } = loadGame();
  run("localStorage.getItem = () => { throw new Error('禁止'); }");
  assert.equal(run('loadCustomPreset()'), null);
});

test('Canvasの色境界と透明セルを1枚のImageDataに描画する', () => {
  const { run, context } = loadGame();
  let output;
  context.canvasContext = {
    createImageData: (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
    putImageData: image => { output = image; }
  };
  run(`elements.map.getContext = () => canvasContext;
    state.currentMapNdvi = Array.from({length: MAP_SIZE}, () => Array(MAP_SIZE).fill(null));
    state.currentMapNdvi[0] = [null, 0.19, 0.2, 0.35, 0.5, 0.65, 0.8, ...Array(93).fill(null)];
    renderMap();`);
  assert.deepEqual(Array.from(output.data.slice(0, 28)), [
    0,0,0,0, 217,83,79,255, 240,173,78,255, 255,215,0,255,
    139,195,74,255, 92,184,92,255, 27,94,32,255
  ]);
  assert.equal(output.data.length, 40000);
  assert.equal(run('elements.map.children.length'), 0);
});
