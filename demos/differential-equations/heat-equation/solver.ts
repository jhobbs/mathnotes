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

/** Snapshot of a Stepper's mode state — for the checkpoint cache. */
export interface StepperSnapshot {
  sine: Float64Array;
  cosine: Float64Array;
  mean: number;
}

/** Integrator for the time-dependent heat equation with inhomogeneous BCs (Dirichlet)
 *  and/or a source term, across all three BC families. Each mode satisfies
 *  b_n' + α λ_n b_n = Q_n(t); the n=0 (mean) mode has λ=0 for Neumann and Periodic,
 *  where it accumulates source input linearly. We advance via first-order ETD, which
 *  is unconditionally stable and exact in the homogeneous part. Basis and wavenumbers
 *  depend on BC:
 *      Dirichlet : sin(nπx/L), λ_n = (nπ/L)²          (mean mode unused)
 *      Neumann   : cos(nπx/L), λ_n = (nπ/L)²; plus mean with λ_0 = 0
 *      Periodic  : sin(2πnx/L), cos(2πnx/L), λ_n = (2πn/L)²; plus mean with λ_0 = 0
 */
export class Stepper {
  readonly bc: BC;
  readonly L: number;
  readonly N: number;
  readonly eigenvalues: Float64Array;
  readonly sineCoeffs: Float64Array;
  readonly cosineCoeffs: Float64Array;
  mean: number = 0;
  t: number = 0;

  constructor(bc: BC, L: number, N: number) {
    this.bc = bc;
    this.L = L;
    this.N = N;
    this.eigenvalues = new Float64Array(N);
    this.sineCoeffs = new Float64Array(N);
    this.cosineCoeffs = new Float64Array(N);
    const kBase = bc === 'periodic' ? 2 : 1;
    for (let n = 1; n <= N; n++) {
      this.eigenvalues[n - 1] = (kBase * Math.PI * n / L) ** 2;
    }
  }

  resetFromCoeffs(coeffs: Coeffs, t0: number = 0): void {
    this.sineCoeffs.set(coeffs.sineCoeffs);
    this.cosineCoeffs.set(coeffs.cosineCoeffs);
    this.mean = coeffs.mean;
    this.t = t0;
  }

  /** Advance by dt using first-order ETD, treating all Q_* as constant over the interval.
   *  qSine, qCosine have length N (mode index n=1..N); qMean is the n=0 contribution. */
  step(dt: number, alpha: number, qSine: Float64Array, qCosine: Float64Array, qMean: number): void {
    // Mean mode (λ=0 for Neumann/Periodic; unused for Dirichlet since caller passes qMean=0).
    this.mean += qMean * dt;
    const N = this.N;
    for (let n = 0; n < N; n++) {
      const phi = alpha * this.eigenvalues[n] * dt;
      if (phi < 1e-10) {
        this.sineCoeffs[n] += qSine[n] * dt;
        this.cosineCoeffs[n] += qCosine[n] * dt;
      } else {
        const decay = Math.exp(-phi);
        const factor = (1 - decay) / (alpha * this.eigenvalues[n]);
        this.sineCoeffs[n] = this.sineCoeffs[n] * decay + qSine[n] * factor;
        this.cosineCoeffs[n] = this.cosineCoeffs[n] * decay + qCosine[n] * factor;
      }
    }
    this.t += dt;
  }

  /** Reconstruct u from stored modes, adding the caller-supplied base U(x) (the
   *  Dirichlet inhomogeneous-BC interpolant; zero for Neumann/Periodic). */
  evaluate(xs: Float64Array, out: Float64Array, base: (x: number) => number): void {
    const nx = xs.length;
    for (let i = 0; i < nx; i++) out[i] = base(xs[i]) + this.mean;
    const kBase = this.bc === 'periodic' ? 2 : 1;
    const N = this.N;
    for (let n = 1; n <= N; n++) {
      const s = this.sineCoeffs[n - 1];
      const c = this.cosineCoeffs[n - 1];
      if (s === 0 && c === 0) continue;
      const kn = kBase * Math.PI * n / this.L;
      for (let i = 0; i < nx; i++) {
        if (s !== 0) out[i] += s * Math.sin(kn * xs[i]);
        if (c !== 0) out[i] += c * Math.cos(kn * xs[i]);
      }
    }
  }

  snapshot(): StepperSnapshot {
    return {
      sine: new Float64Array(this.sineCoeffs),
      cosine: new Float64Array(this.cosineCoeffs),
      mean: this.mean,
    };
  }

  restoreSnapshot(snap: StepperSnapshot, t: number): void {
    this.sineCoeffs.set(snap.sine);
    this.cosineCoeffs.set(snap.cosine);
    this.mean = snap.mean;
    this.t = t;
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
