import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSandbox } from './helpers.mjs';

const EXPECTED_IDS = ['guerreiro', 'barbaro', 'ladino', 'druida'];
const VALID_HIT_DICE = [6, 8, 10, 12];

test('CLASSES has exactly the four documented class ids', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.deepEqual(Object.keys(RPGCalc.CLASSES).sort(), [...EXPECTED_IDS].sort());
});

test('every class has the required shape and non-empty fields', () => {
  const { RPGCalc } = loadSandbox().window;
  for (const id of EXPECTED_IDS) {
    const cls = RPGCalc.CLASSES[id];
    assert.ok(cls, `missing class: ${id}`);
    assert.equal(cls.id, id);
    assert.ok(cls.nome.length > 0, `${id} needs a nome`);
    assert.ok(cls.arquetipo.length > 0, `${id} needs an arquetipo`);
    assert.ok(cls.personagem.length > 0, `${id} needs a personagem`);

    assert.ok(Array.isArray(cls.primarios) && cls.primarios.length >= 1 && cls.primarios.length <= 2,
      `${id} primarios must have 1 or 2 entries`);
    for (const attr of cls.primarios) {
      assert.ok(RPGCalc.ATTRS.includes(attr), `${id} primarios has invalid attr: ${attr}`);
    }
    assert.ok(RPGCalc.ATTRS.includes(cls.secundario), `${id} secundario invalid: ${cls.secundario}`);

    assert.equal(cls.saves.length, 2, `${id} must have exactly 2 saves`);
    for (const attr of cls.saves) {
      assert.ok(RPGCalc.ATTRS.includes(attr), `${id} saves has invalid attr: ${attr}`);
    }

    assert.ok(VALID_HIT_DICE.includes(cls.dadoVida), `${id} dadoVida must be one of ${VALID_HIT_DICE}`);

    assert.ok(Array.isArray(cls.pericias), `${id} pericias must be an array (pode estar vazio)`);
    assert.equal(typeof cls.periciaLivre, "string", `${id} periciaLivre must be a string`);
    assert.equal(typeof cls.proficiencias.categoria, "string");
    assert.equal(typeof cls.proficiencias.loadout, "string");

    for (const field of ['armaLabel', 'arma', 'habilidadeUnica', 'gadget']) {
      assert.equal(typeof cls.equipamento[field], 'string', `${id} equipamento.${field} must be a string`);
    }

    for (const field of ['idade', 'altura', 'peso']) {
      assert.ok(typeof cls.perfil[field] === 'string' && cls.perfil[field].length > 0,
        `${id} perfil.${field} must be a non-empty string`);
    }
    for (const field of ['perfilFisico', 'comoChegou', 'historico']) {
      assert.ok(typeof cls[field] === 'string' && cls[field].length > 0,
        `${id} ${field} must be a non-empty string`);
    }
    for (const field of ['temperamento', 'marca', 'contradicao', 'tique']) {
      assert.ok(typeof cls.historia[field] === 'string' && cls.historia[field].length > 0,
        `${id} historia.${field} must be a non-empty string`);
    }

    assert.ok(cls.img === '' || /^img\/.+-cut\.png$/.test(cls.img), `${id} img must be empty (placeholder) or point at a cutout`);
  }
});

test('a sugestao de point-buy de cada ficha cabe no orcamento de 27 pontos', () => {
  const { RPGCalc } = loadSandbox().window;
  for (const id of EXPECTED_IDS) {
    const { sugestao } = RPGCalc.CLASSES[id];
    assert.deepEqual(Object.keys(sugestao).sort(), [...RPGCalc.ATTRS].sort(),
      `${id} sugestao must cover every attribute`);

    for (const attr of RPGCalc.ATTRS) {
      const score = sugestao[attr];
      assert.ok(Number.isInteger(score) && score >= RPGCalc.MIN_SCORE && score <= RPGCalc.MAX_SCORE,
        `${id} sugestao.${attr} = ${score} is outside 8..15`);
    }

    const cost = RPGCalc.totalPointCost(sugestao);
    assert.ok(cost <= RPGCalc.TOTAL_POINTS,
      `${id} sugestao costs ${cost}, over the ${RPGCalc.TOTAL_POINTS}-point budget`);
  }
});

test('progressao (quando preenchida) comeca no nivel 1 e sobe sem repetir nivel', () => {
  const { RPGCalc } = loadSandbox().window;
  for (const id of EXPECTED_IDS) {
    const { progressao } = RPGCalc.CLASSES[id];
    assert.ok(Array.isArray(progressao), `${id} progressao must be an array`);
    if (progressao.length === 0) continue; // limpa: a definir
    assert.equal(progressao[0][0], 1, `${id} progressao must start at level 1`);

    let prev = 0;
    for (const [level, feature] of progressao) {
      assert.ok(Number.isInteger(level) && level >= 1 && level <= 20,
        `${id} progressao has invalid level: ${level}`);
      assert.ok(level > prev, `${id} progressao levels must ascend (${prev} -> ${level})`);
      assert.ok(typeof feature === 'string' && feature.length > 0,
        `${id} progressao level ${level} needs a feature`);
      prev = level;
    }
  }
});

test('Guerreiro: primarios FOR/DES, saves FOR/CON, d10', () => {
  const { RPGCalc } = loadSandbox().window;
  const g = RPGCalc.CLASSES.guerreiro;
  assert.deepEqual(g.primarios, ['FOR', 'DES']);
  assert.deepEqual(g.saves, ['FOR', 'CON']);
  assert.equal(g.dadoVida, 10);
});

test('Bárbaro d12, Ladino d8 com DES primário, Druida d8 com um único primário (SAB)', () => {
  const { RPGCalc } = loadSandbox().window;
  assert.equal(RPGCalc.CLASSES.barbaro.dadoVida, 12);
  assert.deepEqual(RPGCalc.CLASSES.ladino.primarios, ['DES']);
  assert.deepEqual(RPGCalc.CLASSES.druida.primarios, ['SAB']);
  assert.equal(RPGCalc.CLASSES.druida.dadoVida, 8);
});
