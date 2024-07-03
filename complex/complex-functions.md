---
layout: page
title: Complex Functions
---

# Complex Functions

A complex-valued function $f$ of a complex variable $z$ is a rule that assigns a complex number $f(z)$ to each complex number $z$ in a set $S$.

The set of complex numbers on which a function operates is called the **domain of definition.**. It can be a domain in the sense described in [Regions of the Complex Plane](regions-of-the-complex-plane.html), but it doesn't have to be. If the domain of definition isn't explicitly specified, it is assumed to be the entire complex plane.

We often use the format

$$ w = f(z) $$

to denote that $f$ maps values of $z$ in the domain to values of $w$ in the **range**, which is the set of all values the function produces from input values in the domain of definition.

Using this notation, we say that $f$ maps points in the $z$-plane to points in the $w$-plane. Letting $z = x + yi$ and $w = u + vi$, we see that 4 dimensions ($x,y,u,v$) are required to represent the mapping, and thus it is not possible to represent complex-valued functions using conventional graphs.

We can, how ever, represent input sets in the $z$-plane in one graph and output sets in the $w$-plane in another graph to get some notion of how the mapping works.

## Some Geometricly Interesting Functions

The function

$$ w = z + b $$

where all values are complex, translates any point in the $z$-plane to a new point in the $w$-plane determined by the vector addition of $z$ and $b$.

Next, the function:

$$ w = az $$

where all values are complex, rotates $z$ by the argument of $a$, and multiplies the modulus of $z$ by the modulus of $a$ to get a new point in the $w$-plane.

This becomes more obvious if we let $a = pe^{\phi i}$ and $z = re^{\theta i}$. Then we have:

$$ w = pre^{(\theta + \phi)i}, $$

which we can consider in two parts, a rotation:

$$ w^* = e^{\phi i}z $$

and a magnification:

$$ w = pw^* $$

Finally, the function:

$$ w = f(z) = \frac{1}{z} $$

is called a **reciprocation**. Again, writing it in the exponential form is more enlightening:

$$ w = f(z) = \frac{1}{re^{\theta i}} = \frac{1}{r} e^{-\theta i }. $$

This shows that $f$ inverses the modulus of $z$, and changes the sign of its argument. This has some funky effects; points inside the circle $\|z\| = 1$ are mapped to points outside the circle $\|w\| = 1$, and points on the top half of the input circle are mapped to points on the bottom half of the output circle.

## Bilinear Mappings

Another important class of functions is called **bilinear** or **Mobius** mappings. They are of the form

$$ w = \frac{az + b}{cz + d} $$

where $a, b, c$ and $d$ are complex numbers for which $ad - bc \neq 0$, which ensures that the mapping is not a constant. Every bilinear transformation is a succession of rotations, magnifications, reciprocations, and/or translations. One property of bilinear transformations is that they map circles and straight lines to circles and straight lines; which one depends on whether the curve to be mapped passes through the point at which the bilinear mapping is undefined.
