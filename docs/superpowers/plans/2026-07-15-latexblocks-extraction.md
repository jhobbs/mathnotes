# latexblocks Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract mathnotes' LaTeX-dialect + structured-block + cross-reference pipeline into a standalone `latexblocks` Python library, then migrate mathnotes to consume it and add a latexblocks-powered glossary/definitions system to imagining-syntax.

**Architecture:** The library is the nine core modules (`latex_processor`, `structured_math`, `block_index`, `ref_resolver`, `page_renderer`, `content_loader`, `reverse_index`, `notation`, `mathml`) plus three prebuilt, committed assets: a self-contained Node MathML worker (ported from the un-bundleable `mathjax` npm package to `mathjax-full`), a standalone tooltip/label-copy JS bundle, and a standalone block/tooltip CSS file with variable fallbacks. Site-specific seams (the `/mathnotes/` URL prefix, the `content` dir, `.sty` and worker paths) become a `latexblocks.configure()` call. mathnotes keeps its site generator and becomes a consumer; imagining-syntax renders a glossary at Docker **build** time (node in a build stage only) so its runtime image stays a 4-dependency Flask slim image that never imports latexblocks.

**Tech Stack:** Python ≥3.10, pylatexenc==2.10, setuptools src-layout; Node ≥18 (library dev + math-rendering builds only), mathjax-full 3.2.2, esbuild, PostCSS (nesting/custom-media/lab/autoprefixer); pip installs via GitHub release tarball URLs.

## Global Constraints

- New repo: `/home/jason/latexblocks`, GitHub `jhobbs/latexblocks`, **public** (pip tarball installs need no auth), default branch `main`.
- Package name `latexblocks`, version starts at `0.1.0`. Runtime dependency: **only** `pylatexenc==2.10`. `requires-python = ">=3.10"`.
- Module names and public symbols are preserved: `latexblocks.latex_processor`, `.structured_math`, `.block_index`, `.ref_resolver`, `.page_renderer`, `.content_loader`, `.reverse_index`, `.notation`, `.mathml` plus new `.config`, `.assets`, `.mapper`. Dataclass field names (`BlockReference.block/.full_url/.page_title`, `MathBlock.*`) are load-bearing in mathnotes Jinja templates (`templates/block_index.html:26-28`) — do not rename.
- With `configure(url_prefix="/mathnotes", content_dir="content", sty_path=<mathnotes sty>)`, emitted HTML must be byte-identical to today's output. The mathnotes migration ends with a whole-site before/after HTML diff.
- Prebuilt assets (`assets/tex2mml-worker.mjs`, `assets/latexblocks.js`, `assets/latexblocks.css`, `assets/fonts/`) are **committed** to the library repo (lockfile-style, like `latex/mathnotes-notation.sty`); CI verifies freshness. Consumers never run npm.
- Distribution: `latexblocks @ https://github.com/jhobbs/latexblocks/archive/refs/tags/vX.Y.Z.tar.gz` in consumer requirements (works in python-slim images with no git binary).
- imagining-syntax's **runtime** image must not gain node or latexblocks; glossary artifacts are rendered in a Docker build stage. Its site keeps serving identical experiment content.
- mathnotes git policy: commits in the mathnotes repo happen only on explicit user go-ahead. Library-repo and imsyn-branch commits per task are normal. No AI attribution in commit messages.
- mathnotes tests keep running as stdin scripts in the dev container (no pytest there); library tests use pytest in the library repo.
- The host has no node today: Task 1 installs it user-locally via nvm AND symlinks node/npm/npx into `~/.local/bin` — nvm's bashrc hook does not load in the non-interactive shells later steps run in, so every later `node`/`npm` command relies on those symlinks.
- `/home/jason/mathnotes` and `/home/jason/imagining-syntax` are sibling checkouts of the library repo; Task 3's parity check and Task 9's dev mounts rely on those relative locations.

## Known-stale docs (do not be confused by them)

- `mathnotes/CLAUDE.md` mentions `mathnotes/security.py` and nginx serving production. **Both are stale**: security.py was deleted in commit f917a3f; production is gunicorn (`server/app.py`) via the Dockerfile stage 4. There is no CSP work in this plan.
- `mathnotes/` has **no** `__init__.py` (implicit namespace package rooted by `sys.path` hacks in `scripts/build_static_simple.py:12` and `scripts/watch_and_build.py:15`).
- There is no `url_mapper.py`; the URL mapper is `mathnotes/content_discovery.py` (`ContentDiscovery`).

---

# Phase 1 — the latexblocks library

### Task 1: Scaffold the library repo and toolchains

**Files:**
- Create: `/home/jason/latexblocks/pyproject.toml`
- Create: `/home/jason/latexblocks/.gitignore`
- Create: `/home/jason/latexblocks/src/latexblocks/__init__.py`
- Create: `/home/jason/latexblocks/README.md` (stub)
- Create: `/home/jason/latexblocks/LICENSE` (MIT, Jason Hobbs — swap if the user prefers another license)

**Interfaces:**
- Produces: an installable empty package `latexblocks` at `/home/jason/latexblocks` with a venv at `venv/` and working `node`/`npm` on the host. Later tasks run `./venv/bin/pytest` and `node` from this repo root.

- [ ] **Step 1: Ensure node ≥18 exists (host has none)**

```bash
node --version 2>/dev/null || {
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
  nvm install 22
  # nvm only loads in interactive shells; make node visible to every later
  # (non-interactive) step via ~/.local/bin, which is on PATH:
  mkdir -p ~/.local/bin
  ln -sf "$(dirname "$(nvm which 22)")"/node ~/.local/bin/node
  ln -sf "$(dirname "$(nvm which 22)")"/npm  ~/.local/bin/npm
  ln -sf "$(dirname "$(nvm which 22)")"/npx  ~/.local/bin/npx
}
node --version && npm --version   # both must work in a FRESH shell too
```

- [ ] **Step 2: Create the repo skeleton**

```bash
mkdir -p /home/jason/latexblocks/src/latexblocks /home/jason/latexblocks/test
cd /home/jason/latexblocks
git init -b main
```

`pyproject.toml`:

```toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "latexblocks"
version = "0.1.0"
description = "LaTeX-dialect structured math blocks -> HTML with cross-references, tooltips, and build-time MathML"
readme = "README.md"
requires-python = ">=3.10"
license = { text = "MIT" }
dependencies = ["pylatexenc==2.10"]

[project.optional-dependencies]
dev = ["pytest"]

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
latexblocks = ["assets/**/*"]

[tool.pytest.ini_options]
testpaths = ["test"]
```

`.gitignore`:

```
__pycache__/
*.egg-info/
venv/
node_modules/
dist/
```

`src/latexblocks/__init__.py` (placeholder until Task 4):

```python
"""latexblocks: structured LaTeX math blocks -> HTML with cross-references."""
__version__ = "0.1.0"
```

`README.md` stub: one line `# latexblocks` (fully written in Task 6).

- [ ] **Step 3: Venv + editable install + pytest smoke**

```bash
cd /home/jason/latexblocks
python3 -m venv venv
./venv/bin/pip install -e '.[dev]'
./venv/bin/python -c "import latexblocks; print(latexblocks.__version__)"   # 0.1.0
./venv/bin/pytest -q   # "no tests ran" is the expected PASS state
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Scaffold latexblocks package"
```

---

### Task 2: Verbatim module copy + green test baseline

Copy the nine modules and the five library-only test files **unchanged in behavior**, in a temporary layout that satisfies every existing relative-path computation, so the suite is green before any seam is touched. The temp layout: modules at `src/latexblocks/`, so `dirname(dirname(__file__))` inside them resolves to `src/` — hence the sty goes to `src/latex/mathnotes.sty` and the worker to `src/scripts/tex2mml-worker.mjs`. npm `mathjax` lands at the repo root, which the worker finds by ancestor-walk from `src/scripts/`.

**Files:**
- Create: `src/latexblocks/{latex_processor,structured_math,block_index,ref_resolver,page_renderer,content_loader,reverse_index,notation,mathml}.py` (copies)
- Create: `src/latex/mathnotes.sty`, `src/scripts/tex2mml-worker.mjs` (temporary locations, removed in Tasks 3–4)
- Create: `test/{test_latex_processor,test_structured_math,test_ref_resolver,test_mathml,test_notation}.py` (copies, imports rewritten)
- Create: `package.json` + `package-lock.json` (npm init; dependency `mathjax@3.2.2` — removed again in Task 3)

**Interfaces:**
- Consumes: source files from `/home/jason/mathnotes` (modules under `mathnotes/`, tests under `test/`, `latex/mathnotes.sty`, `scripts/tex2mml-worker.mjs`).
- Produces: importable `latexblocks.<module>` with today's exact behavior; `./venv/bin/pytest` green. Test files keep their `def test_*` + `__main__` structure (they are pytest-collectable as-is).

- [ ] **Step 1: Copy modules and assets**

```bash
MN=/home/jason/mathnotes
cd /home/jason/latexblocks
for m in latex_processor structured_math block_index ref_resolver page_renderer \
         content_loader reverse_index notation mathml; do
  cp "$MN/mathnotes/$m.py" src/latexblocks/
done
mkdir -p src/latex src/scripts
cp "$MN/latex/mathnotes.sty" src/latex/
cp "$MN/scripts/tex2mml-worker.mjs" src/scripts/
```

Intra-package imports are all relative (`from .structured_math import ...`) and need no edits.

- [ ] **Step 2: npm mathjax for the (still unported) worker**

```bash
npm init -y >/dev/null && npm install mathjax@3.2.2
node -e "console.log('node ok')"
```

- [ ] **Step 3: Copy the five LIB test files and rewrite imports**

```bash
for t in test_latex_processor test_structured_math test_ref_resolver test_mathml test_notation; do
  cp "$MN/test/$t.py" test/
done
sed -i 's/from mathnotes\./from latexblocks./g; s/from mathnotes import/from latexblocks import/g; s/import mathnotes\./import latexblocks./g; s/mathnotes\.latex_processor/latexblocks.latex_processor/g' test/*.py
grep -rn "mathnotes" test/*.py   # remaining hits must be prose/comments/sty filenames only — read each one
```

- [ ] **Step 4: Fix `test_mathml.py`'s ROOT so it spawns the temp-layout worker**

`test_mathml.py` computes a repo ROOT (lines ~15-24, falling back to `/app`) and spawns `node ROOT/scripts/tex2mml-worker.mjs`. Replace that ROOT block with:

```python
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src")
```

so `ROOT/scripts/tex2mml-worker.mjs` and the worker's own `../latex/mathnotes.sty` both resolve. Also delete the now-moot `sys.path` bootstrap comments about `<stdin>` if they confuse — the library tests run via pytest, never via stdin.

- [ ] **Step 5: Drop the `sys.path` bootstraps from all five tests**

Each file has a 3–8 line `sys.path.insert(...)` preamble (three variants; e.g. hardcoded `/app` fallbacks). Delete them — the package is pip-installed into the venv. Keep everything else identical.

- [ ] **Step 6: Run the suite — the green baseline**

```bash
./venv/bin/pytest -q
```

