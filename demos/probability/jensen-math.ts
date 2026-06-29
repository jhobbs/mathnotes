// Pure math for the Jensen's inequality demo. No p5 / DOM dependencies.

export type Convexity = 'convex' | 'concave' | 'neither';

export interface Point {
  x: number;
  y: number;
}

/**
 * Classify f on [xMin, xMax] by the sign of its second finite difference.
 * Returns 'convex' if f'' >= 0 everywhere (within tolerance), 'concave' if
 * f'' <= 0 everywhere, otherwise 'neither'. Non-finite samples are skipped.
 */
export function classifyConvexity(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  samples = 200
): Convexity {
  const h = (xMax - xMin) / samples;
  if (!(h > 0)) return 'neither';
  // Scale tolerance to the function's vertical extent so flat-ish regions of
  // steep functions are not misclassified by floating-point noise.
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const y = f(xMin + i * h);
    if (Number.isFinite(y)) {
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }
  const scale = Number.isFinite(yMax - yMin) && yMax > yMin ? yMax - yMin : 1;
  const tol = 1e-9 * scale + 1e-12;

  let sawPositive = false;
  let sawNegative = false;
  for (let i = 1; i < samples; i++) {
    const x = xMin + i * h;
    const a = f(x - h);
    const b = f(x);
    const c = f(x + h);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    const second = a - 2 * b + c; // ~ f''(x) * h^2
    if (second > tol) sawPositive = true;
    else if (second < -tol) sawNegative = true;
  }
  if (sawPositive && sawNegative) return 'neither';
  if (sawPositive) return 'convex';
  if (sawNegative) return 'concave';
  return 'neither'; // affine / constant — Jensen holds with equality
}

/**
 * Normalize non-negative weights to sum to 1. Negative weights are clamped to 0.
 * If the total is ~0 (e.g. all sliders at 0), fall back to uniform weights.
 */
export function normalizeWeights(weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const clamped = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  const total = clamped.reduce((s, w) => s + w, 0);
  if (total <= 1e-12) return new Array(n).fill(1 / n);
  return clamped.map((w) => w / total);
}

/** Weighted sum Σ pᵢ vᵢ. Assumes ps is already normalized and same length as vs. */
export function expectation(vs: number[], ps: number[]): number {
  let acc = 0;
  for (let i = 0; i < vs.length; i++) acc += vs[i] * ps[i];
  return acc;
}

/**
 * Convex hull via monotone chain. Returns hull vertices in counter-clockwise
 * order. For 0/1/2 unique points (or all-collinear), returns the sorted unique
 * points (a degenerate hull the caller can still draw as a polyline).
 */
export function convexHull(points: Point[]): Point[] {
  const pts = points
    .slice()
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  // Dedup
  const uniq: Point[] = [];
  for (const p of pts) {
    const last = uniq[uniq.length - 1];
    if (!last || last.x !== p.x || last.y !== p.y) uniq.push(p);
  }
  if (uniq.length <= 2) return uniq;

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of uniq) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = uniq.length - 1; i >= 0; i--) {
    const p = uniq[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper); // CCW
}
