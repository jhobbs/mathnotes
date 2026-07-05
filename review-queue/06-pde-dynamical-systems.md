# Queue 06: PDEs & Dynamical Systems

## Formalization candidates

### content/applied-math/differential-equations/partial-differential-equations/fourier-series.md
- [ ] line 11: **definition** `{label: periodic-function}` "Periodic Function" — excerpt: "A function is periodic of period T if f(x+T)=f(x)..."
- [ ] line 13: **definition** `{label: even-function}` "Even Function" — excerpt: "A function that satisfies f(-x)=f(x)... is even..."
- [ ] line 15: **definition** `{label: odd-function}` "Odd Function" — excerpt: "A function f that satisfies f(-x)=-f(x)... odd function..." (refs: @even-function)
- [ ] lines 20–26: **proposition** `{label: integrals-of-even-odd-functions}` — excerpt: "If f is an even piecewise continuous function on [-a,a]..." (refs: @even-function, @odd-function)
- [ ] lines 30–72: **proposition** `{label: trig-orthogonality-relations}` "Orthogonality Relations" — excerpt: "The following three integrals are crucial in Fourier series..." (derivation-heavy; results are the load-bearing part)
- [ ] lines 80–90: **definition** `{label: fourier-series}` "Fourier Series" — already marked "**Definition**" in prose; also defines **Euler-Fourier formulas** (could be @euler-fourier-formulas)
- [ ] lines 92–110: **example** `{label: fourier-series-abs-3x}` — excerpt: "Find the Fourier series for f(x)=|3x|, -pi<x<pi..." (refs: @fourier-series, @even-function)
- [ ] lines 114–122: **definition** `{label: odd-2l-periodic-extension}` — excerpt: "we might wish to construct an artificial extension... odd 2L-periodic extension..." (also **half-range expansion**)
- [ ] lines 124–132: **definition** `{label: even-2l-periodic-extension}` — excerpt: "Similarly, we can define the even 2L-periodic extension..."
- [ ] lines 138–144: **definition** `{label: fourier-cosine-series}` — excerpt: "The Fourer cosine series of f(x) on [0,L] is..."
- [ ] lines 146–152: **definition** `{label: fourier-sine-series}` — excerpt: "The Fourer sine series of f(x) on [0,L] is..."

### content/applied-math/differential-equations/partial-differential-equations/heat.md
- [ ] lines 11–37: **definition** `{label: heat-equation}` "Heat Equation" — excerpt: "The Heat Equation in one spatial variable is a partial differential equation..." (refs: @Laplacian)
- [ ] lines 45–49: **definition** `{label: boundary-conditions}` — excerpt: "we require that u(0,t)=u(L,t)=0... These are called boundary conditions..."
- [ ] lines 49–53: **definition** `{label: initial-condition}` — excerpt: "we must be given the initial temperature distribution f(x)..."
- [ ] lines 55–63: **example** or **definition** `{label: heat-ibvp}` "Initial-Boundary Value Problem" — excerpt: "Combining equations (4),(5),(6), we have the following mathematical model..." (refs: @boundary-conditions, @initial-condition)

### content/applied-math/differential-equations/partial-differential-equations/intro.md
- [ ] line 11: **note** — excerpt: "while solutions to systems of ODEs depend on arbitrary constants..." (refs: @system-of-differential-equations)
- [ ] line 13: **note** `{label: counting-principle}` "Counting Principle" — excerpt: "we can expect the solution to an nth order PDE involving m independent variables..."
- [ ] lines 15–29: **example** `{label: simplest-pde}` — excerpt: "The simplest PDE, for a function u(t,x) of two variables is..."
- [ ] lines 33–87: **example** `{label: basic-transport-equation}` — excerpt: "The basic transport equation is u_t + c u_x = 0..."
- [ ] lines 89–109: **example** `{label: transport-with-decay}` — excerpt: "models the transport of, for example, a radioactively decaying solute..."
- [ ] lines 111–147: **example** `{label: non-uniform-transport}` — excerpt: "The non-uniform transport problem is another generalization..."

