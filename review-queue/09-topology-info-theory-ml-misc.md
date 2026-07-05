# Queue 09: Topology, Information Theory, Machine Learning, Misc

## Formalization candidates

### content/applied-math/information-theory/01-discrete-entropy.md
- [ ] lines 254–258: **example** `{label: coin-flip-entropy-example}` "Coin Flip" — excerpt: "For a fair coin flip, $\mathcal{X} = \{h, t\}$ and $p(h) = p(t) = 0.5$..." (refs: @entropy, @self-information)
- [ ] lines 260–266: **example** `{label: unfair-coin-entropy-example}` — excerpt: "Let's say we have an unfair coin and $p(h) = 0.9, p(t) = 0.1$..." (refs: @self-information, @entropy) — could be folded into the coin example above
- [ ] lines 268–272: **example** `{label: die-entropy-example}` "Six-Sided Die" — excerpt: "For a fair six-sided die, $\mathcal{X} = \{1,2,3,4,5,6\}$..." (refs: @entropy, @self-information)
- [ ] lines 274–280: **example** `{label: unfair-die-entropy-example}` — excerpt: "Let's say we have an unfair die and $p(1) = 0.5$..." (refs: @entropy)
- [ ] line 397: **remark** — excerpt: "Note that when $p = q,$ @cross-entropy equals @entropy. The symbol $H$ is overloaded..." (refs: @cross-entropy, @entropy) — note-like aside outside any block
- [ ] lines 243–247: **note** (optional) — excerpt: "The demo below makes these quantities concrete. It uses a discrete alphabet..." — defines the Zipfian distribution formula; borderline demo prose

### content/applied-math/machine-learning/basics.md
- [ ] lines 106–108: **remark** `{label: hamming-loss-not-differentiable}` — excerpt: "Hamming Loss is great way to evaluate the performance of a binary classifier..." (refs: @hamming-loss, @target-class, @differentiable)
- [ ] lines 35–48: **remark/note** (optional) — expository framing of binary classification as $f:\mathbb{R}^n\to\{0,1\}$; borderline narrative
- [ ] line 110: "## Bias vs Variance" heading is an empty stub (no content follows) — incomplete section, not a candidate

### content/applied-math/machine-learning/neural-networks.md
- [ ] lines 8–17: **example** `{label: digit-classification-example}` "Digit Classification" — excerpt: "We have $28 \times 28$ pixel greyscale input image and we want to predict..." (refs: @neural-network; see math-errors queue re: dimensions)
- [ ] line 84: trailing sentence "Our pixels are represented by a value from 0 to 1..." is cut off mid-thought — incomplete

### content/applied-math/misc/dft.md
- [ ] lines 56–64: **definition** `{label: nth-roots-of-unity}` + **proposition** — excerpt: "The $n$th roots of unity. There are $n$ $nth$ roots of 1..." — also states "the $n$th roots of unity form a @cyclic @abelian @group under multiplication" (a stated result, currently loose prose; see math-errors queue re: line 56)
- [ ] lines 100–104: **remark** — excerpt: "On the unit circle, a negative rotation (clockwise) by $\phi$ is equal to..." — fact relating $-k \equiv n-k \pmod n$
- [ ] lines 109–119: **example/remark** — excerpt: "Let's say we have a contour on the complex plane, and we take $n$ sample points..." — contains an embedded lemma (standard basis spans $\mathbb{C}^n$)
- [ ] lines 168–186: **example** `{label: fourier-basis-n3-example}` — excerpt: "To work on intuition some, let's take the case $N = 3$..." (refs: @fourier-basis)
- [ ] lines 190–194: **note/remark** — excerpt: "For odd $N,$ one basis vector represents no rotation - no frequency - aka DC..." — conjugate-symmetry / Nyquist-frequency remarks
- [ ] lines 297–329: **definition** `{label: dft}` and **definition** `{label: idft}` — excerpt: "Now we're ready to see the DFT as a change of basis..." (refs: @fourier-basis, @complex-inner-product-space) — the DFT/IDFT formulas and matrix form are core definitions living in bare prose

