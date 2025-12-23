---
layout: page
title: Discrete Fourier Transform
---

{% include_demo "contour-drawing" %}

The demo above shows how closed contours can be approximated via sums of complex exponentials. The process involves taking samples, performing a Discrete Fourier Transform on them, and then using the resulting Fourier Coefficients for complex exponentials. This is sometimes referred to as epicycles. This page gets into how the Discrete Fourier Transform Works.

# Preliminary rambling notes

1. Take a closed contour $C.$

2. Take $N$ sample points along it, separated evenly by arc length.

3. Calculate the Fourier coefficient $c_n$ at each of the $N$ points. These correspond to the frequencies $n = -[N/2], \dots, [N/2].$ We're basically measuring how much of each frequency the contour has at each of the $N$ different points.

We calculate the Fourier Coefficient $c_n$ as

$$ c_n = \frac{1}{N} \sum_{k=0}^{N-1} z_k e^{-2 \pi i n k / N} $$

4. Only about half of these are unique because the frequency $N - m, m < N$ is the same as $-m$ (just like moving back 2 hours from 12 on a clock to 10 it the same as moving forward by 10 hours).

5. Each $c_n$ represents a vector in the complex plane with:

* length = $|c_n|$

* phase angle = $\Arg(c_n)$

* rotation speed = $n$ 

Seems to be measuring how well the sample points move around the unit circle at the same rate as the rotation vector?

Let's take $N = 9$ and talk about what happens when our curve is a unit circle.

With frequency $n=0:$ we have no rotations, so, for each sample point, we add the sample point directly to the summation vector. The result is the average of all the sample points, the center of gravity, or DC component. For the unit circle this is $0.$

With frequency $n=-1:$

Starting with $k=0, $ we have $z_0,$ which is at $1.$ Our first rotation doesn't rotate at all, so our summation is now pointing at $1.$

Now at $k=1$, our second sample point $z_1$ is pointing at $\frac{2 \pi}{9}.$ The imaginary component of our exponential $e^{-2 \pi i n k / N}$ gives us

$$ -2 \pi i (-1) (1) / 9 = \frac{2 \pi}{9}. $$

So, our sample point and our rotation are the same. When we multiply them in exponential form, we add the angles, and get $\frac{4 \pi}{9}.$ We take the exponential from our first sample and add it to this exponential, which gives us their average, and we get $\frac{2 \pi}{9}$ as our summation vector so far.

Next at $k=2,$ our sample point is at $\frac{4 \pi}{9}$ and our rotation vector is too. The resulting angle is $\frac{8 \pi}{9}.$ Our summation vector now points at $\frac{5 \pi}{9},$ midway between its previous value and the value of this sample.

The demo below shows how each individual Fourier Coefficient calculation works by taking a sample point and rotating it.

{% include_demo "dft-computation" %}

## Math on the Unit Circle

The $n$th roots of @unity. There are $n$ $nth$ roots of 1. So, $z^{1} = 1$ has 1 solution, $1$ itself. $z^{2} = 1$ has 2 solutions, $1$ and $-1.$ Note that $-1$ is on the opposite side of the unit circle from $1.$ $z^3$ has 3 solutions: $1, e^{2 \pi / 3}$ and $e^{4 \pi / 3}.$  The general pattern is that the $n$th roots of unity are given by

$$ e^{i(2 k \pi)/n}, \quad k = 0, \dots, n-1. $$

Now, multiplying these roots by each other can be accomplished by adding their exponents, which are just terms in $i \pi / n,$ i.e. the product of $1$ and $-1$ is

$$ 1 * -1 = e^{0(i 2 \pi /2)} * e^{1(i 2 \pi /2)} = e^{(0 + 1)(i 2 \pi / 2)} = e^{i \pi} = -1. $$

Note that the resultant product is a root of unity as well, and in general the $nth$ roots of unit form a @cyclic @abelian @group under multiplication.

It also turns out that this group is isomorphic to $\mathbb{Z}_n$ under addition modulo $n.$ The multiplication we gave above is equivalent to $0 + 1 = 1$ on $\mathbb{Z}_2,$ and just like $-1 * -1 = 1,$ $1 + 1 = 0$ on $\mathbb{Z}_2.$