Expected: all tests pass (≈80+ tests across 5 files). This exact suite state is the regression contract for Tasks 3–4. If anything fails, fix the *harness* (paths, imports) — never the module code — before proceeding.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "Import nine core modules and library test suite from mathnotes (verbatim baseline)"
```

---

### Task 3: Port the MathML worker to mathjax-full and ship it as a committed bundle

The `mathjax` npm package cannot be esbuild-bundled (its loader does a fully dynamic `require(t)` — verified). Port the worker to `mathjax-full` 3.2.2's direct API, keep the JSON-lines protocol, `parseStyMacros`, `toMathMLCore`, and alttext handling **verbatim**, take the sty path as `argv[2]`, bundle to a single self-contained file, and prove equivalence against the old worker over every math expression in the real mathnotes content.

**Files:**
- Create: `frontend/worker/tex2mml-worker.mjs` (ported source)
- Create: `build.mjs` (asset builder; grows in Task 5)
- Create: `src/latexblocks/assets/tex2mml-worker.mjs` (committed esbuild output)
- Create: `scripts/parity_check.py`
- Modify: `src/latexblocks/mathml.py` (worker path + sty argv)
- Modify: `test/test_mathml.py` (spawn with sty argv; point at the bundle)
- Delete: `src/scripts/tex2mml-worker.mjs`; npm `mathjax` dependency

**Interfaces:**
- Consumes: `src/latex/mathnotes.sty` (still the temp location; Task 4 moves it), the old worker for parity.
- Produces: `MathConverter(worker_path: str = _WORKER_PATH, sty_path: str = _STY_PATH)` spawning `["node", worker_path, sty_path]`; `mathml.reset_converter()`; committed bundle at `src/latexblocks/assets/tex2mml-worker.mjs`. Protocol unchanged: `{"id", "latex", "display", "alttext"?}` → `{"id", "mathml"|"error"}`.

- [ ] **Step 1: Write the ported worker source**

`frontend/worker/tex2mml-worker.mjs` — copy the old worker (`src/scripts/tex2mml-worker.mjs`) and change ONLY the import/init/sty-path sections. `parseStyMacros`, `escapeAttr`, `toMathMLCore`, and the readline loop stay character-identical. New header:

```js
// Build-time LaTeX -> MathML worker. JSON-lines protocol on stdin/stdout:
//   {"id": 1, "latex": "x^2", "display": false}
//   -> {"id": 1, "mathml": "<math ...>"}  or  {"id": 1, "error": "message"}
// A TeX parse error is a per-request error response, never a crash;
// malformed protocol input terminates the worker with a nonzero exit.
// Usage: node tex2mml-worker.mjs <path-to-macros.sty>
import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';

import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SerializedMmlVisitor } from 'mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js';
// Package registrations (side-effect imports). The old mathjax.init loaded
// the 'input/tex' component = base+ams+newcommand+configmacros(+noundefined,
// autoload, require — the first dropped deliberately, the other two useless
// under the synchronous tex2mml API) plus eager cancel and html.
import 'mathjax-full/js/input/tex/base/BaseConfiguration.js';
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js';
import 'mathjax-full/js/input/tex/newcommand/NewcommandConfiguration.js';
import 'mathjax-full/js/input/tex/configmacros/ConfigMacrosConfiguration.js';
import 'mathjax-full/js/input/tex/cancel/CancelConfiguration.js';
import 'mathjax-full/js/input/tex/html/HtmlConfiguration.js';
import { STATE } from 'mathjax-full/js/core/MathItem.js';
```

Then, replacing the old `styPath` const and `mathjax.init` block:

```js
const styPath = process.argv[2];
if (!styPath) {
  process.stderr.write('tex2mml-worker: usage: node tex2mml-worker.mjs <macros.sty>\n');
  process.exit(1);
}

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({
  packages: ['base', 'ams', 'newcommand', 'configmacros', 'cancel', 'html'],
  macros: parseStyMacros(readFileSync(styPath, 'utf8')),
  formatError: (_jax, err) => { throw err; },
});
const doc = mathjax.document('', { InputJax: tex });
const visitor = new SerializedMmlVisitor();
```

and in the request handler, replace `MathJax.tex2mml(req.latex, {display: !!req.display})` with:

```js
    let mml = visitor.visitTree(
      doc.convert(req.latex, { display: !!req.display, end: STATE.CONVERT }));
```

`end: STATE.CONVERT` is load-bearing: the document has no OutputJax, and without it `convert()` runs on to the typeset phase and throws `Cannot read properties of null` on every request (this is why the canonical mathjax-full tex2mml demo passes it).

(`configmacros` is what makes the `macros:` option work — do not drop it.) Everything after that line (single-line collapse, `toMathMLCore`, alttext splice, response write) is unchanged from the old worker.

- [ ] **Step 2: Install build deps and write `build.mjs`**

```bash
npm install --save-dev mathjax-full@3.2.2 esbuild@0.19.12
```

(Keep the `mathjax` runtime dep from Task 2 installed for now — the OLD worker needs it until Step 7's parity check passes; Step 8 removes it.)

`build.mjs`:

```js
// Builds the committed assets in src/latexblocks/assets/.
// Task 5 extends this with the browser JS bundle and the CSS.
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['frontend/worker/tex2mml-worker.mjs'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  outfile: 'src/latexblocks/assets/tex2mml-worker.mjs',
  banner: { js: '// GENERATED by build.mjs from frontend/worker/ — do not edit.' },
});
console.log('built assets/tex2mml-worker.mjs');
```

```bash
node build.mjs
echo '{"id":1,"latex":"\\vec{v} + \\alpha^2","display":false}' | node src/latexblocks/assets/tex2mml-worker.mjs src/latex/mathnotes.sty
```

Expected: one line of JSON containing `"mathml":"<math ...` (the `\vec` macro proves sty macros loaded).

- [ ] **Step 3: Update `mathml.py` for the bundle + sty argv + reset hook**

In `src/latexblocks/mathml.py`: `MathConverter` gains an optional `sty_path` passed to the worker as `argv[2]`; the default worker path now points into `assets/`; `get_converter()` supplies a temporary sty default (Task 4 replaces it with config); add `reset_converter()`.

```python
_WORKER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            "assets", "tex2mml-worker.mjs")
# TEMP until Task 4: dirname(package) = src/, so this is src/latex/mathnotes.sty
_TEMP_STY_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                              "latex", "mathnotes.sty")


class MathConverter:
    def __init__(self, worker_path: str = _WORKER_PATH, sty_path: Optional[str] = None):
        self.worker_path = worker_path
        self.sty_path = sty_path
        self._proc: Optional[subprocess.Popen] = None
        self._next_id = 0

    def _spawn(self):
        cmd = ["node", self.worker_path]
        if self.sty_path:
            cmd.append(self.sty_path)
        # ... rest of _spawn unchanged (Popen + error message uses ' '.join(cmd))
```

```python
def get_converter() -> MathConverter:
    """Module-level singleton; atexit covers the build script and watch mode."""
    global _converter
    if _converter is None:
        _converter = MathConverter(_WORKER_PATH, _TEMP_STY_PATH)  # Task 4: config paths
        atexit.register(_converter.close)
    return _converter


def reset_converter() -> None:
    """Close and forget the worker singleton (configure() calls this)."""
    global _converter
    if _converter is not None:
        _converter.close()
    _converter = None
```

- [ ] **Step 4: Update `test/test_mathml.py`**

Its direct `subprocess.run([..., "node", worker, ...])` calls gain the sty argument; ROOT-based paths change:

```python
ASSETS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                      "src", "latexblocks", "assets")
WORKER = os.path.join(ASSETS, "tex2mml-worker.mjs")
STY = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "src", "latex", "mathnotes.sty")
```

Every spawn becomes `["node", WORKER, STY]`. Constructor call sites: the three **no-argument** `MathConverter()` constructions (test_mathml.py lines 119, 130, 144) become `MathConverter(WORKER, STY)`; the startup-failure test (line 156) keeps its bogus **worker** path (signature unchanged in position 1) — do not give it a sty.

- [ ] **Step 5: Run the mathml tests**

```bash
./venv/bin/pytest test/test_mathml.py -q
```

Expected: PASS. The `\tag`→`mtr` rewrite, `\cancel`→`mrow` rewrite, sty macros, error semantics, and alttext tests are the port's correctness gate.

- [ ] **Step 6: Write the corpus parity check**

`scripts/parity_check.py`:

```python
#!/usr/bin/env python3
"""One-shot equivalence check: old worker (npm mathjax) vs new bundle
(mathjax-full) over every math expression in the mathnotes content tree.
Run from the latexblocks repo root; requires ../../mathnotes... actually
/home/jason/mathnotes checked out."""
import re
import sys
from pathlib import Path

sys.path.insert(0, "src")
from latexblocks.mathml import MathConverter  # noqa: E402

CONTENT = Path("/home/jason/mathnotes/content")
STY = "src/latex/mathnotes.sty"
OLD = MathConverter("src/scripts/tex2mml-worker.mjs", None)  # old worker self-locates the sty
NEW = MathConverter("src/latexblocks/assets/tex2mml-worker.mjs", STY)

INLINE = re.compile(r"(?<!\$)\$([^$\n]+)\$(?!\$)")
DISPLAY = re.compile(r"\\\[(.+?)\\\]", re.DOTALL)

exprs = set()
for tex in sorted(CONTENT.rglob("*.tex")):
    src = tex.read_text(encoding="utf-8")
    exprs.update((m.strip(), False) for m in INLINE.findall(src))
    exprs.update((m.strip(), True) for m in DISPLAY.findall(src))

diffs = errors = same = 0
for latex, display in sorted(exprs):
    try:
        old = OLD.convert(latex, display)
    except Exception:
        errors += 1  # regex over-capture (not real math) — both sides skip
        continue
    new = NEW.convert(latex, display)
    if old == new:
        same += 1
    else:
        diffs += 1
        if diffs <= 10:
            print(f"DIFF ({'display' if display else 'inline'}): {latex!r}\n  old: {old[:200]}\n  new: {new[:200]}")
print(f"{same} identical, {diffs} different, {errors} skipped (old-worker errors)")
sys.exit(1 if diffs else 0)
```

- [ ] **Step 7: Run parity**

```bash
./venv/bin/python scripts/parity_check.py
```

Expected: `N identical, 0 different` over the full corpus (N in the thousands). If diffs appear, inspect them: attribute-order or namespace differences mean the serializer setup differs — fix the port (not the assertion) until zero. Only if a diff is *provably* cosmetically equivalent MathML and unavoidable, document it in the commit message and update `test_mathml` expectations deliberately.

- [ ] **Step 8: Remove the old worker and the mathjax dep; full suite**

```bash
git rm -r src/scripts
npm uninstall mathjax
./venv/bin/pytest -q
```

Expected: full suite green. (`scripts/parity_check.py` keeps a dangling reference to `src/scripts/` — that's fine; it's a one-shot tool. Add a comment noting it ran against commit history.)

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "Port MathML worker to mathjax-full; ship self-contained committed bundle (corpus parity: 0 diffs)"
```

---

### Task 4: `configure()` — parameterize every site-specific seam

Introduce `latexblocks.config` and thread it through the exact seam list below. Behavior under `configure(url_prefix="/mathnotes", content_dir="content")` must be identical to the Task 2 baseline — the existing suite (which asserts `/mathnotes/` URLs) enforces that via a conftest.

**Files:**
- Create: `src/latexblocks/config.py`, `src/latexblocks/assets.py` (path helpers; extended in Task 5), `src/latexblocks/mapper.py`, `test/conftest.py`, `test/test_config.py`
- Create: `src/latexblocks/assets/default.sty` (moved from `src/latex/mathnotes.sty`)
- Modify: `src/latexblocks/{latex_processor,notation,mathml,block_index,ref_resolver,page_renderer,__init__}.py`
- Modify: `test/test_mathml.py` (its `STY` constant points at the moved file)
- Delete: `src/latex/`

**Interfaces:**
- Consumes: `mathml.reset_converter()` (Task 3).
- Produces:
  - `latexblocks.configure(**kwargs) -> Config` / `latexblocks.get_config() -> Config` with fields `url_prefix: str = ""`, `content_dir: str = "content"`, `sty_path: Optional[str] = None` (None → packaged `default.sty`), `worker_path: Optional[str] = None` (None → packaged bundle), `notation_sty_path: str = "latex/mathnotes-notation.sty"`.
  - `latexblocks.config.sty_path() -> str`, `latexblocks.config.worker_path() -> str` (resolved).
  - `latexblocks.assets.default_sty_path() / worker_js_path()` returning filesystem paths into the installed package.
  - `latexblocks.mapper.UrlMapper` (a `typing.Protocol`: `url_mappings: Dict[str, str]`, `get_canonical_url(file_path: str) -> str`).
  - `configure()` resets ALL module state: notation registry, content cache, page cache, pre-expansion macros, worker singleton.

- [ ] **Step 1: Write the failing config tests**

`test/test_config.py` — note the autouse fixture: `configure()` is a full reset, and the session conftest (Step 5) sets `url_prefix="/mathnotes"` for the whole suite, so every config test must put the session config back or all later-collected test files fail their `/mathnotes/...` assertions:

```python
import dataclasses
import os
import tempfile

