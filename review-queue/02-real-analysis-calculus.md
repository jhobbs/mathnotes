# Queue 02: Real Analysis & Calculus

## Formalization candidates

### content/analysis/calculus/integration-strategies.md
- [ ] lines 13–19: **note** `{label: trig-substitution}` "Trig Substitution" — excerpt: "For $\sqrt{b^2x^2 - a^2}$ substitute $x=\frac{a}{b}\sec\theta$..."
- [ ] lines 23–25: **note** `{label: secant-reduction-formula}` — excerpt: "$\int \sec^n x\,dx = \frac{\sec^{n-1}x\sin x}{n-1} + ...$"
- [ ] lines 29–57: **example** `{label: u-sub-tanh-integral}` "u-sub for $\int dv/(g-kv^2/m)$" — excerpt: "Here's an interesting integral from Tenenbaum and Pollard's ODE book..." (see math-errors queue re: line 55)
- [ ] lines 59–61: **definition/note** `{label: integration-by-parts}` "Integration by Parts" — excerpt: "$\int u\,dv = uv - \int v\,du$" (refs: the integration-by-parts theorem in real-analysis/fundamental.md)

### content/analysis/calculus/lengths-areas-and-volumes.md
- [ ] lines 11–19: **note** `{label: volume-of-revolution}` "Volumes of Solids of Revolution" — excerpt: "Volume of a function of $x$ rotated about the $x$-axis..."
- [ ] lines 23–27: **theorem/note** `{label: area-enclosed-by-polar-curve}` "Area Enclosed by Polar Curve" — excerpt: "Let $r = f(\theta)$ define the function $f(\theta)$ using polar..." (refs: @polar-coordinates)
- [ ] lines 29–31: **note** `{label: arc-length-polar}` "Arc Length for Polar Curves" — excerpt: "$s = \int_\alpha^\beta \sqrt{r^2 + (dr/d\theta)^2}\,d\theta$" (refs: @arc-length-in-plane)

### content/analysis/calculus/polar-coordinates.md
- [ ] lines 15–17: **definition** `{label: polar-coordinates}` "Polar Coordinates" — excerpt: "Polar coordinates are a 2d orthogonal coordinate system where coordinates..."
- [ ] lines 23–27: **note** `{label: polar-rectangular-conversion}` "Converting Between Rectangular and Polar" — excerpt: "$x = r\cos\theta,\ y = r\sin\theta$..."
- [ ] lines 29–58: **example/remark** `{label: polar-derivatives}` "Derivatives in Polar Form" — excerpt: "If we parameterize such that $x=x(t)$ and $y=y(t)$..."
- [ ] lines 65–67: **definition** `{label: radial-transverse-components}` "Radial and Transverse Components" — excerpt: "**Radial**: The particle's motion in the direction away from the origin..."

### content/analysis/calculus/vector-integral-calculus.md
(mostly already in blocks)
- [ ] lines 142–146: **note** — excerpt: "Note: for cylindrical coordinates, we need to include $r$ as a scaling factor..."
- [ ] line 150: **remark** — excerpt: "The Divergence Theorem allows us to translate between a volume integral..." (refs: @divergence-theorem)
- [ ] line 160: **remark** — excerpt: "Stoke's Theorem allows us to translate between a line integral around..." (refs: @stokes-theorem)

### content/analysis/calculus/vector-differential-calculus.md
(mostly already in blocks)
- [ ] line 399: **note** `{label: laplacian-is-trace-of-hessian}` — excerpt: "Note that the @Laplacian of $f$ is equal to the @trace of the @Hessian..." (refs: @laplacian, @hessian-matrix, @divergence, @jacobian-matrix)
- [ ] lines 493–536: **remark** `{label: jacobian-and-divergence}` "Jacobian Related to Divergence" — excerpt: "Given a @vector-field $F$... divergence is the sum of the diagonal entries..." (refs: @divergence, @jacobian-matrix)
- [ ] lines 538–630: **remark** `{label: jacobian-and-curl}` "Jacobian Related to Curl" — excerpt: "We can split $\vec{J}$ into its @symmetric and @antisymmetric parts..." (refs: @curl, @jacobian-matrix)
- [ ] lines 633–638: **remark** `{label: jacobian-and-directional-derivative}` — excerpt: "This is mostly covered above, so just note that the @Jacobian..." (refs: @directional-derivative)
- [ ] lines 640–650: **remark** `{label: jacobian-and-laplacian}` — excerpt: "Algebraically, $\nabla^2 f = \nabla \cdot (\nabla f)$..." (refs: @laplacian, @hessian-matrix, @gradient)