### content/applied-math/misc/standardized-test.md
(entire file is worked problems in bare markdown; each subsection is an exercise/solution pair)
- [ ] lines 13–15: **proposition/example** `{label: interior-angles-regular-polygon}` "Interior Angles of Regular Polygons" — excerpt: "The sum of the degrees of the interior angles of a regular $n$-gon is $180(n - 2)$..."
- [ ] lines 17–29: **exercise** + **solution** `{label: octagon-diagonals}` "Diagonals in a Regular Octagon" — excerpt: "How many diagonals does a regular octagon have?..."
- [ ] lines 33–53: **exercise** + **solution** `{label: telescoping-series-sum}` — excerpt: "Find the sum $\sum_{n=1}^{100}{\frac{1}{n} - \frac{1}{n+1}}$..."
- [ ] lines 57–69: **exercise** + **solution** `{label: matches-won}` "Number of Matches Won" — excerpt: "During the first half of the year, a tennis player won 60 percent..."
- [ ] lines 71–77: **exercise** + **solution** `{label: which-quantity-is-odd}` — excerpt: "if $x$ and $y$ are integers and $x = 50y + 69$, which of the following must be odd..."
- [ ] lines 79–93: **exercise** + **solution** `{label: chained-inequality}` — excerpt: "Given $p, q, r$ are positive integers such that $3p < 2q < 4r$..."

### content/topology/*
The six topology files are already almost entirely inside `:::` blocks. One structural issue:
- [ ] topology/finite-countable-uncountable-sets.md lines 128–134: the "reals are uncountable" **proof** (`::::proof`, lines 132–134) is a sibling of, not nested inside, its `::::corollary` (lines 128–130); it is currently attached to the enclosing `binary-sequences-are-uncountable` theorem instead of the `reals-are-uncountable` corollary.

## Typos

### information-theory/01-discrete-entropy.md
- [ ] 252 — stray editing debris "Examples to cover: [https://claude.ai/chat/0702d3b2-...]" left in the page body → should be removed

### machine-learning/basics.md
- [ ] 37,39,51 — `\to {0,1}` / `${0,1}$` render with invisible braces → `\{0,1\}`
- [ ] 43 — `{(\vec{x}^{(0)}, y^{(0)}), ...}` set braces invisible → `\{...\}`; and `\vec{y}^{(1)}` → `y^{(1)}` (scalar label, inconsistent with the other entries)
- [ ] 39 — "This assume we've turned" → "This assumes we've turned"
- [ ] 91 — "the Hamming Loss is the number of positions for which the symbols differ" inside the **Hamming Distance** definition → should say "Hamming Distance"
- [ ] 103 — `d_h{(\hat{y}, y)}` → `d_H(\hat{y}, y)` (defined as $d_H$ on line 96)
- [ ] 106 — "perform gradient loss" → "gradient descent"

### machine-learning/neural-networks.md
- [ ] 43 — "a collections of @neurons" → "a collection of"
- [ ] 57 — unmatched "(" : "(with the $i$th entry representing the bias on the $i$th @neuron in the layer," never closed