import pytest

import latexblocks
from latexblocks.config import get_config, sty_path, worker_path


@pytest.fixture(autouse=True)
def restore_session_config():
    """configure() is a wholesale reset; restore the suite's config (set by
    conftest: url_prefix=/mathnotes) after every test in this file."""
    saved = dataclasses.asdict(get_config())
    yield
    latexblocks.configure(**saved)


def test_defaults():
    latexblocks.configure()  # wholesale reset — all fields at defaults
    cfg = get_config()
    assert cfg.url_prefix == ""
    assert cfg.content_dir == "content"
    assert sty_path().endswith(os.path.join("assets", "default.sty"))
    assert worker_path().endswith(os.path.join("assets", "tex2mml-worker.mjs"))
    assert os.path.exists(sty_path()) and os.path.exists(worker_path())


def test_url_prefix_and_content_dir_flow_to_output():
    latexblocks.configure(url_prefix="/gl", content_dir="glossary")
    from latexblocks.latex_processor import parse_latex_file
    _, doc = parse_latex_file(
        "\\title{T}\n\\includegraphics{plot.png}\n", filepath="glossary/page.tex")
    html = doc.items[0]
    # content_dir stripped from the file's directory; prefix prepended
    assert 'src="/gl/plot.png"' in html


def test_configure_resets_preexpansion_cache():
    import latexblocks.latex_processor as lp
    from latexblocks.latex_processor import parse_latex_file
    parse_latex_file("\\title{T}\nhello\n", filepath="x.tex")
    assert lp._preexpansion_macros is not None
    latexblocks.configure()
    assert lp._preexpansion_macros is None


def test_custom_sty_path():
    with tempfile.TemporaryDirectory() as d:
        sty = os.path.join(d, "my.sty")
        with open(sty, "w") as f:
            f.write("% BEGIN PRE-EXPANSION MACROS\n\\def\\zz{Z}\n% END PRE-EXPANSION MACROS\n"
                    "% BEGIN MATH MACROS\n% END MATH MACROS\n")
        latexblocks.configure(sty_path=sty)
        from latexblocks.latex_processor import _load_preexpansion_macros
        assert _load_preexpansion_macros() == {"zz": "Z"}
```

Run: `./venv/bin/pytest test/test_config.py -q` — expected FAIL (`No module named latexblocks.config`).

- [ ] **Step 2: Write `config.py`**

```python
"""Library-wide configuration and module-state reset.

latexblocks keeps deliberate module-level state: the parse cache
(content_loader._tex_cache), the page-render cache (page_renderer._render_cache),
the notation registry (notation._registry), the pre-expansion macro table
(latex_processor._preexpansion_macros), and the MathML worker singleton
(mathml._converter). configure() replaces the config and resets all of it,
so call it once at application startup, before any parsing.
"""
import dataclasses
from typing import Optional


@dataclasses.dataclass(frozen=True)
class Config:
    # Prepended to every canonical URL the library emits, as
    # f"{url_prefix}/{canonical_url}". mathnotes: "/mathnotes"; a site
    # serving at the root uses "".
    url_prefix: str = ""
    # Scan root (cwd-relative or absolute) for BlockIndex.build_index and
    # the notation registry; also the prefix stripped from file paths when
    # deriving display titles and image URLs.
    content_dir: str = "content"
    # Macro package: PRE-EXPANSION MACROS (parser), MATH MACROS names
    # (notation collision check), MATH MACROS expansions (MathML worker).
    # None -> the packaged assets/default.sty.
    sty_path: Optional[str] = None
    # Node worker script. None -> the packaged assets/tex2mml-worker.mjs.
    worker_path: Optional[str] = None
    # Default output path for notation.write_notation_sty().
    notation_sty_path: str = "latex/mathnotes-notation.sty"


_config = Config()


def get_config() -> Config:
    return _config


def configure(**kwargs) -> Config:
    """Replace the configuration WHOLESALE: omitted kwargs revert to their
    defaults (a reset, not a merge — reconstruct the full call to change
    one field). Also resets every module-level cache/singleton."""
    global _config
    _config = Config(**kwargs)
    reset_state()
    return _config


def reset_state() -> None:
    """Clear every module-level cache/singleton (worker included)."""
    from . import latex_processor, mathml, notation
    from .content_loader import clear_content_cache
    from .page_renderer import clear_page_cache

    notation.reset_registry()
    clear_content_cache()
    clear_page_cache()
    latex_processor._preexpansion_macros = None
    mathml.reset_converter()


def sty_path() -> str:
    cfg = get_config()
    if cfg.sty_path is not None:
        return cfg.sty_path
    from .assets import default_sty_path
    return str(default_sty_path())


def worker_path() -> str:
    cfg = get_config()
    if cfg.worker_path is not None:
        return cfg.worker_path
    from .assets import worker_js_path
    return str(worker_js_path())
```

`assets.py` (initial):

```python
"""Paths to the packaged assets. Extended with web-asset helpers in Task 5."""
from pathlib import Path

_ASSETS = Path(__file__).parent / "assets"


def default_sty_path() -> Path:
    return _ASSETS / "default.sty"


def worker_js_path() -> Path:
    return _ASSETS / "tex2mml-worker.mjs"
```

`mapper.py`:

```python
"""The URL-mapper protocol every latexblocks consumer implements.

block_index and page_renderer call get_canonical_url(file_path); ref_resolver
iterates url_mappings (canonical URL -> file path) to resolve bare \\pagelink
slugs. mathnotes provides ContentDiscovery; a single-page consumer can be as
small as a two-method class over a one-entry dict.
"""
from typing import Dict, Protocol


class UrlMapper(Protocol):
    url_mappings: Dict[str, str]

    def get_canonical_url(self, file_path: str) -> str: ...
```

`__init__.py` becomes:

```python
"""latexblocks: structured LaTeX math blocks -> HTML with cross-references."""
from .config import Config, configure, get_config, reset_state

__all__ = ["Config", "configure", "get_config", "reset_state"]
__version__ = "0.1.0"
```

- [ ] **Step 3: Move the sty into the package**

```bash
git mv src/latex/mathnotes.sty src/latexblocks/assets/default.sty
rmdir src/latex 2>/dev/null || git rm -r src/latex
```

Task 3 hardcoded `STY = .../src/latex/mathnotes.sty` into `test/test_mathml.py` — repoint it at the moved file now:

```python
from latexblocks.assets import default_sty_path
STY = str(default_sty_path())
```

`default.sty` stays a verbatim copy of today's mathnotes.sty — the MATH MACROS (`\vec`, `\grad`, …) become the library's starter macro set, which also keeps the ported sty-dependent tests truthful. mathnotes keeps its own file and passes `sty_path` (Task 7); the two may diverge later by design.

- [ ] **Step 4: Thread config through the seams — exact edit list**

Every edit references the current line in the copied module (same numbers as mathnotes @ fc2c858):

1. `latex_processor.py:63-65` — delete `_STY_PATH`; `_load_preexpansion_macros()` becomes:
   ```python
   def _load_preexpansion_macros() -> Dict[str, str]:
       from .config import sty_path
       with open(sty_path(), "r", encoding="utf-8") as f:
           return _parse_preexpansion_macros(f.read())
   ```
2. `latex_processor.py:680-684` — `_fix_image_path` becomes:
   ```python
   def _fix_image_path(self, path: str) -> str:
       if re.match(r"^(https?:|data:|/)", path):
           return path
       from .config import get_config
       cfg = get_config()
       directory = os.path.dirname(self.filepath)
       root = cfg.content_dir.rstrip("/")
       if directory == root:
           directory = ""
       elif directory.startswith(root + "/"):
           directory = directory[len(root) + 1:]
       return f"{cfg.url_prefix}/{directory}/{path}".replace("//", "/")
   ```
3. `ref_resolver.py:173` and `:176` — both pagelink returns:
   ```python
   from .config import get_config  # add to module imports (top of file)
   ...
   return f'<a href="{get_config().url_prefix}/{canonical}">{text}</a>'
   ...
   return f'<a href="{get_config().url_prefix}/{url}">{text}</a>'
   ```
4. `page_renderer.py:74` — `"canonical_url": f"{get_config().url_prefix}/{canonical_url}",` (add `from .config import get_config` at top).
5. `block_index.py` — add `from .config import get_config` at top; replace all six `/mathnotes/` f-strings (lines 214, 248, 269, 282, 291, 339) with `prefix = get_config().url_prefix` at the top of each containing method and `f"{prefix}/{canonical_url}"` etc.; line 70 `content_dir = "content"` → `content_dir = get_config().content_dir`; line 23 `_ref_link_text` → strip the configured prefix:
   ```python
   def _ref_link_text(ref) -> str:
       from .config import get_config
       root = get_config().content_dir.rstrip("/") + "/"
       title = ref.source_title or ref.source_label or ref.source_file.replace(root, "")
       return text_with_math_to_html(title)
   ```
6. `notation.py:21-23` — delete `_STY_PATH`; `_sty_macro_names()` opens `config.sty_path()`. Lines 87/135/148: `scan_content(content_dir: Optional[str] = None)` resolving `content_dir = content_dir or get_config().content_dir`; `get_registry`/`refresh_registry` use `cfg = get_config()`: `scan_content(cfg.content_dir) if os.path.isdir(cfg.content_dir) else {}`. Line 180: `def write_notation_sty(path: Optional[str] = None)` with `path = path or get_config().notation_sty_path`.
7. `mathml.py` — `get_converter()` from Task 3 now reads config:
   ```python
   def get_converter() -> MathConverter:
       global _converter
       if _converter is None:
           from .config import sty_path, worker_path
           _converter = MathConverter(worker_path(), sty_path())
           atexit.register(_converter.close)
       return _converter
   ```
8. `block_index.py` prints → logging: add `import logging` / `logger = logging.getLogger(__name__)`; the seven `print(...)` calls at lines 63, 104, 110, 164, 221, 238, 261 become `logger.info(...)` (63, 104, 110, 164) and `logger.warning(...)` (221, 238, 261). Message text unchanged.

Do NOT touch: `structured_math.py`'s function-local `from .latex_processor import render_math` (the late-bound seam that `test_structured_math.py` monkeypatches), `PageRenderer(None, None)` constructibility, `content_loader`'s `.tex`-only rejection, `notation._STY_HEADER` wording.

- [ ] **Step 5: `test/conftest.py` — mathnotes-shaped config for the ported suite**

```python
"""The ported suite asserts mathnotes-era output (/mathnotes/ URLs, the
mathnotes macro set). Configure once per session; content_dir stays the
relative default "content" because several tests chdir into tempdirs that
create their own content/ tree."""
import latexblocks


def pytest_configure(config):
    latexblocks.configure(url_prefix="/mathnotes")
