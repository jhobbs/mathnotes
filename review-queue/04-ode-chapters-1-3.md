# Queue 04: ODEs — Chapters 1–3 (Basic Concepts, First-Order Types, First-Order Problems)

None of these files use `:::` syntax yet — every definition/theorem/example below is currently plain markdown. Suggested `@`-refs point at sibling blocks that would be created from definitions in these same files.

Base path: content/applied-math/differential-equations/ordinary-differential-equations/

## Formalization candidates

### chapter-01-basic-concepts/lesson-03-the-differential-equation.md
- [ ] lines 10–12: **definition** `{label: ordinary-differential-equation}` "Ordinary Differential Equation" — excerpt: "Let $f(x)$ define a function of $x$ on an interval..."
- [ ] line 14: **note** `{label: replace-f-with-y}` — excerpt: "It's customary to replace $f(x)$ by $y$."
- [ ] lines 16–18: **definition** `{label: order-of-a-differential-equation}` "Order of a Differential Equation" — excerpt: "The order of a differential equation is the order of..."
- [ ] line 20: **example** `{label: order-examples}` — excerpt: "the differential equation $y' = e^x$ is of the first order..." (short; optional)
- [ ] lines 22–33: **definition** `{label: explicit-solution}` "Explicit Solution" — excerpt: "Let $y = f(x)$ define $y$ as a function of $x$..." (refs: @ordinary-differential-equation)
- [ ] lines 35–49: **definition** `{label: implicit-solution}` "Implicit Solution" — excerpt: "A relation $f(x,y) = 0$ will be called an implicit solution..." (refs: @explicit-solution)

### chapter-01-basic-concepts/lesson-04-general-solutions.md
- [ ] lines 32–46: **definition** `{label: n-parameter-family-of-solutions}` "n-parameter family of solutions" — excerpt: "The functions defined by $y = f(x,c_1,c_2,\cdots,c_n)$ of the $n+1$ variables..."
- [ ] lines 54–74: **example** `{label: finding-de-from-family}` — excerpt: "if we have the 1-parameter family of solutions $y = c\cos x + x$..." (see math-errors queue re: lines 64/68)
- [ ] lines 82–94: **example** `{label: clairaut-singular-solution}` — excerpt: "the first order ODE $y = xy' + (y')^2$ has for a solution..."
- [ ] lines 98–99: **definition** `{label: particular-solution}` "Particular Solution" — excerpt: "A solution of a differential equation will be called a particular solution if..." (refs: @n-parameter-family-of-solutions)
- [ ] lines 101–102: **definition** `{label: general-solution}` "General Solution" — excerpt: "A $n$-parameter family of solutions of a differential equation will be called..." (refs: @particular-solution)
- [ ] lines 106–107: **definition** `{label: initial-conditions}` "Initial Conditions" — excerpt: "The $n$ conditions which enable us to determine the values..."

### chapter-01-basic-concepts/lesson-05-direction-field.md
- [ ] lines 10–20: **definition** `{label: integral-curve}` "Integral Curve" — excerpt: "Given the differential equation $y' = F(x,y)$... the graph of this function is called an integral curve..."
- [ ] line 20: **definition** `{label: line-element-direction-field}` "Line Elements and Direction Field" — excerpt: "These lines are called line elements. All of these lines taken together..."
- [ ] lines 22–34: **definition** `{label: isocline}` "Isocline" — excerpt: "then each curve for which $F(x,y) = k$ ... will be an isocline..." (refs: @integral-curve)
- [ ] line 36: **note** `{label: streamline}` — excerpt: "We can look at an integral curve as the path of a particle..."
- [ ] line 46: **definition** `{label: ordinary-point}` "Ordinary Point" — excerpt: "An ordinary point of the first order differential equation..." (refs: @integral-curve)
- [ ] lines 48–53: **definition** `{label: singular-point}` "Singular Point" — excerpt: "A singular point of a first order differential equation..." (refs: @ordinary-point)

