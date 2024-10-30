def find_coeffs(x, y, rhs, initial_values, N):
    derivatives = [diff(rhs, x, i) for i in range(N)]
    args = [
        diff(y, x, i)(x=0) == initial_values[i] for i in range(len(initial_values)) 
    ]
    values = initial_values.copy()
    
    for n in range(N):
        value = derivatives[n].subs(*args, x=0)
        args.append(diff(y, x, n+len(initial_values))(x=0) == value)
        values.append(value)
        
    p_n = 0
    for i, value in enumerate(values):
        p_n += (value * (x**i))/factorial(i)
    
    show(p_n)
    
x = var('x')
y = function('y')(x)
df = 4*sin(y)+3*exp(x)
find_coeffs(x, y, df, [0], 10)