:::theorem
The $n$th roots of unity under multiplication are isomorphic to $\mathbb{Z}_n$ under addition.

::::proof
Let

$$ \mu_n = \{e^{2 pi i k /n} : k = 0, 1, \dots, n - 1\} $$

be the $n$th roots of unity, and

$$ \mathbb{Z}_n = \{ 0, 1, \dots, n - 1 \} $$

be the first $n$ non-negative integers under addition modulo $n.$

Let

$$ \phi : \mathbb{Z}_n \to \mu_n, \quad \phi(k) = e^{2 \pi i k / n} $$

be a mapping we will show to be an isomorphism.

First, note that $\mu_n$ and $\mathbb{Z}_n$ are obviously the same cardinality, by their definitions.

Now, suppose $a, b < n-1.$ Then

$$ \phi(a + b) = e^{2 \pi i (a + b) / n} = e^{2 \pi i a / n} * e^{2 \pi i b / n} = \phi(a) * \phi(b), $$

so $\phi$ is a @group-homomorphism.

Now,  $e_{\mu_n}$ is 1, that is, $e^{2 \pi i (0) / n},$ so $\ker{\phi} = {0}.$ But, $0$ is $e_{\mathbb{Z}_n},$ and so $\phi$ is @injective, and an @isomorphism, and $\mu_n$ and $\mathbb{Z}_n$ are isomorphic.
::::
:::

One more fact worth noting, now that we've established this isomorphism. On the unit circle, a negative rotation (clockwise) by $\phi$ is equal to a positive rotation (counterclockwise) by $2 \pi - \phi.$ This is easy to see:

$$ -(\phi) \equiv 2 \pi + (-\phi) \pmod{2 \pi} = 2 \pi - \phi. $$

Thus, the $-k$th $n$th root of unit, $e^{2 \pi i (k)}$ equals the $(n - k)$th root of unity (because the $n$th $n$th root of unity corresponds to a full rotation). This corresponds to $-k \equiv n - k \pmod{n}$ on $\mathbb{Z}_n.$ For example, $-4 = 9 - 4 = 5$ on $\mathbb{Z}_9,$ and $e^{2 \pi i (5)/9} = e^{2 \pi i (-4)/9}$ on $\mu_{n}.$


Coming soon... roots of unity as the elements of basis vectors for $\mathbb{C}^n,$ and DFT as computing the inner product (basically, cosine similarity * magnitude) between the sample points and these basis vectors. That is, DFT is a change of basis onto these basis vectors, it is literally projecting onto these.

## Sample Points as Vectors in $\mathbb{C}^n.$

Let's say we have a contour on the complex plane, and we take $n$ sample points on it, in order, so $z_0, z_1, \dots, z_n.$ We can view these sample points (which form a @sequence) as forming a vector in $\mathbb{C}^n:$

$$ ( z_0, z_1, \dots, z_n ). $$

Now, the standard basis for $\mathbb{C}^n$ is the same as that of $\mathbb{R}^n,$ which is $\{ e_1, e_2, \dots, e_n \},$ where $e_k$ is a $n$-dimensional vector with a 1 in the $k$th position and 0's in the other position, i.e.

$$ e_1 = ( 1, 0, \dots, 0 ), \quad e_2 = ( 0, 1, \dots, 0 ), \dots $$

It's easy to see that these basis vectors are @orthogonal (and therefore @linearly-independent); to see that they span $\mathbb{C}^n$, suppose $w = ( w_1, w_2, \dots, w_n. ).$ Then, $w_1 * e_1 + w_2 * e_2 + \cdots + w_n * e_n = w,$ that is, the components of $w$ (which are complex numbers) are exactly the scalar coefficients we need to multiply by our basis vectors to form $w,$ so this basis spans $\mathbb{C}^n.$

### $\mathbb{C}^n$ is an Inner Product Space

Now, we can equip this vector space with an @inner-product

:::theorem "\mathbb{C}^N is an inner product space" {label: complex-inner-product-space}

The @function

$$ \langle z, w \rangle = \sum_{k=0}^{N-1} z_k \overline{w_k} $$

