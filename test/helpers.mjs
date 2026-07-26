import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, '..', 'index.html');

export function readHtml() {
  return readFileSync(HTML_PATH, 'utf8');
}

export function extractInlineScript(html) {
  // vendor tags have src=, só o script inline (sem atributos) casa
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('No inline <script> tag found in index.html');
  return m[1];
}

export function loadSandbox() {
  const html = readHtml();
  const scriptText = extractInlineScript(html);

  // vm.createContext/vm.runInContext creates a genuinely separate V8 realm,
  // so array/object/Error literals created inside the evaluated script get
  // that realm's intrinsics (its own Array.prototype, RangeError, etc.), not
  // the main process's. That makes assert.deepEqual/assert.throws fail in
  // confusing cross-realm ways even when values are logically identical.
  //
  // vm.compileFunction compiles the script as a function in the CURRENT
  // (main) realm when no `parsingContext` option is passed, so every literal
  // and thrown error the script produces is an ordinary main-realm value.
  // That eliminates the cross-realm mismatch at the source -- no need to
  // special-case or clone individual properties (e.g. ATTRS) afterward, and
  // no need to inject main-realm constructors into a sandbox object, since
  // there is no separate sandbox realm anymore.
  const run = vm.compileFunction(scriptText, ['window'], {
    filename: 'index.html-inline-script',
  });

  const window = {};
  run(window);

  return { window };
}
