// Five preset initial-condition functions on [0, 1]. Each is defined as a
// raw function f(x); callers normalize (divide by max|f|) so u stays in
// [-1, 1] for consistent colormap and line-plot scaling.

import type { BC, ICFn } from './solver';

export type ICName = 'gaussian' | 'two-gaussians' | 'square' | 'sine' | 'random';

export interface ICSpec {
  name: ICName;
  label: string;
  build: (params: { mode: number; bc: BC; seed: number }) => ICFn;
  usesMode: boolean;
}

function makePrng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normalize(f: ICFn, samples: number = 257): ICFn {
  let maxAbs = 0;
  for (let i = 0; i <= samples; i++) {
    const v = Math.abs(f(i / samples));
    if (v > maxAbs) maxAbs = v;
  }
  if (maxAbs < 1e-12) return f;
  return (x) => f(x) / maxAbs;
}

export const IC_SPECS: ICSpec[] = [
  {
    name: 'gaussian',
    label: 'Gaussian bump',
    usesMode: false,
    build: () => (x) => Math.exp(-(((x - 0.5) / 0.1) ** 2)),
  },
  {
    name: 'two-gaussians',
    label: 'Two Gaussians',
    usesMode: false,
    build: () => (x) =>
      Math.exp(-(((x - 0.3) / 0.08) ** 2)) -
      Math.exp(-(((x - 0.7) / 0.08) ** 2)),
  },
  {
    name: 'square',
    label: 'Square pulse',
    usesMode: false,
    build: () => (x) => (x >= 0.35 && x <= 0.65 ? 1 : 0),
  },
  {
    name: 'sine',
    label: 'Sine',
    usesMode: true,
    build: ({ mode, bc }) => {
      const k = bc === 'periodic' ? 2 * Math.PI * mode : Math.PI * mode;
      return (x) => Math.sin(k * x);
    },
  },
  {
    name: 'random',
    label: 'Random noise',
    usesMode: false,
    build: ({ seed }) => {
      const cells = 20;
      const rng = makePrng(seed);
      const vals = new Float64Array(cells);
      for (let i = 0; i < cells; i++) vals[i] = rng() * 2 - 1;
      return (x) => {
        const idx = Math.min(cells - 1, Math.floor(x * cells));
        return vals[idx];
      };
    },
  },
];
