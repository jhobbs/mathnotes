# Queue 03: Complex Analysis

## Formalization candidates

### content/analysis/complex-analysis/module-01-algebriac-properties.md
Almost entirely un-blocked prose defining core terms (only lines 117–126 are formal blocks).
- [ ] line 12: **definition** `{label: pure-imaginary-number}` "Pure Imaginary Number" — excerpt: "A **pure imaginary number** is the product of a real number and..."
- [ ] line 14: **definition** `{label: complex-number}` "Complex Number" — excerpt: "A **complex number** is one which can be written in the form $a + bi$..."
- [ ] lines 18–20: **definition** `{label: real-imaginary-part}` "Real and Imaginary Part" — excerpt: "The $a$ in the complex number $z = a + bi$ is called..."
- [ ] lines 22–24: **definition** `{label: complex-conjugate}` "Conjugate" — excerpt: "If $z = a+bi$, then the **conjugate of z**, written as $\bar z$..."
- [ ] line 26: **definition** `{label: modulus}` "Modulus / Absolute Value" — excerpt: "If $z = a + bi$, then the **absolute value of z** or **modulus**..."
- [ ] lines 55–65: **definition** `{label: principal-argument}` "Principal Argument" — excerpt: "The polar angle $\theta$ in the figure above is called the **principal argument**..."
- [ ] lines 67–73: **definition** `{label: argument}` "Argument (multivalued)" — excerpt: "Writing it as $\text{arg}z$ means that instead of taking the **principal value**..." (refs: @principal-argument)
- [ ] lines 77–83: **note** `{label: exponential-form}` "Exponential Form / Euler's Formula" — excerpt: "We can also write a complex number in **exponential form**, by taking..."
- [ ] lines 89–99: **note** `{label: complex-arithmetic}` "Algebra of Complex Numbers" — excerpt: "Here are the rules for performing addition, subtraction, multiplication and division..."
- [ ] lines 128–144: **note** `{label: square-root-complex}` "Square Root of Complex Numbers" — excerpt: "To find the square roots $z$ of a complex number $Z$..." (contains a "principal square root" definition at line 144)
- [ ] lines 155–193: **note** `{label: exp-trig-hyperbolic-series}` "Series & Hyperbolic Definitions" — excerpt: "Some Maclaurin series expansions for a complex valued $z$..." (defines hyperbolic sine/cosine/tangent)
- [ ] lines 195–245: **theorem**+**proof** `{label: conjugate-roots}` "Complex Roots Occur in Conjugate Pairs" — excerpt: "Given that $r$ is a root of $a_nx^n + \cdots + a_0 = 0$..." (a full theorem-with-proof currently just a `##` heading; refs: @complex-conjugate)

### content/analysis/complex-analysis/module-02-regions-of-the-complex-plane.md
- [ ] lines 14–18: **definition** `{label: epsilon-neighborhood}` "ε-neighborhood" — excerpt: "An **$\epsilon$-neighborhood** of a point $z_0$ is the set of all complex numbers..."
- [ ] line 20: **definition** `{label: interior-point}` "Interior Point" — excerpt: "A point $z$ of a set $S$ ... is called an **interior point**..." (referenced as @interior-point / @interior-points in module-05)
- [ ] line 22: **definition** `{label: boundary-point}` "Boundary Point" — excerpt: "On the other hand, $z$ is a **boundary point** of $S$ if..."
- [ ] line 24: **definition** `{label: open-set}` "Open" — excerpt: "A set $S$ ... is said to be **open** if all points in $S$..." (referenced as @open in module-02 Domain, @set in module-05)
- [ ] line 26: **definition** `{label: closed-set}` "Closed" — excerpt: "A set $S$ ... is said to be **closed** if it contains all of its boundary..."
- [ ] line 28: **note** `{label: clopen-note}` — excerpt: "Note that a set can be both open and closed! Both the empty set and..."
- [ ] line 30: **definition** `{label: bounded-set}` "Bounded / Unbounded" — excerpt: "A set $S$ ... is said to be **bounded** if there exists a positive..." (referenced as @bounded in module-22)