### content/analysis/real-analysis/integration.md
(entire file is bare prose — nothing in blocks)
- [ ] lines 11–13: **definition** `{label: partition}` "Partition" — excerpt: "A **partition** $P$ of the interval $[a,b]$ is a set..."
- [ ] lines 15–21: **definition** `{label: darboux-sums}` "Upper and Lower Darboux Sums" — excerpt: "Let $f$ be a bounded function on $[a,b]$... the **upper sum**..."
- [ ] line 23: **remark** — excerpt: "These sums essentially represent the area of rectangles bounded either above..."
- [ ] lines 25–31: **definition** `{label: darboux-integrals}` "Upper and Lower Darboux Integrals" — excerpt: "let $\mathcal{U}$ denote the set of upper sums..."
- [ ] lines 33–35: **theorem** `{label: lower-integral-leq-upper-integral}` — excerpt: "For a given function an interval, the lower Riemann integral is always..."
- [ ] lines 37–43: **definition** `{label: riemann-integrable}` "Riemann Integrable" — excerpt: "We say that $f$ is **Riemann integrable** on $[a,b]$ if..."
- [ ] lines 45–47: **theorem** `{label: riemanns-condition}` "Riemann's Condition" — excerpt: "Let $f$ be a bounded function on $[a,b]$... if and only if for every..."
- [ ] line 49: **theorem** `{label: continuous-implies-integrable}` — excerpt: "If $f$ is continuous on $[a,b]$, then $f$ is Riemann integrable..." (refs: @continuous)
- [ ] lines 53–63: **theorem** `{label: riemann-integration-rules}` "Riemann Integration Rules" — excerpt: "Assume $f$ and $g$ are Riemann integrable on $[a,b]$ and $c\in\mathbb{R}$..."
- [ ] lines 65–67: **theorem** `{label: integral-mean-value-theorem}` "Integral Mean Value Theorem" — excerpt: "If $f$ is continuous on $[a,b]$, there exists a number $c$..."
- [ ] lines 71–75: **definition** `{label: riemann-sum}` "Riemann Sum" — excerpt: "Let $f$ be a bounded function on $[a,b]$ and $P=\{x_0,...\}$..."
- [ ] lines 77–79: **definition** `{label: partition-norm}` "Norm of a Partition" — excerpt: "The **norm** of $P$ is given by..."
- [ ] lines 81–87: **definition** `{label: limit-of-riemann-sum}` — excerpt: "The limit of the sum as the norm of the partition approaches zero..."
- [ ] lines 89–91: **theorem** `{label: riemann-integral-evaluation}` "Riemann Integral Evaluation" — excerpt: "If $f$ is a Riemann integrable function on $[a,b]$, then..."

### content/analysis/real-analysis/differentiation.md
- [ ] lines 11–17: **definition** `{label: derivative}` "Derivative" — excerpt: "For $f:(a,b)\to\mathbb{R}$... we say the **derivative** of $f$ at $x$..." (line 17 is an accompanying intuition/remark)
- [ ] lines 19–34: **theorem** `{label: differentiable-implies-continuous}` + nested **proof** — excerpt: "If $f$ is differentiable at $x$, then it is continuous at $x$." (refs: @continuous)
- [ ] lines 40–49: **theorem** `{label: linearity-of-derivative}` + **proof** — excerpt: "Linearity: $(f+cg)' = f'(x) + cg'(x)$."
- [ ] lines 51–63: **theorem** `{label: product-rule}` + **proof** — excerpt: "Product: $(fg)'(x) = f'(x)g(x) + f(x)g'(x)$."
- [ ] lines 65–79: **theorem** `{label: quotient-rule}` + **proof** — excerpt: "Quotient: $(f/g)'(x) = \frac{f'(x)g(x)-f(x)g'(x)}{[g(x)]^2}$."
- [ ] lines 81–83: **theorem** `{label: chain-rule}` — excerpt: "Let $h(x)=f(g(x))$. Chain: $h'(x)=f'(g(x))\cdot g'(x)$."
- [ ] lines 86–88: **definition** `{label: local-extrema}` "Local Maximum and Minimum" — excerpt: "The real valued function... is said to have a **local maximum**..."
- [ ] line 90: **theorem** `{label: fermats-theorem}` "Fermat's Theorem" — excerpt: "Suppose $f$ is defined on an open interval, that $c$ is a number..."
- [ ] lines 94–96: **theorem** `{label: rolles-theorem}` "Rolle's Theorem" — excerpt: "Suppose $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$..." (refs: @mean-value-theorem)
- [ ] lines 106–114: **theorem** `{label: lhopitals-rule}` "L'Hospital's Rule" — excerpt: "Suppose there is a $\delta>0$ such that $f$ and $g$ are differentiable..."

