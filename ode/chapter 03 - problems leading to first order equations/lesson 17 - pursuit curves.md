# Pursuit Curves

(*jmh* my notes)

Flight path of a plane taking off from $(100,0)$ and always pointing towards $(0,0)$ with $k$ being the ratio of wind speed to plane speed, and wind speed in the positive y direction:

https://www.desmos.com/calculator/yuwl4zdtwc

The equation for the above curve is:

$$ y = xsinh{(k \ln{\frac{100}{x}})} $$

Note that if we want to find where the plane will cross the $y$-axis, we can't just set $x = 0$ because this equation isn't defined there. To get the correct value, we apparently need to take the limit from the right as $x$ approaches $0$.

So, for example, to find where the plane crosses the $y$ axis when the wind to plane speed ratio is $\frac{2}{3}$ we find:

$$ \lim_{x\to0}  xsinh{(k \ln{\frac{100}{x}})} = 50 $$

i.e., 50 units to the north of the target.

This is interesting to me and the book doesn't explain this - you just have to figure it out on your own. I think it makes sense to some degree if you consider that for some wind speeds the plane will never reach the $y$-axis, and that if it were to land at the origin it wouldn't be moving anymore, so the function really isn't intended to be defined at origin, just as we approach the $y$-axis.

You can also solve the problem above with polar coordinates, which gives this equation and graph:

https://www.desmos.com/calculator/rwnpkeivcf

I find the math to be a bit easier with polar coordinates here.

Path taken by a bug crawling across record with radius 100 spinning on a turn table. $k$ is the ratio of the bug's velocity towards the center to the angular velocity of the record:

https://www.desmos.com/calculator/y50fx79ykn

## Turntable problems

converting a system of rectangular differential equations to polar coordinates:

http://people.uncw.edu/hermanr/mat463/ODEBook/Book/Systems.pdf

{% include_relative turntable.html %}