### content/analysis/complex-analysis/module-03-complex-functions.md
- [ ] line 14: **definition** `{label: domain-of-definition}` "Domain of Definition" — excerpt: "The set of complex numbers on which a function operates is called..." (referenced as @domain-of-definition in module-05)
- [ ] line 20: **definition** `{label: range}` "Range" — excerpt: "...values of $w$ in the **range**, which is the set of all values..."
- [ ] lines 28–60: **note** `{label: geometric-functions}` "Geometrically Interesting Functions" — excerpt: "The function $w = z + b$ ... translates any point in the $z$-plane..." (defines translation, rotation/magnification, reciprocation)
- [ ] lines 64–70: **definition** `{label: bilinear-mapping}` "Bilinear / Möbius Mapping" — excerpt: "Another important class of functions is called **bilinear** or **Mobius**..."
- [ ] lines 82–90: **note** `{label: image-of-curve}` "Finding the Image of a Curve" — excerpt: "The **image** in the $w$-plane of a curve $C$ ... can be found by two..."
- [ ] lines 93–95: **definition** `{label: point-at-infinity}` "Point at Infinity / Extended Plane" — excerpt: "There isn't just one point at infinity. In fact, if you go infinitely..." (referenced as @point-at-infinity in module-22)

### content/analysis/complex-analysis/module-04-limits.md
Entire file is un-blocked.
- [ ] lines 14–22: **definition** `{label: limit}` "Limit (delta-epsilon)" — excerpt: "The **limit** of $f(z)$ as $z$ approaches $a$ is $L$..." (referenced as @limit in module-05)
- [ ] lines 30–40: **definition** `{label: continuous}` "Continuity" — excerpt: "A complex function $f$ is said to be **continuous** at $z = z_0$ if..." (referenced as @continuous throughout modules 05, 10, 12)
- [ ] line 44: **definition** `{label: removable-discontinuity}` "Removable Discontinuity" — excerpt: "A discontinuity in a function $f$ at $z_0$ is said to be a **removable**..."
- [ ] lines 48–52: **definition** `{label: branch}` "Branch, Branch Cut, Branch Point" — excerpt: "A multi-valued function such as $\arg z$ can be made single valued..."

### content/analysis/complex-analysis/module-05-derivatives.md
Mostly well-blocked. Un-blocked candidates near the end:
- [ ] line 187: **theorem** `{label: zero-derivative-constant}` — excerpt: "If $f'(z) = 0$ at every point of a domain $D$, then $f(z)$ must be constant..."
- [ ] line 189: **theorem** `{label: constant-part-implies-constant}` — excerpt: "If $f(z) = u + vi$ is analytic in a domain $D$, and if either $u$..."
- [ ] lines 191–202: **note** `{label: cr-polar-form}` "Cauchy-Riemann in Polar Form" — excerpt: "Also, here are the Cauchy-Reimann equations in terms of the modulus..." (refs: @cauchy-riemann-equations)
- [ ] lines 204–216: **note** `{label: jacobian-of-f}` "Jacobian Representation" — excerpt: "Given a complex function $f(z) = u(x,y)+v(x,y)i$, we can use a Jacobian..." (refs: @cauchy-riemann-equations)

### content/analysis/complex-analysis/module-06-harmonic.md
Entire file is un-blocked.
- [ ] lines 10–12: **definition** `{label: harmonic}` "Harmonic Function" — excerpt: "A real-valued function $\phi(x,y)$ is said to be **harmonic** in a domain..."
- [ ] lines 14–16: **theorem** `{label: real-imag-parts-harmonic}` — excerpt: "The real and imaginary parts of a function analytic in a domain $D$ are harmonic..." (refs: @analytic, @cauchy-riemann-equations)
- [ ] line 18: **definition** `{label: harmonic-conjugate}` "Harmonic Conjugate" — excerpt: "...a function $v(x,y)$ such that $u + vi$ is analytic in $D$ is called a **harmonic conjugate**..."
- [ ] lines 20–38: **example** `{label: finding-harmonic-conjugate}` "Finding a Harmonic Conjugate" — excerpt: "Given a harmonic function $u(x,y)$ on a suitable domain, we can use..." (refs: @cauchy-riemann-equations)
- [ ] line 44: **remark** `{label: harmonic-orthogonal-families}` — excerpt: "One interesting property of harmonic functions and their conjugates is that..."

