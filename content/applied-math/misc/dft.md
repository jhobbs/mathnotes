---
layout: page
title: Discrete Fourier Transform
---

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


## math on the unit circle

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

Now, we can equip this vector space with an @inner-product,

$$ \langle z, w \rangle = \sum_{k=0}^{N-1} z_k \overline{w_k}. $$

To see that this is indeed an inner product, we'll show the required properties hold

For @conjugate-symmetry, let $z_k = a + bi$ and let $w_k = c + di.$ Then,

$$ z_k \overline{w_k} = (a + bi)(c - di) = ac - adi + cbi + bd = (ac + bd) + (cb - ad)i, $$

and

$$ \overline{w_k \overline{z_k}} = \overline{(c + di)(a - bi)} = \overline{ac + adi - cbi + bd} = (ac + bd) - (ad - cb)i = (ac + bd) + (cb - ad)i, $$

and since $k$ is arbitrary, it holds for any respective pair of components in $z$ and $w,$ and so $\langle z, w \rangle = \overline{\langle w, z \rangle}.$

For @linearity in the first argument, let $w, v, z \in \mathbb{C}^n, a, b \in \mathbb{C}.$ Then

$$ \langle ax + by, z \rangle = (a x_1 + b y_1) * z_1 + (a x_2 + b y_2) * z_2 + \cdots = a(x_1 * z_1) + a(x_2 * z_2) + \cdots + b(y_1 * z_1) + b(y_2 * z_2) + \cdots = a \langle x, z \rangle + b \langle x, z \rangle. $$

Now, to show @positive-definiteness let $z = a + bi.$ Then,

$$ \langle z, z \rangle = z \overline{z} = 1 > 0. $$

Since $\mathbbC{}^n$ is an inner-product space, we can use the inner product to compare how well aligned two vectors are, and to perform projections.
