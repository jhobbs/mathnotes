# Polar Coordinates

This isn't strictly a calculus topic but it comes up a lot with calculus so I'm sticking it here. I'm not really sure what "part" of math coordinate systems belong to; they are used all over the place and have geometric and algebraic interpretations.

## Definition

Polar coordinates are a 2d orthogonal coordinate system where coordinates are given by two components, radius and angle, i.e. $P = (r,\theta).$

The radius is the distance from the origin to $P$ and the angle is the angle formed with a line measured counter-clockwise from the positive $x$-axis to a line passing through $P$. 


<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/2D_polar.svg/1024px-2D_polar.svg.png"  width="344" height="336">


## Converting Between Rectangular and Polar

$$ x = r\cos\theta, \quad y = r\sin\theta $$

$$ r = \sqrt{x^2 + y^2}, \quad \theta = \text{atan2}({y,x}) $$

## Derivatives ##

If we parameterize such that $x = x(t)$ and $y = y(t)$ and want to find $x'$ and $y'$ in polar coordinates, we have:

$$ \frac{dx}{dt} = x(t)' = (r\cos\theta)' = r'\cos\theta - r\sin\theta, \quad \frac{dy}{dt} = y(t)' = (r\sin\theta)' = r'\sin\theta + r\cos\theta \tag{a} $$

thus:

$$ \frac{\frac{dy}{dt}}{\frac{dx}{dt}} = \frac{dy}{dx} = \frac{r'sin\theta + r\cos\theta}{r'\cos\theta - r\sin\theta} \tag{b} $$

Coming from the other way, and considering $x=x(t), ~ y=y(t), ~r=r(t), ~\theta=\theta(t)$ we can start with:

$$ r^2 = x^2 + y^2, \quad \tan\theta = \frac{y}{x} \tag{c} $$

Differentiating the first equation in (c) with respect to $t$ we get:

$$2rr' = 2xx' + 2yy', ~rr' = xx' + yy', ~ r' = \frac{xx' + yy'}{r} \tag{d}$$

Rewriting the second equaton in (c) and then differentiating with respect to $t$ we get:

$$ \theta = \tan^{-1}\frac{y}{x}, \theta' = \frac{1}{1 + {(\frac{y}{x}})^2} \cdot \frac{y'x-yx'}{x^2} = \frac{y'x-yx'}{x^2 + y^2} = \frac{y'x - yx'}{r} $$