### content/analysis/complex-analysis/module-08-elementary-functions.md
Entire file un-blocked; a large collection of definitions.
- [ ] lines 12–44: **definition** `{label: complex-exponential}` "Complex Exponential Function" — excerpt: "The complex exponential function, $f(z) = e^z$, is defined as the unique solution..." (refs: @entire-function)
- [ ] lines 46–68: **definition** `{label: complex-trig-functions}` "Complex Trigonometric Functions" — excerpt: "Complex trigonometric functions follow the same algebraic rules..."
- [ ] lines 70–92: **definition** `{label: complex-hyperbolic-functions}` "Complex Hyperbolic Functions" — excerpt: "$\sinh z = \frac{e^z - e^{-z}}{2}$ ... These are entire functions..."
- [ ] lines 94–128: **definition** `{label: complex-logarithm}` "Complex Logarithm / Principal Log" — excerpt: "The real logarithm function $\ln x$ is defined as the inverse..." (refs: @branch, @principal-argument)
- [ ] lines 130–134: **definition** `{label: general-powers}` "General Powers of z" — excerpt: "For a complex number $a$, $a^z = e^{z\ln a}$."

### content/analysis/complex-analysis/module-09-indefinite-integrals.md
- [ ] lines 10–13: **definition** `{label: complex-indefinite-integral}` "Complex Indefinite Integral / Antiderivative" — excerpt: "Just like with real indefinite integrals, if $\frac{d}{dz}F(z) = f(z)$..."

### content/analysis/complex-analysis/module-10-contour-integrals.md
- [ ] lines 48–57: **note** (or theorem) `{label: contour-integral-properties}` "Properties of Contour Integrals (ML inequality)" — excerpt: "Some additional properties: $\Re \int_C f(z) dz = \int_C \Re[f(z)dz]$..."
- [ ] lines 59–80: **example** `{label: contour-integral-triangle}` "Integral of $e^z$ over a Triangle" — excerpt: "Here's an example problem: evaluate $\oint_C e^z dz$ where $C$ is..."

### content/analysis/complex-analysis/module-11-independence-of-path.md
Entire file un-blocked; three stated theorems.
- [ ] line 14: **theorem** `{label: independence-iff-antiderivative}` — excerpt: "The contour integral of a continuous function $f$ is independent of path..." (refs: @continuous)
- [ ] lines 16–18: **theorem** `{label: ftc-contour-integrals}` "FTC for Contour Integrals" — excerpt: "If $f$ is continuous in a domain $D$ and has an antiderivative $F$..."
- [ ] lines 20–22: **theorem** `{label: independence-iff-closed-vanishes}` — excerpt: "The contour integral of a continuous function $f$ is independent of path..."
- [ ] lines 24–26: **note** `{label: branch-cut-antiderivative-caution}` — excerpt: "We have to be careful about branch cuts. Different antiderivatives of $1/z$..." (refs: @residue-theorem)

### content/analysis/complex-analysis/module-12-cauchy-goursat.md
- [ ] lines 63–71: **example** `{label: integral-over-annulus-singularities}` — excerpt: "This arms us with a method to find the following contour integral: $\oint_C \frac{1}{z^2-1}$..."
- [ ] lines 85–87: **example** `{label: partial-fraction-contour}` — excerpt: "Now, via partial fraction decomposition we have $\oint_C \frac{1}{z^2-1}$..." (refs: the theorem at lines 76–83)
- [ ] lines 89–95: **theorem** `{label: simply-connected-properties}` "Properties of Simply-Connected Domains" — excerpt: "When $f$ is analytic in a simply-connected domain $D$, the contour integral..."

### content/analysis/complex-analysis/module-13-cauchy-integral-formula.md
Entire file un-blocked; these are referenced elsewhere (@Cauchy-integral-formula in module-23).
- [ ] lines 11–20: **theorem** `{label: cauchy-integral-formula}` "Cauchy Integral Formula" — excerpt: "When $f$ is analytic inside and on a simple, closed, piecewise smooth curve $C$..." (refs: @analytic; this is the target of @Cauchy-integral-formula in module-23 line 17)
- [ ] lines 24–26: **theorem** `{label: cauchy-integral-formula-derivatives}` "CIF for Derivatives" — excerpt: "When $f$ is analytic inside and on a closed, piecewise smooth curve $C$, and $n$..." (refs: @cauchy-integral-formula)

