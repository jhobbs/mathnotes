---
layout: page
title: Discrete Fourier Transform
---

1. Take a closed contour $C.$

2. Take $N$ sample points along it, separated evenly by arc length.

3. Calculate the Fourier coefficient $c_n$ at each of the $N$ points. These correspond to the frequencies $n = -[N/2], \dots, [N/2].$ We're basically measuring how much of each frequency the contour has at each of the $N$ different points.

4. Only about half of these are unique because the frequency $N - m, m < N$ is the same as $-m.$ (why?)

5. Each $c_n$ represents a vector in the complex plane with:

* length = $|c_n|$

* phase angle = $\Arg(c_n)$

* rotation speed = $n$ 
