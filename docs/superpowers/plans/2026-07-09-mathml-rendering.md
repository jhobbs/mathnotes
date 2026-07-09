# Build-Time MathML Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace client-side MathJax with build-time LaTeX→MathML conversion: pages ship native MathML styled with a bundled STIX Two Math webfont, and no math JavaScript reaches the client.

**Architecture:** A persistent Node worker (`scripts/tex2mml-worker.mjs`, MathJax 3.2.2, JSON-lines protocol) converts TeX to MathML; `mathnotes/mathml.py` is its Python client; `render_math()` in `latex_processor.py` (the single math seam from Part 1) delegates to it. Plain-text math surfaces (reference snippets, block titles, tooltips) convert through a new `text_with_math_to_html()` helper; snippet/heading-id derivation reads TeX back out of MathML `alttext`. The client MathJax stack is deleted entirely.

**Tech Stack:** MathJax 3.2.2 (npm, already installed — Node worker only), Python 3.14, Node 24, esbuild, STIX Two Math woff2.

**Spec:** `docs/superpowers/specs/2026-07-09-mathml-rendering-design.md`

## Global Constraints

- Engine: the existing `mathjax` npm dependency, `^3.2.2` in package.json — do not upgrade or add npm dependencies.
- Every unconvertible TeX expression is a **loud build failure** with file:line (`LatexDialectError`); never a silent fallback.
- Worker protocol: request `{"id": n, "latex": "...", "display": true|false}` → response `{"id": n, "mathml": "<math ...>"}` or `{"id": n, "error": "message"}`, one JSON object per line.
- MathML output carries `alttext` set to the original TeX source and `display="block"` for display math.
- Font: STIX Two Math, single full-face woff2 (no subsetting), `font-display: block`, pinned to stixfonts tag `v2.13b171`.
- No client fallback of any kind; the `mathjax` npm package stays a dependency (the build worker needs it).
- No inline JavaScript, no inline event handlers (repo CSP policy).
- Content `.tex` edits: mechanical TeX repairs only (delimiters, stray characters). Anything touching mathematical meaning gets **listed for Jason, not fixed** (repo owner policy).
- Python tests are standalone assert scripts run via `docker exec -i mathnotes-static-builder python3 - < test/<file>.py`. The dev stack must be up: `docker compose -f docker-compose.dev.yml up -d`.
- Commit after each task; plain technical messages, no AI attribution (repo rule).
- Do not restart/rebuild Docker for TS/CSS/Python changes — the dev builder auto-rebuilds. Rebuild only for Dockerfile changes.

**Test-file boilerplate** (every new test file starts with this and ends with the runner):

```python
import os, sys, traceback
try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")
```

```python
if __name__ == "__main__":
    failed = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print(f"PASS {name}")
            except Exception:
                failed += 1
                print(f"FAIL {name}")
                traceback.print_exc()
    sys.exit(1 if failed else 0)
```

(Check `test/test_ref_resolver.py` for the exact pattern used in this repo and mirror it.)

---

### Task 1: Baseline capture + tex2mml worker

The Node worker is the foundation everything else calls. Also capture the semantic-diff baseline **before any rendering change lands**, because the dev builder rebuilds automatically as soon as later tasks touch Python.

**Files:**
- Create: `scripts/tex2mml-worker.mjs`
- Create: `test/test_mathml.py` (worker-protocol tests; Task 2 extends this file)
- Baseline copy (not committed): `/tmp/mathml-site-baseline`

**Interfaces:**
- Produces: a Node script runnable as `node scripts/tex2mml-worker.mjs`, speaking the JSON-lines protocol from Global Constraints. TeX errors are per-request `{"id": n, "error": "..."}` responses; malformed protocol input exits nonzero; stdin EOF exits 0. MathML responses are single-line, start with `<math`, include `alttext` (HTML-escaped TeX) and `display="block"` when `display: true`.

- [ ] **Step 1: Capture the baseline site tree**

```bash
docker compose -f docker-compose.dev.yml up -d
# wait until the builder log shows a completed build:
docker logs --tail 20 mathnotes-static-builder
rm -rf /tmp/mathml-site-baseline
docker cp mathnotes-static-builder:/app/static-build/website /tmp/mathml-site-baseline
ls /tmp/mathml-site-baseline/mathnotes | head
```

Expected: content directories (algebra, real-analysis, ...) listed. The working tree must be on unmodified `main` when this runs.

- [ ] **Step 2: Write the failing worker-protocol tests**

Create `test/test_mathml.py` with the boilerplate above plus:

```python
"""Tests for the LaTeX->MathML worker (scripts/tex2mml-worker.mjs) and the
MathConverter client (mathnotes/mathml.py).

Run: docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py
"""
import json
import subprocess

try:
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    ROOT = "/app"
WORKER = os.path.join(ROOT, "scripts", "tex2mml-worker.mjs")


def worker_roundtrip(requests):
    proc = subprocess.run(
        ["node", WORKER],
        input="".join(json.dumps(r) + "\n" for r in requests),
        capture_output=True, text=True, timeout=120)
    assert proc.returncode == 0, proc.stderr
    return [json.loads(line) for line in proc.stdout.splitlines()]


def test_worker_inline_and_display():
    r1, r2 = worker_roundtrip([
        {"id": 1, "latex": "x<y", "display": False},
        {"id": 2, "latex": "\\int_0^1 f", "display": True},
    ])
    assert r1["id"] == 1 and r1["mathml"].startswith("<math")
    assert 'alttext="x&lt;y"' in r1["mathml"]
    assert 'display="block"' not in r1["mathml"]
    assert "\n" not in r1["mathml"]  # single-line output
    assert r2["id"] == 2 and 'display="block"' in r2["mathml"]
    assert 'alttext="\\int_0^1 f"' in r2["mathml"]


def test_worker_sty_macros_and_ams_symbols():
    r1, r2, r3 = worker_roundtrip([
        {"id": 1, "latex": "\\vec{F}", "display": False},   # mathnotes.sty macro
        {"id": 2, "latex": "\\square", "display": False},   # ams symbol (proof QED)
        {"id": 3, "latex": "\\Res_{z=i} f(z)", "display": False},  # \operatorname* macro
    ])
    assert "error" not in r1 and 'mathvariant="bold"' in r1["mathml"]
    assert "error" not in r2 and r2["mathml"].startswith("<math")
    assert "error" not in r3 and ">Res<" in r3["mathml"]


def test_worker_amsmath_environments():
    reqs = [{"id": i, "latex": t, "display": True} for i, t in enumerate([
        "\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}",
        "\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}",
        "\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}",
        "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}",
        "\\begin{cases} 1 & x > 0 \\\\ 0 & x \\le 0 \\end{cases}",
    ])]
    for r in worker_roundtrip(reqs):
        assert "error" not in r, r


def test_worker_tex_error_is_response_not_crash():
    r1, r2 = worker_roundtrip([
        {"id": 1, "latex": "\\notarealmacro", "display": False},
        {"id": 2, "latex": "x", "display": False},
    ])
    assert "Undefined control sequence" in r1["error"]
    assert r2["mathml"].startswith("<math")  # worker survived the TeX error


def test_worker_malformed_protocol_exits_nonzero():
    proc = subprocess.run(["node", WORKER], input="not json\n",
                          capture_output=True, text=True, timeout=120)
    assert proc.returncode != 0
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py`
Expected: every `test_worker_*` FAILs (worker file does not exist; `proc.returncode` nonzero with "Cannot find module").