defined on $z, w \in \mathbb{C}^N$ is an @inner-product, and so $\mathbb{C}^N$ ($N$ a positive integer) forms an @inner-product-space.

::::proof
Since $\mathbb{C}$ is a @field, $\mathbb{C}^N$ is obviously a @vector-space.

To see that this is indeed an inner product, we'll show the required properties hold.

For @conjugate-symmetry, let $z_k = a + bi$ and let $w_k = c + di.$ Then,

$$ z_k \overline{w_k} = (a + bi)(c - di) = ac - adi + cbi + bd = (ac + bd) + (cb - ad)i, $$

and

$$ \overline{w_k \overline{z_k}} = \overline{(c + di)(a - bi)} = \overline{ac + adi - cbi + bd} = (ac + bd) - (ad - cb)i = (ac + bd) + (cb - ad)i, $$

and since $k$ is arbitrary, it holds for any respective pair of components in $z$ and $w,$ and so $\langle z, w \rangle = \overline{\langle w, z \rangle}.$

For @linearity in the first argument, let $w, v, z \in \mathbb{C}^n, a, b \in \mathbb{C}.$ Then

$$ \langle ax + by, z \rangle = (a x_1 + b y_1) * z_1 + (a x_2 + b y_2) * z_2 + \cdots = a(x_1 * z_1) + a(x_2 * z_2) + \cdots + b(y_1 * z_1) + b(y_2 * z_2) + \cdots = a \langle x, z \rangle + b \langle x, z \rangle. $$

Now, to show @positive-definiteness let $z = a + bi.$ Then,

$$ \langle z, z \rangle = z \overline{z} = 1 > 0. $$
::::
:::

:::remark
Since $\mathbb{C}^n$ is an inner-product space, we can use the inner product to compare how well aligned two vectors are, and to perform projections.
:::

## Fourier Basis

We can use complex numbers representing varying degrees of rotation around the unit circle to form a basis vector. Given a sample count $N,$ we can make a basis from the $N$ vectors whose elements are defined as

$$ \phi_n = \left ( e^{2 \pi i n k / N} \right )_{k=0}^{N-1}, \quad n = 0, \dots, N-1. $$

To work on intuition some, let's take the case $N = 3.$

Then for $n = 0,$

$$ \phi_0 = \left (e^{2 \pi i (0)(0)/ 3}, e^{2 \pi i (0)(1)/ 3}, e^{2 \pi i (0)(2)/ 3} \right ) = (1, 1, 1), $$

$n = 1,$ 

$$ \phi_1 = \left (e^{2 \pi i (1)(0)/ 3}, e^{2 \pi i (1)(1)/ 3}, e^{2 \pi i (1)(2)/ 3} \right ) = (1, e^{2 \pi i / 3}, e^{-2 \pi i / 3} ), $$

and $n = 2,$

$$ \phi_2 = \left (e^{2 \pi i (2)(0)/ 3}, e^{2 \pi i (2)(1)/ 3}, e^{2 \pi i (2)(2)/ 3} \right ) = (1, e^{-2 \pi i / 3}, e^{2 \pi i / 3} ), $$

If we use our isomorphism $\mathbb{Z}_3,$ we have
a
$$ \phi_0 = (0, 0, 0), \quad \phi_1 = (0, 1, 2), \quad \phi_2 = (0, 2, 1). $$

Each of these values $n = 0, 1, 2$ represents a different frequency. For $n = 0,$ our total angle swept across all points is $2 \pi * 0 = 0.$ For $n = 1$ the total angle swept is $2 * \pi * 1 = 2 \pi.$ For $n = 2$ the total angle swept is $2 * pi * 2 = 4 \pi.$ So, we can say that basis vector $\phi_n$ is associated with (represents?) rotation at frequency $n.$

Now note that $\phi_2 = \phi_{-1}$ equals the conjugate of $\phi_1.$ It appears that the conjugate of the basis vector representing rotation at frequency $n$ represents rotation at frequency $-n.$

