// The template engine lives in @portal/trainer-sdk/templates; this module binds it to history's
// own task verifier and collects the history templates, one file per chapter of the book.
import {
  renderTemplate as renderTemplateWith,
  type RenderOptions,
  type RenderOutcome,
  type RenderStats,
  type RenderedTask,
} from "@portal/trainer-sdk/templates";
import { createHash } from "node:crypto";
import type { Task } from "@portal/core";
import type { HistLang } from "../../lang.ts";
import { verifyTask } from "../verifyTask.ts";
import type { HistTemplate } from "./tableTemplate.ts";
import { ch1Templates } from "./topics/ch1.ts";
import { ch2Templates } from "./topics/ch2.ts";
import { ch3Templates } from "./topics/ch3.ts";
import { ch4Templates } from "./topics/ch4.ts";
import { ch5Templates } from "./topics/ch5.ts";
import { ch6Templates } from "./topics/ch6.ts";

export * from "@portal/trainer-sdk/templates";
export * from "./tableTemplate.ts";
export * from "./choices.ts";

/** Options minus `verify` — history always verifies with its own checker. */
export type HistRenderOptions = Omit<RenderOptions<HistLang>, "verify">;

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
 * A history task's id is a hash of its content, not of its template parameters. The pool is kept in
 * step with the templates by id (see server/seed.ts), so any change to a task — a corrected answer,
 * a reworded question, a row moved to another paragraph — gives it a new id: the old row is dropped
 * and the new one stored, where a parameter hash would have left the stale version in place forever.
 */
export function contentId(templateId: string, lang: HistLang, task: Task): string {
  const { id: _id, ...content } = task;
  return `${templateId}:${lang}:${createHash("sha1").update(canonical(content)).digest("hex").slice(0, 12)}`;
}

const withContentIds = (templateId: string, tasks: RenderedTask<HistLang>[]): RenderedTask<HistLang>[] =>
  tasks.map(({ lang, task }) => ({ lang, task: { ...task, id: contentId(templateId, lang, task) } }));

export function renderTemplate(template: HistTemplate, opts: HistRenderOptions): RenderOutcome<HistLang> {
  const outcome = renderTemplateWith(template, { ...opts, verify: verifyTask });
  return { ...outcome, tasks: withContentIds(template.id, outcome.tasks) };
}

export function renderTemplates(
  templates: HistTemplate[],
  opts: HistRenderOptions,
): { tasks: RenderedTask<HistLang>[]; perTemplate: RenderStats[] } {
  const tasks: RenderedTask<HistLang>[] = [];
  const perTemplate: RenderStats[] = [];
  for (const template of templates) {
    const outcome = renderTemplate(template, opts);
    tasks.push(...outcome.tasks);
    perTemplate.push(outcome.stats);
  }
  return { tasks, perTemplate };
}

export const ALL_TEMPLATES: HistTemplate[] = [
  ...ch1Templates,
  ...ch2Templates,
  ...ch3Templates,
  ...ch4Templates,
  ...ch5Templates,
  ...ch6Templates,
];
