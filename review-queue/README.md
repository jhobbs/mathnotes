# Review Queue

A queue of content to review interactively with Claude. Two kinds of queue files:

## Formalization queue (per section)

`XX-<section>.md` files list content not yet in `:::` structured blocks, plus typos found along the way. Each entry is a checkbox:

- `[ ]` — not yet reviewed
- `[x]` — reviewed and applied (or rejected; strike through rejected entries)

Formalization means wrapping the existing text in the right `:::type "Title" {label: slug}` block so it can be referenced, and adding `@label` references where the text mentions already-defined terms. It is not a rewrite.

## Math errors queue

`math-errors.md` lists suspected mathematical errors. These are never auto-fixed; each needs Jason's judgment.

## Workflow

Pick a queue file, work top to bottom with Claude: for each entry Claude proposes the formalized block, you approve/adjust, Claude applies it and checks the box.

## Index

| File | Scope |
|------|-------|
| 01-algebra-foundations-geometry.md | algebra/, foundations/, geometry/ |
| 02-real-analysis-calculus.md | analysis/ except complex-analysis |
| 03-complex-analysis.md | analysis/complex-analysis/ |
| 04-ode-chapters-1-3.md | ODE lessons 3–17b (basic concepts, first-order types & problems) |
| 05-ode-chapters-4-91.md | ODE lessons 19–910 (higher order, operators/Laplace, applications, series) |
| 06-pde-dynamical-systems.md | partial-differential-equations/, dynamical-systems/ |
| 07-numerical-analysis-physics.md | numerical-analysis/, physics/ |
| 08-probability-discrete-math.md | probability-and-statistics/, discrete-math/ |
| 09-topology-info-theory-ml-misc.md | topology/, information-theory/, machine-learning/, misc/ |
| math-errors.md | all suspected math errors, grouped by area |