### chapter-02-special-types-of-first-order-equations/lesson-06-meaning-of-the-differential-of-a-function-and-separable-differential-equations.md
- [ ] line 13: **note** `{label: differentiability-assumption}` — excerpt: "Assume all functions in the lesson are differentiable on an interval."
- [ ] lines 29–32: **definition** `{label: differential-of-y}` "The differential of y" — excerpt: "Let $y=f(x)$ define y as a function of x on an interval $I$..."
- [ ] lines 36–39: **definition** `{label: differential-of-z}` "Differential of z" — excerpt: "Let $z = f(x,y)$ define $z$ as a function of $x$ and $y$..."
- [ ] lines 55–65: **definition** `{label: separable-variables}` "Separable Variables" — excerpt: "If it is possible to rewrite (6.6) or (6.61) in the form..."

### chapter-02.../lesson-07-first-order-differential-equation-with-homogenous-coefficients.md
- [ ] lines 13, 33: **note** `{label: homogeneous-functions-general}` — excerpt: "Homogenous functions are not specific to differential equations..."
- [ ] lines 15–24: **definition** `{label: homogeneous-function}` "Homogeneous of order n" — excerpt: "Let $z = f(x,y)$ define $z$ as a function of $x$ and $y$ in a region $R$..."
- [ ] lines 26–31: **remark** `{label: homogeneous-alternate-definition}` "Alternate definition (Comment 7.15)" — excerpt: "An alternate definition of a homogenous function is the following..." (refs: @homogeneous-function)
- [ ] lines 37–42: **definition** `{label: first-order-de-homogeneous-coefficients}` — excerpt: "The differential equation $P(x,y)dx + Q(x,y)dy = 0$, where $P$ and $Q$..." (refs: @homogeneous-function)
- [ ] lines 50–53: **theorem** `{label: homogeneous-substitution-separable}` "Theorem 7.32" with nested **proof** ("see the book") — excerpt: "If the coeffecients in (7.3) are each homogenous functions of order n..." (refs: @first-order-de-homogeneous-coefficients)

### chapter-02.../lesson-08-differential-equations-with-linear-coefficients.md
- [ ] line 12: **proposition** `{label: parallel-lines-proportional-coefficients}` "Parallel Lines" — excerpt: "If the coefficients of $x$ and $y$ in one linear equation are proportional..."
- [ ] lines 16–26: **definition** `{label: translation-of-axes}` "Translation of Axes" — excerpt: "Let $(x,y)$ be the coordinates of a point $P$ with respect to an origin..."
- [ ] lines 87–126: **example** `{label: linear-coefficients-parallel-lines}` "Example 8.4" — excerpt: "Find a 1-parameter family of solutions of $(4x+3y-1)dx+(4x+6y+2)dy=0$..." (refs: @separable-variables; see math-errors queue re: line 90)