### content/analysis/real-analysis/real-numbers.md
(mostly in blocks; the axioms/consequences are bare prose)
- [ ] line 18: **axiom** `{label: order-axiom}` "Order Axiom" — excerpt: "The **Order axiom** states that there exists a subset of $\mathbb{R}^+$..."
- [ ] lines 20–26: **remark/proposition** — excerpt: "A more familiar and equivalent way of stating this can be achieved..."
- [ ] line 28: **note** — excerpt: "Note that rational numbers also satisfy the field axioms and the Order..."
- [ ] line 54: **axiom** `{label: completeness-axiom}` "Completeness Axiom" — excerpt: "every nonempty subset $A$ of $\mathbb{R}$ that's bounded above has a least..." (refs: @least-upper-bound)
- [ ] lines 56–61: **example/remark** `{label: reals-contain-irrationals}` — excerpt: "One consequence of the Completeness axiom is that the real numbers contain..."
- [ ] lines 63–65: **definition** `{label: absolute-value}` "Absolute Value" — excerpt: "The **absolute value** of a real number is defined as follows..."
- [ ] lines 67–71: **proposition** `{label: abs-value-bound}` + **proof** — excerpt: "if $|a| < b$, then $-b < a < b$."
- [ ] lines 73–75: **proposition/remark** `{label: triangle-inequality}` "Triangle Inequality" — excerpt: "the absolute value function is a norm, and thus satisfies the triangle..."

### content/analysis/real-analysis/real-sequences.md
- [ ] line 21: **definition** `{label: sequence-limit}` "Limit of a Sequence" — excerpt: "We say that a sequence has a limit $L$ if we can make terms arbitrarily..."
- [ ] line 23: **definition** `{label: convergent-sequence}` "Convergent Sequence" — excerpt: "If a sequence's limit exists and is finite, we say the sequence converges..."
- [ ] lines 25–33: **example** `{label: limit-of-3n-over-n-plus-1}` + proof — excerpt: "The limit of the sequence $a_n = \frac{3n}{n+1}$ is $3$."
- [ ] line 35: **remark** — excerpt: "We can simplify this proof a bit by recognizing that..."
- [ ] lines 39–58: **theorem** `{label: uniqueness-of-sequence-limit}` + **proof** — excerpt: "the limit of a sequence is unique, that is, if $\lim = L$ and..." (note: analysis/sequences.md has @limits-of-sequences-are-unique — consider referencing instead of duplicating)
- [ ] lines 62–74: **theorem** `{label: sequence-limit-laws}` "Limit Laws for Sequences" — excerpt: "Constant Sequence: If $a_n = L$ for all $n$..." (includes Squeeze Theorem)
- [ ] line 77: **definition** `{label: bounded-sequence}` "Bounded Sequence" — excerpt: "A sequence is said to be a **bounded sequence** if there exists a real..."
- [ ] lines 80–86: **definition** `{label: divergent-sequence}` "Divergent Sequences" — excerpt: "any sequence that does not converge is said to **diverge**..."
- [ ] lines 90–92: **definition** `{label: monotone-sequence}` "Monotone Sequences" — excerpt: "The real sequence $a_n$ is said to be **increasing** if..."
- [ ] line 94: **theorem** `{label: monotone-convergence-theorem}` "Monotone Convergence Theorem" + **proof** — excerpt: "if a sequence is monotone and bounded, then it converges." (refs: @completeness-axiom)
- [ ] line 98: **definition** `{label: subsequence}` "Subsequence" — excerpt: "The sequence $a_{f(n)}$ is called a **subsequence** of the sequence..."
- [ ] lines 100–112: **theorem** `{label: limit-of-subsequence}` + **proof** + example — excerpt: "if $a_n$ is a convergent sequence with limit $L$, then any subsequence..."
- [ ] line 116: **theorem** `{label: bolzano-weierstrass-sequences}` "Bolzano-Weierstrass" — excerpt: "if a sequence of real numbers is bounded, then it has a convergent..."
- [ ] lines 120–122: **definition** `{label: cauchy-sequence}` "Cauchy" + **theorem** (Cauchy iff convergent) — excerpt: "A sequence is said to be **Cauchy** if for every $\epsilon>0$..." (note: analysis/sequences.md has @cauchy-criterion-for-convergence)
- [ ] lines 126–154: **definition/theorem** `{label: limsup-liminf}` "Lim Sup and Lim Inf" — excerpt: "Suppose the real sequence $a_n$ is bounded. Then $\limsup...$"

