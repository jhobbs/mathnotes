// Build-time LaTeX -> MathML worker. JSON-lines protocol on stdin/stdout:
//   {"id": 1, "latex": "x^2", "display": false}
//   -> {"id": 1, "mathml": "<math ...>"}  or  {"id": 1, "error": "message"}
// A TeX parse error is a per-request error response, never a crash;
// malformed protocol input terminates the worker with a nonzero exit.
import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mathjax from 'mathjax';

// Math macros live in latex/mathnotes.sty (single source of truth, shared
// with pdflatex). Parse the marked section: simple one-line
// \newcommand/\renewcommand{\name}[n]{expansion} definitions only.
function parseStyMacros(sty) {
  const macros = {};
  const begin = sty.indexOf('% BEGIN MATH MACROS');
  const end = sty.indexOf('% END MATH MACROS');
  if (begin === -1 || end === -1 || end <= begin) {
    throw new Error('mathnotes.sty: MATH MACROS markers not found');
  }
  const section = sty.slice(begin, end);
  const definition = /\\(?:re)?newcommand\{\\([A-Za-z]+)\}(?:\[(\d)\])?\{/g;
  let match;
  while ((match = definition.exec(section)) !== null) {
    // brace-count to the matching close of the expansion body
    let depth = 1;
    let i = definition.lastIndex;
    while (i < section.length && depth > 0) {
      if (section[i] === '\\') i += 1; // skip escaped char
      else if (section[i] === '{') depth += 1;
      else if (section[i] === '}') depth -= 1;
      i += 1;
    }
    const body = section.slice(definition.lastIndex, i - 1);
    const [name, nargs] = [match[1], match[2]];
    macros[name] = nargs ? [body, parseInt(nargs, 10)] : body;
    definition.lastIndex = i;
  }
  if (Object.keys(macros).length === 0) {
    throw new Error('mathnotes.sty: no macros parsed from MATH MACROS section');
  }
  return macros;
}

const styPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'latex', 'mathnotes.sty');

const MathJax = await mathjax.init({
  loader: { load: ['input/tex', '[tex]/cancel'] },
  tex: {
    // input/tex bundles base+ams+newcommand+autoload. noundefined would
    // render undefined macros as red text instead of erroring; drop it so
    // every bad expression is a loud build failure. cancel is eagerly loaded
    // here because the synchronous tex2mml API cannot service autoload's async
    // retry mechanism.
    packages: { '[-]': ['noundefined'], '[+]': ['cancel'] },
    macros: parseStyMacros(readFileSync(styPath, 'utf8')),
    formatError: (_jax, err) => { throw err; },
  },
});

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on('line', (line) => {
  if (!line.trim()) return;
  let req;
  try {
    req = JSON.parse(line);
    if (typeof req.latex !== 'string' || typeof req.id !== 'number') {
      throw new Error('request must have numeric id and string latex');
    }
  } catch (e) {
    process.stderr.write(`tex2mml-worker: malformed request: ${e.message}\n`);
    process.exit(1);
  }
  let resp;
  try {
    let mml = MathJax.tex2mml(req.latex, { display: !!req.display });
    // single line: keeps page HTML compact and paragraph splitting inert
    mml = mml.replace(/\n\s*/g, '');
    mml = mml.replace('<math', `<math alttext="${escapeAttr(req.latex)}"`);
    resp = { id: req.id, mathml: mml };
  } catch (err) {
    resp = { id: req.id, error: String(err.message || err) };
  }
  process.stdout.write(JSON.stringify(resp) + '\n');
});
rl.on('close', () => process.exit(0));
