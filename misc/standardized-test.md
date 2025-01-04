---
layout: page
title: Standardized Test Math
---

# Standardized Test Math

These are some notes from my preperation for a standardized math test.

## Geometry


### Interior Angles of Regular Polygons

The sum of the degrees of the interior angles of a regular $n$-gon is $180(n - 2)$. This can be shown by dividing the interior into triangles by picking one vertex and drawing diagonals to non opposing vertices. There will be $n-3$ non-adjacent vertices, resulting in $n-2$ triangles, each with $180$ degrees of interior angles.

### Diagonals in a Regular Octagon

How many diagonals does a regular octagon have? How many of them are parallel to at least one side of the octagon?

There are $n$ vertices in a regular $n$-gon; each vertex is an endpoint for $n-3$ diagonals. However, each diagonal connects to two vertices, so we end up with $\frac{n(n-3)}{2}$ diagonals in a regular $n$-gon. Therefore, a regular octagon has $20$ diagonals.

We can exploit the symmetry of an octagon to get our answer from here. The image below shows that any given vertex is connected to two diagonals that are parellel to at least one side.

![Octagon Diagonals](octagon-diagonals.png)

There are 8 vertices, and each diagonal connects to two diagonals that are parallel to at least one side, so we have $\frac{8 \cdot 2}{2} = 8$ diagonals that are parallel to at least one side of the octagon.

*Note:* I'm not sure how to generalize this to $n$-gons. In particular, I'm not sure how to find the number of diagonals parallel to at least one side.

## Series

Find the sum

$$ \sum_{n=1}^{100}{\frac{1}{n} - \frac{1}{n+1}}.$$

We can split the summation into two:

$$ \sum_{n=1}^{100}{\frac{1}{n} - \frac{1}{n+1}} = \sum_{n=1}^{100}{\frac{1}{n}} -  \sum_{n=1}^{100}{\frac{1}{n+1}}. $$

Now, it's helpful to write out some terms:

$$ \begin{align} \sum_{n=1}^{100}{\frac{1}{n}} & = \frac{1}{1} + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{99} + \frac{1}{100} \\  \sum_{n=1}^{100}{\frac{1}{n+1}} & = \frac{1}{2} + \frac{1}{3} + \frac{1}{4} + \cdots + \frac{1}{100} + \frac{1}{101} \end{align}. $$

From this, it's obvious that subtracting the second summation from the first cancels out all terms except the $\frac{1}{1}$ unique to the first summation and the $\frac{1}{101}$ unique to the second summation.

$$ \require{cancel} $$ 

$$ \begin{align} \sum_{n=1}^{100}{\frac{1}{n}} & = \frac{1}{1} + \cancel{\frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{99} + \frac{1}{100}} \\  \sum_{n=1}^{100}{\frac{1}{n+1}} & = \cancel{\frac{1}{2} + \frac{1}{3} + \frac{1}{4} + \cdots + \frac{1}{100}} + \frac{1}{101} \end{align}. $$

So, we end up with

$$ \sum_{n=1}^{100}{\frac{1}{n} - \frac{1}{n+1}} = 1 - \frac{1}{101} = \frac{100}{101}. $$

## Algebra

### Number of Matches Won

During the first half of the year, a tennis player won 60 percent of the matches she played in. During the second half, the player won 3 out of the 20 matches she played in. If the tennis player won 50 percent of the matches she played in for the year, how many matches did she play in?

Since we know that there were 20 matches played in the second half, our unknown is the number of matches played in the first half. Let's call that $x$.

Then

$$ 0.6x + 3 = 0.5(x + 20), $$

because the left hand side represents the number of matches won in the first and second half of the season, and the right hand side the number of matches won overall.

Solving for $x$, we get $x = 70.$ Then, the number of matches played for the entire year is $70 + 20 = 90$.
