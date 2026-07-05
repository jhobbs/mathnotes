# Queue 01: Algebra, Foundations, Geometry

## Formalization candidates

### content/algebra/abstract/groups.md
- [x] lines 30–40: **example** `{label: examples-of-groups}` — excerpt: "Some examples of groups: The integers under addition..." (includes the non-example at line 40; refs: @group, @identity)
- [x] line 48: **example** `{label: abelian-examples}` — excerpt: "The integers under addition are Abelian, because $a + b = b + a$..." (refs: @abelian)
- [x] lines 52–54: **example** `{label: z4-finite-group}` — excerpt: "The examples given so far are all infinite groups, but finite groups..."
- [x] line 63: **example** `{label: even-integers-subgroup}` — excerpt: "For example, the even integers under addition, $(2\mathbb{Z}, +)$, are a subgroup..." (refs: @subgroup)
- [x] line 77: **note** "Generator Notation" — excerpt: "We use angle brackets to denote an element as a generator..." (ℕ→ℤ error fixed with Jason's approval)
- [x] lines 100–108: **note** "Finding the Subgroups of a Cyclic Group" — excerpt: "Every element of a cyclic finite group will generate a cyclic subgroup..." (note: $r \cdot g^s$ arguably should be $(g^s)^r$ — left as written, Jason aware)
- [x] lines 110–114: **example** "Subgroups of $Z_{20}$" (label autogen: subgroups-of-z20) — excerpt: "This sounds really abstract, so here's an example of finding all of the subgroups..." (also fixed "indicates than" → "indicates that")
- [x] lines 118–128: **example** "Permutation Matrix Notation" — excerpt: "If we rearrange the ordered set $A = \{1,2,3,4,5\}$ to another order..." (also titled the bare `:::definition` below it as "permutation" so @permutation resolves)
- [x] line 142: **definition** "symmetric group" — excerpt: "When $A$ is the finite set $\{1, 2, 3, \cdots, n\}$, the group of all permutations..." (refs: @permutations)
- [x] lines 144–146: **definition** "permutation multiplication" — excerpt: "Permutations can be 'multiplied', which is just composition..." (refs: @Permutations)
- [x] lines 155–161: **definition** "orbit containing a point" — excerpt: "Let $\sigma$ be a permutation of $A$, the orbit of $\sigma$ containing..." (also titled the formal orbit definition "orbit"; added @permutation refs)
- [x] lines 168–180: **example** "Orbits of a Permutation in $S_8$" — excerpt: "Consider $\sigma = \begin{pmatrix} 1 & 2 & 3...$ in $S_8$..." (removed duplicated matrix line, folded "Example:" into the block header)
- [x] line 188: **definition** "cyclic notation" — excerpt: "A cycle in $S_n$ may be written as $(a_1, a_2, \cdots, a_k)$..." (refs: @cycle; also titled the bare cycle definition "cycle" and added @orbit ref)
- [x] lines 228–231: **example** "Left Cosets of $3\mathbb{Z}$" — excerpt: "Example. Left cosets of subgroup $3\mathbb{Z}$ of $\mathbb{Z}$..." (refs: @cosets, @subgroup)
- [x] lines 232–238: **proposition** "Properties of Cosets" `{label: coset-properties}` — excerpt: "Some properties: If $aH \cap bH \neq \emptyset$, then $aH = bH$..." (refs: @cosets, @Abelian, @order)
- [x] lines 291–299: **proposition** `{label: homomorphism-properties}` "Properties of Group Homomorphisms" — excerpt: "Homomorphisms have some nice properties. Suppose that $\phi : G \to G'$..." (refs: @homomorphism-group, @subgroup)
- [x] line 306: **theorem** `{label: homomorphism-injective-iff-trivial-kernel}` — excerpt: "One useful fact you may recall from linear algebra... $\phi$ is injective iff..." (refs: @kernel)

### content/algebra/abstract/rings.md
- [ ] line 22: **example** `{label: examples-of-rings}` — excerpt: "For example, the integers, rationals, reals and complex numbers are all rings..." (refs: @Ring)
- [ ] line 32: **remark** `{label: ring-multiplicative-identity}` — excerpt: "A ring doesn't have to have a multiplicative identity element, but it can..." (refs: @unity)
- [ ] line 64: **example** `{label: examples-of-fields}` — excerpt: "For example, the integers are not a field, but the rationals..." (refs: @Field)

### content/algebra/factoring.md
- [ ] lines 13–19: **theorem** `{label: sum-and-difference-of-cubes}` "Sum and Difference of Cubes" — excerpt: "Sum of cubes: $a^3 + b^3 = (a+b)(a^2 - ab + b^2)$..."
- [ ] lines 21–24: **note** `{label: cubes-factoring-mnemonic}` — excerpt: "Note that in both cases the first operation on the right side..."

### content/algebra/linear/determinants.md
- [ ] line 10: **theorem/proposition** `{label: determinant-of-triangular-matrix}` — excerpt: "The determinant of an upper triangular matrix is the product of its diagonal..."
- [ ] lines 12–18: **note/proposition** `{label: row-operations-and-determinant}` — excerpt: "We can find the determinant of a matrix through row reduction..."
- [ ] line 23: **definition** `{label: two-by-two-determinant}` — excerpt: "For 2x2 matrices... the determinant is $ad - bc$."
- [ ] lines 25–31: **theorem** `{label: cramers-rule}` "Cramer's Rule" — excerpt: "For a system of two equations with two unknowns..."
- [ ] lines 34–42: **theorem/definition** `{label: three-by-three-determinant}` — excerpt: "For the 3x3 matrix... the determinant is..."

### content/algebra/linear/dotproduct.md
- [ ] lines 12–18: **definition** `{label: dot-product}` "Dot Product" — excerpt: "Given two vectors in $R^2$, define their dot product as..." (note: a labeled "Inner product" block with synonym "Dot Product" already exists in properties_of_vectors.md — may want to reference rather than duplicate)
- [ ] lines 20–27: **remark/theorem** `{label: dot-product-geometric-interpretation}` — excerpt: "One geometric interpretation of the dot product of $\vec{u}$ and $\vec{v}$..." (refs: @cos-characterization-of-dot-product, @projection)
- [ ] lines 31–39: **theorem/proposition** `{label: dot-product-properties}` "Properties of the Dot Product" — excerpt: "For these properties, let $x, y, z \in \mathbb{R}^n$..."

### content/algebra/linear/projection.md
- [ ] lines 12–20: **definition** `{label: projection}` "Projection" — excerpt: "The **projection** of $\vec{u}$ onto $\vec{v}$ is the vector paralell..." (refs: @dot-product)
- [ ] lines 22–27: **definition** `{label: component}` "Component" — excerpt: "The length of the projection of $\vec{u}$ in the direction of $\vec{v}$..."
- [ ] lines 30–36: **definition** `{label: orthogonal-projection}` "Orthogonal Projection" — excerpt: "The orthogonal projection of $\vec{u}$ onto $\vec{v}$ is given as..."

### content/foundations/logic-and-proofs/boolean-algebra.md
- [ ] lines 10–20: **axiom/definition** (six blocks, or one) — inference rules Modus Ponens / Modus Tollens / Or Introduction / And Introduction / And Elimination / Material Implication. Suggested labels: `modus-ponens`, `modus-tollens`, `or-introduction`, `and-introduction`, `and-elimination`, `material-implication` — excerpt: "**Modus Ponens:** $P \rightarrow Q, P \vdash Q$..."

### content/foundations/logic-and-proofs/induction.md
- [ ] lines 8–15: **definition/note** `{label: principle-of-mathematical-induction}` "Principle of Mathematical Induction" — excerpt: "For proof by induction that a statement is true for all $n \geq 1$..."
- [ ] lines 19–50: **example** `{label: induction-sum-of-squares}` (with nested proof) — excerpt: "We will prove by induction that $1^2 + 2^2 + 3^2 + \cdots + n^2$..."
- [ ] lines 54–124: **example** `{label: induction-sum-of-powers-of-3}` (with nested proof) — excerpt: "Prove that for all $n \geq 0$: $\sum_{k=0}^n 3^k$..."

### content/geometry/projection-and-homogenous-coordinates.md
- [ ] lines 38–47: **definition/note** `{label: homogeneous-translation-matrix}` — excerpt: "The translation matrix $T$ in homogeneous coordinates that shifts a point..."
- [ ] lines 70–79: **definition/note** `{label: homogeneous-rotation-matrix-x}` — excerpt: "The rotation matrix $R$ around the $x$-axis for an angle $\theta$..."
- [ ] lines 104–113: **definition/note** `{label: perspective-projection-matrix}` — excerpt: "we need to apply a perspective projection, which for focal length $f$..." (see possible math error in math-errors queue)
- [ ] line 122: **definition** `{label: projective-transformation}` "Projective Transformation" — excerpt: "The end transformation is an example of a **projective transformation**..."

### content/geometry/trigonometry/frequency.md
- [ ] line 12: **definition** `{label: period}` "Period" — excerpt: "**Period** (usually denoted as $T$) is the amount of time it takes..."
- [ ] line 14: **definition** `{label: frequency}` "Frequency" — excerpt: "**Frequency** (usually denoted as $f$ or $\nu$) is the number of cycles..."
- [ ] lines 18–22: **note/proposition** `{label: frequency-period-reciprocal}` — excerpt: "Frequency and period are related in this way: $f = \frac{1}{T}$..."
- [ ] lines 24–28: **definition** `{label: angular-frequency}` "Angular Frequency" — excerpt: "**Angular frequency** (usually denoted as $\omega$) is the number of radians..."
- [ ] lines 37–53: **example** `{label: frequency-applied-to-sin}` — excerpt: "The period of $\sin{t}$ is $2 \pi$..."

### content/geometry/trigonometry/identities.md
- [ ] lines 10–18: **theorem** `{label: half-angle-identities}` "Half Angle Identities" — excerpt: "$\cos{\frac{\theta}{2}} = \sqrt{\frac{1 + \cos{\theta}}{2}}$..." (see math-errors queue re: missing $\pm$)
- [ ] lines 22–28: **theorem** `{label: sum-and-difference-formulas}` "Sum and Difference Formulas" — excerpt: "$\cos{(a + b)} = \cos{a}\cos{b}-\sin{a}\sin{b}$..."
- [ ] lines 32–34: **theorem** `{label: linear-combination-of-sinusoids}` — excerpt: "$a \cos x + b \sin x = \sqrt{a^2 + b^2} \cos{(x - \arctan2{(b, a)})}$..."

### Clean files (nothing to formalize)
content/algebra/binomial.md, content/algebra/linear/properties_of_vectors.md, content/foundations/logic-and-proofs/formal-proofs.md, content/foundations/set-theory.md

## Typos
- [x] content/algebra/abstract/groups.md:14 — "A group, is a set" → "A group is a set" (stray comma)
- [x] content/algebra/abstract/groups.md:36 — "$n ~ x ~ n$ invertible matrices" → "$n \times n$ invertible matrices" (literal x used for times; same at line 48)
- [x] content/algebra/abstract/groups.md:45 — "$a \* b = b \* g$" → "$a \* b = b \* a$" (the $g$ should be $a$)
- [x] content/algebra/abstract/groups.md:60 — "a subset of $G$ group together with the same operation" → "a subset of $G$ together with the same operation" (stray word "group")
- [x] content/algebra/abstract/groups.md:74 — "$G = \{g^N | n \in \mathbb{Z}\}$" → "$G = \{g^n | n \in \mathbb{Z}\}$" (capital $N$ should be lowercase $n$)
- [x] content/algebra/abstract/groups.md:104 — "will generator the entire group" → "will generate the entire group"
- [x] content/algebra/abstract/groups.md:106 — "$r \dot g^s$" → "$r \cdot g^s$" (`\dot` is an accent command; should be `\cdot`)
- [x] content/algebra/abstract/groups.md:112 — "$Z_20$" in image alt text → "$Z_{20}$" (subscript renders only the 2)
- [x] content/algebra/abstract/groups.md:159 — "$a \~ b$" → "$a \sim b$" (`\~` is not valid; should be `\sim`)
- [x] content/algebra/abstract/groups.md:161 — "is an equivalent relation" → "is an equivalence relation"
- [x] content/algebra/abstract/groups.md:185 — "containing more than one elements" → "containing more than one element"
- [ ] content/algebra/abstract/groups.md:191 — "Two or more than two cycles are **disjoint**" → "Two or more cycles are **disjoint**"
- [x] content/algebra/abstract/groups.md:265 — "a disjoint coset of of $H$" → "a disjoint coset of $H$" (duplicate "of")
- [x] content/algebra/abstract/groups.md:269 — "$H = \bigcup_{q \in Q} q$" uses $Q$ but the set is named $\mathcal{Q}$ (inconsistent symbol)
- [x] content/algebra/abstract/groups.md:271–275 — in matrix $\mathcal{R}$ the row order is $a_1, a_2, \cdots, a_3, a_n$; the $a_3$ row is placed after the "\cdots" row (should be $a_1, a_2, a_3, \cdots, a_n$)
- [ ] content/algebra/abstract/rings.md:17 — "the right distribute law" → "the right distributive law"
- [ ] content/algebra/binomial.md:8 — "$n, k \in mathbb{N}$" → "$n, k \in \mathbb{N}$" (missing backslash on `\mathbb`)
- [ ] content/algebra/linear/dotproduct.md:18 — "$(x_1, x_2, \cdots, x_n) \cdots (y_1, \dots)$" → the middle operator should be `\cdot` (dot product), not `\cdots`
- [ ] content/algebra/linear/dotproduct.md:20 — "Thus, one $\vec{u}$ and $\vec{v}$ are pointing" → "Thus, when $\vec{u}$ and $\vec{v}$ are pointing"
- [ ] content/algebra/linear/dotproduct.md:20 — "when they're perpindicular" → "perpendicular"
- [ ] content/algebra/linear/projection.md:14 — "the vector paralell to $\vec{v}$ that's magnitude is component of" → "the vector parallel to $\vec{v}$ whose magnitude is the component of"
- [ ] content/algebra/linear/properties_of_vectors.md:116 — "$\vec{X} \cdot \vec{y}$" → "$\vec{x} \cdot \vec{y}$" (capital $X$ should be lowercase)
- [ ] content/algebra/linear/properties_of_vectors.md:148 — "so that $\vec{v} = \vec{a} \times \vec{b} = \vec{0}. $$" → trailing "$$" should be a single "$" (extra dollar sign, unbalanced inline math)
- [ ] content/algebra/linear/properties_of_vectors.md:161 — "$c_1, c_2, \cdots, c_3 \in \mathbb{R}$" → "$c_1, c_2, \cdots, c_n \in \mathbb{R}$" ($c_3$ should be $c_n$)
- [ ] content/foundations/logic-and-proofs/formal-proofs.md:17 — stray "\end{enumerate}" left over from LaTeX source (no matching \begin; should be removed)
- [ ] content/foundations/set-theory.md:17 — "is true for precisely for those objects" → "is true precisely for those objects" (duplicate "for")
- [ ] content/foundations/set-theory.md:77 — "$E \subset(B)$" → "$E \subset B$" (malformed parenthesis)
- [ ] content/foundations/logic-and-proofs/induction.md:44 — duplicate equation tag "\tag{e}" (already used on line 40); line 44 should likely be "\tag{f}"
- [ ] content/geometry/projection-and-homogenous-coordinates.md:14 — "changle the angle" → "change the angle"
- [ ] content/geometry/projection-and-homogenous-coordinates.md:21,22,34 — set notation written as `${(x_1,y_1),\dots}$`; the literal `{ }` are consumed as LaTeX grouping and won't render as set braces (use `\{ \}`)
- [ ] content/geometry/projection-and-homogenous-coordinates.md:32 — "homogenous coordiantes" → "homogeneous coordinates" ("coordiantes" misspelled; also "homogenous" → "homogeneous" appears throughout the file/title)
- [ ] content/geometry/trigonometry/frequency.md:22 — "As peroid increases" → "As period increases"
- [ ] content/geometry/trigonometry/frequency.md:44 — "\$omega$ is the horizontal scale factor" → "$\omega$ is the horizontal scale factor" (malformed: backslash-dollar then omega)
- [ ] content/geometry/trigonometry/identities.md:33 — "$\cos{(x + \Arctan{(-b/a))})}$" has unbalanced parentheses (an extra closing `)`); should be "$\cos{(x + \Arctan{(-b/a)})}$"