```

Note: `configure()` closes the worker; it runs once before tests, so worker reuse across tests is preserved (test_mathml's singleton-identity test still holds).

- [ ] **Step 6: Full suite + config tests**

```bash
./venv/bin/pytest -q
```

Expected: everything green — the old assertions (e.g. `test_href_and_images`' `/mathnotes/test/plot.png`, `test_pagelink`'s `/mathnotes/topology/compact-sets/`) now pass *because of* the conftest configure, proving prefix-threading is complete. Grep to prove no literal remains:

```bash
grep -rn '"/mathnotes\|/mathnotes/{' src/latexblocks/ && echo "LEAK" || echo "clean"
grep -rn '"content"' src/latexblocks/*.py
# EXACTLY two legitimate hits remain: config.py's content_dir default, and
# page_renderer.py's result-dict key `"content": html_content` (a frozen
# API key — do NOT rename it). Anything else is a missed seam.
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "Add configure(): url_prefix, content_dir, sty/worker paths; state reset; logging"
```

---

### Task 5: Web assets — tooltip JS, label-copy JS, standalone CSS, fonts

The browser half of the block contract: `tooltip-system.ts` (zero imports — copies verbatim), the label-copy behavior extracted from `mathblock-toggle.ts` (the statements-toggle itself is mathnotes site policy and stays there), and a standalone CSS file assembled from the exact mathnotes rule ranges, compiled through the same PostCSS pipeline, with `:root` variable fallbacks so it works with no site theme at all.

**Files:**
- Create: `frontend/src/tooltip-system.ts` (copy of `demos-framework/src/tooltip-system.ts`, 347 lines, unchanged)
- Create: `frontend/src/label-copy.ts`, `frontend/src/index.ts`
- Create: `frontend/css/latexblocks.css` (source), `frontend/fonts/LatinModernMath-Regular.woff2` + `GUST-FONT-LICENSE.txt` (copies from `styles/fonts/`)
- Modify: `build.mjs`, `package.json` (postcss deps), `src/latexblocks/assets.py`
- Create: committed outputs `src/latexblocks/assets/{latexblocks.js,latexblocks.css,fonts/*}`
- Create: `test/test_assets.py`

**Interfaces:**
- Produces:
  - `latexblocks.assets.web_css_path() -> Path`, `web_js_path() -> Path`, `copy_web_assets(dest_dir) -> None` (copies `latexblocks.css`, `latexblocks.js`, `fonts/` into `dest_dir`).
  - Browser contract (consumed by both sites): a JSON **array** in `<script type="application/json" id="tooltip-data">` with objects `{label, type, title, content, url, is_synonym, synonym_of, synonym_title}` (exactly `ref_resolver.tooltip_entry` plus `label`); the JS binds `a.block-reference, .notation-ref[data-ref-label]`, navigates `.notation-ref[data-ref-url]`, and rewrites `.block-label-ref` to the ※ copy affordance. Theming is pure CSS (`prefers-color-scheme`).

- [ ] **Step 1: Copy tooltip-system and the fonts**

```bash
MN=/home/jason/mathnotes
mkdir -p frontend/src frontend/css frontend/fonts
cp "$MN/demos-framework/src/tooltip-system.ts" frontend/src/
cp "$MN/styles/fonts/LatinModernMath-Regular.woff2" "$MN/styles/fonts/GUST-FONT-LICENSE.txt" frontend/fonts/
```

- [ ] **Step 2: Write `label-copy.ts` and `index.ts`**

`frontend/src/label-copy.ts` — the `initLabelCopyToClipboard` function moved verbatim from `demos-framework/src/mathblock-toggle.ts:45-97`, with `export` added:

```ts
export function initLabelCopyToClipboard(): void {
    // ... body copied character-for-character from mathblock-toggle.ts:46-96 ...
}
```

`frontend/src/index.ts`:

```ts
// latexblocks browser bundle: reference tooltips + \@{label} copy affordance.
// Load with <script defer src=".../latexblocks.js"></script>; tooltip data
// comes from <script type="application/json" id="tooltip-data">.
import { initTooltipSystem } from './tooltip-system';
import { initLabelCopyToClipboard } from './label-copy';

function init(): void {
  initTooltipSystem();          // idempotent (module-level singleton guard)
  initLabelCopyToClipboard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

- [ ] **Step 3: Assemble the CSS source**

`frontend/css/latexblocks.css` structure (assemble by copying the exact mathnotes rule ranges; keep the postcss-nesting `&` syntax — the build compiles it):

```css
/* latexblocks standalone stylesheet.
   Source of truth for block cards, reference links, tooltips, embeds,
   the Referenced-by panel, and MathML fixups. Every custom property has
   a site-overridable definition below: load this file BEFORE the site
   theme so the site's :root values win. */

@custom-media --dark (prefers-color-scheme: dark);
/* Needed by the Referenced-by panel's mobile block (copied from
   block-index.module.css 132-141); value from mathnotes main.css:19.
   Without this declaration postcss ships a literal `@media (--phone)`,
   which browsers silently ignore. */
@custom-media --phone (max-width: 640px);

:root {
  /* Copy the VALUE of each var below from mathnotes styles/theme.css :root
     (lines 2-256). Vars consumed by the extracted rules:
     --color-{definition,theorem,lemma,proposition,corollary,axiom,proof,
              example,remark,note,intuition,exercise,solution}    (theme.css 85-97)
     --color-nested-*   (110-117)   --color-type-*   (100-107)
     --color-tooltip-bg (81) --color-tooltip-footer-bg (82)
     --color-text (52) --color-text-secondary (53) --color-text-heading (54)
     --color-link (57) --color-border (64) --color-code-bg (49)
     --color-bg (46) --color-bg-secondary (47) --color-card-bg (48)
     --color-error* (68-71) --color-overlay-light (75) --color-spinner-border (78)
     --color-embedded-bg (120) --color-primary
     --space-* (130-146) --font-size-* (149-155) --line-height-relaxed (159)
     --border-width-* (162-166) --radius-* (168-174) --shadow-* (177-184)
     --transition-* (187-189) --z-sticky (194)
     --size-tooltip-min (209) --size-tooltip-max (210) --size-spinner (211)
     --gap-* (227-232) --width-content-base (216) */

  /* Consumed in mathnotes but never defined there — define here: */
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --color-text-muted: var(--color-text-secondary);
  --color-success: #1a7f37;
  --color-code-green: #1a7f37;
  --text-primary: var(--color-text);
  --text-secondary: var(--color-text-secondary);
  --card-background: var(--color-card-bg);
  --border-color: var(--color-border);
}

@media (--dark) {
  :root {
    /* dark values for the same vars, copied from theme.css
       @media (prefers-color-scheme: dark) block (lines 259-353) */
  }
}

/* ===== rules copied verbatim from mathnotes ===== */
/* main.css 200-216   .block-reference link treatment          */
/* main.css 231-240   a.block-reference:has(math)              */
/* main.css 244-251   .math-block-title a:has(math)            */
/* main.css 254-265   .block-reference-error                   */
/* main.css 375-661   .math-block cards, header, synonyms,
                      notation, tags, nested variants, errors  */
/* main.css 731-761   .embedded-block/.embedded-header/.embedded-source */
/* main.css 764-796   .block-label-ref (+ .copied/.failed)     */
/* main.css 799-805   EXCLUDED — .block-index-page policy stays in mathnotes */
/* main.css 809-820   .embed-error                             */
/* main.css 823-1026  .math-tooltip family + mobile breakpoint */
/* math.css 3-14      @font-face Latin Modern Math (URL becomes
                      url('./fonts/LatinModernMath-Regular.woff2')) + math sizing */
/* math.css 18-48     display-math overflow, \tag support (math-tagged/math-tag) */
/* math.css 52-60     .mml-cancel strike                        */
/* math.css 68-76     math .notation-ref[data-ref-url]          */
/* block-index.module.css 57-141: the Referenced-by panel rules, with every
   `.block-index-page ` scope prefix REMOVED (the library styles the panel;
   whether/where it displays is site policy). Do NOT copy lines 52-54
   (display:none) — that is mathnotes policy. Replace its dark-only
   --text-secondary/--text-primary/--card-background/--border-color usages
   with the always-defined aliases declared above. */
```

Copy each range with `sed -n 'START,ENDp' $MN/styles/main.css >> frontend/css/latexblocks.css` etc., then verify by name: the assembled file must contain rules for `.math-block`, `.math-block-header`, `.math-block-type`, `.math-block-title`, `.block-synonyms`, `.block-notation`, `.block-tags`, `.block-tag`, `.block-label-ref`, `.math-block-content`, `.math-block-nested`, `.math-block-error`, `.block-reference`, `.synonym-reference`, `.block-reference-error`, `.embedded-block`, `.embedded-source`, `.embed-error`, `.math-tooltip*`, `.block-references-section`, `.direct-references`, `.transitive-references`, `.ref-type`, `.notation-ref`, `.math-tagged`, `.math-tag`, `.mml-cancel` — and must NOT contain `.math-content-toggle` or `.block-index-page`.

- [ ] **Step 4: Extend `build.mjs` with JS + CSS + fonts**

```bash
npm install --save-dev typescript@5.3.3 postcss@8.5.6 postcss-nesting@12.1.5 \
  postcss-custom-media@10.0.8 postcss-lab-function@6.0.19 autoprefixer@10.4.21
```

Append to `build.mjs`:

```js
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';
import postcssCustomMedia from 'postcss-custom-media';
import postcssLab from 'postcss-lab-function';
import autoprefixer from 'autoprefixer';

// Browser bundle (iife: plain <script defer> tag, no module semantics needed)
await esbuild.build({
  entryPoints: ['frontend/src/index.ts'],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: true,
  outfile: 'src/latexblocks/assets/latexblocks.js',
  banner: { js: '// GENERATED by build.mjs from frontend/src/ — do not edit.' },
});

// CSS through the same PostCSS pipeline mathnotes uses
const css = readFileSync('frontend/css/latexblocks.css', 'utf8');
const result = await postcss([
  postcssNesting, postcssCustomMedia, postcssLab({ preserve: true }), autoprefixer,
]).process(css, { from: 'frontend/css/latexblocks.css' });
writeFileSync('src/latexblocks/assets/latexblocks.css',
  '/* GENERATED by build.mjs from frontend/css/ — do not edit. */\n' + result.css);

// Fonts
mkdirSync('src/latexblocks/assets/fonts', { recursive: true });
for (const f of readdirSync('frontend/fonts')) {
  copyFileSync(`frontend/fonts/${f}`, `src/latexblocks/assets/fonts/${f}`);
}
console.log('built assets/latexblocks.js, assets/latexblocks.css, assets/fonts/');
```

```bash
node build.mjs
```

- [ ] **Step 5: Extend `assets.py` and write the failing asset tests**

Append to `src/latexblocks/assets.py`:

```python
import shutil


def web_css_path() -> Path:
    return _ASSETS / "latexblocks.css"


def web_js_path() -> Path:
    return _ASSETS / "latexblocks.js"


def copy_web_assets(dest_dir) -> None:
    """Copy the browser assets (css, js, fonts/) into a site's static dir."""
    dest = Path(dest_dir)
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copy(web_css_path(), dest / "latexblocks.css")
    shutil.copy(web_js_path(), dest / "latexblocks.js")
    shutil.copytree(_ASSETS / "fonts", dest / "fonts", dirs_exist_ok=True)
```

`test/test_assets.py`:

```python
import latexblocks.assets as assets


def test_packaged_assets_exist():
    for p in (assets.default_sty_path(), assets.worker_js_path(),
              assets.web_css_path(), assets.web_js_path()):
        assert p.exists(), p


def test_css_covers_the_emitted_contract():
    css = assets.web_css_path().read_text(encoding="utf-8")
    for cls in (".math-block", ".block-reference", ".math-tooltip",
                ".embedded-block", ".block-label-ref", ".block-references-section",
                ".mml-cancel", ".math-tag"):
        assert cls in css, cls
    assert ".math-content-toggle" not in css      # mathnotes site policy
    assert ".block-index-page" not in css         # mathnotes site policy


def test_js_binds_the_contract():
    js = assets.web_js_path().read_text(encoding="utf-8")
    assert "tooltip-data" in js
    assert "block-reference" in js
    assert "block-label-ref" in js