For odd $N,$ one basis vector represents no rotation - no frequency - aka DC - this is for $n=0.$ Then, for each $n$ up to $(N-1)/2,$ we have a positive $n$ frequency vector and a matching $-n$ frequency vector. The vectors representing each pair of frequencies are made up of sample points which are conjugates of each other (reflections of each other across the $x$-axis, or alternatively, rotations by the same increments in opposite directions.) That is, the $k$th point in the vector for $-n$ is the conjugate of the $k$th point in the vector for $n.$

For even $N,$ we have a similar situation, except there is an additional frequency at $N/2$ that is sometimes called the Nyquist frequency. This frequency has only real components and is therefore its own conjugate. The $k$th element of this vector is given by

$$ \phi_{N/2}(k) = e^{\pi i k} = (-1)^k. $$


:::theorem "Fourier Basis" {label: fourier-basis}
Let $N$ be a positive integer. Then the vectors

$$ \phi_n = (e^{2 \pi i n k  / N})_{k=0}^{N-1} $$

for $n = 0, \dots, N-1$ form a basis for $\mathbb{C}^N.$

::::proof
To show linear independence, we will show a stronger condition, orthogonality, holds.

For $m,n,k \in \mathbb{Z}_N, m \neq n$ we can write that the $k$th entry of $\phi_m$ is

$$ \phi_m(k) = e^{\frac{2 * \pi * i}{N} ( km \pmod{N} )}, $$

and that the conjugate of the $k$th entry of $\phi_n$ is

$$ \overline{\phi_n(k)} = e^{\frac{2 * \pi * i}{N} ( -kn \pmod{N} )}. $$

Then, in our inner product between $\phi_m$ and $\phi_n$, the $k$th term is

$$ \phi_m(k) \overline{\phi_n(k)} = e^{\frac{2 * \pi * i}{N} ( km \pmod{N} )} e^{\frac{2 * \pi * i}{N} ( -kn \pmod{N} )} = e^{\frac{2 * \pi * i}{N} ( k(m-n) \pmod{N} )}. $$

Thus, for $r = m - n \pmod{N},$

$$ \langle \phi_m, \phi_n \rangle = \sum_{k=0}^{N-1} e^{\frac{2 \pi i}{N} kr}. $$

Now we need to show that this sum is $0.$ Note that if we let $w = e^{\frac{2 \pi i}{N} r},$ we can rewrite this as

$$ \langle \phi_m, \phi_n \rangle = \sum_{k=0}^{N-1} w^k. $$

From @finite-geometric-series, we have that

$$ \sum_{k=0}^{N-1} w^k = \frac{1 - w^N}{1 - w}. $$

Substituting back in $e^{\frac{2 \pi i}{N} r}$ for $w$ we get

$$ \begin{aligned}

\sum_{k=0}^{N-1} e^{\frac{2 \pi i}{N} r k} & = \frac{1 -  e^{\frac{2 \pi i}{N} r N}}{1 - e^{\frac{2 \pi i}{N} r}} \\
                                           & = \frac{1 - 1^r}{1 - e^{\frac{2 \pi i}{N} r}} \\
                                           & = 0.
\end{aligned}
$$

Thus, $\langle \phi_m, \phi_n \rangle = 0,$ and so when $m \neq n,$ $\phi_m$ an $\phi_n$ are @orthogonal and therefore @linearly-independent.

Now we need to show that $\phi_0 \dots \phi_{N-1}$ span $\mathbb{C}^N.$

Let $\vec{u} = (z_0, z_1, \dots, z_{N-1}) \in \mathbb{C}^N.$ We need to find $c_0, c_1, \dots, c_{N-1}$ such that

$$ \vec{u} = c_0 \phi_0 + c_1 \phi_1 + \cdots + c_{N-1} \phi_{N-1}. $$

That is, we want constants $c_0 \cdots c_{N-1}$ such that

$$ \vec{u}u = \sum_{n=0}^{N-1} c_n \phi_n. $$

To find some specific $c_m,$ we can take the inner product of both sides with respect to $\phi_m$ to get

$$ \langle \vec{u}, \phi_m \rangle = \left \langle \sum_{n=0}^{N-1} c_n \phi_n, \phi_m \right \rangle. $$

