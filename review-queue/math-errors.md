# Math Errors Queue

Suspected mathematical errors found during the formalization scan. Per policy these are listed, not fixed — each needs Jason's judgment. Checkbox = reviewed/resolved.

## Algebra, Foundations, Geometry
- [x] content/algebra/abstract/groups.md:77 — "$\langle 1 \rangle$ is a generator of $(\mathbb{N}, +)$..." Should be $(\mathbb{Z}, +)$. **Fixed with Jason's approval during queue-01 review.**
- [x] content/algebra/abstract/groups.md:45 — abelian condition written "$a \* b = b \* g$"; commutativity must be $a \* b = b \* a$. **Fixed with Jason's approval during queue-01 review.**
- [ ] content/foundations/set-theory.md:86–92 — proof of $(A \cup B)^c = A^c \cap B^c$ only establishes $\subseteq$; the reverse inclusion needed for equality is never shown.
- [ ] content/foundations/set-theory.md:98–104 — proof of $(A \cap B)^c = A^c \cup B^c$ likewise only proves one direction. (The De Morgan proofs in boolean-algebra.md correctly prove both directions.)
- [ ] content/geometry/projection-and-homogenous-coordinates.md:104–113 — perspective matrix has $f$ in the top-left diagonal entries AND $1/f$ in the last row: applying it to $(x,y,z,1)$ and dividing by $w=z/f$ yields $(f^2x/z, f^2y/z)$ instead of $(fx/z, fy/z)$ — the factor of $f$ is double-counted. Consistent with the file's own note that "focal length and Translate Z are having the same effect." (moderate confidence)
- [ ] content/geometry/trigonometry/identities.md:10–12 — half-angle identities omit the $\pm$; as written they hold only where the half-angle's cosine/sine is nonnegative. (incompleteness rather than hard error)

## Real Analysis & Calculus
- [ ] content/analysis/calculus/integration-strategies.md:55 — partial-fraction factoring $\frac{-m}{k}\int\frac{dv}{(v-\frac{gm}{k})(v+\frac{gm}{k})}$ is wrong: the roots of $g-\frac{k}{m}v^2$ are $\pm\sqrt{gm/k}$, not $\pm\frac{gm}{k}$. As written it expands to $v^2-(gm/k)^2$, not $v^2-gm/k$.
- [ ] content/analysis/calculus/vector-differential-calculus.md:66 — difference quotient numerator `(x+h) - f(x)` must be $f(x+h)-f(x)$.
- [ ] content/analysis/real-analysis/integration.md:73 — Riemann sum written $\sum f(t_k)(x_{k-1}-x_k)$ has the width sign reversed; should be $(x_k - x_{k-1})$.
- [ ] content/analysis/real-analysis/integration.md:85 — "for every $\epsilon < 0$" must be "$\epsilon > 0$".
- [ ] content/analysis/real-analysis/integration.md:87 — limit condition $|S(f,P,T)| < \epsilon$ must bound distance to the limit: $|S(f,P,T) - I| < \epsilon$.
- [ ] content/analysis/real-analysis/real-numbers.md:104 — corollary proof: "Pick $n$ such that $n(y-a)>1$" should be $n(y-x)>1$; and from $nx < k < ny$, dividing by $n$ gives $x < k/n < y$, so "$x < n/k < y$", "$q = n/k$", and "$r \in (x,y)$" should be $k/n$, $q=k/n$, $q\in(x,y)$ (fraction inverted; variable name changes mid-proof).
- [ ] content/analysis/real-analysis/real-sequences.md:31 — in the $\iff$ chain, "$-\epsilon n > \epsilon - 3$" has a flipped inequality; from $3 < \epsilon n + \epsilon$ one gets $\epsilon n > 3-\epsilon$. Contradicts the (correct) conclusion $n > \frac{3-\epsilon}{\epsilon}$.
- [ ] content/analysis/real-analysis/real-sequences.md:35 — "$\frac{3}{n} < \epsilon$ when $n < \frac{3}{\epsilon}$" is backwards; $\frac{3}{n} < \epsilon \iff n > \frac{3}{\epsilon}$.
- [ ] content/analysis/real-analysis/real-sequences.md:132 — intuition for $\liminf$ ("greatest lower bound that the terms get close to, but do not exceed") reuses the limsup phrasing incorrectly; terms approach the liminf from above and eventually do not fall below it.
- [ ] content/analysis/real-analysis/real-sequences.md:138 — "$b_2 = \sup\{a_2,a_3,\dots\}$ is the least upper bound of all terms... except $a_1$ and $a_2$" — the set excludes only $a_1$; $a_2$ is included.
- [ ] content/analysis/real-analysis/series.md:65 — Cauchy condensation stated with $\sum 2^n a_{2n}$; must be $a_{2^n}$ ($2$ to the power $n$). With $a_{2n}$ the test is false.
- [ ] content/analysis/real-analysis/fundamental.md:16 — "Derivative Part" defines $F(x)=\int_a^b f(y)\,dy$, a constant, so $F'=0$. Upper limit must be $x$: $F(x)=\int_a^x f(y)\,dy$.
- [ ] content/analysis/sequences.md:152–153 — proof of (e): "$|s_n-s|<\tfrac12|s| \iff |s_n|+|s|<\tfrac12|s|$" is wrong (yields the impossible $|s_n|<-\tfrac12|s|$). Reverse triangle inequality gives $|s|-|s_n|\le|s_n-s|<\tfrac12|s|$, hence $|s_n|>\tfrac12|s|$ (the correct conclusion on line 154).