def test_copy_web_assets(tmp_path):
    assets.copy_web_assets(tmp_path)
    assert (tmp_path / "latexblocks.css").exists()
    assert (tmp_path / "latexblocks.js").exists()
    assert (tmp_path / "fonts" / "LatinModernMath-Regular.woff2").exists()
```

```bash
./venv/bin/pytest test/test_assets.py -q   # PASS (assets were built in Step 4)
./venv/bin/pytest -q                        # full suite green
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Ship browser assets: tooltip system, label copy, standalone block/tooltip CSS, math fonts"
```

---

### Task 6: Port remaining lib tests, README, CI, publish v0.1.0

**Files:**
- Create: `test/test_cache_invalidation.py` (ported core subset), `test/test_reference_snippets.py` (ported)
- Create: `.github/workflows/ci.yml`, finished `README.md`
- Modify: `test/conftest.py` (add the shared `DictUrlMapper`)

**Interfaces:**
- Consumes: everything from Tasks 2–5.
- Produces: GitHub repo `jhobbs/latexblocks` (public) with tag `v0.1.0`; the pip URL `https://github.com/jhobbs/latexblocks/archive/refs/tags/v0.1.0.tar.gz` used by Tasks 7 and 11. Test helper `DictUrlMapper(mapping: dict[str, str])` in conftest.

- [ ] **Step 1: Add `DictUrlMapper` to `test/conftest.py`**

```python
class DictUrlMapper:
    """Minimal latexblocks.mapper.UrlMapper for tests: canonical URL -> path."""
    def __init__(self, mapping):
        self.url_mappings = dict(mapping)
        self._reverse = {v: k for k, v in self.url_mappings.items()}

    def get_canonical_url(self, file_path):
        return self._reverse[file_path.replace("\\", "/")]
```

- [ ] **Step 2: Port `test_reference_snippets.py`**

Copy from mathnotes, rewrite imports as in Task 2 Step 3, drop the sys.path bootstrap. The two unit tests (`test_content_snippet_flattens_references`, `..._custom_and_typed_references`) port unchanged. The e2e test (`test_rendered_link_text_has_no_raw_references`, old lines 77-111) is a **cross-file** reference test: inside its tempdir it writes TWO files, `content/test/defining.tex` and `content/test/referencing.tex`, and renders the latter — keep that fixture exactly, and replace only the `ContentDiscovery` setup with the conftest mapper covering **both** files (BlockIndex scans the whole content dir and calls `get_canonical_url` on every `.tex` it finds):

```python
from conftest import DictUrlMapper  # pytest puts test/ on sys.path (no __init__.py)
mapper = DictUrlMapper({"test/defining/": "content/test/defining.tex",
                        "test/referencing/": "content/test/referencing.tex"})
index = BlockIndex(mapper)
index.build_index()
```

(the `render_page("content/test/referencing.tex")` call and all assertions stay identical — output URLs still say `/mathnotes/...` thanks to the session configure). Run `./venv/bin/pytest test/test_reference_snippets.py -q` → PASS.

- [ ] **Step 3: Port the core of `test_cache_invalidation.py`**

Copy, rewrite imports, drop sys.path bootstrap. ContentDiscovery appears in FOUR places that all need rework (not just one helper): the module-level import at old line 23 (delete it — `latexblocks.content_discovery` does not exist), and the in-test setup pairs `url_mapper = ContentDiscovery(); url_mapper.build_url_mappings()` at old lines 63-64, 105-106, 146-147, 192-193 (each becomes `url_mapper = make_mapper()`). Add this rescan helper:

```python
def make_mapper(root="content"):
    mapping = {}
    for dirpath, _, files in os.walk(root):
        for f in sorted(files):
            if f.endswith(".tex"):
                p = os.path.join(dirpath, f).replace("\\", "/")
                slug = p[len(root) + 1:-len(".tex")] + "/"
                mapping[slug] = p
    return DictUrlMapper(mapping)
```

`incremental_rebuild()` currently calls `url_mapper.build_url_mappings()` — `DictUrlMapper` has no such method, so rewrite it to reassign a fresh mapper on the live index (mirroring the rescan) and rebuild:

```python
def incremental_rebuild(block_index):
    block_index.url_mapper = make_mapper()
    block_index.build_index()
```

