import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHtml } from './helpers.mjs';

test('historia section and body exist', () => {
  const html = readHtml();
  assert.match(html, /id="historia-section"/);
  assert.match(html, /id="historia-body"/);
});

test('historia body has the four content fields', () => {
  const html = readHtml();
  for (const id of ['historia-temperamento', 'historia-marca', 'historia-contradicao', 'historia-tique']) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
});

test('historia section has the historico lead paragraph slot', () => {
  const html = readHtml();
  assert.match(html, /id="char-historico"/);
});