### content/applied-math/differential-equations/partial-differential-equations/separation-of-variables.md
- [ ] lines 9–17: **note** `{label: separation-of-variables-method}` — excerpt: "The method of separation of variables is effective in solving..."
- [ ] line 72: **definition** `{label: eigenfunction}` / **definition** `{label: eigenvalue}` — excerpt: "These solutions are called the eigenfunctions... the eigenvalues are..."
- [ ] lines 121–137: **example** `{label: heat-flow-example}` — excerpt: "Find the soluton to the heat flow problem..." (refs: @heat-equation)
- [ ] lines 140–150: **theorem/proposition** `{label: general-heat-solution}` — excerpt: "almost any function f(x)... can be expressed as a convergent series of eigenfunctions..." (refs: @fourier-sine-series)
- [ ] lines 211–231: **example/definition** `{label: vibrating-string}` "Vibrating String Problem" — excerpt: "The equation of motion for a vibrating string of length L with fixed ends..."
- [ ] lines 232–242: **example** `{label: vibrating-string-example}` — excerpt: "Solve the vibrating string problem with alpha=5, L=pi..." (see math-errors queue re: line 242)
- [ ] lines 244–250: **definition** `{label: laplaces-equation}` "Laplace's Equation" — excerpt: "Laplace's equation ... Has a lot of applications..."
- [ ] lines 252–262: **definition** `{label: dirichlet-neumann-bc}` — excerpt: "There are two basic types of boundary conditions... Dirichlet... Neumann..." (refs: @boundary-conditions)

### content/applied-math/dynamical-systems/bifurcations.md
- [ ] lines 30–42: **proposition** `{label: saddle-node-conditions}` — excerpt: "the prototypical forms for saddle-node bifurcations are..." (refs: @saddle-node, @tangential-intersection, @bifurcation-point)
- [ ] lines 60–70: **proposition** `{label: saddle-node-condition-summary}` — excerpt: "f_r != 0. f_xx != 0." (adjacent :::intuition already exists)
- [ ] lines 72–84: **proposition** `{label: transcritical-conditions}` — excerpt: "f_r = 0. f_xx != 0. f_xr != 0." (refs: @transcritical)
- [ ] lines 86–108: **proposition** `{label: pitchfork-conditions}` — excerpt: "f_r = 0. f_xx = 0. f_xxx != 0..."
- [ ] lines 110–112: **remark** — excerpt: "We can find the normal form by shifting to u=x-x*, mu=r-r*..."
- [ ] lines 114–150: **example** `{label: nondimensionalization}` "Nondimensionalization" — excerpt: "we can sometimes eliminate parameters through dimensional analysis..." (see math-errors queue re: lines 136–138)
- [ ] lines 152–192: **note/remark** `{label: bifurcation-diagram-algorithm}` — excerpt: "Algorithm (1D bifurcation diagram for x-dot = f(x,r))..."

### content/applied-math/dynamical-systems/discrete-maps.md
- [ ] lines 35–37: **example** `{label: alternating-map}` — excerpt: "Example: x_{n+1} = -x_n. If we start with x_0..."
- [ ] lines 45–47: **definition** `{label: fixed-point-discrete}` — excerpt: "A fixed point in a DTDS is a point whose further iteration does not change..." (refs: @fixed-point)
- [ ] lines 49–77: **proposition** `{label: linear-map-stability}` with nested **proof** — excerpt: "Consider x_{n+1} = lambda x_n... In summary, if |lambda|<1..."

### content/applied-math/dynamical-systems/flows-on-the-circle.md
- [ ] lines 6–10: **definition** `{label: flow-on-circle}` (weak/short) — excerpt: "Instead of a line, we can have flows on a circle..." (refs: @angular-velocity)

### content/applied-math/dynamical-systems/flows-on-the-line.md
- [ ] lines 64–72: **example** `{label: population-growth}` — excerpt: "A very simple model of population growth is just exponential growth..." (refs: @fixed-point)

### content/applied-math/dynamical-systems/limit-cycles.md
- [ ] lines 5–9: **proposition/note** `{label: polar-coordinate-conversion}` — excerpt: "it's sometimes useful... to convert to polar coordinates..."
- [ ] lines 17–37: **example** `{label: energy-conservation}` — excerpt: "consider a particle of mass m moving along the x-axis..." (refs: @conserved-quantity, @conservative-system)
- [ ] lines 57–59: **remark** — excerpt: "These homoclinic-orbits are common in conservative systems but are rare otherwise..." (refs: @homoclinic-orbit)
- [ ] line 155: **definition/note** `{label: bendixsons-theorem}` "Bendixson's Theorem" — excerpt: "The special case where g(x)=1 is called Bendixson's theorem..."

