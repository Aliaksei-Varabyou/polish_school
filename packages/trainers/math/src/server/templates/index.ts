// The template engine itself lives in @portal/trainer-sdk/templates (shared with other subjects).
// This module binds it to math's own task verifier and collects the math templates.
import type { Lang } from "@portal/core";
import {
  renderTemplate as renderTemplateWith,
  renderTemplates as renderTemplatesWith,
  type ParamSpec,
  type RenderOptions,
  type RenderOutcome,
  type RenderStats,
  type RenderedTask,
  type TaskTemplate,
} from "@portal/trainer-sdk/templates";
import { verifyTask } from "../verifyTask.ts";
import { lo2PolynomialsTemplates } from "./topics/lo2Polynomials.ts";
import { lo2QuadEqTemplates } from "./topics/lo2QuadEq.ts";
import { sp5DecimalsTemplates } from "./topics/sp5Decimals.ts";
import { sp5DivisibilityTemplates } from "./topics/sp5Divisibility.ts";
import { sp5NaturalTemplates } from "./topics/sp5Natural.ts";

export * from "@portal/trainer-sdk/templates";

/** Options minus `verify` — math always verifies with its own mathjs-backed checker. */
export type MathRenderOptions<L extends Lang = Lang> = Omit<RenderOptions<L>, "verify">;

export function renderTemplate<P extends Record<string, ParamSpec>, L extends Lang>(
  template: TaskTemplate<P, L>,
  opts: MathRenderOptions<L>,
): RenderOutcome<L> {
  return renderTemplateWith(template, { ...opts, verify: verifyTask });
}

export function renderTemplates<L extends Lang>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templates: TaskTemplate<any, L>[],
  opts: MathRenderOptions<L>,
): { tasks: RenderedTask<L>[]; perTemplate: RenderStats[] } {
  return renderTemplatesWith(templates, { ...opts, verify: verifyTask });
}

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