### content/analysis/complex-analysis/module-20-taylor-and-maclaurin-series.md
- [ ] lines 65–73: **note** `{label: important-maclaurin-series}` "Common Maclaurin Series" — excerpt: "Here are some important and useful Maclaurin series that we can often use..."
- [ ] lines 75–105: **note** `{label: center-and-radius-of-convergence}` "Finding Center and Radius of Convergence" — excerpt: "Given a power-series, we often want to know the center and radius..." (refs: @radius-of-convergence, @circle-of-convergence)

### content/analysis/complex-analysis/module-21-laurent-series.md
- [ ] lines 10–30: **note** `{label: geometric-series-background}` "Geometric Series Background" — excerpt: "First, some background on geometric series. The geometric series..."
- [ ] lines 32–38: **theorem** `{label: laurent-expansion-theorem}` "Laurent Expansion Theorem" — excerpt: "Let $f$ be analytic in an annulus $D: r < |z-z_0| < R$. Then $f(z)$ can..." (currently just bold text, not a block)
- [ ] lines 40–72: **example** `{label: laurent-series-example}` "Laurent Series Worked Example" — excerpt: "We will find the Laurent series for $f(z) = \frac{z}{z^2-3z+z}$..." (refs: @laurent-expansion-theorem; see math-errors queue re: denominator)
- [ ] lines 74–118: **note** `{label: finding-all-taylor-laurent}` "General Method for Finding All Series" — excerpt: "If we want to find all of the Taylor and Laurent Series for $f(z)$..." (refs: @binomial-series, @taylor-series)

### content/analysis/complex-analysis/module-23-residue-integration.md
- [ ] lines 9–25: **theorem** (or note) `{label: residue-integration-formula}` "Integral from the Residue" — excerpt: "Suppose $f(z)$ has a singularity at $z=z_0$ inside a simple closed curve $C$..." (refs: @laurent-series, @Cauchy-integral-formula; leads into the "Residue" definition)

### content/analysis/complex-analysis/module-24-real-integrals.md
- [ ] lines 11–33: **note** (method) `{label: full-period-trig-integrals}` "Full-Period Trigonometric Integrals" — excerpt: "If we have an integral of the form $I = \int_0^{2\pi} g(\sin\theta,\cos\theta)d\theta$..." (refs: @residue)
- [ ] lines 47–89: **example** `{label: improper-integral-example}` "Improper Integral via Residues" — excerpt: "This method applies for integrals of the form $\int_{-\infty}^{\infty} f(x)dx$..." (contains worked example lines 59–85; refs: @residue-theorem, @rational-function)
- [ ] lines 127–139: **theorem**+**example** `{label: principal-value-formula}` "Principal Value with Real-Axis Poles" — excerpt: "Putting this all together, we get, for an integral that has poles off..."

### Clean or already well-blocked files
module-07-zeros.md (structured, but uses invalid `:::define` type, see typos), module-22-classification-of-singularities.md, module-25-more-series.md