## Complex Analysis
- [ ] module-01-algebriac-properties.md:87 — "$ae^{\theta i} + be^{\phi i} = abe^{(\theta+\phi)i}$" — left side uses addition but the identity requires multiplication.
- [ ] module-01-algebriac-properties.md:112 — "$\overline{z} = r^{-i\theta}$" — missing base $e$; should be $\bar z = re^{-i\theta}$.
- [ ] module-01-algebriac-properties.md:136 — "$X + Yi = (x + yi) = x^2 + 2xyi - y^2$" — middle term must be squared: $(x+yi)^2$.
- [ ] module-01-algebriac-properties.md:165–167 — "$\cos z = 1 + \frac{1}{2!} + \frac{1}{4!} + \cdots$" — LHS should be $\cos i$ ($= \cosh 1$), not $\cos z$; as written it states a false identity for general $z$.
- [ ] module-06-harmonic.md:14 — "the second partial derivatives of $u$ and $x$ satisfy Laplace's equation" — should be "$u$ and $v$".
- [ ] module-08-elementary-functions.md:59 — "$\sin(x+yi) = \sin x \cosh x + i\cos x \sinh y$" — first term should be $\sin x \cosh y$ ($\cosh y$, not $\cosh x$).
- [ ] module-09-indefinite-integrals.md:10 — "$F(z) + c$, $c \in \mathbb{Z}$" — integration constant is an arbitrary complex constant: $c \in \mathbb{C}$.
- [ ] module-20-taylor-and-maclaurin-series.md:71 — "$\cos z = z - \frac{z^2}{2!} + \frac{z^4}{4!} - \cdots$" — leading term is wrong: cosine series begins with $1$ (the summation form on the right is correct).
- [ ] module-21-laurent-series.md:42,46 — "$f(z) = \frac{z}{z^2 - 3z + z}$" — denominator inconsistent with the factorization $(z-1)(z-2)$ used two lines later; last term should be $+2$.
- [ ] module-21-laurent-series.md:60 — expansion of $\frac{2}{z-2}$ drops a factor of 2 and contains a broken equality chain; correctly $\frac{2}{z-2} = \sum_{n=0}^\infty \frac{2(-1)^n}{(z-3)^{n+1}}$. Consequently the final combined series (line 72) first sum should read $\sum_{n=1}^\infty \frac{2(-1)^{n+1}}{(z-3)^n}$.
- [ ] module-21-laurent-series.md:30 — "converge when $z < 2$ ... $z > 2$" — must be in modulus: $|z| < 2$, $|z| > 2$ (complex numbers are unordered).

(Paths relative to content/analysis/complex-analysis/.)