- [ ] **Step 4: Write the worker**

Create `scripts/tex2mml-worker.mjs`:

```js
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
  loader: { load: ['input/tex'] },
  tex: {
    // input/tex bundles base+ams+newcommand+autoload. noundefined would
    // render undefined macros as red text instead of erroring; drop it so
    // every bad expression is a loud build failure.
    packages: { '[-]': ['noundefined'] },
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
```

Notes for the implementer:
- `mathjax`'s package main is `es5/node-main.js` (CommonJS); the default-import interop gives you `.init()`. Verified present in the container at `node_modules/mathjax/es5/node-main.js`.
- `MathJax.tex2mml` exists once `input/tex` is loaded (no output jax needed).
- The `parseStyMacros` port must match `demos-framework/src/mathjax-init.ts:15-44` (it is deleted in Task 6; this becomes the only copy).
- If `tex2mml`'s error for `\notarealmacro` phrases differently than "Undefined control sequence", adjust the test to the actual message — the invariant is *error response, not merror markup*: also assert `"merror" not in r2.get("mathml", "")`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py`
Expected: all 5 `test_worker_*` PASS. (Dev compose mounts `./scripts` and `./latex` into the container, so no rebuild is needed.)

- [ ] **Step 6: Commit**

```bash
git add scripts/tex2mml-worker.mjs test/test_mathml.py
git commit -m "Add tex2mml worker: build-time LaTeX to MathML via MathJax node"
```

---

### Task 2: Python converter client — `mathnotes/mathml.py`

**Files:**
- Create: `mathnotes/mathml.py`
- Modify: `test/test_mathml.py` (append converter tests)

**Interfaces:**
- Consumes: `scripts/tex2mml-worker.mjs` protocol (Task 1).
- Produces: `MathConversionError(ValueError)`; `MathConverter` with `convert(latex: str, display: bool) -> str` and `close()`; module-level `get_converter() -> MathConverter` (lazy singleton with `atexit` close). `convert` raises `MathConversionError` on a TeX error response, `RuntimeError` if the worker cannot start or dies twice.

- [ ] **Step 1: Write the failing tests**

Append to `test/test_mathml.py`:

```python
from mathnotes.mathml import MathConverter, MathConversionError, get_converter


def test_converter_roundtrip():
    c = MathConverter()
    try:
        mml = c.convert("x^2", display=False)
        assert mml.startswith("<math") and 'alttext="x^2"' in mml
        dm = c.convert("\\sum_{n=1}^\\infty a_n", display=True)
        assert 'display="block"' in dm
    finally:
        c.close()


def test_converter_tex_error_raises():
    c = MathConverter()
    try:
        try:
            c.convert("\\notarealmacro", display=False)
            assert False, "expected MathConversionError"
        except MathConversionError as e:
            assert "notarealmacro" in str(e) or "Undefined" in str(e)
        # converter still usable after an error response
        assert c.convert("x", display=False).startswith("<math")
    finally:
        c.close()


def test_converter_restarts_dead_worker():
    c = MathConverter()
    try:
        assert c.convert("x", display=False).startswith("<math")
        c._proc.kill()
        c._proc.wait()
        # one restart + retry of the in-flight request
        assert c.convert("y", display=False).startswith("<math")
    finally:
        c.close()


def test_converter_startup_failure_names_command():
    c = MathConverter(worker_path="/nonexistent/worker.mjs")
    try:
        c.convert("x", display=False)
        assert False, "expected RuntimeError"
    except RuntimeError as e:
        assert "worker" in str(e).lower()
    finally:
        c.close()


def test_get_converter_is_singleton():
    assert get_converter() is get_converter()
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py`
Expected: FAIL at the import line (`No module named 'mathnotes.mathml'`); Task 1 tests still PASS.

- [ ] **Step 3: Write `mathnotes/mathml.py`**

