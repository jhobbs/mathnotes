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

$$ -2 \pi i (-1) (1) / 9} = \frac{2 \pi}{9}. $$

So, our sample point and our rotation are the same. When we multiply them in exponential form, we add the angles, and get $\frac{4 \pi}{9}.$ We take the exponential from our first sample and add it to this exponential, which gives us their average, and we get $\frac{2 \pi}{9}$ as our summation vector so far.

Next at $k=2,$ our sample point is at $\frac{4 \pi}{9}$ and our rotation vector is too. The resulting angle is $\frac{8 \pi}{9}.$ Our summation vector now points at $\frac{5 \pi}{9},$ midway between its previous value and the value of this sample.
