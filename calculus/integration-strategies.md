# Trig Sub

For $\sqrt{b^2x^2 - a^2}$ substitute $x= \frac{a}{b}\sec{\theta}$

For $\sqrt{a^2 - b^2x^2}$ substitute $x= \frac{a}{b}\sin{\theta}$

For $\sqrt{a^2 + b^2x^2}$ substitute $x= \frac{a}{b}\tan{\theta}$

See https://tutorial.math.lamar.edu/classes/calcii/TrigSubstitutions.aspx

# Integration by Reduction Formulae

$$ \int{\sec^n{x}dx} = \frac{\sec^{n-1}{x}\sin{x}}{n-1} + \frac{n-2}{n-1}\int{\sec^{n-2}{x}}dx $$

See more here: https://en.wikipedia.org/wiki/Integration_by_reduction_formulae

# $u$-sub

Here's an interesting integral from Tenenbaum and Pollard's ODE book that can be solved via $u$-sub:

$$ \tag{a} \int{\frac{dv}{g-\frac{kv^2}{m}}} $$

Our strategy will be to use:

$$ \tag{b} \int{\frac{dv}{1-x^2}} = \tanh^{-1}x + c$$

First factor out $g$ from the denominator and then factor the constant out of the integral:

$$ \tag{c} \int{\frac{dv}{g-\frac{kv^2}{m}}} = \int{\frac{dv}{g(1-\frac{kv^2}{mg})}} = \frac{1}{g}\int{\frac{dv}{1-\frac{kv^2}{mg}}} $$

Now we can use a $u$-sub to get the form we want. Let:

$$ \tag{d} u = v\sqrt{\frac{k}{mg}},~du = \sqrt{\frac{k}{mg}}dv $$

Then:

$$ \tag{e} \frac{1}{g}\int{\frac{dv}{1-\frac{kv^2}{mg}}} = \sqrt{\frac{m}{kg}}\int{\frac{1}{1-\frac{kv^2}{mg}} * \sqrt{\frac{k}{mg}} dv} = \sqrt{\frac{m}{kg}}\int{\frac{du}{1-u^2}} $$

Now we can use the integral given in (a) and substitute back for $u$:

$$ \tag{f} \sqrt{\frac{m}{kg}}\int{\frac{du}{1-u^2}} = \sqrt{\frac{m}{kg}}(\tanh^{-1}{u} + c) = \sqrt{\frac{m}{kg}}\tanh^{-1}{(v\sqrt{\frac{k}{mg}})} + c $$

Note that instead of using $u$-sub, we could have used partial fraction decomposition by performing different factoring to get:

$$ \tag{g} \frac{-m}{k} \int{\frac{dv}{(v-\frac{gm}{k})(v+\frac{gm}{k})}} $$

This would lead to a solution in terms of natural logarithms instead of $\tanh^{-1}$. 