```python
"""Build-time LaTeX -> MathML conversion via a persistent Node MathJax worker.

MathConverter speaks the JSON-lines protocol of scripts/tex2mml-worker.mjs.
One request is in flight at a time (the build is single-threaded). If the
worker dies mid-request it is restarted once and the request retried; a
second failure is a hard error. A TeX parse error is a MathConversionError.
"""

import atexit
import json
import os
import subprocess
from typing import Optional


class MathConversionError(ValueError):
    """The worker could not convert an expression (TeX error)."""


class _WorkerDied(Exception):
    pass


_WORKER_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "scripts", "tex2mml-worker.mjs")


class MathConverter:
    def __init__(self, worker_path: str = _WORKER_PATH):
        self.worker_path = worker_path
        self._proc: Optional[subprocess.Popen] = None
        self._next_id = 0

    def _spawn(self):
        cmd = ["node", self.worker_path]
        try:
            self._proc = subprocess.Popen(
                cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                text=True, bufsize=1)
        except OSError as e:
            raise RuntimeError(
                f"could not start MathML worker ({' '.join(cmd)}): {e}") from e

    def _request_once(self, payload: dict) -> dict:
        if self._proc is None or self._proc.poll() is not None:
            self._spawn()
        try:
            self._proc.stdin.write(json.dumps(payload) + "\n")
            self._proc.stdin.flush()
            line = self._proc.stdout.readline()
        except (BrokenPipeError, OSError) as e:
            raise _WorkerDied(str(e)) from e
        if not line:
            raise _WorkerDied("worker closed stdout")
        return json.loads(line)

    def convert(self, latex: str, display: bool) -> str:
        self._next_id += 1
        payload = {"id": self._next_id, "latex": latex, "display": display}
        try:
            resp = self._request_once(payload)
        except _WorkerDied:
            self._proc = None
            try:
                resp = self._request_once(payload)
            except _WorkerDied as e:
                raise RuntimeError(
                    f"MathML worker died twice converting {latex!r}: {e}") from e
        if resp.get("id") != payload["id"]:
            raise RuntimeError(
                f"MathML worker protocol desync: sent id {payload['id']}, "
                f"got {resp.get('id')!r}")
        if "error" in resp:
            raise MathConversionError(resp["error"])
        return resp["mathml"]

    def close(self):
        if self._proc is not None and self._proc.poll() is None:
            self._proc.stdin.close()
            try:
                self._proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self._proc.kill()
        self._proc = None


_converter: Optional[MathConverter] = None


def get_converter() -> MathConverter:
    """Module-level singleton; atexit covers the build script and watch mode."""
    global _converter
    if _converter is None:
        _converter = MathConverter()
        atexit.register(_converter.close)
    return _converter
```

Note: the nonexistent-worker-path case surfaces as node exiting immediately → `_WorkerDied` twice → `RuntimeError`, which is what the test asserts. A missing `node` binary raises `RuntimeError` naming the command from `_spawn`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add mathnotes/mathml.py test/test_mathml.py
git commit -m "Add MathConverter: persistent MathML worker client with restart"
```

---

### Task 3: TeX restoration from MathML alttext (snippets, heading ids, descriptions)

`MathBlock.content` (→ reference snippets) is derived from rendered `body_html` via `body_text()`; heading ids come from rendered heading HTML; page descriptions from page HTML. Once `render_math()` emits MathML, all three would see MathML tag soup. This task makes them alttext-aware **before** the swap — every change is a no-op on current `$…$` output, so nothing else moves.

**Files:**
- Modify: `mathnotes/structured_math.py` (add `math_to_dollar_text`, wire into `body_text`)
- Modify: `mathnotes/latex_processor.py:101-102` (`_heading_id`)
- Modify: `mathnotes/page_renderer.py:84-99` (`_generate_description`)
- Modify: `test/test_structured_math.py`

**Interfaces:**
- Produces: `math_to_dollar_text(html_str: str) -> str` in `structured_math.py` — replaces each `<math …>…</math>` element with `$<alttext TeX>$` (or `$$…$$` when the open tag has `display="block"`). Exported alongside `body_text`.

- [ ] **Step 1: Write the failing tests**

Add to `test/test_structured_math.py` (import `math_to_dollar_text` in the existing import list from `mathnotes.structured_math`):

```python
def test_math_to_dollar_text():
    h = ('<p>Let <math xmlns="http://www.w3.org/1998/Math/MathML" '
         'alttext="x &lt; y"><mi>x</mi><mo>&lt;</mo><mi>y</mi></math> and '
         '<math alttext="\\int f" display="block"><mo>∫</mo></math> end.</p>')
    out = math_to_dollar_text(h)
    assert "$x < y$" in out
    assert "$$\\int f$$" in out
    assert "<math" not in out
    # no-op on HTML without math elements
    assert math_to_dollar_text("<p>plain $a+b$ text</p>") == "<p>plain $a+b$ text</p>"


def test_body_text_restores_math_from_alttext():
    h = '<p>Every <math alttext="\\epsilon"><mi>ε</mi></math> ball is open</p>'
    assert body_text(h) == "Every $\\epsilon$ ball is open"


def test_description_strips_math_elements():
    from mathnotes.page_renderer import PageRenderer
    pr = PageRenderer(None, None)
    desc = pr._generate_description(
        {}, '<p>Intro <math alttext="x^2"><mi>x</mi></math> continues here.</p>')
    assert desc == "Intro continues here."
    assert "<math" not in desc and "x" not in desc.replace("Intro", "")
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py`
Expected: the three new tests FAIL (`ImportError: cannot import name 'math_to_dollar_text'` first — fix the import, rerun, then assertion failures); all pre-existing tests PASS.

- [ ] **Step 3: Implement**

In `mathnotes/structured_math.py`, below the existing module-level regexes (near line 17):

```python
_MATH_EL_RE = re.compile(r"<math\b[^>]*>.*?</math>", re.DOTALL)
_ALTTEXT_RE = re.compile(r'\balttext="([^"]*)"')


def math_to_dollar_text(html_str: str) -> str:
    """Replace <math> elements with their $-delimited alttext TeX (display
    math gets $$), so snippet and heading-id derivation see the same text
    the $-delimiter era produced. No-op on HTML without <math> elements."""
    def repl(m):
        el = m.group(0)
        open_tag = el[: el.index(">") + 1]
        alt = _ALTTEXT_RE.search(open_tag)
        tex = html_lib.unescape(alt.group(1)) if alt else ""
        return f"$${tex}$$" if 'display="block"' in open_tag else f"${tex}$"
    return _MATH_EL_RE.sub(repl, html_str)
```

In `body_text()` (structured_math.py:33-37), restore math **before** tags are stripped:

```python
    text = _DREF_TEXT_RE.sub(flatten, html_str)
    text = math_to_dollar_text(text)
    text = CHILD_MARKER_RE.sub(" ", text)
    text = _TAG_RE.sub("", text)
    text = html_lib.unescape(text)
    return " ".join(text.split())