### content/applied-math/dynamical-systems/planar-bifurcations.md
- [ ] lines 14–20: **definition/example** `{label: saddle-node-planar}` — excerpt: "A pair of fixed points, one saddle and one node... approach each other..." (refs: @saddle, @node)
- [ ] lines 22–28: **definition/example** `{label: transcritical-planar}` — excerpt: "A fixed-point always exists, in the same place..."
- [ ] lines 30–36: **definition/example** `{label: supercritical-pitchfork}` — excerpt: "we have a single stable fixed point, and at the bifurcation..."
- [ ] lines 38–46: **definition/example** `{label: subcritical-pitchfork}` — excerpt: "Here, we have a stable origin flanked by two unstable fixed points..."
- [ ] lines 48–59: **definition** `{label: supercritical-hopf}` "Supercritical Hopf Bifurcation" — excerpt: "a conjugate pair of eigenvalues can cross the imaginary axis..."
- [ ] lines 62–67: **definition** `{label: subcritical-hopf}` — excerpt: "Subcritical Hopf bifurcations happen when an unstable spiral changes to a stable spiral..."

### content/applied-math/dynamical-systems/planar.md
- [ ] lines 62–71: **note/theorem** `{label: linear-classification}` — the classification table plus "Linear systems only have one fixed point, the origin!" (refs: @eigenvalues, @characteristic-equation)
- [ ] lines 73–88: **theorem/note** `{label: jacobian-linearization}` — excerpt: "We can do linear stability analysis on this system... use the Jacobian matrix..." (refs: @hyperbolic-fixed-point)

### content/applied-math/dynamical-systems/weakly-nonlinear.md
- [ ] lines 16–24: **definition** `{label: regular-perturbation-theory}` — excerpt: "we could get a useful solution just truncating to the first few terms... regular perturbation theory..." (refs: @weakly-nonlinear-oscillator)
- [ ] lines 24–66: **example** `{label: weakly-damped-oscillator}` — excerpt: "We'll use the weakly damped linear oscillator as an example..." (see math-errors queue re: $\dot{x}$ vs $\ddot{x}$)
- [ ] lines 68–162: **example** `{label: two-timing-example}` "Two Timing" — excerpt: "Given the weakly nonlinear oscillator... let tau=t be fast time and T=epsilon t be slow time..."

### Empty stubs (nothing to formalize)
chaos.md, fractals.md, logistic-map.md (only TODO comments)