### chapter-02.../lesson-09-exact-differential-equations.md
- [ ] lines 13–21: **note** `{label: riemann-integral-review}` "Riemann integral" — excerpt: "Let $f(x)$ be a function of $x$ defined on an interval..."
- [ ] lines 41–42: **definition** `{label: simply-connected-region}` "Simply Connected Region" — excerpt: "A region is called a simply connected region if every simple closed curve..."
- [ ] lines 54–60: **definition** `{label: exact-differential}` "Exact Differential (Def 9.23)" — excerpt: "A differential expression $P(x,y)dx + Q(x,y)dy$ is called an exact differential..."
- [ ] lines 62–72: **definition** `{label: exact-differential-equation}` "Exact Differential Equation (Def 9.27)" — excerpt: "The differential equation $P(x,y)dx + Q(x,y)dy = 0$ is called exact if..." (refs: @exact-differential)
- [ ] lines 76–86: **theorem** `{label: exactness-necessary-sufficient}` "Theorem 9.3" with nested **proof** (necessary condition, line 86) — excerpt: "A necessary and sufficient condition that the differential equation... be exact is that..." (refs: @exact-differential-equation, @simply-connected-region)
- [ ] lines 104–151: **remark**/**intuition** `{label: exact-solution-from-definition}` "Solution from definition" — excerpt: "An alternative approach, and one preferred by the authors..." (refs: @exact-differential-equation)

### chapter-02.../lesson-10-recognizable-exact-differential-equations-and-integrating-factors.md
- [ ] lines 8–18: **example**/**definition** `{label: integrable-combinations}` "Integrable Combinations" — excerpt: "Sometimes we can recognize exact differential equations. For example $2xy^2dx+2x^2ydy=0$..."
- [ ] lines 23–24: **definition** `{label: integrating-factor}` "Integrating Factor (Def 10.5)" — excerpt: "A multiplying factor which will convert an inexact differential equation into an exact one..." (refs: @exact-differential-equation)
- [ ] lines 26–76: **theorem**/**proposition** `{label: integrating-factor-cases}` "Finding an integrating factor" — excerpt: "We assume that $P(x,y)dx + Q(x,y)dy = 0$ is not an exact differential equation..." (refs: @exactness-necessary-sufficient; note duplicate eq tags 10.65/10.66 reused five times)
- [ ] lines 78–118: **example** `{label: integrating-factor-matching-exponents}` "Special form with matching exponents" — excerpt: "If a differential equation can be put in the special form..." (refs: @integrating-factor)
- [ ] lines 120–125: **remark** `{label: integrating-factors-beyond-methods}` — excerpt: "A few of the excercises have solutions that don't seem to fit..."

### chapter-02.../lesson-11-the-linear-differential-equation-of-the-first-order-and-bernoulli-equation.md
- [ ] lines 15–20: **definition** `{label: linear-differential-equation-first-order}` "Definition 11.1" — excerpt: "A linear differential equation of the first order is one which can be written as..."
- [ ] lines 22–30: **theorem**/**note** `{label: solving-linear-first-order}` "Solving via integrating factor" — excerpt: "The integrating factor of a linear differential equation in the form of (11.11) is..." (refs: @integrating-factor)
- [ ] lines 32–55: **definition**/**proposition** `{label: bernoulli-equation}` "Bernoulli Equation" — excerpt: "A special type of first order differential equation, named for the swiss mathematician..." (refs: @linear-differential-equation-first-order)
- [ ] lines 57–86: **example** `{label: bernoulli-example}` "Example 11.54" — excerpt: "Solve $y' + xy = \frac{x}{y^3}$..." (refs: @bernoulli-equation)
- [ ] lines 88–98: **definition**/**proposition** `{label: riccati-equation}` "Riccati Equation" — excerpt: "$y' = f_0(x) + f_1(x)y + f_2(x)y^2$... is called a Ricatti equation..."
- [ ] lines 100–126: **proof** `{label: riccati-substitution-proof}` "Proof that this substitution works" — excerpt: "First, substitute (11.61) into (11.6)..." (refs: @riccati-equation)
- [ ] lines 136–186: **example** `{label: riccati-example}` — excerpt: "Solve $y' = 2\tan{x}\sec{x}-y^2\sin{x}$..." (refs: @riccati-equation)

### chapter-02.../lesson-12-miscellaneous-methods-of-solving-a-first-order-differential-equation.md
- [ ] lines 10–18: **example** `{label: choice-of-method-example}` "Example 12.1" — excerpt: "$xdy - ydx = y^2dx$..." (refs: @bernoulli-equation, @integrable-combinations; see math-errors queue re: line 14)
- [ ] lines 24–40: **example** `{label: substitution-trig-example}` "Example 12.21" — excerpt: "Solve $(2\cos{y})y' + \sin{y} = x^2 \csc{y}$..." (refs: @solving-linear-first-order)
- [ ] lines 42–70: **example** `{label: substitution-u-example}` "Example 12.22" — excerpt: "Solve $y' + 2x = 2(x^2 + y - 1)^{2/3}$..."

