const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers');

test('翻訳パラメータの通貨記号・特殊文字をそのまま保持する', () => {
  const { run } = loadGame();
  run("DICT.en.test = '{money}|{money}|{a.b}|{empty}';");
  const value = "$200.00B $$ $& $` $' $1 $15.00M";
  assert.equal(run(`t('test', {money: ${JSON.stringify(value)}, 'a.b': '特殊文字', empty: null})`), `${value}|${value}|特殊文字|`);
  run("DICT.en.scalar = '{0}';");
  assert.equal(run(`t('scalar', ${JSON.stringify(value)})`), value);
  assert.equal(run("t('scalar', 0)"), '0');
});

test('辞書がない場合は日本語、未知のキーはキー自体にフォールバックする', () => {
  const { run, warnings } = loadGame();
  run("DICT.ja.onlyJapanese = '日本語';");
  assert.equal(run("t('onlyJapanese')"), '日本語');
  assert.equal(run("t('unknown.key')"), 'unknown.key');
  assert.equal(warnings.length, 1);
});

test('日英のミッション年と国の特徴キーが揃っている', () => {
  const { run, warnings } = loadGame();
  for (const locale of ['ja', 'en']) {
    run(`currentLocale = '${locale}'`);
    for (let year = 1; year <= 5; year++) {
      assert.equal(run(`t('option.year-select.0${year}')`), String(2000 + year));
    }
    for (const country of ['usa', 'china', 'india', 'brazil', 'egypt', 'ireland']) {
      run(`setSelectedCountry('${country}'); renderCountryDetails();`);
      assert.ok(run('elements.countryDetails.textContent').length > 30);
    }
  }
  assert.deepEqual(warnings, []);
});