```

In `mathnotes/latex_processor.py`, add `math_to_dollar_text` to the existing `from .structured_math import (...)` block, and change `_heading_id` (line 101) so heading anchors keep their exact pre-MathML ids (`Small $x$ Idea` → `small-x-idea` derives from the TeX, not from MathML element text):

```python
def _heading_id(title_html: str) -> str:
    return MathBlock.normalize_label_from_title(
        re.sub(r"<[^>]+>", "", math_to_dollar_text(title_html)))
```

In `mathnotes/page_renderer.py` `_generate_description` (line 89), strip math elements before the generic tag strip (keep the `$` regexes for now — they still do the work until Task 5 swaps the seam):

```python
            clean = re.sub(r"<math\b.*?</math>", " ", html_content, flags=re.DOTALL)
            clean = re.sub(r"<[^>]+>", "", clean)
            clean = re.sub(r"\$\$[^$]+\$\$", "", clean)
            clean = re.sub(r"\$[^$]+\$", "", clean)
```

- [ ] **Step 4: Run the full Python suite to verify no regressions**

```bash
for t in test_structured_math test_latex_processor test_ref_resolver test_latex_integration test_reference_snippets; do
  echo "== $t"; docker exec -i mathnotes-static-builder python3 - < test/$t.py || break
done
```
Expected: all PASS (every change is inert on `$…$`-era HTML).

- [ ] **Step 5: Commit**

```bash
git add mathnotes/structured_math.py mathnotes/latex_processor.py mathnotes/page_renderer.py test/test_structured_math.py
git commit -m "Restore TeX from MathML alttext for snippets, heading ids, descriptions"
```

---

### Task 4: Plain-text math surfaces — `text_with_math_to_html()`

The three surfaces whose `$…$` currently relies on client MathJax: reference link text (289 snippet blocks plus titled/synonym links), block header titles (5 with math), and tooltip title/type strings. Wire them through one helper now; with Part-1 `render_math` still active its output is byte-identical to the old `html.escape` paths for math-free text, so existing tests stay green.

**Files:**
- Modify: `mathnotes/structured_math.py` (add helper; use in `render_block_html`)
- Modify: `mathnotes/ref_resolver.py` (link text paths, `get_tooltip_data`)
- Modify: `mathnotes/sitegenerator/builder.py:100-115` (global tooltip JSON)
- Modify: `test/test_structured_math.py`

**Interfaces:**
- Consumes: `render_math(latex, display)` from `latex_processor.py` via lazy import (same circular-import precedent as the QED call at `structured_math.py:335`).
- Produces: `text_with_math_to_html(text: str) -> str` in `structured_math.py` — HTML-escapes prose, converts complete `$…$` spans via `render_math(…, display=False)`. Unpaired `$` stays escaped prose.

- [ ] **Step 1: Write the failing tests**

Add to `test/test_structured_math.py` (import `text_with_math_to_html` too):

```python
def test_text_with_math_to_html():
    import mathnotes.latex_processor as lp
    orig = lp.render_math
    lp.render_math = lambda latex, display: f'<MML:{latex}:{display}>'
    try:
        out = text_with_math_to_html("Norm $\\|x\\|$ & more")
        assert out == 'Norm <MML:\\|x\\|:False> &amp; more'
        # prose-only: plain escaping, no double-escaping
        assert text_with_math_to_html("a < b") == "a &lt; b"
        # unpaired $ is inert prose
        assert text_with_math_to_html("costs $5") == "costs $5"
    finally:
        lp.render_math = orig


def test_render_block_html_title_goes_through_math_seam():
    b = MathBlock(block_type=MathBlockType.THEOREM, content="c",
                  title="Bound on $\\|x\\|$", label="t1")
    out = render_block_html(b, "<p>c</p>", "/u#t1")
    # with the Part-1 seam this renders as escaped $-text, same as before
    assert "Bound on $\\|x\\|$" in out
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_structured_math.py`
Expected: import error for `text_with_math_to_html`, then assertion failures after adding a stub.

- [ ] **Step 3: Implement**

In `mathnotes/structured_math.py`:

```python
_INLINE_MATH_RE = re.compile(r"\$([^$]+)\$")


def text_with_math_to_html(text: str) -> str:
    """HTML for plain text that may contain $...$ math: prose is escaped,
    complete math spans render through the math seam. Used for reference
    link text, block header titles, and tooltip title/type strings."""
    from .latex_processor import render_math  # local: latex_processor imports this module

    out = []
    pos = 0
    for m in _INLINE_MATH_RE.finditer(text):
        out.append(html_lib.escape(text[pos:m.start()], quote=False))
        out.append(render_math(m.group(1).strip(), display=False))
        pos = m.end()
    out.append(html_lib.escape(text[pos:], quote=False))
    return "".join(out)
```

In `render_block_html` (structured_math.py:298-301), the title span becomes:

```python
            parts.append(
                f'<span class="math-block-title"><a href="{url}">'
                f"{text_with_math_to_html(block.title)}</a></span>"
            )
```

In `mathnotes/ref_resolver.py`, add `text_with_math_to_html` to the `from .structured_math import` line, then in `_resolve_dref` (lines 92-103) replace the three text paths:

```python
            elif is_synonym and getattr(bref, "synonym_title", None):
                text = bref.synonym_title
                if block.block_type == MathBlockType.DEFINITION:
                    text = text.lower()
                text = text_with_math_to_html(text)
            elif block.title:
                text = block.title
                if block.block_type == MathBlockType.DEFINITION and ref_type is None:
                    text = text.lower()
                text = text_with_math_to_html(text)
            else:
                text = text_with_math_to_html(block.content_snippet)
```

In `get_tooltip_data` (ref_resolver.py:62-68):

```python
            if is_synonym and synonym_title:
                display_type = (
                    f"{block.block_type.value} ({text_with_math_to_html(synonym_title)}), "
                    f"synonym of {text_with_math_to_html(block.title or label)}")
                display_title = ""
            else:
                display_type = block.block_type.value
                display_title = text_with_math_to_html(block.title) if block.title else ""