The same `BlockIndex`/`PageRenderer` instances persist across calls — the invalidation logic under test is unchanged. **Drop** `test_url_mappings_drop_deleted_files` (pure ContentDiscovery behavior; it stays in mathnotes). Keep the notation-expansion-invalidates-page-cache test (it exercises `refresh_registry`'s cross-cache clearing). Run → PASS.

- [ ] **Step 4: CI workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - uses: actions/setup-node@v4
        with: { node-version: "22" }
      - run: npm ci
      - run: node build.mjs
      - name: committed assets are fresh
        run: git diff --exit-code src/latexblocks/assets
      - run: pip install -e '.[dev]'
      - run: pytest -q
```

- [ ] **Step 5: Write the real README**

Sections (write them fully, ~150 lines): what it is (the dialect + blocks + cross-refs + MathML in one paragraph); install (`pip install "latexblocks @ https://github.com/jhobbs/latexblocks/archive/refs/tags/v0.1.0.tar.gz"`); runtime requirements (node ≥18 on PATH **only if content contains math**); 20-line quickstart (configure → mapper → BlockIndex → PageRenderer → page dict); `configure()` reference table (the five fields); the UrlMapper protocol; the browser contract (`copy_web_assets`, the `tooltip-data` island, selector list); the `.sty` contract (PRE-EXPANSION / MATH MACROS marker sections); development (`npm ci && node build.mjs`, committed assets, pytest); consumers (mathnotes, imagining-syntax).

- [ ] **Step 6: Publish and tag**

```bash
./venv/bin/pytest -q                            # final green check
git add -A && git commit -m "Port remaining library tests; add CI and README"
gh repo create jhobbs/latexblocks --public --source . --push
git tag v0.1.0 && git push origin v0.1.0
# verify the tarball pip-installs cold:
python3 -m venv /tmp/lbtest && /tmp/lbtest/bin/pip install \
  "latexblocks @ https://github.com/jhobbs/latexblocks/archive/refs/tags/v0.1.0.tar.gz"
/tmp/lbtest/bin/python -c "import latexblocks, latexblocks.assets as a; print(a.worker_js_path().exists())"  # True
```

---

# Phase 2 — migrate mathnotes

> All Phase 2 commits require the user's explicit go-ahead (mathnotes repo policy). Do the work, verify, then pause and show the diff summary before committing.

### Task 7: Swap mathnotes onto the library

**Files:**
- Modify: `requirements.in`, `requirements.txt`, `mathnotes/config.py`, `mathnotes/content_discovery.py:4`, `mathnotes/navigation.py:9`, `mathnotes/file_utils.py:7`, `mathnotes/sources.py:102`, `mathnotes/sitegenerator/builder.py:13-15,106,192`, `scripts/build_static_simple.py`, `scripts/watch_and_build.py:67-69,106`, `test/test_cache_invalidation.py`, `test/test_latex_integration.py`, `test/test_reference_snippets.py`, `Dockerfile`, `Dockerfile.dev`, `CLAUDE.md`
- Delete: `mathnotes/{latex_processor,structured_math,block_index,ref_resolver,page_renderer,content_loader,reverse_index,notation,mathml}.py`, `scripts/tex2mml-worker.mjs`, `test/{test_latex_processor,test_structured_math,test_ref_resolver,test_mathml,test_notation}.py`

**Interfaces:**
- Consumes: `latexblocks` v0.1.0 (tarball URL), `latexblocks.configure`, all nine modules under their new package.
- Produces: `mathnotes.config.configure_latexblocks()` — the single site-config call used by build script, watcher, builder, and the remaining tests.

- [ ] **Step 1: Take a baseline build for the Task 10 diff**

```bash
cd /home/jason/mathnotes
docker compose -f docker-compose.dev.yml up -d --build
docker exec mathnotes-static-builder python scripts/build_static_simple.py --output /tmp/site-before
docker cp mathnotes-static-builder:/tmp/site-before /tmp/site-before
```

- [ ] **Step 2: Dependencies**

Append to `requirements.in` and `requirements.txt` (keep pip-compile ordering conventions; the pinned file accepts direct references verbatim):

```
latexblocks @ https://github.com/jhobbs/latexblocks/archive/refs/tags/v0.1.0.tar.gz
```

- [ ] **Step 3: `mathnotes/config.py` gains the site configure call**

```python
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent


def configure_latexblocks():
    """Point latexblocks at this site's layout. Absolute sty paths: tests
    and the watcher chdir into tempdirs, and content_dir must stay relative
    ("content") for exactly that reason."""
    import latexblocks

    latexblocks.configure(
        url_prefix="/mathnotes",
        content_dir="content",
        sty_path=str(_REPO_ROOT / "latex" / "mathnotes.sty"),
        notation_sty_path=str(_REPO_ROOT / "latex" / "mathnotes-notation.sty"),
    )
```

- [ ] **Step 4: Rewrite every import site (exact list from recon)**

| File:line | Old | New |
|---|---|---|
| `mathnotes/content_discovery.py:4` | `from .content_loader import load_content_file` | `from latexblocks.content_loader import load_content_file` |
| `mathnotes/navigation.py:9` | same | same pattern |
| `mathnotes/file_utils.py:7` | same | same pattern |
| `mathnotes/sources.py:102` | `from .content_loader import load_content_file` | `from latexblocks.content_loader import load_content_file` |
| `mathnotes/sitegenerator/builder.py:13` | `from mathnotes.page_renderer import PageRenderer` | `from latexblocks.page_renderer import PageRenderer` |
| `mathnotes/sitegenerator/builder.py:14` | `from mathnotes.block_index import BlockIndex` | `from latexblocks.block_index import BlockIndex` |
| `mathnotes/sitegenerator/builder.py:106` | `from mathnotes.ref_resolver import tooltip_entry` | `from latexblocks.ref_resolver import tooltip_entry` |
| `mathnotes/sitegenerator/builder.py:192` | `from mathnotes.notation import write_notation_sty` | `from latexblocks.notation import write_notation_sty` |
| `scripts/watch_and_build.py:69` | `from mathnotes.page_renderer import clear_page_cache` | `from latexblocks.page_renderer import clear_page_cache` |
| `scripts/watch_and_build.py:106` | `from mathnotes import notation` | `from latexblocks import notation` |

And add the configure call at three entry points:
1. `scripts/build_static_simple.py` — in `main()`, before `SiteBuilder(...)`:
   ```python
   from mathnotes.config import configure_latexblocks
   configure_latexblocks()
   ```
2. `scripts/watch_and_build.py` — immediately after the `SiteBuilder` import block (line ~67), before any build:
   ```python
   from mathnotes.config import configure_latexblocks
   configure_latexblocks()
   ```
   (the watcher's `notation.refresh_registry()` at line 108 must never run under default config).
3. `mathnotes/sitegenerator/builder.py` — first line of `SiteBuilder.__init__`, belt-and-braces:
   ```python
   from mathnotes.config import configure_latexblocks
   configure_latexblocks()
   ```

- [ ] **Step 5: Delete moved code and tests**

```bash
cd /home/jason/mathnotes
git rm mathnotes/{latex_processor,structured_math,block_index,ref_resolver,page_renderer,content_loader,reverse_index,notation,mathml}.py
git rm scripts/tex2mml-worker.mjs
git rm test/{test_latex_processor,test_structured_math,test_ref_resolver,test_mathml,test_notation}.py
grep -rn "from mathnotes\.\(latex_processor\|structured_math\|block_index\|ref_resolver\|page_renderer\|content_loader\|reverse_index\|notation\|mathml\)\|from \.\(latex_processor\|structured_math\|block_index\|ref_resolver\|page_renderer\|content_loader\|reverse_index\|notation\|mathml\)" \
  mathnotes/ scripts/ test/ server/ && echo "STALE IMPORTS" || echo "clean"
```

- [ ] **Step 6: Fix the three remaining test files**

In `test/test_cache_invalidation.py`, `test/test_latex_integration.py`, `test/test_reference_snippets.py`:
- rewrite core-module imports `mathnotes.X` → `latexblocks.X` (same sed as Task 2 Step 3, but ONLY for the nine module names — `mathnotes.content_discovery`, `mathnotes.config`, `mathnotes.navigation` stay);
- at the top of each file's setup (before any parsing/index building), add:
  ```python
  from mathnotes.config import configure_latexblocks
  configure_latexblocks()
  ```
  (absolute sty paths make this correct inside their tempdir `chdir`s).

- [ ] **Step 7: Dockerfiles**

`Dockerfile` stage 3 ("builder"):
- line 56: remove `scripts/tex2mml-worker.mjs` from the `COPY` (keep `build_static_simple.py`).
- line 59: delete `COPY --from=esbuild-builder /app/node_modules/mathjax ./node_modules/mathjax`.
- Keep the nodejs install (lines 38-43) — the packaged worker still runs under node.
`Dockerfile.dev`: no worker/mathjax lines exist; nothing to change beyond rebuild picking up requirements.

- [ ] **Step 8: Rebuild dev and run everything in-container**

```bash
docker compose -f docker-compose.dev.yml up -d --build
docker logs -f mathnotes-static-builder   # until "Block index built: ..." then Ctrl-C
docker exec -i mathnotes-static-builder python3 - < test/test_cache_invalidation.py
docker exec -i mathnotes-static-builder python3 - < test/test_latex_integration.py
docker exec -i mathnotes-static-builder python3 - < test/test_reference_snippets.py
docker exec -i mathnotes-static-builder python3 - < test/test_watcher.py
```

Expected: builder container stays up, initial build succeeds, all four scripts exit 0.

- [ ] **Step 9: Update CLAUDE.md test list + architecture pointers**

Remove the five moved test commands; add a line: "Core LaTeX/block/reference pipeline lives in the latexblocks library (github.com/jhobbs/latexblocks); its tests run there via pytest." Update the Architecture/'Processing Components' section to name `latexblocks` as the provider of items 2-6 and `mathnotes/config.py:configure_latexblocks()` as the wiring point. Fix the stale `security.py` mention while touching that section.

- [ ] **Step 10: PAUSE — show the user the diff summary; commit only on go-ahead**

```bash
git add -A && git status && git diff --cached --stat
# on user approval:
git commit -m "Consume latexblocks for the core parse/index/render pipeline"
```

---

### Task 8: mathnotes frontend consumption (JS/CSS from the library)

**Files:**
- Modify: `mathnotes/sitegenerator/builder.py` (`copy_static_assets`), `templates/base.html`, `demos-framework/src/main.ts:24,99`, `demos-framework/src/mathblock-toggle.ts`, `styles/main.css`, `styles/math.css`, `styles/pages/block-index.module.css`, `package.json`
- Delete: `demos-framework/src/tooltip-system.ts`

**Interfaces:**
- Consumes: `latexblocks.assets.copy_web_assets` (Task 5).
- Produces: pages loading `/static/dist/latexblocks.css` (before the site bundle) and `/static/dist/latexblocks.js`; the site bundle no longer contains tooltip/label-copy code or the extracted CSS rules.

- [ ] **Step 1: Builder copies the library assets**

In `SiteBuilder.copy_static_assets` (builder.py:135-159), after the existing `shutil.copytree` of `./static`:

```python
from latexblocks.assets import copy_web_assets
copy_web_assets(self.output_dir / "static" / "dist")
```

- [ ] **Step 2: Templates**

`templates/base.html`:
- before line 54's `<link rel="stylesheet" href="{{ css_url }}">` add (library first so site vars win):
  ```html
  <link rel="stylesheet" href="/static/dist/latexblocks.css">
  ```
- after line 92's main script tag add:
  ```html
  <script defer src="/static/dist/latexblocks.js"></script>
  ```
The `tooltip-data` island (lines 87-89) is already exactly the contract — unchanged.

- [ ] **Step 3: Remove the moved JS from the site bundle**

- `demos-framework/src/main.ts`: delete line 24 (`import { initTooltipSystem } ...`) and line 99 (`initTooltipSystem();`).
- `demos-framework/src/mathblock-toggle.ts`: delete `initLabelCopyToClipboard` (lines 45-97) and its call at line 101 (the comment line 100 too). The statements-toggle stays.
- `git rm demos-framework/src/tooltip-system.ts`
- Remove the mathjax dependency **with the lockfile kept in sync** — `npm ci` (run by both Dockerfile.dev:22 and the prod esbuild stage) hard-fails if package.json and package-lock.json disagree, so hand-editing package.json alone breaks every Docker build:
  ```bash
  cd /home/jason/mathnotes
  npm uninstall mathjax --package-lock-only   # updates package.json AND package-lock.json, no node_modules needed
  git diff --stat package.json package-lock.json   # both must show changes
  ```

- [ ] **Step 4: Delete the extracted CSS rules from mathnotes**

Delete exactly the ranges copied into the library in Task 5 Step 3 (they are now served by `latexblocks.css`):
- `styles/main.css`: 200-216, 231-240, 244-251, 254-265, 375-661, 731-761, 764-796, 809-820, 823-1026. KEEP: 218-229 (generic `a:has(math)`), 682-728 (`.math-content-toggle*`), 799-805 (`.block-index-page` hide-proofs policy).
- `styles/math.css`: delete 3-76 EXCEPT any rule not copied to the library — after deletion the file should contain only demo/site-specific math rules; if it becomes empty of rules, keep the file with a comment pointing at the library.
- `styles/pages/block-index.module.css`: delete the panel styling (57-141) but KEEP/ADD the policy rules:
  ```css
  .block-references-section { display: none; }
  .block-index-page .block-references-section { display: block; }
  ```
  plus the existing `.block-index-page .embedded-block/.embedded-source` overrides (lines 32-42).
- Delete `styles/fonts/` and the `@font-face` if it was part of the moved math.css range — the font now ships in `/static/dist/fonts/` via the library (its `url('./fonts/...')` resolves relative to latexblocks.css in `/static/dist/`).

- [ ] **Step 5: Rebuild + verify in dev**

```bash
docker compose -f docker-compose.dev.yml up -d --build
docker exec mathnotes-static-builder npm run type-check
./scripts/crawl-dev.sh --single-page "http://web-dev:5000/mathnotes/algebra/groups"
```

Expected: type-check clean (tooltip-system gone from the program), crawl reports zero console errors. Manually verify in a browser (or via the crawler screenshots with --ask): hover a block reference → tooltip card; click a `※` label → copies `\@{label}`; a notation-ref MathML underline navigates; dark mode still themes cards/tooltips (site vars override library fallbacks); the block-index page still shows Referenced-by panels while content pages hide them.

- [ ] **Step 6: PAUSE for user go-ahead, then commit**

```bash
git add -A && git commit -m "Serve block/tooltip frontend from latexblocks assets"
```

---

### Task 9: mathnotes dev loop for library development

**Files:**
- Modify: `docker-compose.dev.yml`, `scripts/smart-rebuild.sh`, `scripts/watch_and_build.py:18`

**Interfaces:**
- Produces: mounting `../latexblocks` makes the dev container import the checkout live (PYTHONPATH shadows the pinned tarball install — no pip, nothing written into the mount); watcher restarts on library `.py` edits. Without the mount, the pinned tarball install is used — the mount is optional.

- [ ] **Step 1: Compose mount**

`docker-compose.dev.yml`, static-builder volumes (after the `./scripts` mount):

```yaml
      - ../latexblocks:/latexblocks:ro
```

- [ ] **Step 2: PYTHONPATH shadow in `smart-rebuild.sh`**

Do NOT `pip install -e` here: a PEP 660 editable install writes `src/*.egg-info` into the source tree, which fails silently on the `:ro` mount (and would litter the host checkout with root-owned files if mounted rw). PYTHONPATH precedes site-packages, so the mounted source simply wins over the tarball install — assets resolve via `__file__`, so they come from the checkout too. Near the top of `smart-rebuild.sh` (before the npm build at line ~72):

```bash
# Live library development: a mounted latexblocks checkout shadows the
# pip-installed tarball (PYTHONPATH precedes site-packages).
if [ -f /latexblocks/pyproject.toml ]; then
  export PYTHONPATH="/latexblocks/src${PYTHONPATH:+:$PYTHONPATH}"
  echo "latexblocks: using mounted checkout at /latexblocks/src"
fi
```

- [ ] **Step 3: Watch the library source**

`scripts/watch_and_build.py:18`:

```python
CONTENT_DIRS = ['content', 'mathnotes', 'templates', 'latex']
if os.path.isdir('/latexblocks/src/latexblocks'):
    CONTENT_DIRS.append('/latexblocks/src/latexblocks')
```

(`requires_restart` already re-execs on any `.py` change, which is exactly right: library code is imported, so in-process rebuild can't pick it up.)

- [ ] **Step 4: Verify the loop**

```bash
docker compose -f docker-compose.dev.yml up -d --build
docker logs mathnotes-static-builder | grep "using mounted checkout"
docker exec mathnotes-static-builder python3 -c "import latexblocks; print(latexblocks.__file__)"
# expect /latexblocks/src/latexblocks/__init__.py (NOT site-packages)
# touch a library file and watch for the restart:
touch /home/jason/latexblocks/src/latexblocks/structured_math.py
docker logs -f mathnotes-static-builder   # expect the watcher's restart message within ~2s
```

(The watcher inherits PYTHONPATH from smart-rebuild.sh, and its `os.execv` re-exec preserves the environment, so restarts keep using the checkout.)

- [ ] **Step 5: PAUSE for go-ahead, commit**

```bash
git add -A && git commit -m "Dev-loop support for a mounted latexblocks checkout"
```

---

### Task 10: mathnotes end-to-end equivalence + ship

**Files:**
- No new files; verification + `PARSING.md` pointer note.

- [ ] **Step 1: Whole-site before/after diff**

```bash
docker exec mathnotes-static-builder python scripts/build_static_simple.py --output /tmp/site-after
docker cp mathnotes-static-builder:/tmp/site-after /tmp/site-after
diff -r /tmp/site-before /tmp/site-after > /tmp/site-diff.txt; wc -l /tmp/site-diff.txt
```

Expected diffs, and ONLY these classes: (a) every page gains the two new `<link>/<script>` tags; (b) hashed `main-*.{js,css}` filenames changed (bundle contents changed) and their references; (c) `static/dist/latexblocks.*` + `fonts/` are new; (d) CSS bundle content moved rules out. Grep the diff to prove content-equivalence:

```bash
grep -E '^[<>]' /tmp/site-diff.txt | grep -v 'latexblocks\|main-[a-zA-Z0-9]*\.\(js\|css\)\|<script defer\|<link rel="stylesheet" href="/static/dist' \
  | head -50   # expect EMPTY — any hit is an unexplained content change; investigate before shipping
```

- [ ] **Step 2: Full crawl**

```bash
./scripts/crawl-dev.sh "http://web-dev:5000"
```

Expected: zero JS errors site-wide.

- [ ] **Step 3: Docs**

Add to `PARSING.md` (top): "The parsing pipeline described here now lives in the latexblocks library (github.com/jhobbs/latexblocks); this document remains its design reference." Keep the rest.

- [ ] **Step 4: PAUSE — user go-ahead → final commit & push (CI deploys)**

```bash
git add -A && git commit -m "Docs: point parsing pipeline at latexblocks"
git push origin main   # docker-publish.yml builds and deploys to Fly
```

Post-deploy: spot-check https://lacunary.org (tooltips, a definition page, dark mode).

---

# Phase 3 — imagining-syntax glossary

> Work on a branch (`glossary`); pushing to main auto-deploys via `.github/workflows/deploy-site.yml`.

### Task 11: Glossary content + build-time renderer + Docker stage

Definitions render at Docker **build** time: a build stage with node + latexblocks produces three plain files (`glossary.html`, `tooltips.json`, `terms.json`) plus the web assets; the runtime image and `requirements.txt` gain nothing.

**Files:**
- Create: `site/glossary/glossary.tex`, `site/render_glossary.py`
- Modify: `site/Dockerfile`, `site/.dockerignore`, `.gitignore` (add `site/build/`, `site/static/latexblocks.*`, `site/static/fonts/`)

**Interfaces:**
- Produces: `site/build/glossary/{glossary.html,tooltips.json,terms.json}` and `site/static/{latexblocks.css,latexblocks.js,fonts/}` at image build; `terms.json` maps lowercased term → `{"label","url","type"}`; `tooltips.json` is the data-island array.

- [ ] **Step 1: Seed glossary content** (user reviews wording afterward — flag that in the PR)

`site/glossary/glossary.tex`:

```latex
\title{Glossary}
\description{Definitions of terms used across imagining-syntax experiments.}

\begin{definition}[Zipfian Parameter]
\label{zipfian-parameter}
\synonyms{alpha}
The exponent $\alpha \ge 0$ (written $Z$ in code) of the Zipfian distribution
$P(k) \propto k^{-\alpha}$ used to sample noun--verb pairings for training
data. $\alpha = 0$ is uniform over the seen vocabulary; $\alpha = 1$ is
classic Zipf; larger $\alpha$ concentrates mass on high-frequency pairs.
\end{definition}

\begin{definition}[Minimal Pair]
\label{minimal-pair}
A pair of sentences identical except for verb number agreement, used to test
whether a model prefers the grammatical variant. Each evaluation condition
scores one thousand minimal pairs.
\end{definition}

\begin{definition}[Unseen Mismatch]
\label{unseen-mismatch}
The hardest evaluation condition: noun--verb pairs absent from training
(unseen), with prepositional objects whose number mismatches the subject.
Accuracy here traces an inverted-U in $\alpha$ with peak near $\alpha
\approx 1.4$.
\end{definition}

\begin{definition}[Waypoint]
\label{waypoint}
A training iteration at which a model checkpoint and per-condition accuracies
are snapshotted mid-run, giving learning trajectories rather than only final
accuracy.
\end{definition}

\begin{definition}[Curriculum]
\label{curriculum}
A training run in which the \dref{zipfian-parameter} varies across training
according to a schedule (staged regenerated datasets or continuous per-batch
sampling), evaluated against a fixed reference-$\alpha$ suite.
\end{definition}

\begin{definition}[Collocational Bootstrapping]
\label{collocational-bootstrapping}
The hypothesis that learners first memorize high-frequency subject--verb
collocations and bootstrap the abstract agreement rule from that scaffold,
predicting an optimal, intermediate degree of distributional skew.
\end{definition}

\begin{definition}[Oneshot Distribution]
\label{oneshot-distribution}
\synonyms{oneshot}
The $\alpha \to \infty$ limit: every verb pairs with exactly one noun,
deterministically. Invoked with \texttt{--oneshot}.
\end{definition}
```

- [ ] **Step 2: `site/render_glossary.py`**

```python
#!/usr/bin/env python3
"""Build-time glossary renderer: glossary/*.tex -> prebuilt artifacts.

Outputs plain files the Flask app reads at startup (the app never imports
latexblocks):
  <out>/glossary.html   rendered page content
  <out>/tooltips.json   tooltip data-island payload (JSON array)
  <out>/terms.json      autolink map: lowercased term -> {label, url, type}
Also copies the library web assets (css/js/fonts) into --assets-out.
Requires: pip install latexblocks; node >= 18 on PATH (math conversion).
"""
import argparse
import json
from pathlib import Path

import latexblocks
from latexblocks.assets import copy_web_assets
from latexblocks.block_index import BlockIndex
from latexblocks.page_renderer import PageRenderer
from latexblocks.ref_resolver import tooltip_entry


class GlossaryMapper:
    """latexblocks.mapper.UrlMapper over a single glossary page."""

    def __init__(self, tex_path: str):
        self.url_mappings = {"glossary/": tex_path}

    def get_canonical_url(self, file_path: str) -> str:
        return "glossary/"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--glossary-dir", default="glossary")
    p.add_argument("--out", default="build/glossary")
    p.add_argument("--assets-out", default="static")
    args = p.parse_args()

    tex_files = sorted(Path(args.glossary_dir).glob("*.tex"))
    if len(tex_files) != 1:
        raise SystemExit(f"expected exactly one glossary .tex, found {len(tex_files)}")
    tex_path = str(tex_files[0])

    latexblocks.configure(url_prefix="", content_dir=args.glossary_dir)
    mapper = GlossaryMapper(tex_path)
    index = BlockIndex(mapper)
    index.build_index()
    page = PageRenderer(mapper, index).render_page(tex_path)

    tooltips = [{"label": label, **tooltip_entry(ref)}
                for label, ref in sorted(index.index.items())]
    terms = {}
    for label, ref in index.index.items():
        if ref.block.block_type.value != "definition":
            continue
        name = getattr(ref, "synonym_title", None) or ref.block.title
        if name and "$" not in name:  # autolink plain-text names only
            terms[name.lower()] = {"label": ref.block.label,
                                   "url": ref.full_url,
                                   "type": ref.block.block_type.value}

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "glossary.html").write_text(page["content"], encoding="utf-8")
    (out / "tooltips.json").write_text(json.dumps(tooltips), encoding="utf-8")
    (out / "terms.json").write_text(
        json.dumps(terms, indent=1, sort_keys=True), encoding="utf-8")
    copy_web_assets(args.assets_out)
    print(f"glossary: {len(tooltips)} indexed entries, {len(terms)} autolink terms")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Dockerfile build stage**

Replace `site/Dockerfile` with:

```dockerfile
# Build stage: render the glossary with latexblocks (needs node for MathML).
FROM python:3.12-slim AS glossary
RUN apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir \
    "latexblocks @ https://github.com/jhobbs/latexblocks/archive/refs/tags/v0.1.0.tar.gz"
WORKDIR /build
COPY glossary/ glossary/
COPY render_glossary.py .
RUN python render_glossary.py --glossary-dir glossary --out build/glossary --assets-out static

# Runtime stage: unchanged shape — no node, no latexblocks.
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py bucket.py ./
COPY templates/ templates/
COPY static/ static/
COPY --from=glossary /build/build/glossary build/glossary/
COPY --from=glossary /build/static/ static/
EXPOSE 8080
CMD ["gunicorn", "-b", "0.0.0.0:8080", "-w", "2", "app:create_app()"]
```

(Task 13 Step 4 extends the `COPY app.py bucket.py ./` line with `glossary_links.py` when that module exists.)

Add to `site/.dockerignore`: `build/`. Add to repo `.gitignore`: `site/build/`, `site/static/latexblocks.css`, `site/static/latexblocks.js`, `site/static/fonts/`.

- [ ] **Step 4: Verify by building the image**

```bash
cd /home/jason/imagining-syntax/site
docker build -t imsyn-site-test .
docker run --rm imsyn-site-test ls build/glossary static
```

Expected: `glossary.html tooltips.json terms.json` and `latexblocks.css latexblocks.js fonts style.css`. A LaTeX error in glossary.tex fails the build loudly with file:line — that is the content gate.

- [ ] **Step 5: Commit (branch `glossary`)**

```bash
cd /home/jason/imagining-syntax && git checkout -b glossary
git add site/glossary site/render_glossary.py site/Dockerfile site/.dockerignore .gitignore
git commit -m "glossary: latexblocks build-time renderer + seed definitions"
```

---

### Task 12: Serve the glossary page + tooltip assets

**Files:**
- Modify: `site/app.py`, `site/templates/base.html`
- Create: `site/templates/glossary.html`
- Modify: `site/tests/conftest.py`, create `site/tests/test_glossary.py`

**Interfaces:**
- Consumes: Task 11 artifacts (shape only — tests use fixtures).
- Produces: `load_glossary(build_dir) -> {"html": str, "tooltips_json": str, "terms": dict}`; `create_app(reader=None, glossary=None)`; route `GET /glossary`; template context globals `has_glossary`, `tooltip_json`.

- [ ] **Step 1: Failing tests first**

`site/tests/conftest.py` — add after the existing fixtures:

```python
GLOSSARY = {
    "html": '<div class="math-block math-definition" id="waypoint" data-label="waypoint">'
            '<div class="math-block-header"><span class="math-block-type">Definition:</span>'
            '<span class="math-block-title"><a href="/glossary/#waypoint">Waypoint</a></span></div>'
            '<div class="math-block-content"><p>A snapshot iteration.</p></div></div>',
    "tooltips_json": '[{"label": "waypoint", "type": "definition", "title": "Waypoint",'
                     ' "content": "<p>A snapshot iteration.</p>", "url": "/glossary/#waypoint",'
                     ' "is_synonym": false, "synonym_of": null, "synonym_title": null}]',
    "terms": {"waypoint": {"label": "waypoint", "url": "/glossary/#waypoint",
                           "type": "definition"}},
}


EMPTY_GLOSSARY = {"html": "", "tooltips_json": "", "terms": {}}


@pytest.fixture
def glossary_client(objects):
    from app import create_app
    app = create_app(reader=FakeReader(objects), glossary=dict(GLOSSARY))
    app.config["TESTING"] = True
    return app.test_client()
```

Also change the EXISTING `client` fixture to pass `glossary=dict(EMPTY_GLOSSARY)` to `create_app` — otherwise a stray local `site/build/glossary/` (from a docker-less render) would leak into the 35 existing tests and the 404 test. The existing tests then deterministically exercise the no-glossary path.

`site/tests/test_glossary.py`:

```python
from app import load_glossary


def test_glossary_page_renders(glossary_client):
    r = glossary_client.get("/glossary/")
    assert r.status_code == 200
    assert b"math-definition" in r.data
    assert b"Waypoint" in r.data


def test_glossary_redirects_slashless(glossary_client):
    r = glossary_client.get("/glossary")
    assert r.status_code == 308      # Flask redirect to the canonical /glossary/


def test_glossary_404_without_build(client):
    assert client.get("/glossary/").status_code == 404


def test_tooltip_island_and_assets_present(glossary_client):
    html = glossary_client.get("/glossary/").data.decode()
    assert 'id="tooltip-data"' in html
    assert "latexblocks.css" in html and "latexblocks.js" in html


def test_no_island_without_glossary(client):
    html = client.get("/").data.decode()
    assert 'id="tooltip-data"' not in html


def test_load_glossary_missing_dir(tmp_path):
    g = load_glossary(tmp_path / "nope")
    assert g == {"html": "", "tooltips_json": "", "terms": {}}
```

Run: `pytest site/tests/test_glossary.py -q` from the repo root → FAIL (`cannot import name 'load_glossary'`).

- [ ] **Step 2: Implement in `site/app.py`**

Add imports (`import json`, `from pathlib import Path`) and:

```python
GLOSSARY_BUILD = Path(__file__).resolve().parent / "build" / "glossary"


def load_glossary(build_dir=GLOSSARY_BUILD):
    """Prebuilt glossary artifacts (render_glossary.py output). All three
    files are optional so the app runs without a glossary build (dev, CI)."""
    build_dir = Path(build_dir)

    def read(name):
        p = build_dir / name
        return p.read_text(encoding="utf-8") if p.exists() else ""

    terms_raw = read("terms.json")
    return {"html": read("glossary.html"),
            "tooltips_json": read("tooltips.json"),
            "terms": json.loads(terms_raw) if terms_raw else {}}
```

In `create_app`, change the signature to `def create_app(reader=None, glossary=None):` and add:

```python
    app.config["GLOSSARY"] = glossary if glossary is not None else load_glossary()

    @app.context_processor
    def glossary_context():
        g = app.config["GLOSSARY"]
        return {"has_glossary": bool(g["html"]), "tooltip_json": g["tooltips_json"]}

    # Trailing slash is load-bearing: latexblocks emits every glossary URL as
    # "/glossary/#label" (GlossaryMapper's canonical URL is "glossary/").
    # A slashless route would 404 all of them; defined WITH the slash, Flask
    # redirects /glossary -> /glossary/ automatically.
    @app.route("/glossary/")
    def glossary_page():
        g = app.config["GLOSSARY"]
        if not g["html"]:
            abort(404)
        return render_template("glossary.html", content=g["html"])
```

The glossary page will show each definition's "Referenced by" panel (a collapsed `<details>`) when other entries `\dref` it — the library CSS styles it and imsyn adds no hide rule. This is **intended**: on a glossary, backlinks are useful. (mathnotes hides panels outside its block-index page via its own site CSS; that policy did not move into the library.)

- [ ] **Step 3: Templates**

`site/templates/glossary.html`:

```html
{% extends "base.html" %}
{% block title %}glossary — imagining syntax{% endblock %}
{% block content %}
<h1>Glossary</h1>
{{ content | safe }}
{% endblock %}
```

`site/templates/base.html` — three edits:
- in `<head>` after the existing stylesheet link:
  ```html
  {% if has_glossary %}<link rel="stylesheet" href="{{ url_for('static', filename='latexblocks.css') }}">{% endif %}
  ```
- in `<header>` after the subtitle span:
  ```html
  {% if has_glossary %}<nav class="site-nav"><a href="{{ url_for('glossary_page') }}">glossary</a></nav>{% endif %}
  ```
- before `</body>`:
  ```html
  {% if has_glossary and tooltip_json %}
  <script type="application/json" id="tooltip-data">{{ tooltip_json | safe }}</script>
  <script defer src="{{ url_for('static', filename='latexblocks.js') }}"></script>
  {% endif %}
  ```

- [ ] **Step 4: Run all site tests**

```bash
cd /home/jason/imagining-syntax && pytest site/tests -q
```

Expected: all pass — the 35 existing tests prove the no-glossary path is unchanged (the reworked `client` fixture passes an explicitly empty glossary).

- [ ] **Step 5: Commit**

```bash
git add site/app.py site/templates site/tests && git commit -m "glossary: serve prebuilt glossary page + tooltip assets"
```

---

### Task 13: Autolink glossary terms in experiment prose

**Files:**
- Create: `site/glossary_links.py`, `site/tests/test_glossary_links.py`
- Modify: `site/app.py` (experiment route), `site/Dockerfile` (COPY line), `site/tests/test_app.py` (one fixture tweak if needed)

**Interfaces:**
- Consumes: `terms` dict from Task 12.
- Produces: `autolink_terms(html: str, terms: dict) -> str` — wraps the **first** occurrence of each known term (case-insensitive, word-bounded, longest-first) in `<a class="block-reference" data-ref-type=... data-ref-label=...>`, never inside `<a>`, `<code>`, `<pre>`, headings, `<script>`, or `<style>`.

- [ ] **Step 1: Failing unit tests**

`site/tests/test_glossary_links.py`:

```python
from glossary_links import autolink_terms

TERMS = {
    "waypoint": {"label": "waypoint", "url": "/glossary/#waypoint", "type": "definition"},
    "unseen mismatch": {"label": "unseen-mismatch", "url": "/glossary/#unseen-mismatch",
                        "type": "definition"},
}


def test_links_first_occurrence_only():
    out = autolink_terms("<p>The waypoint at 300. Another waypoint later.</p>", TERMS)
    assert out.count('data-ref-label="waypoint"') == 1
    assert 'href="/glossary/#waypoint"' in out
    assert 'class="block-reference"' in out


def test_case_insensitive_and_word_bounded():
    out = autolink_terms("<p>Waypoint marks; waypoints differ.</p>", TERMS)
    assert out.count("data-ref-label") == 1          # 'waypoints' is not matched
    assert ">Waypoint</a>" in out                    # original casing preserved


def test_longest_term_wins():
    out = autolink_terms("<p>unseen mismatch accuracy</p>", TERMS)
    assert 'data-ref-label="unseen-mismatch"' in out


def test_skips_links_code_pre_headings():
    html = ('<h2>waypoint</h2><a href="#">waypoint</a><code>waypoint</code>'
            '<pre>waypoint</pre><p>waypoint</p>')
    out = autolink_terms(html, TERMS)
    assert out.count("data-ref-label") == 1
    assert out.index("data-ref-label") > out.index("<p>")


def test_empty_terms_is_identity():
    assert autolink_terms("<p>waypoint</p>", {}) == "<p>waypoint</p>"
```

Run → FAIL (`No module named glossary_links`).

- [ ] **Step 2: Implement `site/glossary_links.py`**

```python
"""Autolink glossary terms in already-rendered HTML.

Operates only on text between tags, tracks a skip-depth for elements whose
text must never be linked, and links at most the first occurrence of each
term per document (mirroring how mathnotes treats definition references as
introductions, not decorations).
"""
import re

_SKIP_TAGS = {"a", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6",
              "script", "style"}
_TAG_RE = re.compile(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>")


def autolink_terms(html, terms):
    if not terms:
        return html
    pattern = re.compile(
        r"\b(" + "|".join(re.escape(t) for t in
                          sorted(terms, key=len, reverse=True)) + r")\b",
        re.IGNORECASE)
    seen = set()

    def link_text(text):
        def repl(m):
            key = m.group(1).lower()
            info = terms.get(key)
            if info is None or key in seen:
                return m.group(0)
            seen.add(key)
            return (f'<a href="{info["url"]}" class="block-reference" '
                    f'data-ref-type="{info["type"]}" '
                    f'data-ref-label="{info["label"]}">{m.group(0)}</a>')
        return pattern.sub(repl, text)

    out, pos, depth = [], 0, 0
    for m in _TAG_RE.finditer(html):
        text = html[pos:m.start()]
        out.append(text if depth else link_text(text))
        if m.group(2).lower() in _SKIP_TAGS:
            depth = max(0, depth + (-1 if m.group(1) else 1))
        out.append(m.group(0))
        pos = m.end()
    tail = html[pos:]
    out.append(tail if depth else link_text(tail))
    return "".join(out)
```

Run the unit tests → PASS.

- [ ] **Step 3: Wire into the experiment route + integration test**

`site/app.py`: `from glossary_links import autolink_terms` (top, next to the bucket import). In `experiment()`, add `terms = app.config["GLOSSARY"]["terms"]` before the NOTES handling, then — **inside the existing `if notes:` block, preserving the placeholder guard exactly as it is** — change only the two assignment lines that call `render_md`:

```python
        # old: conclusions_html = render_md(conclusions)   (guarded by the
        #      existing `conclusions != CONCLUSIONS_PLACEHOLDER` condition)
        conclusions_html = autolink_terms(render_md(conclusions), terms)
        ...
        # old: curricula_html = render_md(curricula)
        curricula_html = autolink_terms(render_md(curricula), terms)
```

Do not restructure the surrounding conditionals: `conclusions`/`curricula` are only bound inside `if notes:`, and the placeholder check must keep suppressing `_(write after the run)_` (test_app.py's placeholder test guards this).

Add to `site/tests/test_glossary.py` — two REQUIRED fixture facts: the conftest experiment is `EXP = "20260101_000000_fake_exp"`, and its NOTES.md Conclusions text ("Capacity **matters**.") does not contain a glossary term, so change that fixture line to `"Capacity **matters** at each waypoint."`:

```python
from conftest import EXP


def test_experiment_conclusions_autolinked(glossary_client):
    r = glossary_client.get(f"/exp/{EXP}")
    assert r.status_code == 200
    assert b'data-ref-label="waypoint"' in r.data
```

- [ ] **Step 4: Dockerfile COPY + full test run**

`site/Dockerfile` runtime stage: `COPY app.py bucket.py glossary_links.py ./`

```bash
pytest site/tests -q && docker build -t imsyn-site-test site/
```

- [ ] **Step 5: Commit**

```bash
git add site/ && git commit -m "glossary: autolink terms in experiment prose"
```

---

### Task 14: Deploy imagining-syntax and verify live

- [ ] **Step 1: Push the branch, open PR, review content**

```bash
git push -u origin glossary
gh pr create --title "Glossary powered by latexblocks" \
  --body "Build-time rendered glossary + tooltips + term autolinking. Please review glossary.tex wording before merge; merging to main auto-deploys via deploy-site.yml."
```

The user reviews the definition wording (their research, their words) and merges.

- [ ] **Step 2: Post-merge verification**

CI (`deploy-site.yml`) runs pytest and `flyctl deploy --remote-only`. Then:

```bash
curl -sL https://imsyn.lacunary.org/glossary/ | grep -c "math-definition"   # >= 7
curl -sL https://imsyn.lacunary.org/glossary/ | grep -o 'id="tooltip-data"' # present
curl -sI https://imsyn.lacunary.org/static/latexblocks.js | head -1         # 200
```

Manual browser check: glossary page cards styled, hover tooltips on `\dref` links inside definitions, an experiment page's Conclusions autolinks (e.g. "waypoint") with a hover card, and MathML α renders.

- [ ] **Step 3: Update `site/README.md`**

Document: the glossary content lives in `site/glossary/*.tex`; editing it requires a redeploy (unlike bucket-published results); local rendering needs `pip install latexblocks` + node, or just `docker build site/`.

```bash
git add site/README.md && git commit -m "docs: glossary editing workflow" && git push
```

---

## Appendix A — consumer import-site map (recon, mathnotes @ fc2c858)

| Consumer | What it uses | Migration |
|---|---|---|
| `mathnotes/content_discovery.py:4` | `content_loader.load_content_file` | import → latexblocks |
| `mathnotes/navigation.py:9` | same | same |
| `mathnotes/file_utils.py:7` | same | same |
| `mathnotes/sources.py:102` | same (function-local) | same |
| `mathnotes/sitegenerator/builder.py:13,14,106,192` | `PageRenderer`, `BlockIndex`, `tooltip_entry`, `write_notation_sty` | imports → latexblocks + `configure_latexblocks()` |
| `mathnotes/sitegenerator/builder.py:110` | `block_index.index` dict | unchanged attribute |
| `mathnotes/sitegenerator/pages.py:163,242,252` | `render_page` dict, `find_blocks_by_type`, `reverse_index` | unchanged (via site_context) |
| `scripts/build_static_simple.py:14` | `SiteBuilder` | + `configure_latexblocks()` |
| `scripts/watch_and_build.py:67-69,106,119-121` | `SiteBuilder`, `clear_page_cache`, `notation.refresh_registry`, in-place rebuilds | imports → latexblocks + configure + watch `/latexblocks` |
| `templates/block_index.html:26-28` | `BlockReference.block/.full_url/.page_title`, `MathBlock.label/.rendered_html` | field names frozen |
| `templates/base.html:87-92` | tooltip-data island + bundles | + latexblocks css/js tags |

## Appendix B — risk register

- **mathjax-full port output drift** → gated by test_mathml + the zero-diff corpus parity check (Task 3 Step 7).
- **CSS split visual regressions** → gated by the whole-site diff (Task 10), full crawl, and manual dark/light checks; library-before-site load order keeps mathnotes' variables authoritative.
- **configure() ordering bugs** (something parses before configure) → configure is called at every entry point (build script, watcher, builder ctor) and the watcher's early `refresh_registry` is explicitly covered (Task 7 Step 4).
- **Tarball install needs the repo public**; if it must go private later, switch consumers to `git+ssh` (adds git + keys to images) or vendor a wheel.
- **esbuild/postcss nondeterminism breaking CI's freshness check** → all toolchain versions locked via package-lock.json; if it flakes, relax to building assets in CI and uploading, but keep the committed copies canonical.
- **imsyn autolinker over-matching** → conservative design (word-bounded, first-occurrence, skip-tags) + unit tests; the terms list is curated by the glossary author.
