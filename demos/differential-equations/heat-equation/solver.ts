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

/** Project an arbitrary spatial profile onto the Dirichlet sine basis on [0, L]:
 *  returns coefficients c_n such that fn(x) ≈ Σ c_n sin(nπx/L). */
export function projectOntoSineBasis(
  fn: (x: number) => number,
  L: number = 1,
  N: number = DEFAULT_N_MODES,
  M: number = INTEGRATION_POINTS
): Float64Array {
  const dx = L / M;
  const samples = new Float64Array(M + 1);
  for (let i = 0; i <= M; i++) samples[i] = fn(i * dx);
  const trap = (vals: Float64Array): number => {
    let s = 0.5 * (vals[0] + vals[M]);
    for (let i = 1; i < M; i++) s += vals[i];
    return s * dx;
  };
  const out = new Float64Array(N);
  const integrand = new Float64Array(M + 1);
  for (let n = 1; n <= N; n++) {
    const kn = Math.PI * n / L;
    for (let i = 0; i <= M; i++) integrand[i] = samples[i] * Math.sin(kn * i * dx);
    out[n - 1] = (2 / L) * trap(integrand);
  }
  return out;
}

/** Integrator for the time-dependent Dirichlet heat problem with inhomogeneous BCs
 *  and a source term. Each mode b_n(t) satisfies b_n' + α λ_n b_n = Q_n(t); we advance
 *  via exponential time differencing (ETD1), which is unconditionally stable and
 *  exact for the homogeneous part. Caller supplies Q_n(t) at the stepper's current time.
 */
export class DirichletStepper {
  readonly N: number;
  readonly L: number;
  readonly eigenvalues: Float64Array;
  readonly bn: Float64Array;
  t: number;

  constructor(L: number, N: number) {
    this.L = L;
    this.N = N;
    this.eigenvalues = new Float64Array(N);
    this.bn = new Float64Array(N);
    this.t = 0;
    for (let n = 1; n <= N; n++) {
      this.eigenvalues[n - 1] = (Math.PI * n / L) ** 2;
    }
  }

  reset(bnInit: Float64Array, t0: number = 0): void {
    this.bn.set(bnInit);
    this.t = t0;
  }

  /** Advance by dt using first-order ETD, treating Q_n as constant over the interval. */
  step(dt: number, alpha: number, Qn: Float64Array): void {
    const N = this.N;
    for (let n = 0; n < N; n++) {
      const phi = alpha * this.eigenvalues[n] * dt;
      if (phi < 1e-10) {
        // α = 0 or vanishing decay; forcing integrates linearly in dt.
        this.bn[n] += Qn[n] * dt;
      } else {
        const decay = Math.exp(-phi);
        const factor = (1 - decay) / (alpha * this.eigenvalues[n]);
        this.bn[n] = this.bn[n] * decay + Qn[n] * factor;
      }
    }
    this.t += dt;
  }

  /** Reconstruct u from stored modes, adding the caller-supplied base U(x) (steady/linear part). */
  evaluate(xs: Float64Array, out: Float64Array, base: (x: number) => number): void {
    const nx = xs.length;
    for (let i = 0; i < nx; i++) out[i] = base(xs[i]);
    const N = this.N;
    for (let n = 1; n <= N; n++) {
      const b = this.bn[n - 1];
      if (b === 0) continue;
      const kn = Math.PI * n / this.L;
      for (let i = 0; i < nx; i++) out[i] += b * Math.sin(kn * xs[i]);
    }
  }

  /** Deep-copy the mode state (for the checkpoint cache). */
  snapshot(): Float64Array {
    return new Float64Array(this.bn);
  }
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
