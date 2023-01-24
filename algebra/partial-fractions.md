# Conditions for application

Partial fraction decomposition works when we have a rational expression of the form:

$$ f(x) = \frac{P(x)}{Q(x)} $$

where both $P(x)$ and $Q(x)$ are polynomials and the degree of $P(x)$ is strictly less than the degree of $Q(x)$.

If the degree of $P(x)$ is greater than or equal to the degree of $Q(x)$, perform long division first and work with the remainder term.

# Proper Partial Fraction Decomposition

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

5. Clear the fractions by multiplying by $Q(x)$. Arrange the terms in decreasing powers of $x$.

6. Equate the coefficients of corresponding powers of $x$ and solve the resulting equations for the undetermined coefficients.

*note*: why can we only deal with linear and irreducible quadratics? Can we always factor higher degree polynomials into terms that are either linear or quadratic?



# References
[Paul's Notes](https://tutorial.math.lamar.edu/classes/calcii/partialfractions.aspx)

*Calculus* by Thomas & Finney, 9th edition, pp 569-573 
