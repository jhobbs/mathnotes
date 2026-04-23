// Diverging colormap for temperature u ∈ [-1, 1], centered on 0.
// Deep cold blue → neutral mid → deep hot red. The neutral midpoint
// swaps between white (light mode) and dark-gray (dark mode) so the
// canvas always has contrast against the page background.

import type p5 from 'p5';

interface Stop {
  r: number; g: number; b: number;
  at: number;
}

const COLD: Stop       = { r: 29,  g: 58,  b: 138, at: -1 };
const MID_LIGHT: Stop  = { r: 245, g: 245, b: 245, at: 0 };
const MID_DARK: Stop   = { r: 40,  g: 40,  b: 40,  at: 0 };
const HOT: Stop        = { r: 178, g: 24,  b: 43,  at: 1 };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function stopsFor(isDark: boolean): [Stop, Stop, Stop] {
  return [COLD, isDark ? MID_DARK : MID_LIGHT, HOT];
}

export function temperatureToColor(p: p5, u: number, isDark: boolean): p5.Color {
  const clamped = Math.max(-1, Math.min(1, u));
  const stops = stopsFor(isDark);
  let a = stops[0], b = stops[1];
  if (clamped > 0) { a = stops[1]; b = stops[2]; }
  const t = (clamped - a.at) / (b.at - a.at);
  return p.color(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t));
}
