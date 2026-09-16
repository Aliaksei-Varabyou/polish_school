import { createHash } from "node:crypto";
import type { Lang, Task } from "@portal/core";
import { verifyTask } from "../verifyTask.ts";
import { enumerateParams } from "./combinations.ts";
import type { Derived, ParamSpec, ParamsOf, TaskTemplate } from "./types.ts";

export interface RenderOptions {
  langs: readonly Lang[];
  /** how many distinct, verified substitutions to keep (tasks per language = this × langs.length) */
  targetCount: number;
  /** raw substitutions to try before giving up; default targetCount × 8 */
  attemptBudget?: number;
}

export interface RenderStats {
  templateId: string;
  /** distinct substitutions accepted (verified in every requested language) */
  accepted: number;
  /** substitutions tried but rejected: failed `constraint`, or verification failed in ≥1 language */
  rejected: number;
  rejectionReasons: string[];
}

export interface RenderedTask {
  lang: Lang;
  task: Task;
}

export interface RenderOutcome {
  tasks: RenderedTask[];
  stats: RenderStats;
}

const paramsHash = (params: Record<string, unknown>): string =>
  createHash("sha1")
    .update(JSON.stringify(params, Object.keys(params).sort()))
    .digest("hex")
    .slice(0, 10);

function buildRaw<P extends Record<string, ParamSpec>>(template: TaskTemplate<P>, p: ParamsOf<P>, d: Derived, lang: Lang) {
  const isChoice = template.answerType === "choice";
  const choices = isChoice ? template.choices?.(p, d, lang) : undefined;
  const correctChoice = isChoice ? template.correctChoiceLabel?.(p, d) : undefined;
  return {
    topicId: template.topicId,
    subtopic: template.subtopic[lang],
    difficulty: template.difficulty,
    question: template.question(p, d, lang),
    answerType: template.answerType,
    correctAnswer: isChoice ? (correctChoice ?? "") : template.correctAnswer(p, d),
    verifyExpression: template.verifyExpression?.(p, d),
    choices,
    correctChoice,
    hint: template.hint?.[lang]?.(p, d),
    solution: template.solution[lang](p, d),
  };
}

/**
 * Renders one template into concrete, verified tasks: enumerates (or samples) substitutions, applies
 * `constraint`, then builds and verifies a task in every requested language via the same `verifyTask`
 * used for LLM output (re-checks the math, not just the shape). A substitution is only kept if it
 * verifies in *every* language — keeps per-language coverage symmetric instead of silently lopsided.
 */
export function renderTemplate<P extends Record<string, ParamSpec>>(template: TaskTemplate<P>, opts: RenderOptions): RenderOutcome {
  const attemptBudget = opts.attemptBudget ?? opts.targetCount * 8;
  const answerMode = template.answerType === "choice" ? "choice" : "input";
  const tasks: RenderedTask[] = [];
  let accepted = 0;
  let rejected = 0;
  const rejectionReasons: string[] = [];

  for (const p of enumerateParams(template.params, attemptBudget)) {
    if (accepted >= opts.targetCount) break;
    if (template.constraint && !template.constraint(p)) {
      rejected++;
      continue;
    }
    const derived = template.derive?.(p) ?? {};
    const hash = paramsHash(p as Record<string, unknown>);

    const perLang: RenderedTask[] = [];
    let failReason: string | null = null;
    for (const lang of opts.langs) {
      const raw = buildRaw(template, p, derived, lang);
      const id = `${template.id}:${lang}:${hash}`;
      const result = verifyTask(raw, { allowedTopicIds: [template.topicId], answerMode, id });
      if (!result.ok) {
        failReason = `[${lang}] ${result.reason}`;
        break;
      }
      perLang.push({ lang, task: result.task });
    }

    if (failReason) {
      rejected++;
      if (rejectionReasons.length < 20) rejectionReasons.push(failReason);
      continue;
    }
    tasks.push(...perLang);
    accepted++;
  }

  return { tasks, stats: { templateId: template.id, accepted, rejected, rejectionReasons } };
}

/** Renders many templates at once; each keeps its own stats (per-template breakdown, e.g. for a report). */
export function renderTemplates(templates: TaskTemplate<any>[], opts: RenderOptions): { tasks: RenderedTask[]; perTemplate: RenderStats[] } {
  const tasks: RenderedTask[] = [];
  const perTemplate: RenderStats[] = [];
  for (const t of templates) {
    const out = renderTemplate(t, opts);
    tasks.push(...out.tasks);
    perTemplate.push(out.stats);
  }
  return { tasks, perTemplate };
}

export { paramsHash };
