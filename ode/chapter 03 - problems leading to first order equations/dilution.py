import math

solution_starting_volume = 100
solution_starting_mass = 30

inflow_volume_rate = 3
inflow_concentration = 0
inflow_mass_rate = inflow_volume_rate * inflow_concentration

outflow_volume_rate = -3

net_flow_rate = inflow_volume_rate + outflow_volume_rate

a = inflow_mass_rate
b = outflow_volume_rate
c = net_flow_rate
v = solution_starting_volume

t = 10
x = 200


if inflow_mass_rate != 0 and net_flow_rate != 0:
    k = (math.pow(v, -b / c) * (a * v + b*x  - c*x))/(b - c)
elif a == 0:
    k = (v/b) * math.log(solution_starting_mass)
    print(k)
    x = math.exp((t + k) * (b/v))
    #t = (v/b) * math.log(x) - k

print(k)
print(x)
