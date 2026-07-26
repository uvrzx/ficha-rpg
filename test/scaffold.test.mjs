import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHtml, loadSandbox } from './helpers.mjs';

test('index.html has the character panel before the calculator panel', () => {
  const html = readHtml();
  const charIdx = html.indexOf('id="character-panel"');
  const calcIdx = html.indexOf('id="calculator-panel"');
  assert.ok(charIdx > -1, 'expected #character-panel to exist');
  assert.ok(calcIdx > -1, 'expected #calculator-panel to exist');
  assert.ok(charIdx < calcIdx, 'character-panel must appear before calculator-panel in the DOM');
});

test('index.html wraps both panels in #calculator-section', () => {
  const html = readHtml();
  assert.ok(html.includes('id="calculator-section"'));
});

test('inline script exposes window.RPGCalc as an object', () => {
  const sandbox = loadSandbox();
  assert.equal(typeof sandbox.window.RPGCalc, 'object');
});
