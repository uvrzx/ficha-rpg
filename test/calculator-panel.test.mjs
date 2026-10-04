import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHtml, loadSandbox } from './helpers.mjs';

test('attribute panel has a character name input and the attribute rows slot', () => {
  const html = readHtml();
  assert.match(html, /id="char-name-input"/);
  assert.match(html, /id="attr-rows"/);
});

test('painel tem nota de pontos e botao de travar', () => {
  const html = readHtml();
  assert.doesNotMatch(html, /id="points-remaining"/);
  assert.match(html, /id="points-locked-note"/, 'nota com os pontos livres');
  assert.match(html, /id="lock-btn"/, 'botao de travar a distribuicao');
});

test('a logica de point-buy continua disponivel pro level-up', () => {
  const { RPGCalc } = loadSandbox().window;
  for (const fn of ['costForScore', 'totalPointCost', 'canIncrease', 'canDecrease']) {
    assert.equal(typeof RPGCalc[fn], 'function', `RPGCalc.${fn} precisa sobreviver ao travamento`);
  }
  assert.equal(RPGCalc.TOTAL_POINTS, 27);
});