```

In `mathnotes/sitegenerator/builder.py` `setup_global_context` (lines 100-115), import the helper and convert the title fields of the global tooltip JSON:

```python
        from mathnotes.structured_math import text_with_math_to_html

        tooltip_data = {}
        for label, ref in self.block_index.index.items():
            is_syn = getattr(ref, 'is_synonym', False)
            tooltip_data[label] = {
                "type": ref.block.block_type.value,
                "title": text_with_math_to_html(ref.block.title) if ref.block.title else "",
                "content": ref.block.content_html,
                "url": ref.full_url,
                "is_synonym": is_syn,
                "synonym_of": (text_with_math_to_html(ref.block.title)
                               if is_syn and ref.block.title else None),
                "synonym_title": getattr(ref, 'synonym_title', None),
            }
```

- [ ] **Step 4: Run the full Python suite**

Same loop as Task 3 Step 4. Expected: all PASS — with the Part-1 seam, `text_with_math_to_html("The $\\log$ f")` produces the same escaped `$…$` text the old `html.escape` paths did, so `test_reference_snippets.py` and `test_ref_resolver.py` assertions hold unchanged. If any fail, the helper's escaping differs from `html.escape(…, quote=False)` semantics — fix the helper, not the tests.

- [ ] **Step 5: Commit**

```bash
git add mathnotes/structured_math.py mathnotes/ref_resolver.py mathnotes/sitegenerator/builder.py test/test_structured_math.py
git commit -m "Route reference link text, block titles, tooltips through math seam"
```

---

### Task 5: Swap the seam — `render_math()` emits MathML; build fails loudly

**Files:**
- Modify: `mathnotes/latex_processor.py:36-43` (`render_math`), `:594-598` (`_math`)
- Modify: `mathnotes/page_renderer.py` (drop the now-dead `$` regexes)
- Modify: `test/test_latex_processor.py`, `test/test_latex_integration.py`, `test/test_structured_math.py`
- Modify (mechanical repairs only, as needed): `content/**/*.tex`

**Interfaces:**
- Consumes: `get_converter()`, `MathConversionError` from `mathnotes/mathml.py`.
- Produces: `render_math(latex: str, display: bool) -> str` — same signature, now returns a single-line `<math …>` string; raises `MathConversionError` on unconvertible TeX. `_math` converts that to `LatexDialectError` with file:line. Callers outside the emitter (`render_block_html` QED, `text_with_math_to_html`) let `MathConversionError` propagate — those inputs re-convert text that already converted in a block body, so a failure there is a genuine build bug and should crash the build.

- [ ] **Step 1: Update the seam-level tests to expect MathML**

In `test/test_latex_processor.py`:

Lines 81-84 become:

```python
    m = render_math("x<y", False)
    assert m.startswith("<math") and 'alttext="x&lt;y"' in m
    d = render_math("\\int f", True)
    assert 'display="block"' in d and 'alttext="\\int f"' in d
    h = prose("Inline $a<b$ and display $$c \\to d$$ done.")
    assert 'alttext="a&lt;b"' in h and 'alttext="c \\to d"' in h
    assert 'display="block"' in h
```

Lines 88-90 (heading ids must not change):

```python
    h = prose("\\section{Big Idea}\nText.\n\\subsection{Small $x$ Idea}")
    assert '<h2 id="small-x-idea">' in h and 'alttext="x"' in h
    # keep the file's other heading assertions as they are — only the
    # $x$-in-heading line changes (the id must NOT change)
```

Lines 213-218 (the AST invariant is "`&` inside `$…$` never splits a table cell" — keep it, but with TeX that is valid standalone):

```python
    # & inside $...$ is part of the opaque math node at the AST level (the
    # walker consumes the whole $...$ span before the tabular-row splitter
    # ever sees it), so a matrix cell must stay one cell, not two.
    h = prose("\\begin{tabular}{lc}\nSym & Val \\\\\n$H(X|Y)$ & "
              "$\\begin{pmatrix} a & b \\end{pmatrix}$ \\\\\n\\end{tabular}")
    assert 'alttext="H(X|Y)"' in h
    assert h.count("<td") == 4  # 2x2 table: the math & did not split a cell
```

Lines 237-249 (`THM` block assertions):

```python
    assert t.body_html.startswith("<p>Body <math")
    assert 'alttext="x"' in t.body_html and t.body_html.endswith(".</p>")
    assert t.content == "Body $x$."   # alttext round-trip via body_text
```

Also add a new loud-failure test:

```python
def test_unconvertible_math_is_dialect_error_with_line():
    import tempfile
    src = "\\title{T}\n\nGood text.\n\n$\\notarealmacro$\n"
    with tempfile.NamedTemporaryFile("w", suffix=".tex", delete=False) as f:
        f.write(src)
    try:
        parse_latex_file(f.name)
        assert False, "expected LatexDialectError"
    except LatexDialectError as e:
        assert f.name in str(e) and ":5:" in str(e)
```

(Match the surrounding tests' actual helpers — if the file already has a `parse` helper writing temp files, reuse it.)

In `test/test_latex_integration.py` line 88: replace `assert "$\\square$" in b_html` with `assert 'alttext="\\square"' in b_html`.

In `test/test_structured_math.py`, `test_render_block_html_title_goes_through_math_seam` (Task 4): the title now renders as MathML — replace the `$`-text assertion with:

```python
    assert "Bound on <math" in out and 'alttext="\\|x\\|"' in out
```

- [ ] **Step 2: Run tests to verify the updated ones fail**

Run: `docker exec -i mathnotes-static-builder python3 - < test/test_latex_processor.py`
Expected: the updated math assertions FAIL (`render_math` still emits `$…$`).

- [ ] **Step 3: Swap the seam**

In `mathnotes/latex_processor.py`, add to the imports:

```python
from .mathml import MathConversionError, get_converter
```

Replace `render_math` (lines 36-43):

```python
def render_math(latex: str, display: bool) -> str:
    """THE math seam: every math node renders through this one function.

    Build-time MathML: delegate to the persistent MathJax node worker. The
    return value is serializer output — well-formed markup, inserted raw.
    Raises MathConversionError on unconvertible TeX; the emitter turns that
    into a LatexDialectError with file:line.
    """
    return get_converter().convert(latex.strip(), display)
