const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

function createElement() {
  return {
    value: '0', max: 0, textContent: '', innerHTML: '', children: [],
    style: { setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild(child) { this.children.push(child); },
    setAttribute() {}, addEventListener() {}, remove() {}, closest() { return null; }
  };
}

function loadGame(storage = new Map()) {
  const nodes = new Map();
  const warnings = [];
  const radios = ['usa', 'china', 'india', 'brazil', 'egypt', 'ireland'].map(value =>
    ({ ...createElement(), value, checked: value === 'usa' }));
  const context = vm.createContext({
    console: { ...console, warn: message => warnings.push(message) },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    document: {
      querySelector(selector) {
        if (!nodes.has(selector)) nodes.set(selector, createElement());
        return nodes.get(selector);
      },
      getElementsByName: () => radios,
      createElement, createElementNS: createElement,
      addEventListener() {}, querySelectorAll: () => [],
      documentElement: {}, body: createElement()
    },
    setTimeout() {}, confirm: () => false,
    crypto: { randomUUID: () => 'test-player' },
    fetch: async path => ({ ok: true, json: async () =>
      JSON.parse(readFileSync(resolve(__dirname, '..', path), 'utf8')) })
  });
  for (const file of ['i18n', 'config', 'state', 'ui', 'competition', 'map', 'game-logic', 'main']) {
    vm.runInContext(readFileSync(resolve(__dirname, '..', 'js', `${file}.js`), 'utf8'), context, { filename: `${file}.js` });
  }
  return { context, storage, warnings, radios, nodes,
    run: code => vm.runInContext(code, context) };
}

module.exports = { loadGame };
