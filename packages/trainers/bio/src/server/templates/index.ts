// The template engine lives in @portal/trainer-sdk/templates; this module binds it to biology's
// own task verifier and collects the biology templates.
import {
  renderTemplate as renderTemplateWith,
  type RenderOptions,
  type RenderOutcome,
  type RenderStats,
  type RenderedTask,
} from "@portal/trainer-sdk/templates";
import { createHash } from "node:crypto";
import type { Task } from "@portal/core";
import type { BioLang } from "../../lang.ts";
import { verifyTask } from "../verifyTask.ts";
import type { BioTemplate } from "./tableTemplate.ts";
import { lo3HomeostasisTemplates } from "./topics/lo3Homeostasis.ts";
import { lo3HormonesTemplates } from "./topics/lo3Hormones.ts";
import { lo3CirculationTemplates } from "./topics/lo3Circulation.ts";
import { lo3RemainingTemplates } from "./topics/lo3Remaining.ts";
import { lo3RespirationTemplates } from "./topics/lo3Respiration.ts";
import { lo3SkinTemplates } from "./topics/lo3Skin.ts";
import { lo3UrinaryTemplates } from "./topics/lo3Urinary.ts";

export * from "@portal/trainer-sdk/templates";
export * from "./tableTemplate.ts";
export * from "./choices.ts";

/** Options minus `verify` — biology always verifies with its own checker. */
export type BioRenderOptions = Omit<RenderOptions<BioLang>, "verify">;

/** JSON with object keys sorted at every level, so equal content always serializes the same. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
    return `{${entries
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * A biology task's id is a hash of its content, not of its template parameters. The pool is kept in
 * step with the templates by id (see server/seed.ts), so any change to a task — a corrected answer,
 * a reworded question, a row moved to another paragraph — gives it a new id: the old row is dropped
 * and the new one stored, where a parameter hash would have left the stale version in place forever.
 */
export function contentId(templateId: string, lang: BioLang, task: Task): string {
  const { id: _id, ...content } = task;
  return `${templateId}:${lang}:${createHash("sha1").update(canonical(content)).digest("hex").slice(0, 12)}`;
}

const withContentIds = (templateId: string, tasks: RenderedTask<BioLang>[]): RenderedTask<BioLang>[] =>
  tasks.map(({ lang, task }) => ({ lang, task: { ...task, id: contentId(templateId, lang, task) } }));

export function renderTemplate(template: BioTemplate, opts: BioRenderOptions): RenderOutcome<BioLang> {
  const outcome = renderTemplateWith(template, { ...opts, verify: verifyTask });
  return { ...outcome, tasks: withContentIds(template.id, outcome.tasks) };
}

export function renderTemplates(
  templates: BioTemplate[],
  opts: BioRenderOptions,
): { tasks: RenderedTask<BioLang>[]; perTemplate: RenderStats[] } {
  const tasks: RenderedTask<BioLang>[] = [];
  const perTemplate: RenderStats[] = [];
  for (const template of templates) {
    const outcome = renderTemplate(template, opts);
    tasks.push(...outcome.tasks);
    perTemplate.push(outcome.stats);
  }
  return { tasks, perTemplate };
}

export const ALL_TEMPLATES: BioTemplate[] = [
  ...lo3HormonesTemplates,
  ...lo3RespirationTemplates,
  ...lo3CirculationTemplates,
  ...lo3UrinaryTemplates,
  ...lo3RemainingTemplates,
  ...lo3HomeostasisTemplates,
  ...lo3SkinTemplates,
];
