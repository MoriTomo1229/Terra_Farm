const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers');

test('シード付き乱数は同じシードで再現し、異なるシードでは変わる', () => {
  const { run } = loadGame();
  const sequence = seed => run(`Array.from({length: 100}, createSeededRandom('${seed}')).join(',')`);
  assert.equal(sequence('大会A'), sequence('大会A'));
  assert.notEqual(sequence('大会A'), sequence('大会B'));
  assert.ok(run("Array.from({length: 1000}, createSeededRandom('range')).every(v => v >= 0 && v < 1)"));
  assert.equal(run("xmur3('seed')()"), run("xmur3('seed')()"));
  assert.equal(run('mulberry32(123)()'), run('mulberry32(123)()'));
});

test('リーダーボードの技術時代は日英の時代名で描画する', () => {
  const { run } = loadGame();
  for (const locale of ['ja', 'en']) {
    run(`currentLocale = '${locale}'; competitionState.leaderboard = [{eraIndex: 2, missionYear: '05', envScore: 80, finalScore: 100, displayName: '農家'}]; renderCompetitionLeaderboard();`);
    const meta = run('elements.leaderboardList.children.at(-1).children[1].children[1].textContent');
    assert.ok(meta.includes(run("t('era.2')")));
    assert.ok(!meta.includes('Tech 2'));
  }
});

test('旧大会スコアは保存を維持しつつ新大会ランキングから除外する', () => {
  const { run, storage } = loadGame();
  run(`saveLocalLeaderboard([
    {eventId: 'local-spring-opening-2026', finalScore: 999999},
    {eventId: LOCAL_COMPETITION_EVENT.id, simulationVersion: 'old', finalScore: 888888},
    {eventId: LOCAL_COMPETITION_EVENT.id, simulationVersion: COMPETITION_SIMULATION_VERSION, finalScore: 100}
  ]);`);
  assert.equal(run('getCompetitionSnapshot().leaderboard.length'), 1);
  assert.equal(run('getCompetitionSnapshot().leaderboard[0].finalScore'), 100);
  assert.equal(JSON.parse(storage.get('terra_farm_local_leaderboard_v1')).length, 3);
});
