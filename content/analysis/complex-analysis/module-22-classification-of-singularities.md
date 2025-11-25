---
description: Types of isolated singularities including removable singularities, poles
  of various orders, and essential singularities based on Laurent series.
layout: page
title: Classification of Singularities
---

:::definition "Singularity"
A point $z_0$ is called a **singularity** of a complex function $f$ if $f$ is not analytic at $z_0$, but every neighborhood of $z_0$ contains at least one point at which $f$ is analytic.
:::

:::definition "Point Singularity" {synonyms: "Isolated Singularity"}
A @singularity $z_0$ of a @complex-function $f$ is said to be a **point singularity** or **isolated singularity** if there exists a @neighborhood of $z_0$ in which $z_0$ is the only @singularity of $f$.

Alternatively, a **point singularity** of a function $f$ is a @complex-number $z_0$ such that $f$ is defined in a @neighborhood of $z_0$ but not at the point $z_0$ itself.
:::

# Classification of Singularities

Given a @Laurent-series expansion of a @function with an @isolated-singularity at $z_0$, we have the possibility of the @singularity being removable, a pole, or an essential singularity.

:::definition "Removable Singularity" {synonyms: removable}
A **removable singularity** occurs if all negative powers in the Laurent series are zero and the function can be redefined at the singularity to be analytic.
:::
:::example
Consider $f(z) = z$ defined in the @punctured-plane. Then, the @origin is an @isolated-singularity, because $f(z)$ is not defined there, but is defined everywhere else in a @neighborhood of the origin. We can easily define $f(0) = 0,$ and this will make $f(z)$ analytic at $0,$ and so we say this @singularity is @removable.
:::

:::definition "Pole"
A **pole** is present if the Laurent series has a finite number of negative power terms. The largest negative exponent (in absolute value) indicates the order of the pole.
:::
:::example
Consider $f(z) = 1/z$ defined in the @punctured-plane. Then, the @origin is an @isolated-singularity, but in this case, we can't simply define it in a @continuous fashion, because $f(z)$ approaches infinity as $z \to 0.$ Thus, we call this @singularity a @pole.
:::

:::definition "Essential Singularity"
An **essential singularity** occurs if there are infinitely many negative powers in the Laurent series.
:::
:::example
Consider $f(z) = e^{1/z},$ on the @punctured-plane. As $z$ approach $0$ on the positive real axis, $f(z)$ goes to infinity, and as $z$ approaches $0$ on the negative real axis, $f(z)$ approaches 0. On the imaginary axis, $f(z)$ oscillates wildly, but remains @bounded, as $z$ approaches $0.$ This is neither a @removable-singularity nor a @pole, and we call it an @essential-singularity.
:::


:::theorem
If $f(1/z)$ has a @singularity at $0,$ then $f(z)$ has a @singularity at the @point-at-infinity.
:::
