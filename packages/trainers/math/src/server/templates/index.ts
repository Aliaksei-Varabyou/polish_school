export * from "./types.ts";
export * from "./text.ts";
export * from "./combinations.ts";
export * from "./render.ts";

import type { TaskTemplate } from "./types.ts";
import { lo2PolynomialsTemplates } from "./topics/lo2Polynomials.ts";
import { lo2QuadEqTemplates } from "./topics/lo2QuadEq.ts";
import { sp5DecimalsTemplates } from "./topics/sp5Decimals.ts";
import { sp5DivisibilityTemplates } from "./topics/sp5Divisibility.ts";
import { sp5NaturalTemplates } from "./topics/sp5Natural.ts";

/**
 * All pilot templates (SP5 + LO2-P), see docs/template-feasibility-sp5-lo2.md for the topic list.
 * Widened to `TaskTemplate<any>`: each template has its own distinct `params` shape, and code that
 * iterates this list (the render script, tests) doesn't need per-template param types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALL_TEMPLATES: TaskTemplate<any>[] = [
  ...sp5NaturalTemplates,
  ...sp5DivisibilityTemplates,
  ...sp5DecimalsTemplates,
  ...lo2QuadEqTemplates,
  ...lo2PolynomialsTemplates,
];