## Typos
- [ ] module-01-algebriac-properties.md:14 — "where a and be are real numbers" → "where $a$ and $b$ are real numbers"
- [ ] module-01-algebriac-properties.md:32 — "relationships between a complex numbe rand the polar" → "complex number and the polar"
- [ ] module-01-algebriac-properties.md:51 — "$r(cos\theta + i\sin\theta)$" → "$r(\cos\theta + i\sin\theta)$" (unescaped `cos`)
- [ ] module-01-algebriac-properties.md:61 — "$tan{\theta}$" → "$\tan\theta$" (unescaped `tan`)
- [ ] module-01-algebriac-properties.md:69 — "$\Argz$" is malformed → "$\Arg z$"; also range "$n = 1,2,3$" should include $n=0$
- [ ] module-01-algebriac-properties.md:108 — "$cos(\theta_1+\theta_2) + isin(\theta_1+\theta_2)$" → "$\cos(\dots) + i\sin(\dots)$"
- [ ] module-01-algebriac-properties.md:235,239 — duplicate equation label `\tag{g}` used twice
- [ ] module-02-regions-of-the-complex-plane.md:41 — "a boundary that is not included the in the set" → "not included in the set"
- [ ] module-03-complex-functions.md:24 — "We can, how ever, represent" → "however"
- [ ] module-03-complex-functions.md:26 — "Some Geometricly Interesting Functions" → "Geometrically"
- [ ] module-04-limits.md:14 — "is $L$, donoted as" → "denoted"
- [ ] module-04-limits.md:50 — "call this fuction $\arg_\phi z$" → "function"
- [ ] module-05-derivatives.md:13,45 — "$\lim_{\Delta z -> 0}$" uses `->` → should be `\to` (renders literally otherwise)
- [ ] module-05-derivatives.md:191 — "Cauchy-Reimann equations ... a functon of $z$" → "Cauchy-Riemann ... function"
- [ ] module-06-harmonic.md:36 — "$g'(x,y) + h'(x,y)$" → "$g'(x,y) + h'(x)$" ($h$ is a function of $x$ only; the surrounding text uses $h'(x)$)
- [ ] module-06-harmonic.md:40 — "the same mechnical procedure" → "mechanical"
- [ ] module-07-zeros.md:9,15 — `:::define "Zero"` / `:::define "Simple Zero"` use invalid block type `define` → should be `:::definition`
- [ ] module-08-elementary-functions.md:116 — "on the negative real aixs" → "axis"
- [ ] module-08-elementary-functions.md:126 — "making an angle of $\phi$ radians ith the positive real axis" → "with"
- [ ] module-09-indefinite-integrals.md:15 — "so we homogeniety and additivity" → "so we have homogeneity and additivity"
- [ ] module-10-contour-integrals.md:97 — "$\frac{1}{e^(i\theta)}$" → "$\frac{1}{e^{i\theta}}$" (parentheses should be braces)
- [ ] module-11-independence-of-path.md:5 — title "Indepenence of Path" → "Independence"
- [ ] module-12-cauchy-goursat.md:9 — label `{label: @cauchys-integral-theorem}` has a stray `@` (labels shouldn't be prefixed with `@`) → `{label: cauchys-integral-theorem}`
- [ ] module-12-cauchy-goursat.md:15 — "Let $f(z) = u(x,y) + i(v,y)$" → "$u(x,y) + i\,v(x,y)$"
- [ ] module-20-taylor-and-maclaurin-series.md:46 — "The circle $|z - z_0| < $ in which" — missing radius after `<` (e.g. `< R`)
- [ ] module-20-taylor-and-maclaurin-series.md:91 — "First, the root test." — the derivation that follows is the ratio test → "First, the ratio test."
- [ ] module-20-taylor-and-maclaurin-series.md:93 — "$\left|\frac{a_{n+1}w^{a_{n+1}}}{a_n w^n}\right|$" — exponent `w^{a_{n+1}}` should be `w^{n+1}`
- [ ] module-20-taylor-and-maclaurin-series.md:114 — "converges absolutely for any any complex $\alpha$" → "for any complex $\alpha$"
- [ ] module-22-classification-of-singularities.md:40 — "As $z$ approach $0$ on the positive real axis" → "approaches"
- [ ] module-23-residue-integration.md:19 — "$\frac{1}{2 * pi * i}$" → "$\frac{1}{2\pi i}$" (unescaped `pi`, literal `*`)
- [ ] module-24-real-integrals.md:15 — "$g(\sin\theta \cos\theta)$" → "$g(\sin\theta, \cos\theta)$" (missing comma between the two arguments)
- [ ] module-24-real-integrals.md:31 — "$\oint_{|z|} f(z)\frac{dz}{iz}$" — subscript incomplete → "$\oint_{|z|=1}$"
- [ ] module-24-real-integrals.md:85,120 — "$\Res{z \to z_1}$", "$\Res{z=a}$" missing subscript underscore → "$\Res_{z=z_1}$", "$\Res_{z=a}$"
- [ ] module-24-real-integrals.md:131 — "which must be simple." — unbalanced parenthesis (opening `(` on line 131 never closed)
- [ ] module-25-more-series.md:10 — "Let $w \in mathbb{C}$" → "$w \in \mathbb{C}$" (missing backslash)
- [ ] module-25-more-series.md:43 — stray lone `$$` after the aligned block already closed on line 42 (orphan math delimiter)

(All paths relative to content/analysis/complex-analysis/ unless noted.)
