// The template engine lives in @portal/trainer-sdk/templates; this module binds it to biology's
// own task verifier and collects the biology templates.
import {
  renderTemplate as renderTemplateWith,
  renderTemplates as renderTemplatesWith,
  type RenderOptions,
  type RenderOutcome,
  type RenderStats,
  type RenderedTask,
} from "@portal/trainer-sdk/templates";
import type { BioLang } from "../../lang.ts";
import { verifyTask } from "../verifyTask.ts";
import type { BioTemplate } from "./tableTemplate.ts";
import { lo3HormonesTemplates } from "./topics/lo3Hormones.ts";
import { lo3CirculationTemplates } from "./topics/lo3Circulation.ts";
import { lo3RespirationTemplates } from "./topics/lo3Respiration.ts";
import { lo3UrinaryTemplates } from "./topics/lo3Urinary.ts";

export * from "@portal/trainer-sdk/templates";
export * from "./tableTemplate.ts";
export * from "./choices.ts";

/** Options minus `verify` — biology always verifies with its own checker. */
export type BioRenderOptions = Omit<RenderOptions<BioLang>, "verify">;

export function renderTemplate(template: BioTemplate, opts: BioRenderOptions): RenderOutcome<BioLang> {
  return renderTemplateWith(template, { ...opts, verify: verifyTask });
}

export function renderTemplates(
  templates: BioTemplate[],
  opts: BioRenderOptions,
): { tasks: RenderedTask<BioLang>[]; perTemplate: RenderStats[] } {
  return renderTemplatesWith(templates, { ...opts, verify: verifyTask });
}

export const ALL_TEMPLATES: BioTemplate[] = [
  ...lo3HormonesTemplates,
  ...lo3RespirationTemplates,
  ...lo3CirculationTemplates,
  ...lo3UrinaryTemplates,
];
