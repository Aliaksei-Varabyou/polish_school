// A Westie's coat is all tufts: every outline of Mors is an ellipse whose edge is broken into small
// bumps. Computed once at import, so the SVG gets plain path strings.

const r1 = (x: number) => Math.round(x * 10) / 10;

/**
 * A closed path running around an ellipse in `bumps` tufts that stick out by `depth`.
 * `from`/`to` (radians, clockwise from the right) draw only an arc of it — e.g. a fringe.
 * `flare` > 0 makes it wider at the bottom than at the top.
 * `square` > 2 turns the ellipse into a superellipse: 3 is a rounded box, 4 almost a rectangle —
 * the Westie's blunt, boxy muzzle and beard.
 */
export function fluff(cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number, from = 0, to = Math.PI * 2, square = 2, spikeEvery = 0, flare = 0): string {
  const closed = to - from >= Math.PI * 2 - 1e-6;
  const pow = (v: number) => Math.sign(v) * Math.abs(v) ** (2 / square);
  // `flare` widens the shape towards its bottom (a beard-heavy head) and narrows the top
  const at = (a: number, grow = 0) => [r1(cx + pow(Math.cos(a)) * (rx + grow) * (1 + flare * Math.sin(a))), r1(cy + pow(Math.sin(a)) * (ry + grow))] as const;
  const step = (to - from) / bumps;
  const [x0, y0] = at(from);
  let d = `M${x0} ${y0}`;
  for (let i = 0; i < bumps; i++) {
    const [x, y] = at(from + step * (i + 1));
    if (spikeEvery && i % spikeEvery === spikeEvery - 1) {
      // a sharp tuft sticking out between two rounded ones
      const [sx, sy] = at(from + step * (i + 0.55), depth * 3);
      d += ` L${sx} ${sy} L${x} ${y}`;
    } else {
      const [cxp, cyp] = at(from + step * (i + 0.5), depth * 2);
      d += ` Q${cxp} ${cyp} ${x} ${y}`;
    }
  }
  return closed ? `${d} Z` : d;
}

/**
 * The same outline cut into sharp, uneven tufts — the clipped-but-shaggy Westie coat. Tufts lean
 * downwards on the sides (hair hangs), stand up at the top and hang straight under the chin.
 * `pattern` sets the relative length of consecutive tufts, so the edge never looks machine-made.
 */
export function jagged(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tufts: number,
  depth: number,
  { from = 0, to = Math.PI * 2, square = 2, flare = 0, lean = 0.5, pattern = [1, 0.55, 0.85, 0.65, 1, 0.5, 0.8] }: { from?: number; to?: number; square?: number; flare?: number; lean?: number; pattern?: number[] } = {},
): string {
  const closed = to - from >= Math.PI * 2 - 1e-6;
  const pow = (v: number) => Math.sign(v) * Math.abs(v) ** (2 / square);
  const at = (a: number, grow = 0) => [r1(cx + pow(Math.cos(a)) * (rx + grow) * (1 + flare * Math.sin(a))), r1(cy + pow(Math.sin(a)) * (ry + grow))] as const;
  const step = (to - from) / tufts;
  const [x0, y0] = at(from);
  let d = `M${x0} ${y0}`;
  for (let i = 0; i < tufts; i++) {
    const base = from + step * i;
    const len = depth * pattern[i % pattern.length]!;
    // the tip swings towards the bottom of the shape by `lean` of a step, scaled by how far from
    // the vertical axis we are — straight up at the crown, straight down under the chin
    const tilt = Math.cos(base + step / 2) * step * lean;
    const [tx, ty] = at(base + step / 2 + tilt, len);
    const [x, y] = at(base + step);
    d += ` L${tx} ${ty} L${x} ${y}`;
  }
  return closed ? `${d} Z` : d;
}
