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

## Bug on a Turntable Problems

The book has a series of problems where the goal is the find the path of a bug that is walking on a turntable. I haven't found solutions to these elsewhere on the internet, and it took me weeks to solve them, so I'm going to detail them here. The quoted questions are from the book and the rest is my own work.

### 4. Bug Walking Towards The Center ###

"An insect steps on the edge of a turntable of radius $a$ that is rotating at a constant angular velocity $\alpha$. It moves straight toward the center of the table at a constant velocity $v_0$. Find the equation of its path in polar coordinates, relative to axes fixed in space."

In the turntable graphic at the bottom of this page, this is the "To Center" mode.

We'll assume that the bug steps on to the table at $\theta = 0$ and that the turntable is rotating counter-clockwise.

We have two sources of motion for the bug to consider - its locomotive motion (walking) and the rotation caused by the turntable.

The bug's locomotive motion takes it always towards the center of the turntable at speed $v_0$, reducing the radius, and doesn't change the angle to the bug relative to the $x$-axis. The following differential equations capture that motion:

$$ \frac{dr}{dt} = -v_0,~\frac{d\theta}{dt} = 0 \tag{a} $$

The motion of the turntable rotating always changes only the angle to the bug relative to the $x$-axis at speed $\alpha$ and never the distance of the bug from the center. The following differential equations capture that motion:

$$ \frac{dr}{dt} = 0,~\frac{d\theta}{dt} = \alpha \tag{b}$$

Adding together the equations $\frac{dr}{dt}$ and $\frac{d\theta}{dt}$ respectively from (a) and (b) gives:

$$ \frac{dr}{dt} = -v_0,~\frac{d\theta}{dt} = \alpha \tag{c} $$

We can then divide to get $\frac{dr}{d\theta}$:

$$ \frac{dr}{d\theta} = \frac{dr}{dt}\frac{dt}{d\theta} = \frac{-v_0}{\alpha}, \alpha \neq 0 \tag{d} $$

To find the path of the equation we can rearrange and integrate with initial conditions $r = a$ and $\theta = 0$

$$ \int_{r=a}^{r} dr = \int_{\theta=0}^{\theta}-\frac{v_0}{\alpha}d\theta \tag{e} $$

Which gives:

$$ r = a - \frac{v_0}{\alpha}\theta \tag{f} $$

The book then asks:

"Draw a graph of the equation if $a = 10$ ft, $\alpha = \frac{\pi}{4}$ radians/sec, $v_0 = 1$ ft/sec. How many revolutions will the table have made by the time the insect reaches the center?"

That graph is given here: https://www.desmos.com/calculator/jascajj5wo

The number of revolutions required is $1\frac{1}{4}$ which can be found by substituting the given values and solving for $\theta$. 

I found the notes in this document on converting a system of rectangular differential equations to polar coordinates particularly helpful:
http://people.uncw.edu/hermanr/mat463/ODEBook/Book/Systems.pdf

{% include_relative turntable.html %}