@Linearity in the first argument of the @inner-product allows us to rewrite the right side to get

$$ \langle \vec{u}, \phi_m \rangle = \sum_{n=0}^{N-1} c_n  \left \langle \phi_n, \phi_m \right \rangle. $$

Now, we know that

$$ \left \langle \phi_n, \phi_m \right \rangle =
\begin{cases}
\text{N}, & n = m, \\
0, & n \neq m.
\end{cases}
$$

so the inner product on the right-hand side is $0$ except when $n = m,$ and this reduces to

$$ \langle \vec{u}, \phi_m \rangle = c_m N. $$

Therefore,

$$ c_m = \frac{\langle \vec{u}, \phi_m \rangle}{N}. $$

This shows that the Fourier basis described here indeed spans $\mathbb{C}^N,$ and shows how to compute the Fourier coefficients $c_0 \dots c_{N-1}.$
::::
:::
:::remark
The Fourier Coefficient $c_m,$ given as

$$ c_m = \frac{\langle \vec{u}, \phi_m \rangle}{N}. $$

Is just the @scalar-projection of $\vec{u}$ onto $\phi_m.$ It is a complex number, and $|c_m|$ is proportional to the amplitude of the frequency $m$ present in $\vec{u},$ while $\Arg{c_m}$ gives the phase of frequency $m$ in $\vec{u}.$

::::note
We've given this $c_m$ as the inner product divided by $N.$ This is allowed but not typical. In order to make

$$ IDFT(DFT(\vec{x})) = \vec{x}, $$

we need $\frac{1}{N}$ as a factor in either the DFT or the IDFT, but typically, it's done in the IDFT.
::::
:::

Now we're ready to see the DFT as a change of basis from the standard basis for $\mathbb{C}^N$ to the DFT (Fourier) Basis for $\mathbb{C}^N.$ The DFT is given as

$$ \vec{X}[n] = \langle \vec{x}[k], \phi_n \rangle = \sum_{k=0}^{N-1} \vec{x}[k] e^{-2 \pi i n k / N}, $$

and the IDFT is given as

$$ \vec{x}[k] = \frac{1}{N} \sum_{n=0}^{N-1} X[n] e^{2 \pi i n k / N}. $$

If we collect the conjugates of the $\phi_k$ vectors as rows in a matrix we get

$$ F =
\begin{pmatrix}
\phi_0^{*} \\
\phi_1^{*} \\
\vdots \\
\phi_{N-1}^{*}
\end{pmatrix}

= \begin{pmatrix}
e^{-2\pi i\,0\cdot 0/N} & e^{-2\pi i\,0\cdot 1/N} & \cdots & e^{-2\pi i\,0\cdot (N-1)/N} \\
e^{-2\pi i\,1\cdot 0/N} & e^{-2\pi i\,1\cdot 1/N} & \cdots & e^{-2\pi i\,1\cdot (N-1)/N} \\
\vdots & \vdots & \ddots & \vdots \\
e^{-2\pi i\,(N-1)\cdot 0/N} & e^{-2\pi i\,(N-1)\cdot 1/N} & \cdots & e^{-2\pi i\,(N-1)\cdot (N-1)/N}
\end{pmatrix}.
$$

Then, given a vector $\vec{x}$ in $\mathbb{C}^N,$ we can compute its DFT via matrix vector multiplication as

$$ \vec{X} = F \vec{x}, $$

and we can invert it via IDFT using the conjugate rows of $F$ as

$$ \vec{x} = \frac{1}{N} F^{*} \vec{X}. $$

:::note
In practice, while this matrix multiplication approach works, it can be optimized. This isn't an arbitrary matrix - it has some particular structure, and it can be factored to come up with a more efficient operation. This is what the Fast Fourier Transform does.
:::

The demo below allows drawing a contour and then editing the Fourier coefficients. Playing with this helps gives some intuition for what the coefficients represent, and it also shows one of the applications of DFT - filtering and amplifying components of a signal. Try drawing a closed contour that wraps around the origin three times counter-clockwise. What's the biggest component? Try drawing a similar shape, but go clockwise, maybe go clockwise 4 times.

{% include_demo "dft-editor" %}
