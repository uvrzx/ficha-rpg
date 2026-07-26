import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHtml, loadSandbox } from './helpers.mjs';

test('attribute panel has a character name input and the attribute rows slot', () => {
  const html = readHtml();
  assert.match(html, /id="char-name-input"/);
  assert.match(html, /id="attr-rows"/);
});

test('nivel 1 nao expoe steppers nem contador de pontos — a ficha esta travada', () => {
  const html = readHtml();
  assert.doesNotMatch(html, /id="points-remaining"/, 'contador de pontos deve sumir enquanto travado');
  assert.doesNotMatch(html, /attr-stepper-btn/, 'steppers so voltam no level-up');
  assert.match(html, /id="points-locked-note"/, 'o painel avisa que a distribuicao esta travada');
});

test('a logica de point-buy continua disponivel pro level-up', () => {
  const { RPGCalc } = loadSandbox().window;
  for (const fn of ['costForScore', 'totalPointCost', 'canIncrease', 'canDecrease']) {
    assert.equal(typeof RPGCalc[fn], 'function', `RPGCalc.${fn} precisa sobreviver ao travamento`);
  }
  assert.equal(RPGCalc.TOTAL_POINTS, 27);
});
