// Analytic solution to the 1D heat equation u_t = alpha * u_xx on [0, L]
// via eigenfunction expansion. No p5, no DOM — pure math.
//
// For each boundary condition we use the corresponding orthonormal basis
// of -d^2/dx^2, expand the initial condition into that basis, and evolve
// each mode by its decay factor exp(-alpha * lambda_n * t).

export type BC = 'dirichlet' | 'neumann' | 'periodic';
export type ICFn = (x: number) => number;

export interface Coeffs {
  bc: BC;
  L: number;
  sineCoeffs: Float64Array;
  cosineCoeffs: Float64Array;
  mean: number;
  eigenvalues: Float64Array;
}

export const DEFAULT_N_MODES = 64;
export const INTEGRATION_POINTS = 512;

export function slowestNonzeroEigenvalue(bc: BC, L: number): number {
  switch (bc) {
    case 'dirichlet':
    case 'neumann':
      return (Math.PI / L) ** 2;
    case 'periodic':
      return (2 * Math.PI / L) ** 2;
  }
}

export function computeCoefficients(
  ic: ICFn,
  bc: BC,
  L: number = 1,
  N: number = DEFAULT_N_MODES,
  M: number = INTEGRATION_POINTS
): Coeffs {
  const sineCoeffs = new Float64Array(N);
  const cosineCoeffs = new Float64Array(N);
  const eigenvalues = new Float64Array(N);
  let mean = 0;

  if (bc === 'periodic') {
    const dx = L / M;
    const samples = new Float64Array(M);
    for (let i = 0; i < M; i++) samples[i] = ic(i * dx);

    let s = 0;
    for (let i = 0; i < M; i++) s += samples[i];
    mean = s / M;

    for (let n = 1; n <= N; n++) {
      const kn = 2 * Math.PI * n / L;
      let a = 0, b = 0;
      for (let i = 0; i < M; i++) {
        const x = i * dx;
        a += samples[i] * Math.cos(kn * x);
        b += samples[i] * Math.sin(kn * x);
      }
      cosineCoeffs[n - 1] = (2 / M) * a;
      sineCoeffs[n - 1]   = (2 / M) * b;
      eigenvalues[n - 1]  = kn * kn;
    }
  } else {
    const dx = L / M;
    const samples = new Float64Array(M + 1);
    for (let i = 0; i <= M; i++) samples[i] = ic(i * dx);

    const trap = (vals: Float64Array): number => {
      let s = 0.5 * (vals[0] + vals[M]);
      for (let i = 1; i < M; i++) s += vals[i];
      return s * dx;
    };

    if (bc === 'neumann') {
      mean = trap(samples) / L;
    }

    const integrand = new Float64Array(M + 1);
    for (let n = 1; n <= N; n++) {
      const kn = Math.PI * n / L;
      if (bc === 'dirichlet') {
        for (let i = 0; i <= M; i++) integrand[i] = samples[i] * Math.sin(kn * i * dx);
        sineCoeffs[n - 1] = (2 / L) * trap(integrand);
        cosineCoeffs[n - 1] = 0;
      } else {
        for (let i = 0; i <= M; i++) integrand[i] = samples[i] * Math.cos(kn * i * dx);
        cosineCoeffs[n - 1] = (2 / L) * trap(integrand);
        sineCoeffs[n - 1] = 0;
      }
      eigenvalues[n - 1] = kn * kn;
    }
  }

  return { bc, L, sineCoeffs, cosineCoeffs, mean, eigenvalues };
}

export function evaluate(
  coeffs: Coeffs,
  xs: Float64Array | number[],
  t: number,
  alpha: number,
  out?: Float64Array
): Float64Array {
  const nx = xs.length;
  const result = out && out.length === nx ? out : new Float64Array(nx);

  for (let i = 0; i < nx; i++) result[i] = coeffs.mean;

  const { sineCoeffs, cosineCoeffs, eigenvalues, bc, L } = coeffs;
  const N = eigenvalues.length;

  for (let n = 1; n <= N; n++) {
    const decay = Math.exp(-alpha * eigenvalues[n - 1] * t);
    if (decay < 1e-12) continue;
    const s = sineCoeffs[n - 1] * decay;
    const c = cosineCoeffs[n - 1] * decay;
    if (s === 0 && c === 0) continue;

    const kn = bc === 'periodic' ? 2 * Math.PI * n / L : Math.PI * n / L;
    for (let i = 0; i < nx; i++) {
      const x = xs[i];
      if (s !== 0) result[i] += s * Math.sin(kn * x);
      if (c !== 0) result[i] += c * Math.cos(kn * x);
    }
  }

  return result;
}