### content/analysis/real-analysis/limits-of-a-function.md
- [ ] lines 13–19: **definition** `{label: function-limit-interval}` "Delta-Epsilon Limit" — excerpt: "Let $I$ be an open interval containing $a$... The **limit** of $f(x)$..."
- [ ] lines 23–39: **example** `{label: limit-example-3x}` — excerpt: "Prove $\lim_{x\to 1}\frac{3x(x-1)}{x-1} = 3$."
- [ ] lines 45–49: **definition** `{label: function-limit-set}` "Limit on a Set" — excerpt: "Let $A$ be a set of real numbers and $f(x)$ be a function..."
- [ ] lines 53–61: **theorem** `{label: function-limit-laws}` "Limit Rules" — excerpt: "Suppose $\lim f = L$, $\lim g = M$ and $c\in\mathbb{R}$. Then..."
- [ ] lines 64–74: **definition** `{label: one-sided-limits}` "One-Sided Limits" — excerpt: "The limit of $f(x)$ as $x$ approaches $a$ **from the right**..."
- [ ] line 76: **theorem** `{label: two-sided-iff-one-sided}` — excerpt: "$\lim f = L$ if and only if $\lim_{x\to a^-} = \lim_{x\to a^+} = L$."
- [ ] lines 79–89: **definition** `{label: limits-at-infinity}` "Limits Involving Infinity" — excerpt: "the limit of $f(x)$ as $x$ approaches infinity is $L$..."
- [ ] lines 92–104: **example/remark** `{label: factoring-root-out-of-numerator}` — excerpt: "Factoring a root out of a numerator..."

### content/analysis/real-analysis/continuity.md
(entire file bare prose)
- [ ] lines 14–16: **definition** `{label: continuous-limit-def}` "Limit Definition of Continuity" — excerpt: "We say that $f(x)$ is **continuous** at $a$ if $\lim_{x\to a}f(x)=f(a)$." (refs: @function-limit-set)
- [ ] lines 22–24: **theorem** `{label: continuous-epsilon-delta}` "Epsilon-Delta Continuity" — excerpt: "Then $f(x)$ is continuous at $a$ if and only if for every $\epsilon>0$..."
- [ ] lines 28–38: **theorem** `{label: continuity-rules}` "Continuity Rules" + **definition** of continuous on $[a,b]$ — excerpt: "Suppose $f(x)$ and $g(x)$ are continuous at $a$..."
- [ ] line 42: **theorem** `{label: intermediate-value-theorem}` "Intermediate Value Theorem" — excerpt: "Suppose $f:[a,b]\to\mathbb{R}$ is continuous and that $r$ is a value..."
- [ ] line 44: **theorem** `{label: boundedness-theorem}` "Boundedness Theorem" — excerpt: "If $f$ is continuous on $[a,b]$ then it's bounded on $[a,b]$."
- [ ] line 46: **theorem** `{label: extreme-value-theorem}` "Extreme Value Theorem" — excerpt: "If $f$ is continuous on $[a,b]$ then $f$ attains absolute minimum..."