### chapter-02.../lesson-12b-summary.md
- [ ] Mostly summary/connective prose; low priority. Optional: lines 11–33 as **remark** `{label: first-order-types-summary}`, lines 38–51 as **remark** `{label: general-solving-approach}` — excerpt: "One general form that comes up a lot is..."

### chapter-03-problems-leading-to-first-order-equations/lesson-13-geometric-problems.md
- [ ] lines 22–25: **definition** `{label: midpoint-formula}` "Midpoint Formula" — excerpt: "The mid-point formula for two points..."
- [ ] lines 27–29: **definition** `{label: vector-projection}` "Projection" — excerpt: "A projection of $\vec{a}$ onto $\vec{b}$ is a new vector..." (note: algebra/linear/projection.md also defines projection — coordinate labels)
- [ ] lines 33–36: **definition** `{label: tangent-and-normal-line}` "Tangent Line and Normal Line" — excerpt: "The tangent line (or simply tangent) to a plane curve..."
- [ ] lines 40–41: **definition** `{label: subtangent}` "Subtangent" — excerpt: "The subtangent is the length of the projection of the tangent line..."
- [ ] lines 43–44: **definition** `{label: subnormal}` "Subnormal" — excerpt: "The subnormal is the length of the projection of the normal line..."
- [ ] lines 46–51: **definition** `{label: radius-vector}` "Radius Vector" — excerpt: "A radius vector is a vector from the origin to a point on a curve..."
- [ ] lines 53–57: **definition** `{label: abscissa-ordinate}` "Abscissa and Ordinate" — excerpt: "The $x$ value of a point..."
- [ ] lines 59–67: **note**/**remark** `{label: geometric-solution-method}` "Method of Solution" (necessity/sufficiency) — excerpt: "The problems are started in the form 'find the family of curves'..."

### chapter-03.../lesson-14-trajectories.md
- [ ] lines 10–16: **note**/**definition** `{label: angle-between-curves}` "Angle between two curves" — excerpt: "When two curves intersect in a plane, the angle between them..."
- [ ] line 18: **definition** `{label: isogonal-trajectory}` "Isogonal Trajectory (Def 14.12)" — excerpt: "A curve which cuts every member of a given 1-parameter family..."
- [ ] line 26: **definition** `{label: orthogonal-trajectory}` "Orthogonal Trajectory (Def 14.2)" — excerpt: "A curve which cuts every member of a given 1-parameter family of curves in a $90^\circ$ angle..." (refs: @isogonal-trajectory)
- [ ] lines 32–58: **note**/**remark** `{label: orthogonal-trajectories-polar}` "Orthogonal trajectories in polar coordinates" — excerpt: "call $P(r,\theta)$ the point of intersection in polar coordinates..." (refs: @orthogonal-trajectory)

### chapter-03.../lesson-15-dilution-and-accretion,-interest,-temperature,-decomposition-and-growth,-second-order-processes.md
- [ ] lines 95–176: **proposition** + nested **proof** `{label: dilution-solution-forms}` "Forms of the Solution (Conjecture)" — excerpt: "When both $a \neq 0$ and $c \neq 0$, an unseparable linear first order..." (see math-errors queue re: lines 64/68/144)

### chapter-03.../lesson-16-motion-of-a-particle-along-a-straight-line.md
- [ ] lines 14–18: **axiom**/**note** `{label: newtons-second-law}` "Newton's Second Law" — excerpt: "Newton's second law says the rate of a change of the momentum of a body..." (note: physics/motion.md also states this — coordinate labels)
- [ ] lines 40–44: **axiom**/**note** `{label: newtons-law-of-attraction}` "Law of Attraction" — excerpt: "If $m_1$ and $m_2$ are the masses of two bodies..."
- [ ] line 130: **definition** `{label: terminal-velocity}` "Terminal Velocity" — excerpt: "We call the value $gm/k$ the terminal velocity of the object..."
- [ ] lines 209–216: **definition** `{label: sliding-friction-coefficient}` "Sliding Friction / Coefficient of Friction" — excerpt: "We call this sliding friction to distinguish it from..."
- [ ] lines 176–207: **example** `{label: velocity-as-function-of-distance}` "Velocity as a function of distance" — excerpt: "Call $R$ the radius of the earth, substitute initial conditions..."

### chapter-03.../lesson-17a-pursuit-curves.md
- [ ] lines 42–82: **exercise** + **solution** `{label: bug-toward-center}` "Problem 4: Bug Walking Towards The Center" — excerpt: "An insect steps on the edge of a turntable of radius $a$..."
- [ ] lines 84–148: **exercise** + **solution** `{label: bug-parallel-to-x-axis}` "Problem 5: Bug Walking Parallel to the x-axis" — excerpt: "Assume in problem 4 that the insect always moves in a direction parallel..." (refs: @exact-differential-equation)
- [ ] lines 150–170: **exercise** + **solution** `{label: bug-toward-light}` "Problem 12: Bug Walking Towards a Light" — excerpt: "Assume in problem 4 that the insect moves straight toward a light..."

### chapter-03.../lesson-17b-miscellaneous-types-of-problems-leading-to-equations-of-the-first-order.md
- [ ] lines 8–48: **example**/**note** `{label: rl-circuit}` "First Order Linear Electric Circuit" — excerpt: "Take a circuit where an applied electromotive force $E$, an inductor $L$..." (refs: @linear-differential-equation-first-order)
- [ ] lines 50–72: **example**/**note** `{label: chain-over-support}` "Chain Hung over Frictionless Support" — excerpt: "Consider a chain hung over a frictionless support..." (refs: @newtons-second-law)
- [ ] lines 74–99: **exercise** + **solution** `{label: chain-exercise-17-23}` "Exercise 17.23" — excerpt: "Assume we have a chain 24 feet long hanging on a frictionless support..."
- [ ] lines 101–147: **example**/**note** `{label: variable-mass-rocket}` "Variable Mass Rocket" — excerpt: "A rocket burns fuel to accelerate, causing its mass to be variable..." (see math-errors queue re: line 123)

