# Polar Coordinates

This isn't strictly a calculus topic but it comes up a lot with calculus so I'm sticking it here. I'm not really sure what "part" of math coordinate systems belong to; they are used all over the place and have geometric and algebraic interpretations.

## Definition

Polar coordinates are a 2d orthogonal coordinate system where coordinates are given by two components, radius and angle, i.e. $P = (r,\theta).$

The radius is the distance from the origin to $P$ and the angle is the angle formed with a line measured counter-clockwise from the positive $x$-axis to a line passing through $P$. 


<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/2D_polar.svg/1024px-2D_polar.svg.png"  width="344" height="336">


## Converting Between Rectangular and Polar

$$ x = r\cos\theta, \quad y = r\sin\theta $$

$$ r = \sqrt{x^2 + y^2}, \quad \theta = \text{atan2}({y,x}) $$

