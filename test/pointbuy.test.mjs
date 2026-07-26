import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSandbox } from './helpers.mjs';

const ZERO = { IMP: 8, REF: 8, RES: 8, COG: 8, INS: 8, INF: 8 };

test('costForScore matches the approved point-buy table', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.equal(RPGCalc.costForScore(8), 0);
  assert.equal(RPGCalc.costForScore(9), 1);
  assert.equal(RPGCalc.costForScore(10), 2);
  assert.equal(RPGCalc.costForScore(11), 3);
  assert.equal(RPGCalc.costForScore(12), 4);
  assert.equal(RPGCalc.costForScore(13), 5);
  assert.equal(RPGCalc.costForScore(14), 7);
  assert.equal(RPGCalc.costForScore(15), 9);
});

test('costForScore rejects out-of-range scores', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.throws(() => RPGCalc.costForScore(7), RangeError);
  assert.throws(() => RPGCalc.costForScore(16), RangeError);
});

test('totalPointCost sums cost across all six attributes', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.equal(RPGCalc.totalPointCost(ZERO), 0);

  const optimalSpread = { IMP: 15, REF: 14, RES: 13, COG: 12, INS: 10, INF: 8 };
  assert.equal(RPGCalc.totalPointCost(optimalSpread), 27);
});

test('abilityModifier follows the standard floor((score-10)/2) rule', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.equal(RPGCalc.abilityModifier(8), -1);
  assert.equal(RPGCalc.abilityModifier(10), 0);
  assert.equal(RPGCalc.abilityModifier(12), 1);
  assert.equal(RPGCalc.abilityModifier(15), 2);
});

test('calcHP adds hit die max to the Resistencia modifier', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.equal(RPGCalc.calcHP(10, 14), 12);
  assert.equal(RPGCalc.calcHP(8, 8), 7);
  assert.equal(RPGCalc.calcHP(6, 10), 6);
  assert.equal(RPGCalc.calcHP(12, 15), 14);
});

test('canIncrease blocks raising a score past 15 or past the 27-point budget', () => {
  const { RPGCalc } = loadSandbox().window;
  const nearMax = { ...ZERO, IMP: 15 };
  assert.equal(RPGCalc.canIncrease(nearMax, 'IMP'), false, 'already at MAX_SCORE');

  const spentAllPoints = { IMP: 15, REF: 14, RES: 13, COG: 12, INS: 10, INF: 8 };
  assert.equal(RPGCalc.canIncrease(spentAllPoints, 'INF'), false, 'no points left in the 27 budget');

  assert.equal(RPGCalc.canIncrease(ZERO, 'IMP'), true);
});

test('canIncrease allows a step that lands exactly on the 27-point budget', () => {
  const { RPGCalc } = loadSandbox().window;
  // 26 gastos: subir INF de 8 pra 9 custa 1 e fecha exatamente em 27
  const twoShort = { IMP: 15, REF: 14, RES: 13, COG: 12, INS: 9, INF: 8 };
  assert.equal(RPGCalc.totalPointCost(twoShort), 26);
  assert.equal(RPGCalc.canIncrease(twoShort, 'INF'), true);
});

test('canDecrease blocks lowering a score past 8', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.equal(RPGCalc.canDecrease(ZERO, 'IMP'), false);
  assert.equal(RPGCalc.canDecrease({ ...ZERO, IMP: 9 }, 'IMP'), true);
});

test('ATTRS and ATTR_LABELS cover the six sheet attributes in order', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.deepEqual(RPGCalc.ATTRS, ['IMP', 'REF', 'RES', 'COG', 'INS', 'INF']);
  assert.deepEqual(
    RPGCalc.ATTRS.map((a) => RPGCalc.ATTR_LABELS[a]),
    ['Impacto', 'Reflexo', 'Resistência', 'Cognição', 'Instinto', 'Influência']
  );
});
