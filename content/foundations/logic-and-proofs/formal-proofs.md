---
layout: page
title: Formality and Proofs
---

:::definition "Formal System"
A  **formal system** $\mathcal{F}$ is an ordered quadruple

$$\mathcal{F} = (\Sigma, W, A, R) $$

where:

1. $\Sigma$ is a finite, nonempty **alphabet** (a set of symbols);
2. $W \subseteq \Sigma^{*}$ is the set of **well-formed-formulas** (wffs), defined inductively by formation rules specifying which finite strings over $\Sigma$ belong to $W$
3. $A \subseteq W$ is a distinguished subset of $W$, whose members are called **axioms.**
4. $R$ is a finite set of **rules of inference**, each of which is a relation on $W$ determining from which formulas other formulas may be derived.
\end{enumerate}
:::


:::definition "Derivation" {synonyms: proof}
A **derivation** (or **proof**) in $\mathcal{F}$ is a finite sequence of formulas

$$ \varphi_1, \varphi_2, \dots, \varphi_n $$

such that for each $i \le n$,
1. Either $\varphi_i \in A$, or
2. $\varphi_i$ follows from earlier formulas in the sequence by an inference rule in $R$.
:::


:::definition "theorem" {synonym: "provable formula"}
A formula $\psi \in W$ is a **theorem** (or **provable formula**) of $\mathcal{F}$ if there exists such a derivation ending with $\psi$. We then write

$$\vdash_{\mathcal{F}} \psi. $$
:::

:::definition "recursive" {synonym: "effectively generated"}
The system $\mathcal{F}$ is said to be **recursive** (or **effectively generated**) if $W$, $A$, and $R$ are all @recursively-enumerable sets, so that derivations can be verified by a finite mechanical procedure.
:::

:::remark
No @semantics are assumed in this definition; a @formal-system is purely @syntactic.

A @formal-system operates purely on @form, not content.

Its symbols are inert marks; its rules manipulate these marks according to syntactic shape alone.

No step depends on what any symbol "means."

A proof in such a system is therefore a finite, mechanical transformation of strings; a sequence of moves in a symbol game governed entirely by explicit rules.

Semantics enter only afterward, when we interpret the symbols externally (e.g. as numbers, sets, or truth values).

Until then, the system is a syntax engine; a rule-bound procedure that generates certain strings (theorems) from others (axioms), without regard to interpretation or truth.
:::

:::note
When an interpretation (model) $\mathcal{M}$ and a satisfaction relation $\models_{\mathcal{M}}$ are supplied, one obtains a **formal theory.**
:::
