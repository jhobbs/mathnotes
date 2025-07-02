# Simplifying Mathnotes’ Structured-Math Parsing

## 1  Current Implementation & Pain Points

Mathnotes extends Markdown with **custom “mathblocks”** (12 types: Definition, Theorem, Lemma, …).  
Key files & functions:

| Area | File / Class | Key Methods |
|------|--------------|-------------|
| Block parsing | `mathnotes/structured_math.py` · `StructuredMathParser` | `parse()` |
| Block → HTML | `structured_math.py` helpers | `process_structured_math_content()` |
| Markdown orchestration | `mathnotes/markdown_processor.py` · `MarkdownProcessor` | `render_markdown_file()` |
| Cross-file refs | `mathnotes/block_index.py` · `BlockIndex` | |

Pain points:

1. **Duplicate math-placeholder logic** (inline & display) scattered in ≥ 3 spots.  
2. **Duplicate `@label` reference handling** (main text vs. nested blocks).  
3. **Two-pass parsing** with fragile string markers (`MATHBLOCK0MARKER`, etc.).  
4. Manual QA only → regressions in MathJax & cross-refs.  
5. Coupled functions pass around `current_file`, `block_index`, etc., leading to brittle signatures.

---

## 2  Refactor / Simplification Plan

| # | Action | Benefit |
|---|--------|---------|
| **2.1** | **Centralise math-placeholder helpers**<br>`protect_math()` / `restore_math()` used everywhere. | Single regex implementation; fewer subtle MathJax bugs. |
| **2.2** | **Unify reference replacement**<br>`replace_block_references()` shared by both main & child paths. | Guarantees identical behaviour & styling for `@label` / `@{text\|label}`. |
| **2.3** | **Streamline rendering flow**<br>Option A: build a custom **Python-Markdown extension** to parse `:::blocktype ...` in one pass.<br>Option B (interim): keep two-pass but parse into an AST, then render by tree-walk (no HTML placeholder swapping). | Removes placeholder hacks; simpler control of nesting; fewer state resets. |
| **2.4** | **Isolate Markdown instances / state**<br>Either one instance with our extension, or clearly separate instances for main & block content. | Predictable behaviour, easier debugging. |
| **2.5** | **Reduce metadata plumbing**<br>Parser holds a reference to a global `BlockIndex`; drop `block_index` arg in deep calls. | Simpler signatures; less boiler-plate. |
| **2.6** | **Centralised error reporting** for unclosed tags, unknown labels. | Consistent UX & easier unit testing. |

---

## 3  Testing & CI Strategy

### 3.1  Unit Tests

| Component | What to assert |
|-----------|----------------|
| **Parser** (`parse`) | Correct placeholder ↔ `MathBlock` mapping; nesting tree; graceful error injection. |
| **Reference replacement** | `@label` → `<a href…>`; `@{text\|label}` overrides link text; unknown label → error span. |
| **Block renderer** | `<div class="math-block math-theorem" id="…">`, auto-QED for proofs, nested blocks embed correctly. |

### 3.2  Integration / Regression Tests

* Render full sample markdown files end-to-end; compare to golden HTML (snapshot tests).
* Include historical bug cases (e.g., block at file start, trailing `@label`, complex nesting).

### 3.3  CI Pipeline

* Run pytest on every PR.
* Add lint/black/isort to keep style LLM-friendly.

---

## 4  LLM-Friendly Guidelines

1. **Single-source utilities** (math protection, reference linking) = minimal surface for model edits.  
2. **Comprehensive tests** let you accept/refuse LLM PRs automatically.  
3. **Clear file boundaries & doc-strings** improve code-gen quality.  
4. **Avoid hidden global state**; prefer dependency injection or small helpers so model can reason locally.

---

## 5  Next Steps Checklist

- [ ] Extract and unit-test `protect_math` / `restore_math` utilities.  
- [ ] Merge duplicate reference-handling into `replace_block_references`.  
- [ ] Decide on Extension-vs-Two-Pass approach; spike a Markdown extension prototype.  
- [ ] Build initial pytest suite (parser + reference + renderer).  
- [ ] Add GitHub Actions workflow running tests + flake8/black.  
- [ ] Document contribution guide (how to run tests, typical bug patterns).  

Once these foundations are in, future features (new block types, custom numbering, …) become straightforward and safer to implement.