### content/analysis/real-analysis/series.md
(entire file bare prose)
- [ ] lines 11–19: **definition** `{label: infinite-series}` "Series and Partial Sums" — excerpt: "An infinite sequence $a_n$ can be used to form an infinite series..."
- [ ] line 22: **definition** `{label: absolute-convergence}` "Absolute and Conditional Convergence" — excerpt: "said to **converge absolutely** if $\sum|a_n|$ converges..."
- [ ] lines 26–28: **theorem** `{label: series-linearity}` "Linearity of Convergent Series" — excerpt: "If $c$ is a real number and the series... are convergent, then..."
- [ ] lines 34–42: **theorem** `{label: divergence-test}` "Divergence Test" + **proof** + note — excerpt: "if an infinite series $\sum a_n$ converges, then $\lim a_n = 0$."
- [ ] lines 44–56: **theorem** `{label: geometric-series-test}` "Geometric Series Test" + **proof** — excerpt: "the geometric series $\sum r^n$ converges if $|r|<1$..."
- [ ] lines 58–62: **theorem** `{label: bounded-partial-sums-test}` + **proof** — excerpt: "Suppose $a_n\ge 0$ for all $n$. Then the series converges iff..." (refs: @monotone-convergence-theorem)
- [ ] lines 64–65: **theorem** `{label: cauchy-condensation-test}` "$2^n$ Test" — excerpt: "Suppose $a_n\ge a_{n+1}\ge 0$... converges iff $\sum 2^n a_{2^n}$..." (see math-errors queue)
- [ ] lines 67–68: **theorem** `{label: p-series-test}` "p-Series Test" — excerpt: "The $p$-series $\sum 1/n^p$ converges if $p>1$..."
- [ ] lines 70–71: **theorem** `{label: alternating-series-test}` "Alternating Series Test" — excerpt: "Suppose $a_n\ge a_{n+1}$... Then the alternating series converges."
- [ ] lines 73–74: **theorem** `{label: absolute-convergence-implies-convergence}` — excerpt: "If the series $\sum a_n$ converges absolutely then it simply converges too."
- [ ] lines 76–77: **theorem** `{label: comparison-test}` "Comparison Test" — excerpt: "Suppose $\sum a_n$ and $\sum b_n$ are series for which $|a_n|\le|b_n|$..."
- [ ] lines 79–84: **theorem** `{label: ratio-test}` "Limit Ratio Test" — excerpt: "let $L = \lim|a_{n+1}/a_n|$. Then, if $L<1$..."
- [ ] lines 86–87: **theorem** `{label: root-test}` "Root Test" — excerpt: "let $L = \limsup|a_n|^{1/n}$. Then if $L<1$..." (refs: @limsup-liminf)

### content/analysis/real-analysis/summation.md
- [ ] lines 10–50: **example** `{label: shifting-summation-index}` "Shifting the Summation Index" — excerpt: "Let's say we have $\sum_{n=2}^\infty n(n-1)a_n x^{n-2}$..." (whole file is one worked example)

### content/analysis/real-analysis/fundamental.md
(entire file bare prose)
- [ ] lines 10–12: **theorem** `{label: fundamental-theorem-of-calculus}` "Fundamental Theorem of Calculus" — excerpt: "If $f$ is Riemann integrable on $[a,b]$ and $F$ is a function..." (refs: @riemann-integrable)
- [ ] lines 14–18: **theorem** `{label: ftc-derivative-part}` "Derivative Part of the FTC" — excerpt: "Let $f$ be continuous on $[a,b]$ and define the function $F$..." (refs: @continuous; see math-errors queue)
- [ ] lines 20–22: **theorem** `{label: integration-by-parts}` "Integration by Parts" — excerpt: "Let $f$ and $g$ be continuously differentiable functions on $[a,b]$..."
- [ ] lines 24–26: **theorem** `{label: substitution-theorem}` "Substitution for Integration" — excerpt: "Let $g$ be a function with a continuous derivative on $[a,b]$..."

### Clean files (already fully structured)
analysis/continuity.md, analysis/sequences.md, analysis/real-analysis/convexity.md

