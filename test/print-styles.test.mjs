import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readHtml } from './helpers.mjs';

test('a @media print block exists', () => {
  const html = readHtml();
  assert.match(html, /@media print/);
});

test('@media print block hides the interactive UI and shows only the print sheet', () => {
  const html = readHtml();
  const printBlockMatch = html.match(/@media print\s*{([\s\S]*?)}\s*<\/style>/);
  assert.ok(printBlockMatch, 'expected @media print to be the last rule before </style>');
  const printBlock = printBlockMatch[1];
  for (const selector of ['#print-btn', '#points-locked-note', '.topbar', '.hero', '.sec']) {
    assert.ok(printBlock.includes(selector), `expected ${selector} to be hidden in print styles`);
  }
  assert.ok(printBlock.includes('#print-sheet'), 'expected #print-sheet to be shown in print styles');
});