## Typos
- [ ] fourier-series.md:94,96 — "$f(x) = \|3x\|$" → `|3x|` (`\|` renders as norm bars ‖; should be single absolute-value bars)
- [ ] fourier-series.md:96 — "Here, $L$ = $pi$." → `$\pi$` (missing backslash)
- [ ] fourier-series.md:98 — "$a_0 = \frac{1}{\pi} = \int_{-\pi}^{\pi}..." → stray "="; should be "$a_0 = \frac{1}{\pi}\int_{-\pi}^{\pi}...$"
- [ ] fourier-series.md:122 — "on $(0, L,)$" → "on $(0, L)$" (stray comma inside parentheses)
- [ ] fourier-series.md:138,146 — "**Fourer cosine series**" / "**Fourer sine series**" → "Fourier"
- [ ] fourier-transform.md:19 — "swap the order if integration" → "order of integration"
- [ ] fourier-transform.md:29 — "$\delta(x + \omega). dx$" → "$\delta(x+\omega)\,dx$" (stray period before dx)
- [ ] fourier-transform.md:31 — "Now by, the sifting property" → "Now, by the sifting property"
- [ ] heat.md:41,45,55 — "$0^\circ c$" → "$0^\circ C$" (Celsius should be capital C)
- [ ] intro.md:23 — "$$ 0 \ \int_{0}^{t}..." → malformed; the "0 \" should be "0 =" (i.e. "$0 = \int_0^t ...$")
- [ ] intro.md:43 — "we see that if if $u_t + c u_x = 0$" → doubled "if if"
- [ ] intro.md:55 — "create stations waves" → "stationary waves"
- [ ] intro.md:87 — "This meany any reasonable function" → "This means any"
- [ ] intro.md:119,123 — "$\frac{\partial}{\partial}u(t, x(t))$" → "$\frac{\partial}{\partial t}u$" (missing t in denominator)
- [ ] intro.md:140 — "$\beta^{-1}, let t = \frac{x^2}{2}.$" → text "let" is inside math delimiters; malformed
- [ ] intro.md:144 — "$f(\sqrt{2 ( \frac{x^2}{2} -t )}$" → missing closing ")" on f(...)
- [ ] separation-of-variables.md:13 — "beinga linear combinatio nof simple... certian boundary conditions" → "being a linear combination of ... certain"
- [ ] separation-of-variables.md:15 — "$u_n(x,t) = X_n(X)T_n(t)$" → "$X_n(x)$" (capital X argument should be x)
- [ ] separation-of-variables.md:32 — "We being by proposing" → "We begin"
- [ ] separation-of-variables.md:58 — "letting $u(x,t) = X(x)T(t):" → missing closing "$" delimiter; also "initial conditions in (2)" should be "boundary conditions in (2)"
- [ ] separation-of-variables.md:72 — "is a soluton of (7)" and "find a non-trival solution" → "solution", "non-trivial"
- [ ] separation-of-variables.md:99 — "either $\sin{\sqrt{\lambda}L} = $ or $c_2=0$" → missing "0" after equals; also "Because c_1 = 0" not in math mode
- [ ] separation-of-variables.md:113 — "$T_n(t) = b_n e^{-\beta(n \pi/L)^2}$" → exponent missing "t": "$e^{-\beta(n\pi/L)^2 t}$"
- [ ] separation-of-variables.md:117 — "$u_n(x_t)$" → "$u_n(x,t)$"
- [ ] separation-of-variables.md:123 — "Find the soluton" → "solution"
- [ ] separation-of-variables.md:191 — "as $t \to \inf$" → "$t \to \infty$" (`\inf` is infimum); also "staisfy" → "satisfy"
- [ ] separation-of-variables.md:177,185,187,191 — "Nonhomogenous / nonhomgenous / combintation" → "Nonhomogeneous / nonhomogeneous / combination"
- [ ] separation-of-variables.md:208 — "$...\sin{\frac{n \pi x}{L}}.$" → missing "dx" at end of integral
- [ ] separation-of-variables.md:238 — "$b_13$" → "$b_{13}$" (subscript needs braces)
- [ ] bifurcations.md:21 — "until they reach other at the bifurcation-point" → "reach each other"
- [ ] bifurcations.md:108 — "$\dot{x} = r * x \pm x^3$" → "r x" (literal "*" renders as asterisk)
- [ ] discrete-maps.md:35 — "$= x_0, dots$" → "$\dots$" (missing backslash)
- [ ] discrete-maps.md:59 — "if $lambda = 1$" → "$\lambda$" (missing backslash)
- [ ] flows-on-the-circle.md:10 — "$\dot{\theta} = \frac{d\theta}{t}$" → "$\frac{d\theta}{dt}$" (missing dt)
- [ ] flows-on-the-line.md:16 — "as a as a @vector-field" → doubled "as a"
- [ ] limit-cycles.md:133 — "...toward $\vec{x^*}.$" → missing closing ")" on the parenthetical
- [ ] limit-cycles.md:145 — "@Lianpunov-functions" → broken reference; label is "liapunov-function" (also "Lianpunov" is misspelled)
- [ ] planar-bifurcations.md:26 — the transcritical aligned block "$\dot{x} & = \mu x -x^2,$" is missing the "\\" line break before "$\dot{y}$" (malformed align environment)
- [ ] planar-bifurcations.md:62 — "shrinks down to envelope the stable fixed point... it envelopes it" → verb should be "envelop"/"envelops"
- [ ] planar.md:15 — "the boundary that separating two modes" → "that separates"
- [ ] planar.md:22 — def title "Heteroclinc Trajectory" → "Heteroclinic"
- [ ] planar.md:24 — "connect two @fixed-point are called heteroclinic orbits" → "@fixed-points"; title says "Trajectory" but body says "orbits" (inconsistent)
- [ ] planar.md:75 — "Given general (can be nonlinear planar system:" → "Given a general (possibly nonlinear) planar system:" (missing words/closing paren)
- [ ] weakly-nonlinear.md:26 — "$\dot{x} 0 = 1$" → "$\dot{x}(0) = 1$"; and "$e^{-st}$" on line 28 → "$e^{-\epsilon t}$" (no `s` is defined)

(All paths relative to content/applied-math/differential-equations/partial-differential-equations/ or content/applied-math/dynamical-systems/.)