## Typos
- [ ] lesson-03:23 — "explict solution" → "explicit solution"; "satisfies th equation" → "the equation"; "occurences" → "occurrences"
- [ ] lesson-03:25 — `$$F(x,y,y',\cdots,y^{(n)} = 0$$` unbalanced — missing `)`: `F(x,y,y',\cdots,y^{(n)}) = 0`
- [ ] lesson-03:42 — "implict function" → "implicit function"
- [ ] lesson-03:51 — "here was have $f(x,y)$" → "here we have"
- [ ] lesson-03:53 — duplicated phrase: "pick a branch of $f(x,y)$, first pick a branch of $f(x,y)$ that defines a function"
- [ ] lesson-04:28 — "the solution a diffrential equation" → "the solution to a differential equation"
- [ ] lesson-04:40 — `$$ F(x,y,y',\cdots,y^{(n)} = 0 \tag{4.32}$$` unbalanced — missing `)`
- [ ] lesson-04:42 — "the resultion *function*" → "resulting function"
- [ ] lesson-04:44 — `F(x,f',f'',\cdots,f^{(n)})` should be `F(x,f,f',\cdots,f^{(n)})` (the zeroth term $f$ replacing $y$ is missing)
- [ ] lesson-04:56,60,64,68,72 — `ccosx`, `-csinx`, `sinx`, `sinx cosx`, `tanx` should use `\cos x`, `\sin x`, `\tan x`
- [ ] lesson-04:98 — "Particular Solutoin" → "Particular Solution"
- [ ] lesson-04:107 — "initital conditions" → "initial conditions"
- [ ] lesson-05:16 — "satisifies" → "satisfies"; "soltuion" → "solution"
- [ ] lesson-05:18 — "algebraicly" → "algebraically"; "the slop of an integral curve" → "slope"
- [ ] lesson-05:34 — "countor lines" → "contour lines"
- [ ] lesson-05:46 — "which les on" → "which lies on"
- [ ] lesson-05:53 — "to exlude" → "to exclude"
- [ ] lesson-06:19 — `tan\alpha` → `\tan\alpha`
- [ ] lesson-06:51 — "incremements" → "increments"
- [ ] lesson-07 (title/throughout) — "Homogenous" → "Homogeneous" (systemic, incl. filename/headings; recurs across the whole ODE tree)
- [ ] lesson-07:22 — `f(x,y) = y^nh(h)` → `y^n h(u)` (argument should be `u=x/y`, not `h`)
- [ ] lesson-07:29 — `f(tx,ty) = t^n(x,y)` → `t^n f(x,y)` (missing `f`)
- [ ] lesson-07:35,51 — "Coeffecients"/"coeffecients" → "Coefficients"; "substition" → "substitution"
- [ ] lesson-08:10 — "prevents it from being homogenous" → "homogeneous"
- [ ] lesson-08:12 — "Paralell Lines" → "Parallel"; "anorther" → "another"; "aree parallel" → "are parallel"
- [ ] lesson-08:16 — `$(0,0$)` malformed → `$(0,0)$`
- [ ] lesson-08:34 — trailing unbalanced `)`; also "for if they were" is missing "zero"
- [ ] lesson-08:42 — "havea unique point" → "have a unique point"
- [ ] lesson-08:44,48 — both display equations tagged `\tag{8.23}` (duplicate tag)
- [ ] lesson-08:116 — constraint `u \neq 8` → `u \neq -8` (all other constraints are $-8$)
- [ ] lesson-09:23 — "continuous funtion" → "continuous function"
- [ ] lesson-09:39,50 — "dtermined" → "determined"; the four corner points list repeats `(x_0,y_0)` twice and omits `(x,y)`
- [ ] lesson-09:78 — `$$ P(x,y)dx + Q(x,y)dx = 0 $$` second `dx` → `dy`
- [ ] lesson-09:86 — `F_xy(x,y) == F_yx(x,y)` → `F_{xy} = F_{yx}` (subscript braces; `==`→`=`); also "if such a function... then" missing "there exists"
- [ ] lesson-09:123,145 — `R(Y)` → `R(y)`; notation introduced as `P_{-1}` but used as `P_{-x}` (inconsistent)
- [ ] lesson-09:141 — unbalanced parentheses (open "(because both..." never closed)
- [ ] lesson-10:16 — "coeffecient" → "coefficient"
- [ ] lesson-10:44–74 — equation tags `10.65`/`10.66` reused across cases 1–5 (duplicate tags)
- [ ] lesson-10:121 — "excercises" → "exercises"
- [ ] lesson-11:13 — "in wich" → "in which"
- [ ] lesson-11:33 — "for hte swiss mathematician" → "the Swiss"
- [ ] lesson-11:62 — `4xy4` → `4xy^4`
- [ ] lesson-11:66 — "we now that hte first term" → "we know that the first term"
- [ ] lesson-11:78 — reference "(11.19)" → likely "(11.21)" (no 11.19 defined; 11.21 is the solution formula)
- [ ] lesson-11 (throughout) — "Ricatti" → "Riccati"
- [ ] lesson-11:92 — "is calleda" → "is called a"
- [ ] lesson-11:138 — "excercise" → "exercise"
- [ ] lesson-11:168 — `e^{\int{-2\{tan}x}dx}` malformed — `\{tan` → `\tan`
- [ ] lesson-11:170 — `\int{\cos^{x}\sin{x}dx}` — `\cos^{x}` → `\cos^2{x}` (integrand is $\Psi Q = \cos^2 x\,\sin x$)
- [ ] lesson-11:178,182 — `cos` → `\cos` (unescaped)
- [ ] lesson-12:18 — reference "(through 10.30)" — no 10.30 exists in lesson 10 (likely wrong tag)
- [ ] lesson-12b:19,20 — "Homogenous Coffecients" → "Homogeneous Coefficients"; "homgenous" → "homogeneous"
- [ ] lesson-13:14 — "who's derivative" → "whose"; "proprety" → "property"; "tangets" → "tangents"
- [ ] lesson-13:29,36 — "perpindicular" → "perpendicular"; line 29 "we can find $\vec{b}$" should be "find $\vec{c}$" (the projection vector)
- [ ] lesson-13:51 — `\tan{\beta} = r\frac{d0}{dr}` — `d0` → `d\theta`
- [ ] lesson-13:61 — "problems are started in the form" → "stated"; "than any curve" → "that any curve"
- [ ] lesson-13:63 — "Proof of Necessesity" → "Necessity"
- [ ] lesson-14:20 — "measured from the tangent line with slope ${y_1}'$ to the tangent line with slope ${y_1}'$" — the two slopes are identical; per (14.13) should read "from ... slope $y'$ to ... slope ${y_1}'$"
- [ ] lesson-14:28 — "a give nfamily" → "a given family"
- [ ] lesson-14:36 — "it is evient form the figure" → "evident from the figure"
- [ ] lesson-15:73 — "solve the differntial equation" → "differential"
- [ ] lesson-15:150 — "$x+k=0,~x=k$" inconsistent (from $dx=0$ one gets $x=k$, but $x+k=0$ gives $x=-k$)
- [ ] lesson-16:108 — "positon equation" → "position"; "conditons" → "conditions"
- [ ] lesson-16:142 — "porportional the the square" → "proportional to the square"; "downard" → "downward"
- [ ] lesson-16:154 — "downard" → "downward"
- [ ] lesson-16:216 — "smoothness/roughness particular the object and surface" → "particular to the object"
- [ ] lesson-16:234,235 — "This make sense" → "makes"; "multipled times" → "multiplied"; "As the angle increase" → "increases"; `\degree` is non-standard (use `^\circ`)
- [ ] lesson-17a:16,22 — `xsinh` → `x\sinh`; lines 118,126 `sin\theta`/`v_0sin\theta` → `\sin\theta`
- [ ] lesson-17a:100 — "Picking a few of positions" → "a few positions"; unbalanced paren "(consider it moving ... unchanged." (no closing `)`)
- [ ] lesson-17a:102 — "the bugs' position" → "the bug's position"
- [ ] lesson-17a:110 — "arbitrary constant's" → "arbitrary constants"
- [ ] lesson-17a:136 — "gives $c = \alpha r^2$" → should be `\alpha a^2` (at $r=a$)
- [ ] lesson-17a:168 — "inseperable" → "inseparable"
- [ ] lesson-17a:189 — "equillibrium" → "equilibrium" (twice)
- [ ] lesson-17b:34 — `i_0 e^\frac{-Rt}{L}` missing braces around exponent → `e^{\frac{-Rt}{L}}`
- [ ] lesson-17b:42 — "This is makes the steady state" → "This makes"
- [ ] lesson-17b:58 — "the chain weights $\delta$ units" → "weighs"
- [ ] lesson-17b:62 — "the portion on the right side must be hanging at $y$ above" — second "right" should be "left"
- [ ] lesson-17b:74 — "Excercise" → "Exercise"
- [ ] lesson-17b:105 — "accomodate" → "accommodate"
- [ ] lesson-17b:125 — "we get  get:" → "we get:"
- [ ] lesson-17b:135,141,145 — `Aln`/`ln` → `A\ln`/`\ln`
