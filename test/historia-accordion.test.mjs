import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHtml } from './helpers.mjs';

test('historia section and body exist', () => {
  const html = readHtml();
  assert.match(html, /id="historia-section"/);
});

test('historia nao tem mais temperamento, marca, contradicao e tique', () => {
  const html = readHtml();
  for (const id of ['historia-temperamento', 'historia-marca', 'historia-contradicao', 'historia-tique', 'historia-body']) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`), `#${id} deveria ter sido removido`);
  }
});

test('historia section has the historico lead paragraph slot', () => {
  const html = readHtml();
  assert.match(html, /id="char-historico"/);
});