```

Replace `_math` (lines 594-598):

```python
    def _math(self, n) -> str:
        verbatim = n.latex_verbatim()
        open_d, close_d = n.delimiters
        inner = verbatim[len(open_d): len(verbatim) - len(close_d)].strip()
        try:
            return render_math(inner, n.displaytype == "display")
        except MathConversionError as e:
            self._err(n, f"math does not convert to MathML: {e}")
```

In `mathnotes/page_renderer.py` `_generate_description`, delete the two now-dead lines:

```python
            clean = re.sub(r"\$\$[^$]+\$\$", "", clean)
            clean = re.sub(r"\$[^$]+\$", "", clean)
```

- [ ] **Step 4: Run the full Python suite**

Same loop as Task 3 Step 4, plus `test_mathml.py`. Expected: all PASS. `test_cache_invalidation.py` and `test_watcher.py` (run with the documented commands from CLAUDE.md) should also pass — they exercise real builds, which now spawn the worker.

- [ ] **Step 5: Full-site build — triage every unconvertible expression**

```bash
time docker exec -w /app mathnotes-static-builder python3 scripts/build_static_simple.py 2>&1 | tail -30
```

- On success: note the wall time (baseline expectation: one persistent worker over ~9k expressions adds seconds, not minutes; if the build grew by minutes, investigate before proceeding — likely a worker-restart-per-request bug).
- On `LatexDialectError`: fix and re-run one error at a time. **Mechanical repairs only** (e.g. a stray `&` outside an alignment environment, `\\\ ` oddities inside matrices, an unclosed brace). Record every repair in the commit message. Anything that would change mathematical content: leave it broken, collect it in a list, and stop at the end of this task to present the list to Jason.

- [ ] **Step 6: Spot-check the output**

```bash
docker exec mathnotes-static-builder sh -c \
  'grep -c "<math" static-build/website/mathnotes/algebra/linear/determinants/index.html; \
   grep -c "\\$" static-build/website/mathnotes/algebra/linear/determinants/index.html'
```
Expected: many `<math` occurrences; `$` count at or near zero (tooltip JSON may legitimately contain `\$`-escaped TeX inside alttext copies — inspect any hits rather than assuming).

- [ ] **Step 7: Commit**

```bash
git add mathnotes/latex_processor.py mathnotes/page_renderer.py test/ content/
git commit -m "Swap render_math to build-time MathML; unconvertible TeX fails the build"
```

---

### Task 6: Client MathJax teardown

**Files:**
- Delete: `demos-framework/src/mathjax-entry.ts`, `demos-framework/src/mathjax-init.ts`, `demos-framework/src/mathjax.d.ts`
- Modify: `demos-framework/src/main.ts` (take over tooltip init), `demos-framework/src/tooltip-system.ts` (drop typeset + global decl)
- Modify: `esbuild.config.js` (entry point, font copy plugin, manifest case)
- Modify: `mathnotes/sitegenerator/context.py` (drop `mathjax_js_url`)
- Modify: `templates/base.html:53-54` (drop script tag)

**Interfaces:**
- Consumes: `initTooltipSystem()` from `tooltip-system.ts` (already exported).
- Produces: nothing new — the constraint is that tooltips still initialize on every page (they were bootstrapped from `mathjax-entry.ts`, which dies here) and the build produces no `mathjax.js` bundle or MathJax fonts.

- [ ] **Step 1: Move tooltip initialization into main.ts**

In `demos-framework/src/main.ts`, add to the imports:

```ts
// Import tooltip system for block-reference hover previews
import { initTooltipSystem } from './tooltip-system';
```

Inside the existing `DOMContentLoaded` handler (line 89), after `initMathBlockToggle();`:

```ts
  // Initialize reference tooltips (content ships pre-rendered MathML)
  initTooltipSystem();
```

- [ ] **Step 2: Strip MathJax from tooltip-system.ts**

Delete lines 1-5 (the `declare global { interface Window { MathJax: any } }` block) and the typeset block at lines 283-287:

```ts
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([this.tooltipElement]).catch((e: any) => {
        console.error('MathJax typesetting failed:', e);
      });
    }