## ODEs — Chapters 1–3
- [ ] lesson-04-general-solutions.md:64 — sign error: from $y' = -c\sin x + 1$, $c = \frac{1-y'}{\sin x}$, not $\frac{1+y'}{\sin x}$. Propagates to line 68 (final answer on line 72 is nonetheless correct).
- [ ] lesson-08-differential-equations-with-linear-coefficients.md:83 — "If the lines ... are **not** parallel, the method of Lesson 8B ... will not work, because it depends on the two lines having a point of intersection, which parallel lines do not have." The reasoning only holds when the lines are parallel; "not parallel" should be "parallel."
- [ ] lesson-08-...md:90 — inconsistent problem statement: equation (a) is $(4x+3y-1)dx+(4x+6y+2)dy=0$ but the entire solution requires the first coefficient to be $2x+3y-1$ (the `4x` should be `2x`); as written the coefficients are not parallel, contradicting the example's premise.
- [ ] lesson-09-exact-differential-equations.md:96 — equation (9.47) has wrong bounds/variables: reads $f=\int_{x_0}^{x}Q(x,y)\,dy+\int_{y_0}^{y}P(x,y_0)\,dy$; by symmetry with (9.45) it should be $f=\int_{y_0}^{y}Q(x,y)\,dy+\int_{x_0}^{x}P(x,y_0)\,dx$.
- [ ] lesson-11-...bernoulli-equation.md:160 — wrong operation stated: to get from $-\frac{1}{u^2}u' = -\frac{2\tan x}{u}-\frac{\sin x}{u^2}$ to $u'=2u\tan x+\sin x$, multiply by $-u^2$, not "$-\frac{1}{u^2}$".
- [ ] lesson-12-...md:14 — wrong integrating factor: for $x\,dy-y\,dx=y^2dx$, the factor is $1/y^2$ (giving $-d(x/y)=dx$), not "$-y^2$".
- [ ] lesson-15-...md:64,68 — dimensional error in (15.1j)/(15.2j): outflow term $-\frac{x}{V+t(\text{in}+\text{out})}$ has units of concentration, not mass/time — missing the outflow volume-rate factor (cf. (15.3j) at line 104 which correctly uses $+\frac{bx}{v+ct}$).
- [ ] lesson-15-...md:144 — missing factor in solved time: from $x=ke^{bt/v}-\frac{av}{b}$, solving gives $t=\frac{v}{b}\ln\big(\frac{1}{k}(x+\frac{av}{b})\big)$; the text writes $\frac{1}{k}(x+va)$ — the $av$ term should be $\frac{av}{b}$.
- [ ] lesson-16-...md:20 — inverted unit conversion: "slug for mass (= 1/32 pound)" — a slug is about 32 pounds(-mass); a pound-mass is $1/32$ slug.
- [ ] lesson-17b-...md:123 — wrong derivative: for $m=M+m_0-kt$, $\frac{dm}{dt}=-k$, not "$-kt$" (equation (b) below correctly uses $-k$).

(Paths relative to content/applied-math/differential-equations/ordinary-differential-equations/, chapters 01–03.)

## ODEs — Chapters 4–91
- [ ] lesson-20-...coefficients.md:50 — repeated-root solution written $y = e^{m_1 x}(c_1 + c_2 x + c_3 x^2 + \cdots + c_4 x^k)$; for multiplicity $k$ the polynomial has degree $k-1$, so the top term must be $c_k x^{k-1}$ (wrong index and off-by-one power).
- [ ] lesson-24-...operators.md:98 — "solve the related non-homogenous differential equation to find the complementary function" — $y_c$ solves the related homogeneous equation.
- [ ] lesson-27-...gamma-function.md:47 — stated $F^{(n)}(s) = L[x^n f(x)] = (-1)^n\int_0^{\infty} e^{-sx}x^n f(x)\,dx$; the middle term must carry the sign: $F^{(n)}(s) = (-1)^n L[x^n f(x)]$. As written it's false for odd $n$ and contradicts $F'(s) = -L[xf(x)]$ just above.
- [ ] lesson-27-...gamma-function.md:131 — "$L[y] = \frac{2}{s+2} = 2e^{-2x}$" equates a function of $s$ with a function of $x$; should be $y = L^{-1}[\frac{2}{s+2}] = 2e^{-2x}$.
- [ ] lesson-27b-summary-...equations.md:96 — initial conditions listed as "$y(0), y'(0), y^{(2)}, \cdots, y^{(n)}$"; an $n$th-order equation needs derivatives $0$ through $n-1$, each evaluated at 0 — should end at $y^{(n-1)}(0)$.
- [ ] lesson-28-undamped-motion.md:115 — period computed as "$\frac{2\pi}{\frac{k}{m}} = 2\pi\sqrt{\frac{m}{k}}$"; middle step used $\omega_0^2$ instead of $\omega_0=\sqrt{k/m}$ (final answer correct).
- [ ] lesson-28-undamped-motion.md:153,172 — pendulum frequency "$\nu = \frac{1}{2\pi}\sqrt{gl}$" must be $\frac{1}{2\pi}\sqrt{g/l}$ (inconsistent with $T = 2\pi\sqrt{l/g}$ stated alongside).
- [ ] lesson-28-undamped-motion.md:170 — for release from $\theta_0$, amplitude is $\theta_0$; the listed "Amplitude: $A = \omega_0$ rad" is wrong (no initial angular velocity in the released case).
- [ ] lesson-29-damped-motion.md:26 — overdamped solution exponents missing the factor $t$: should be $e^{(-r\pm\sqrt{r^2-\omega_0^2})\,t}$ (as written the "solution" is constant).
- [ ] lesson-29-damped-motion.md:42 — "**damped frequency** $\nu = \sqrt{\omega_0^2 - r^2}$" — given $T = \frac{2\pi}{\sqrt{\omega_0^2-r^2}}$ in the same sentence, $\nu = 1/T = \frac{\sqrt{\omega_0^2-r^2}}{2\pi}$; the expression as labeled drops the $\frac{1}{2\pi}$ (it's the angular frequency).
- [ ] lesson-29-damped-motion.md:101 — magnification ratio first bracket has $\omega/\omega_0^2$; dividing through by $\omega_0^2$ gives $1-(\omega/\omega_0)^2$ — denominator should be $\omega_0$, not $\omega_0^2$.
- [ ] lesson-30-electric-circuits.md:47 — phase $\alpha = \sin^{-1}(\frac{1-CL\omega^2}{R\omega C})$: the argument is a ratio of the two legs (imaginary/real), i.e. a tangent — should be $\tan^{-1}$, or arcsin with the hypotenuse in the denominator. As written the arcsin argument can exceed 1.

(Paths relative to content/applied-math/differential-equations/ordinary-differential-equations/, chapters 04–91.)

## PDEs & Dynamical Systems
- [ ] dynamical-systems/weakly-nonlinear.md:11,13,26 — "weakly nonlinear oscillator" and its example written with a first derivative as leading term ("$\dot{x} + x + \epsilon h = 0$", "$\dot{x}+x=0$", "$\dot{x} + 2\epsilon\dot{x} + x = 0$"); these must be second-order ($\ddot{x}$) — $\dot{x}+x=0$ is exponential decay, not an oscillator. The subsequent work (lines 30–34) confirms $\ddot{x}$.
- [ ] partial-differential-equations/separation-of-variables.md:242 — final vibrating-string answer has "$-\frac{14}{15}\sin{65t}\sin{13x}$", but line 238 computed $b_{13} = -\frac{14}{65}$; coefficient should be $-\frac{14}{65}$.
- [ ] partial-differential-equations/intro.md:140 — "$\xi = \frac{x^2}{2} + t$" contradicts the characteristic definition $\xi(t,x)=\beta(x)-t$ (line 132); sign on $t$ is wrong (final answer at 143–145 correctly uses $\frac{x^2}{2}-t$).
- [ ] dynamical-systems/bifurcations.md:136,138 — nondimensionalization: line 136 "$b T U^2 + x^3$" should be "$b T U^2 x^3$"; line 138 "$r = a T x$" should be "$r = aT$". The final results on line 144 confirm these are slips.
- [ ] dynamical-systems/discrete-maps.md:20–24 — for non-autonomous $x_{n+1}=f(x_n,n)$, iterates written with second argument held at 0 ($x_2=f(x_1,0)$, ...); it should advance: $x_2=f(x_1,1)$, ..., $x_n=f(x_{n-1},n-1)$.
- [ ] partial-differential-equations/fourier-series.md:96,100,104 — internal equation references swapped: "$a_0$/$a_n$ using (8)" should cite (9); "using (9) we can write our Fourier series" should cite (8).

(Paths relative to content/applied-math/.)

## Numerical Analysis & Physics
- [ ] physics/simple-harmonic-motion.md:22 — acceleration written $a = -x_m\omega^2\sin(\omega t+\phi)$; differentiating $v=-x_m\omega\sin(\omega t+\phi)$ gives $a = -x_m\omega^2\cos(\omega t+\phi)$ (cosine, matching $a=-\omega^2x$).
- [ ] physics/motion.md:77 — static friction given as $F_s = \mu_s F_x$ (μ_s times the applied force); it equals the applied force up to a maximum of $\mu_s F_n$ (correctly stated on line 83). Contradicts the preceding sentence.
- [ ] physics/motion.md:50 — spring constant $k$ "typically in newton-meters"; units are newtons per meter (N/m).
- [ ] physics/motion.md:56 — $W = -\frac{k}{2}x^2$ labeled "Work to reach a given displacement": $-\frac12 kx^2$ is the work done *by* the spring; work done *to stretch to* $x$ is $+\frac12 kx^2$. Sign inconsistent with the label. (moderate confidence)
- [ ] physics/electric-potential.md:32 — field angle $\theta = \operatorname{atan2}(\frac{\partial V}{\partial x}, \frac{\partial V}{\partial y})$ has arguments in the wrong order and drops the negation from $\vec{E} = -\nabla V$; should be $\operatorname{atan2}(-\partial V/\partial y, -\partial V/\partial x)$.
- [ ] physics/waves.md:76 — beat frequency $f_{\text{beat}} = f_1 - f_2$ should be $|f_1 - f_2|$. (minor)
- [ ] numerical-analysis/interpolation-and-polynomial-approximation.md:49 — "$P(x_0) = 0\cdot f(x_0) + 1\cdot f(x_1) = f(x_1) = y_1$" evaluates at $x_1$, so LHS should be $P(x_1)$ (line 45 already gives $P(x_0)=y_0$).

## Probability, Discrete Math, Topology, Info Theory, ML, Misc
- [ ] probability-and-statistics/continuous-probability-distributions.md:64 — "$Z = \lim_{n\to\infty}\frac{X-np}{\sqrt{npq}} = n(z;0,1)$" equates a random variable with a density function; correct statement is convergence in distribution, $\frac{X-np}{\sqrt{npq}} \xrightarrow{d} N(0,1)$.
- [ ] probability-and-statistics/continuous-probability-distributions.md:27 — uniform CDF "$F(x) = \frac{x-a}{b-a}$" uses undefined lowercase $a,b$; for a distribution on $[A,B]$ it must be $\frac{x-A}{B-A}$.
- [x] probability-and-statistics/discrete-probability-distributions.md:105 — negative binomial pmf "$P(x=n) = \binom{n-1}{r-1} p^r (1-)^{n-r}$" — "$(1-)$" is missing the $p$; also $P(x=n)$ should be $P(X=n)$. (fixed 2026-07-19: now $P(X=n) = \binom{n-1}{r-1} p^r (1-p)^{n-r}$)
- [ ] probability-and-statistics/joint-probability.md:26 — multinomial "$P(X_1=n_1, \dots, X_n=n_r)$" — last variable should be $X_r$, not $X_n$.
- [ ] probability-and-statistics/markov-chains.md:29 — "$\sum_{k=0}^{N} p_{jk} = 1$" sums $N+1$ terms but states are indexed $1,\dots,N$; sum should start at $k=1$.
- [x] probability-and-statistics/expectation.md:33,37 — missing "$=$" makes the variance definition read as a product $E[(X-\mu)^2]\cdot\sum(\dots)$ rather than an equality (also filed as typo). (fixed 2026-07-19)
- [ ] probability-and-statistics/probability.md:33 — "the sum of the probabilities of all *events* in a sample space is 1" — events overlap ($2^{|S|}$ of them); it's the probabilities of all sample points/outcomes that sum to 1.
- [ ] probability-and-statistics/limit-theorems.md:30 — "$E[X \mid X \ge t] > t$" should be $\ge t$ (equality possible); line 34 correctly uses $\ge$. (minor)
- [ ] discrete-math/cellular-automata/game-of-life.md:73 — "critical density ≈ 0.37; above this patterns die out, below they stabilize" is not a recognized Game of Life result; random soups settle to ash density ≈ 0.03 regardless of starting density. Likely incorrect. (moderate confidence)
- [ ] discrete-math/recurrence-relations.md:53 — "$r^2 = Ar + b$" — lowercase $b$ should be $B$ (next expression correctly uses $-B$). (minor)
- [ ] machine-learning/basics.md:43 — training set indexed 0-based with $n+1$ items but loss sum runs $i=1$ to $m$ and predictions run $(1)$ to $(n)$; sample-count symbol/indexing inconsistent. (low severity)
- [ ] machine-learning/neural-networks.md:15,17 — map written $M(\mathbb{Z}_{255})_{24,24}$ / "$24 \times 24$ matrix" but line 9 specifies a $28\times28$ image (MNIST); also $\mathbb{Z}_{255}$ is $\{0,\dots,254\}$ while the text says "integers between 0 and 255" (256 values) → $\mathbb{Z}_{256}$.
- [ ] machine-learning/neural-networks.md:47 — layer map $F_\ell:\mathbb{R}^{\ell-1}\to\mathbb{R}^{\ell}$ — exponents should be neuron counts: $\mathbb{R}^{n_{\ell-1}}\to\mathbb{R}^{n_\ell}$ (consistent with $W_\ell$ on line 55).
- [ ] misc/dft.md:56 — "$z^3$ has 3 solutions: $1, e^{2\pi/3}, e^{4\pi/3}$" — imaginary unit missing: $e^{2\pi i/3}$, $e^{4\pi i/3}$. As written they are real numbers.
- [ ] misc/dft.md:113 — sample vector "$(z_0, \dots, z_n)$" claimed in $\mathbb{C}^n$ but lists $n+1$ components; should be $(z_0,\dots,z_{n-1})$ (also line 111).
- [ ] misc/dft.md:150 — linearity concluded "$= a\langle x, z\rangle + b\langle x, z\rangle$"; second term must be $b\langle y, z\rangle$ (line also switches from the declared $w,v,z$ to $x,y$).
- [ ] misc/dft.md:154 — positive-definiteness step "$\langle z, z \rangle = z\overline{z} = 1 > 0$" is wrong: $\langle z,z\rangle=\sum_k |z_k|^2=\|z\|^2$, and the property needed is $\ge 0$ with equality iff $z=0$, which this doesn't establish.
- [ ] topology/cantor-set.md:47 — retained sub-intervals of $[\alpha,\beta]$ stated as "$[\alpha, \frac{\beta-\alpha}{3}]$ and $\frac{2(\beta-\alpha)}{3}, \beta]$"; correct endpoints are $[\alpha, \alpha+\frac{\beta-\alpha}{3}]$ and $[\beta-\frac{\beta-\alpha}{3}, \beta]$ — the written ones only coincide when $\alpha=0$ (second interval also missing its opening "[").
- [ ] topology/cantor-set.md:63 — "all neighborhoods of $x$ are limit points of $P$" is a category error; should read: every neighborhood of $x$ contains a point of $P$ other than $x$, hence $x$ is a limit point.
- [ ] topology/metric-spaces.md:26,48 — triangle inequality written $d(p,q)\le d(p,r)+d(r,p)$; last term must be $d(r,q)$ (as written the RHS is $2\,d(p,r)$).
- [ ] topology/metric-spaces.md:40 — "$\mathbb{R}^0$ is just the empty set" — $\mathbb{R}^0=\{0\}$, the one-point space, not $\varnothing$.
- [ ] topology/metric-spaces.md:42 — "Then $|p - q| < 0,$ so $d(p,q) > 0$" — $|p-q|<0$ is impossible; should be $|p-q|>0$.
- [ ] topology/metric-spaces.md:56 — homogeneity "$a|x| = |ax|$" — correct statement is $|a|\,\|x\| = \|ax\|$ (fails for $a<0$ as written).
- [ ] topology/metric-spaces.md:212 — "$N_r(p) \bigcup E\setminus\{p\}$" (twice) uses union where intersection is meant: $N_r(p)\cap(E\setminus\{p\})$. With union the minimum-distance argument breaks.
- [ ] topology/metric-spaces.md:240 — empty-$E^c$ edge case internally inconsistent: says "consider the case that $E^c$ is empty" then argues "Since $E$ is empty," and concludes "$x$ is closed" (conflates $E$ and $E^c$; a point is not "closed").
- [ ] topology/perfect-sets-and-more.md:87 — triangle-inequality bound derives $d(x,y)<\delta$ but concludes "$d(x,y) < \epsilon$"; should be $<\delta$ ($\epsilon$ was never introduced).

(Paths relative to content/applied-math/ or content/ as shown.)
