import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHtml } from './helpers.mjs';

const REQUIRED_IDS = [
  'char-cursive-name',
  'char-player-name',
  'char-class-tag',
  'char-hp-value',
  'char-saves-value',
  'char-primaries-value',
  'char-pericias-value',
  'char-pericia-livre',
  'char-prof-categoria',
  'char-prof-loadout',
  'char-equipamento-value',
  'prog-body'
];

test('character panel has all required display elements', () => {
  const html = readHtml();
  for (const id of REQUIRED_IDS) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
});

test('portrait has an alpha cutout slot plus a silhouette fallback', () => {
  const html = readHtml();
  assert.match(html, /id="hero-portrait"/);
  assert.match(html, /class="char-silhouette"/);
  assert.match(html, /class="portrait-aura"/);
});
