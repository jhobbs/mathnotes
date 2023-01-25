# Goal
The goal of partial fraction composition is to be able to rewrite a rational expression as a sum of simpler fractions.

# Conditions for application

Partial fraction decomposition works when we have a rational expression of the form:

$$ f(x) = \frac{P(x)}{Q(x)} $$

where both $P(x)$ and $Q(x)$ are polynomials and the degree of $P(x)$ is strictly less than the degree of $Q(x)$.

If the degree of $P(x)$ is greater than or equal to the degree of $Q(x)$, perform long division first and work with the remainder term.

# General Approach to Partial Fraction Decomposition

This approach always works as long as the conditions above are satisfied, but there are other ways; see below.

1. First, factor the denominator as completely as possible.

2. Handle **linear factors of** $Q(x)$

Let $x - r$ be a linear factor of $Q(x)$. Suppose that $(x - r)^m$ is the highest power of $x - r$ that divides $Q(x)$.

This factor will translate to the sum of $m$ partial fractions, as follows:

$$ \frac{A_1}{x-r} + \frac{A_2}{(x-r)^2} + \cdots + \frac{A_m}{(x - r)^m}. $$

Repeat this for each distinct linear factor of $Q(x)$.

3. Handle **irreducible quadratic factors of** $Q(x)$

An irreducible quadtric factor is a quadratic expression that cannot be factored into linear factors with real coefficients.

Let $x^2 + px + q$ be an irreducible quadratic factor of $Q(x)$. Suppose $(x^2 +px + q)^n$ is the highest power of this factor thad divides $Q(x)$.

This factor will translate to the sum of $n$ partial fractions, as follows:

$$ \frac{B_1 x + C_1}{x^2+px+q} + \frac{B_2 x + C_2}{(x^2+px+q)^2} + \cdots + \frac{B_n x + C_n}{(x^2+px+q)^n} $$

Repeat this for each distinct irreducible quadratic factor of $Q(x)$.

4. Set the original fraction $\frac{P(x)}{Q(x)}$ equal to the sum of all the partial fractions from steps 2 and 3.

5. Clear the fractions by multiplying by $Q(x)$. Distribute. Arrange the terms in decreasing powers of $x$. Group coefficients of the same power of $x$ by factoring out that power of $x$.

6. Equate the coefficients of corresponding powers of $x$ and solve the resulting equations for the undetermined coefficients.

7. We can now write the equation in the form

$$ \frac{P(x)}{Q(x)} = \frac{A_1}{x-r} + \frac{A_2}{(x-r)^2} + \cdots + \frac{A_m}{(x - r)^m} + \frac{B_1 x + C_1}{x^2+px+q} + \frac{B_2 x + C_2}{(x^2+px+q)^2} + \cdots + \frac{B_n x + C_n}{(x^2+px+q)^n} $$

*note*: why can we only deal with linear and irreducible quadratics? Can we always factor higher degree polynomials into terms that are either linear or quadratic?

## Example

Express

$$ \tag{a} \frac{3(1+x)}{1-x^3} $$

as a sum of partial fractions.

Note that the degree of the numerator is 1 while the degree of the denominator is 3, so we satisfy the conditions for performing partial fraction decomposition and may proceed.

First, factor the denominator (recognizing that it's a sum of cubes):

$$ \tag{b} \frac{3(1+x)}{(1-x)(x^2+x+1)} $$

The denominator is now composed of one linear factor in $x$: $1+x$, and one irreducible quadratic factor in $x$:  $x^2+x+1$. Both are raised on the first power.

Write the partial fraction with an undetermined coefficient for the linear factor as:

$$ \tag{c} \frac{A}{1-x} $$

Write the partial fraction with undetermined coefficients for the irreducible quadratic factor as:

$$ \tag{d} \frac{Bx + C}{x^2+x+1} $$

Sum (c) and (d) and set it equal to (b):

$$ \tag{e} \frac{3(1+x)}{(1-x)(x^2+x+1)} = \frac{A}{1-x} + \frac{Bx + C}{x^2+x+1} $$

Clear the fractions by multiplying both sides by the denominator of the left hand side:

$$ \tag{f} 3(1+x) = A(x^2+x+1) + (Bx+C)(1-x) $$

Distribute

$$ \tag{g} 3 + 3x = Ax^2 + Ax + A + Bx - Bx^2 +C - Cx $$

Sort by descending powers of $x$:

$$ \tag{h} 3x + 3 = Ax^2 - Bx^2 + Ax + Bx - Cx + A + C $$

Group coefficients of like powers of $x$ by factoring out the common power of $x$:

$$ \tag{i} 3x + 3 = x^2(A-B) + x(A+B-C) + (A+C) $$

The equation will be an identity when the coefficients of respective powers of $x$ on both sides are equal. Set them up and solve for them.

$$ \tag{j} \text{Coefficients of}~x^2: 0 = A - B $$

$$ \text{Coefficients of}~x^1: 3 = (A+B-C) $$

$$ \text{Coefficients of}~x^0: 3 = (A+C) $$

Solving these simulataneously we get $A=2, B=2, C=1$

Substituting these values into (e) we get:

$$ \tag{k} \frac{3(1+x)}{(1-x)(x^2+x+1)} = \frac{2}{1-x} + \frac{2x + 1}{x^2+x+1} $$

which is the desired sum of partial fractions.

# The Heaviside Cover-up Method

This method only applies when the factor of $Q(x)$ are:

* linear
* distinct
* raised to the first power

That is, they are of the form $(x-r_1),(x-r_2),\cdots,(x-r_n)$.

But when it does work, it's a bit faster than the *proper* method above.

1. First, factor the denominator as completely as possible. We now have a function in the form:

$$ \frac{P(x)}{Q(x)} = \frac{P(x)}{(x-r_1)(x-r_2)\cdots(x-r_n)} $$

2. For each of the $n$ factors, find the corresponding factor $A_n$ by setting $x$ to $r_n$ and *covering* the factor containing $r_n$. By covering, we mean *remove* it as it if weren't there. For example, for $n = 1$:

$$ A_n = \frac{P(r_1)}{\cancel{(x-r_1)}(r_1-r_2)\cdots(r_1-r_n)} $$

3. Repeat $n$ times to find the $n$ different factors, then you can write the function in decomposed format:

$$ \frac{P(x)}{Q(x)} = \frac{A_1}{x-r_1} + \frac{A_2}{x-r_2} + \cdots + \frac{A_n}{x-r_n} $$

# Other Methods
Thomas and Finney cover a couple of other methods of determining the coefficients:

* Differentiating
* Assigning small values to $x$ such as $x=0,\pm1,\pm2$ to get equations in $A$, $B$, and $C$.

# References
[Paul's Notes](https://tutorial.math.lamar.edu/classes/calcii/partialfractions.aspx)

*Calculus* by Thomas & Finney, 9th edition, pp 569-573 