## Typos
- [ ] analysis/calculus/lengths-areas-and-volumes.md:23 — heading "## Volume Enclosed by Polar Curve" → "## Area Enclosed by Polar Curve" (the formula below it, $A=\int\frac12 r^2 d\theta$, is an area, not a volume)
- [ ] analysis/calculus/integration-strategies.md:49 — "use the integral given in (a)" → "given in (b)" (equation (b) is the $\int dv/(1-x^2)=\tanh^{-1}x$ identity; (a) is the original problem)
- [ ] analysis/calculus/vector-integral-calculus.md:57 — `\times {0}` → `\times \{0\}` (bare braces render invisibly)
- [ ] analysis/calculus/vector-integral-calculus.md:65 — `S^2 = {(x,y,z) : ...}` → `\{(x,y,z):...\}` (bare braces)
- [ ] analysis/calculus/vector-integral-calculus.md:67 — `\setminus {N}` → `\setminus \{N\}`
- [ ] analysis/calculus/vector-integral-calculus.md:77 — "An closed interval in $R^1$" → "A closed interval"
- [ ] analysis/calculus/vector-integral-calculus.md:99 — `\int_{C} \int_{C} \vec{F}...` has a doubled `\int_{C}` and trailing `... z') dt).` with a stray `)` → single integral and `dt`
- [ ] analysis/calculus/vector-integral-calculus.md:121 — `u_0 \leq u < u_1` inconsistent with `v_0 \leq v \leq v_1` → likely `u_0 \le u \le u_1`
- [ ] analysis/calculus/polar-coordinates.md:37 — `r'sin\theta` → `r'\sin\theta` (missing backslash)
- [ ] analysis/calculus/polar-coordinates.md:48 — "the second equaton" → "equation"
- [ ] analysis/calculus/vector-differential-calculus.md:66 — `lim_{h \to 0} \frac{(x+h) - f(x)}{h}` → `\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}` (missing `\`, and numerator should be `f(x+h)` — also listed as math error)
- [ ] analysis/calculus/vector-differential-calculus.md:74 — `\lim_{h \to 0} = \frac{r(h)}{h}` → remove stray `=`: `\lim_{h \to 0} \frac{r(h)}{h}`
- [ ] analysis/calculus/vector-differential-calculus.md:140 — "**total derivative** of $\vec{f}$ at $\vec{f}$" → "at $\vec{x}$"
- [ ] analysis/calculus/vector-differential-calculus.md:194 — `D_{\vec{u}} = \vec{u} \cdot \grad{f}` → `D_{\vec{u}}f = \vec{u} \cdot \grad{f}` (missing $f$ on the left)
- [ ] analysis/calculus/vector-differential-calculus.md:209 — "$\vec{b}$ and $\grad{f}$ are @parallel" → `$\vec{u}$` (the unit vector is $\vec{u}$; $\vec{b}$ is undefined)
- [ ] analysis/calculus/vector-differential-calculus.md:518 — `\dfrac{\partial F_@}{\partial y}` → `\dfrac{\partial F_2}{\partial y}`
- [ ] analysis/calculus/vector-differential-calculus.md:608 — `\vec{\omega}}}` → `\vec{\omega}` (extra braces)
- [ ] analysis/calculus/vector-differential-calculus.md:624 — `\vec{\omega.}` → `\vec{\omega}.` (period inside the braces)
- [ ] analysis/real-analysis/integration.md:33 — "For a given function an interval" → "for a given function and interval"
- [ ] analysis/real-analysis/integration.md:83,85 — `\normP` is not a defined macro (line 79 uses `\norm{P}`) → `\norm{P}`
- [ ] analysis/real-analysis/integration.md:85 — "for any points $T,$ is is the case that" → "it is the case"
- [ ] analysis/real-analysis/differentiation.md:23 — `\lim_{x -> a}` → `\lim_{x \to a}`
- [ ] analysis/real-analysis/differentiation.md:65 — `\frac{...}{\[g(x)\]^2}` → `\frac{...}{[g(x)]^2}` (`\[ \]` are display-math delimiters, not brackets)
- [ ] analysis/real-analysis/real-numbers.md:18 — "there exists a subset of $\mathbb{R}^+$ of $\mathbb{R}$" → "there exists a subset $\mathbb{R}^+$ of $\mathbb{R}$"
- [ ] analysis/real-analysis/real-numbers.md:67 — "One fact that follow from" → "follows"
- [ ] analysis/real-analysis/real-numbers.md:69 — `$a >= 0$` → `$a \geq 0$` (`>=` is not valid LaTeX)
- [ ] analysis/real-analysis/real-numbers.md:104 — "Because because" → "Because"
- [ ] analysis/real-analysis/real-sequences.md:12 — "A real sequence of numbers if a function" → "is a function"
- [ ] analysis/real-analysis/real-sequences.md:39 — `\lim_{n \to \infty} = L` and `= M` → missing operand `a_n`: `\lim_{n\to\infty} a_n = L`
- [ ] analysis/real-analysis/real-sequences.md:74 — "the same liimt $L$" → "limit"
- [ ] analysis/real-analysis/real-sequences.md:82,84 — `\lim_{n->\infty}` → `\lim_{n\to\infty}`
- [ ] analysis/real-analysis/real-sequences.md:82,84 — "not matter how large/small" → "no matter"
- [ ] analysis/real-analysis/real-sequences.md:92 — "A real sequence is $a_n$ is said to be **monotone**" → drop one "is"; and "decreasining" → "decreasing"
- [ ] analysis/real-analysis/real-sequences.md:114,116 — "Bolzano-Weirstrass" → "Bolzano-Weierstrass"
- [ ] analysis/real-analysis/limits-of-a-function.md:13 — "donoted" → "denoted"
- [ ] analysis/real-analysis/limits-of-a-function.md:43 — "where there domain is a set" → "the domain"
- [ ] analysis/real-analysis/limits-of-a-function.md:61 — "(same assumption as given above applies..." — unclosed parenthesis (no closing `)`)
- [ ] analysis/real-analysis/limits-of-a-function.md:76 — `0 < \| x - a \| \delta` → `0 < |x-a| < \delta` (missing `<`)
- [ ] analysis/real-analysis/limits-of-a-function.md:98 — `\sqrt{(n+1)^2)` → `\sqrt{(n+1)^2}` (mismatched brace/paren)
- [ ] analysis/real-analysis/continuity.md:6 — front matter contains stray `test: change` (looks like leftover junk)
- [ ] analysis/real-analysis/continuity.md:46 — "Extereme Value Theorem" → "Extreme Value Theorem"; "absolume maximum" → "absolute maximum"
- [ ] analysis/real-analysis/series.md:17,38 — `s_n = \sum_{k=1}^{n} a_n` → summand should use the index `k`: `\sum_{k=1}^n a_k`
- [ ] analysis/real-analysis/summation.md:31 — "nothing is lost be shifting" → "by shifting"
- [ ] analysis/real-analysis/summation.md:50 — `\sum_{k=1}{...}` → missing upper limit: `\sum_{k=1}^{\infty}`
- [ ] analysis/sequences.md:96,125 — "pick $N_t$ such that $|t_n - s| < ...$" → `$|t_n - t|$` (both in proof (a) and proof (d))
- [ ] analysis/sequences.md:160 — "when $n \geq M$" → "$n \geq N$" (variable defined as $N$)
- [ ] analysis/sequences.md:194 — "distance from $\alpha_{k,n}$ to $\alpha_{n}$" → "$\alpha_{j,n}$ to $\alpha_j$"
- [ ] analysis/sequences.md:206 — "Part (b) follows from part (a) and @sequence-in-rk-converges-iff-its-components-converge" — self-reference; likely should be `@sums-and-products-of-sequences`
- [ ] analysis/sequences.md:239 — `d(p, p_{n_1} < 1.` → missing `)`: `d(p, p_{n_1}) < 1`
- [ ] analysis/sequences.md:257 — `E* = \{q\}` → `E^* = \{q\}`
- [ ] analysis/sequences.md:278 — "such that $d(p_n,p_m)<\epsilon$ is $n\geq N$" → "if $n \geq N$"
- [ ] analysis/sequences.md:293 — `lim_{N \to \infty}` → `\lim_{N \to \infty}`
- [ ] analysis/sequences.md:329 — `\lim+{n \to \infty}` → `\lim_{n \to \infty}`
- [ ] analysis/sequences.md:355 — "let $E_n$ bet the set" → "be the set"
- [ ] analysis/continuity.md:71 — "This follows directly from the that @{...}" → "from the fact that"
- [ ] analysis/continuity.md:144 — `d_z(g(f(x)), ...)` → `d_Z(...)` (capitalization inconsistent with $d_Z$ elsewhere)