```

- [ ] **Step 3: Delete the client MathJax files**

```bash
git rm demos-framework/src/mathjax-entry.ts demos-framework/src/mathjax-init.ts demos-framework/src/mathjax.d.ts
```

(`mathjax.d.ts` also declares the `*.sty` text-import module — only `mathjax-init.ts` used it; verify with `grep -rn "\.sty'" demos-framework/ demos/` → no hits after deletion.)

- [ ] **Step 4: esbuild config**

In `esbuild.config.js`:
- Delete the whole `copyPlugin` (lines 44-68) and remove it from `plugins: [postcssPlugin, copyPlugin]` → `plugins: [postcssPlugin]`.
- Remove the entry point line `path.resolve(process.cwd(), 'demos-framework/src/mathjax-entry.ts'),`.
- In the manifest loop, remove the mathjax special case (lines 136-141), leaving:

```js
          if (ext === '.js') {
            manifest[`${entryName}.js`] = relativePath;
          } else if (ext === '.css') {
```

- [ ] **Step 5: Python context and template**

In `mathnotes/sitegenerator/context.py` `get_asset_urls`, delete the `mathjax_js_key` / `mathjax_js` lines and the `"mathjax_js_url"` dict entry. In `templates/base.html`, delete lines 53-54 (`<!-- MathJax initialization -->` and the `mathjax_js_url` script tag).

- [ ] **Step 6: Verify the dev build and page behavior**

```bash
docker exec mathnotes-static-builder npm run type-check
docker logs --tail 30 mathnotes-static-builder   # clean auto-rebuild, no TS errors
docker exec mathnotes-static-builder sh -c 'ls static/dist | grep -i mathjax || echo NO-MATHJAX-ASSETS'
grep -rn "mathjax\|MathJax" demos-framework/ templates/ mathnotes/ esbuild.config.js || echo CLEAN
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/algebra/linear/determinants"
```
Expected: type-check clean; `NO-MATHJAX-ASSETS`; remaining grep hits only in `mathnotes/mathml.py` and comments/docstrings that legitimately describe the build-time worker (plus `package.json`/lockfile — kept: the worker needs the package); crawl reports zero console errors and the page shows tooltips working (crawl output confirms no JS errors — visual tooltip check happens in Task 10).

- [ ] **Step 7: Commit**

```bash
git add -A demos-framework esbuild.config.js mathnotes/sitegenerator/context.py templates/base.html
git commit -m "Remove client MathJax: entry, init, fonts, tooltip typeset, script tag"
```

---

### Task 7: STIX Two Math font + MathML CSS

**Files:**
- Create: `styles/fonts/STIXTwoMath-Regular.woff2` (vendored binary), `styles/fonts/OFL.txt`
- Create: `styles/math.css`
- Modify: `styles/main.css` (one `@import`)

**Interfaces:**
- Produces: an `@font-face` for `'STIX Two Math'` bundled by esbuild's existing `.woff2` file loader (hash-named into `static/dist/`, URL rewritten automatically — no Dockerfile or copy-plugin work; `styles/` is already mounted in dev and COPY'd in both Docker builds).

- [ ] **Step 1: Vendor the font (pinned upstream tag, full face, OFL license)**

```bash
mkdir -p styles/fonts
curl -fL -o styles/fonts/STIXTwoMath-Regular.woff2 \
  https://raw.githubusercontent.com/stipub/stixfonts/v2.13b171/fonts/static_otf_woff2/STIXTwoMath-Regular.woff2
curl -fL -o styles/fonts/OFL.txt \
  https://raw.githubusercontent.com/stipub/stixfonts/v2.13b171/OFL.txt
ls -l styles/fonts/
```
Expected: `STIXTwoMath-Regular.woff2` is 551908 bytes (verified against the tag during planning).

- [ ] **Step 2: Write `styles/math.css`**

```css
/* Native MathML rendering (build-time MathJax -> MathML Core). */

@font-face {
  font-family: 'STIX Two Math';
  src: url('./fonts/STIXTwoMath-Regular.woff2') format('woff2');
  /* brief invisibility beats math reflowing from fallback glyphs */
  font-display: block;
}

math {
  font-family: 'STIX Two Math', math;
}

/* MathJax's scroll containers are gone; wide display equations scroll
   inside the element instead of overflowing the page */
math[display='block'] {
  overflow-x: auto;
  max-width: 100%;
}
```

(Dark mode needs nothing: MathML inherits `currentColor`. No theme tokens apply here — this is a font binding, not a themed component.)

- [ ] **Step 3: Import it**

In `styles/main.css`, after `@import './demo-components.css';`:

```css
@import './math.css';
```

- [ ] **Step 4: Verify the built CSS and served font**

```bash
docker logs --tail 10 mathnotes-static-builder   # auto-rebuild finished
docker exec mathnotes-static-builder sh -c \
  "grep -o 'STIX Two Math' static/dist/main-*.css | head -2; ls static/dist/ | grep -i stix"
curl -s http://localhost:5000/mathnotes/algebra/linear/determinants/ | grep -c "<math"
```
Expected: the font-family appears in the bundled CSS, a hashed `STIXTwoMath-Regular-*.woff2` sits in `static/dist/`, and the page serves MathML.

- [ ] **Step 5: Commit**

```bash
git add styles/fonts styles/math.css styles/main.css
git commit -m "Bundle STIX Two Math (v2.13b171, OFL) and MathML CSS"
```

---

### Task 8: Production Dockerfile — Node in the Python build stage

The production Python stage (`Dockerfile` Stage 3, `python:3.14-slim AS builder`) has **no Node and no node_modules** — the build would die spawning the worker. (Dev needs no changes: `Dockerfile.dev` already installs Node 24 + `npm ci`, and the dev compose mounts `./scripts` and `./latex`.) The `mathjax` package has zero runtime dependencies (verified), so copying just its directory suffices.

**Files:**
- Modify: `Dockerfile` (Stage 3 only)

**Interfaces:**
- Consumes: `scripts/tex2mml-worker.mjs` (Task 1) resolving `mathjax` from `/app/node_modules` and reading `/app/latex/mathnotes.sty`.

- [ ] **Step 1: Edit Stage 3**

After `FROM python:3.14-slim AS builder` / `WORKDIR /app`, add (mirroring `Dockerfile.dev`'s Node install):

```dockerfile
# Node runs the build-time MathML worker (scripts/tex2mml-worker.mjs)
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*
```

Change the scripts COPY line and add the worker's two other needs:

```dockerfile
COPY scripts/build_static_simple.py scripts/tex2mml-worker.mjs ./scripts/
COPY latex/ ./latex/
# The MathML worker needs only the mathjax package (it has no runtime deps)
COPY --from=esbuild-builder /app/node_modules/mathjax ./node_modules/mathjax
```

- [ ] **Step 2: Prove the production build stage converts the whole site**

```bash
docker build --target builder -t mathnotes-prod-builder-test . 2>&1 | tail -15
```
Expected: image builds; the `RUN python scripts/build_static_simple.py` layer completes (that run is the full 9k-expression conversion — this is the "build is the test" gate for production). This is a Dockerfile change, so an actual build is required (the no-rebuild rule doesn't apply).

- [ ] **Step 3: Commit**

```bash
git add Dockerfile
git commit -m "Production builder stage: node + mathjax package for MathML worker"
```

---

### Task 9: Semantic diff — alttext-aware math extraction, then run it

**Files:**
- Modify: `scripts/semantic_diff.py`

**Interfaces:**
- Produces: `summarize()` whose `math` field is delimiter-normalized TeX drawn from `<math alttext>` when present, falling back to `$…$` text (baseline side); MathML element text is excluded from the `text` field.

- [ ] **Step 1: Extend the extractor**

In `Extractor.__init__` add:

```python
        self.math_alt = []
        self._in_math = 0
```

At the top of `handle_starttag`:

```python
        if tag == "math":
            self.math_alt.append(a.get("alttext", ""))
            self._in_math += 1
            return
        if self._in_math:
            return  # tags inside <math> are rendering detail
```

In `handle_endtag`, first line:

```python
        if tag == "math" and self._in_math:
            self._in_math -= 1
            return
```

In `handle_data`, extend the guard: `if self._skip or self._in_math: return`.

In `summarize()`:

```python
    def norm_math(s):
        return " ".join(s.replace("$", " ").split())

    math = sorted(norm_math(m) for m in MATH_RE.findall(text) + ex.math_alt)
```

(`$$ \int f $$` from the baseline and alttext `\int f` from the new build both normalize to `\int f`; prose already excludes math on both sides.)

- [ ] **Step 2: Sanity-check extraction on one page**

```bash
python3 - <<'EOF'
import sys; sys.path.insert(0, "scripts")
from pathlib import Path
from semantic_diff import summarize
s = summarize(Path("/tmp/mathml-site-baseline/mathnotes/algebra/linear/determinants/index.html"))
print("baseline math count:", len(s["math"]), "| sample:", s["math"][:2])
EOF
```
Expected: nonzero math count from the `$…$` fallback on the baseline tree.

- [ ] **Step 3: Diff the new build against the baseline**

```bash
rm -rf /tmp/mathml-site-new
docker cp mathnotes-static-builder:/app/static-build/website /tmp/mathml-site-new
python3 scripts/semantic_diff.py /tmp/mathml-site-baseline /tmp/mathml-site-new
```

Expected: `CLEAN`. For every reported difference: math content differences are bugs (fix them — likely alttext escaping or a surface missed in Task 4); non-math differences must be individually explained and either fixed or confirmed against the Part-1 accepted-differences set (`docs/superpowers/specs/2026-07-09-remove-markdown-layer-design.md`). Do not proceed with unexplained diffs. Note: `links` includes `#anchor` hrefs, so this also proves heading ids and block labels survived.

- [ ] **Step 4: Commit**

```bash
git add scripts/semantic_diff.py
git commit -m "semantic_diff: extract math from MathML alttext"
```

---

### Task 10: Full verification, docs, owner gate

**Files:**
- Modify: `CLAUDE.md` (three stale statements)
- No other code — this task is evidence gathering.

- [ ] **Step 1: Full Python suite**

Run every command in CLAUDE.md's "Running Tests" section plus `test/test_mathml.py`. Expected: all PASS.

- [ ] **Step 2: Full-site crawl**

```bash
./scripts/crawl-dev.sh "http://web-dev:5000"
```
Expected: zero console errors, zero CSP violations across all pages.

- [ ] **Step 3: Page-weight spot check**

```bash
curl -s http://localhost:5000/mathnotes/algebra/linear/determinants/ | grep -ci mathjax   # expect 0
curl -so /dev/null -w '%{size_download}\n' http://localhost:5000/static/dist/main-*.css 2>/dev/null || true
docker exec mathnotes-static-builder sh -c 'du -sh static/dist'
```
Expected: no MathJax script reference in any page; total `static/dist` visibly smaller than before (the ~1MB+ MathJax bundle and its woff2 set are gone; the one-time cost added is the ~540KB STIX font).

- [ ] **Step 4: Update stale docs**

In `CLAUDE.md`:
- "MathJax handles final LaTeX rendering client-side" (Math Processing Pipeline) → "the build-time MathML worker (`scripts/tex2mml-worker.mjs` via `mathnotes/mathml.py`) renders final MathML at build time".
- "Jinja2 templates generate static HTML with MathJax for LaTeX" (Rendering, item 8) → "Jinja2 templates generate static HTML with native MathML".
- In "Math Rendering Seam": note `render_math()` now delegates to `mathnotes/mathml.py` and that unconvertible TeX fails the build with file:line.

Check `PARSING.md` for equivalent MathJax-era statements and update the same way.

```bash
git add CLAUDE.md PARSING.md
git commit -m "Document build-time MathML pipeline"
```

- [ ] **Step 5: Owner visual inspection — STOP and hand over**

This is the real quality gate for MathML Core rendering (spec §Verification 5) and it belongs to Jason. Present him a short list of URLs to eyeball, covering: a display-math-heavy page (aligned environments), a matrix-heavy page (`/mathnotes/algebra/linear/determinants/`), a page with a math block title and reference tooltips, and the block index. Ask him to check light + dark mode, desktop + mobile. **Do not declare the feature done until he signs off.** Also hand over the list (if any) of content errors that were left unfixed in Task 5.

---

## Self-Review Notes (done while writing)

- **Spec coverage:** worker (Task 1), converter + atexit/watch (Task 2), snippets/heading-ids/descriptions (Task 3), three plain-text surfaces incl. builder's global tooltip JSON (Task 4), seam swap + loud errors + QED note (Task 5), full client teardown incl. tooltip re-bootstrap (Task 6), font/CSS incl. overflow rule and dark-mode no-op (Task 7), production Node gap the spec didn't know about (Task 8), semantic diff (Task 9), crawl/page-weight/owner gate (Task 10). Non-goals respected: no content dialect changes, no numbering, no fallback.
- **Deliberate deviations from spec letter:** (1) display-math overflow styles `math[display='block']` directly instead of adding a wrapper element — same effect, no emitter change; (2) the worker excludes MathJax's `noundefined` package so undefined macros error loudly instead of rendering red text — required by the build-fails-loudly property.
- **Known risk, mitigated:** `content_snippet` can truncate a `$…$` span; `_INLINE_MATH_RE` only converts complete pairs, so truncated math degrades to inert escaped text (same words the old pipeline showed, minus client typesetting of a broken span — acceptable and rare; semantic diff will surface any case that matters).
- **Type consistency check:** `math_to_dollar_text` / `text_with_math_to_html` / `MathConversionError` / `get_converter` names match across all tasks; `convert(latex, display)` signature consistent; `initTooltipSystem` import path matches its export.