### misc/dft.md
- [ ] 22 — "moving forward by 10 hours) it the same as" → "is the same as"
- [ ] 74 — `e^{2 pi i k /n}` → `e^{2 \pi i k / n}` (missing `\`)
- [ ] 96 — `\ker{\phi} = {0}` → `\{0\}`
- [ ] 104 — "root of unit" → "root of unity"; and `e^{2 \pi i (k)}` is missing `/n` and the sign
- [ ] 125 — theorem title `"\mathbb{C}^N is an inner product space"` is missing `$` delimiters around the LaTeX (`$\mathbb{C}^N$`); titles are MathJax-rendered, but only delimited math is typeset
- [ ] 183 — stray lone "a" on its own line between the text and the `$$` block
- [ ] 186 — `2 * pi * 2 = 4 \pi` → `2 * \pi * 2`
- [ ] 251 — `\vec{u}u = \sum...` → stray extra `u`, should be `\vec{u} = \sum...`
- [ ] 265 — `\text{N}` in the cases block → `N`

### misc/standardized-test.md
- [ ] 8 — "preperation" → "preparation"
- [ ] 15 — "drawing diagonals to non opposing vertices" → "non-adjacent vertices"
- [ ] 23 — "parellel" → "parallel"
- [ ] 27 — "each diagonal connects to two diagonals that are parallel" → "each vertex connects to two diagonals..."
- [ ] 75 — "$50y = 50(2n) + 69 = 100n + 69$" → the "$+69$" should not be attached to $50y$; should be "$x = 50y+69 = 100n+69$"
- [ ] 77 — "$x + 2y = 2m+1 2(2n+1)$" → missing "+": "$2m+1 + 2(2n+1)$"
- [ ] 43,49,83 — `\begin{align} ... \end{align}` used inside `$$ ... $$`; many MathJax configs error on this (use `aligned` or drop the `$$`)

### topology/cantor-set.md
- [ ] 55 — "$(\alpha, \beta)$ \subset $P$" → `\subset` is outside math mode; and "provision assumption" → "provisional assumption"

### topology/compact-sets.md
- [ ] 27 — "$x_i \in G_\alpha(i)$" → `k_i \in G_{\alpha(i)}` (points were enumerated as $k_i$; subscript grouping)
- [ ] 43 — "$V_a = Y \cap G_\alpha$" → `V_\alpha`
- [ ] 47 — "finite set of indices $a_1, \dots, a_n$" → `\alpha_1, \dots, \alpha_n`
- [ ] 62 — "neigborhood" → "neighborhood"; and "and they are open.)" has an unmatched ")"
- [ ] 111,119 — "$\bigcap_{i=1}^n I_n$" → `\bigcap_{i=1}^\infty I_i` (infinite intersection; index variable mismatch); "${I_n}$" → `\{I_n\}`
- [ ] 162 — "$N_r\{p\}$" → `N_r(p)`; and "Since no point in $\{x_n\}$, other than perhaps $p$, lies in $\{x_n\}$" — the second `\{x_n\}` should be `N_r(p)`
- [ ] 186 — malformed reference: `@{infinite subsets of a compact set $K$ have a limit point in $K$, $E$ has...` opens `@{` but never closes with `|label}`

### topology/connected-sets.md
- [ ] 2 — "conneceted" → "connected" (frontmatter description)
- [ ] 39 — "nonempty separated sets $A$ an $B$" → "and"

### topology/finite-countable-uncountable-sets.md
- [ ] 25 — "**infinite** it is not finite" → "**infinite** if it is not finite"
- [ ] 48 — "$f(k) = {x_{k_n}}$" → `f(k) = x_{n_k}`
- [ ] 54 — "$f(1) = 0, f(1) = 2, \dots$" → second should be `f(2) = 2`
- [ ] 83 — "$T ~ S$" → `T \sim S`; and "subset of $S,$," has a doubled comma
- [ ] 97 — "appending each element of $a$" → "each element of $A$"
- [ ] 104 — "Rational numbers just formed from pairs" → "are just formed"
- [ ] 121 — "since it its elements" → "since its elements"

### topology/metric-spaces.md
- [ ] 48 — "$p, q, r$ \in $R^n$" → `\in` is outside math mode
- [ ] 216 — "then the set if infinite" → "is infinite"
- [ ] 270 — "$\bigcap{\alpha} F_\alpha$" → `\bigcap_{\alpha}` (missing underscore)
- [ ] 277 — "the property do not necessarily hold" → "properties do not"
- [ ] 321 — "$q \not in E$" → `q \notin E`
- [ ] 336,339 — "$\bigcup_{i=i}^n A_i$" → `\bigcup_{i=1}^n`
- [ ] 240 — "therefore $x$ is closed" → "$E^c$ is closed" (see also math-errors queue)

### topology/perfect-sets-and-more.md
- [ ] 180 — "Special case of Blaire's theorem" → "Baire's theorem" (label confirms baire)
- [ ] 29 — "$K_{n+1} \subset K$" → `K_{n+1} \subset K_n`
- [ ] 105 — unmatched "(" : "(because no point in $K$ is more than $1/n$ away..." never closed
- [ ] 119 — unmatched "(" : "(otherwise a finite subcollection of $\{G_n\}$ would cover $X.$" never closed
- [ ] 125 — "for $n >= m,$" → `n \ge m`
- [ ] 148 — "there are at must countably many" → "at most"
- [ ] 77,89,125 — "$N_r{p}$" → `N_r(p)`
