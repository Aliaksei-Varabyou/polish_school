import { createHash } from "node:crypto";
import type { Lang, Task } from "@portal/core";
import type { VerifyContext, VerifyResult } from "../index.ts";
import { enumerateParams } from "./combinations.ts";
import type { Derived, ParamSpec, ParamsOf, TaskTemplate } from "./types.ts";

/** Same contract as `TrainerServer.verifyTask` — the trainer's own verifier, injected by its shim. */
export type VerifyFn = (raw: unknown, ctx: VerifyContext) => VerifyResult;

export interface RenderOptions<L extends Lang = Lang> {
  langs: readonly L[];
  /** how many distinct, verified substitutions to keep (tasks per language = this × langs.length) */
  targetCount: number;
  /** raw substitutions to try before giving up; default targetCount × 8 */
  attemptBudget?: number;
  /**
   * The trainer's task verifier. Rendered tasks go through exactly the same check as LLM output,
   * which is what makes offline content trustworthy — so the engine takes it rather than picking one.
   */
  verify: VerifyFn;
}

export interface RenderStats {
  templateId: string;
  /** distinct substitutions accepted (verified in every requested language) */
  accepted: number;
  /** substitutions tried but rejected: failed `constraint`, or verification failed in ≥1 language */
  rejected: number;
  rejectionReasons: string[];
}

export interface RenderedTask<L extends Lang = Lang> {
  lang: L;
  task: Task;
}

export interface RenderOutcome<L extends Lang = Lang> {
  tasks: RenderedTask<L>[];
  stats: RenderStats;
}

const paramsHash = (params: Record<string, unknown>): string =>
  createHash("sha1")
    .update(JSON.stringify(params, Object.keys(params).sort()))
    .digest("hex")
    .slice(0, 10);

function buildRaw<P extends Record<string, ParamSpec>, L extends Lang>(template: TaskTemplate<P, L>, p: ParamsOf<P>, d: Derived, lang: L) {
  const isChoice = template.answerType === "choice";
  const choices = isChoice ? template.choices?.(p, d, lang) : undefined;
  const correctChoice = isChoice ? template.correctChoiceLabel?.(p, d) : undefined;
  return {
    topicId: template.topicId,
    subtopic: template.subtopic[lang],
    difficulty: typeof template.difficulty === "function" ? template.difficulty(p, d) : template.difficulty,
    question: template.question(p, d, lang),
    answerType: template.answerType,
    correctAnswer: isChoice ? (correctChoice ?? "") : template.correctAnswer(p, d, lang),
    acceptedAnswers: template.acceptedAnswers?.(p, d, lang),
    tags: template.tags,
    verifyExpression: template.verifyExpression?.(p, d),
    choices,
    correctChoice,
    hint: template.hint?.[lang]?.(p, d),
    solution: template.solution[lang](p, d),
  };
}

/**
 * Renders one template into concrete, verified tasks: enumerates (or samples) substitutions, applies
 * `constraint`, then builds and verifies a task in every requested language via `opts.verify` — the
 * same check used for LLM output (re-checks the content, not just the shape). A substitution is only
 * kept if it verifies in *every* language — keeps per-language coverage symmetric instead of
 * silently lopsided.
 */
export function renderTemplate<P extends Record<string, ParamSpec>, L extends Lang>(
  template: TaskTemplate<P, L>,
  opts: RenderOptions<L>,
): RenderOutcome<L> {
  const attemptBudget = opts.attemptBudget ?? opts.targetCount * 8;
  const answerMode = template.answerType === "choice" ? "choice" : "input";
  const tasks: RenderedTask<L>[] = [];
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

    const perLang: RenderedTask<L>[] = [];
    let failReason: string | null = null;
    for (const lang of opts.langs) {
      const raw = buildRaw(template, p, derived, lang);
      const id = `${template.id}:${lang}:${hash}`;
      const result = opts.verify(raw, { allowedTopicIds: [template.topicId], answerMode, id });
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
export function renderTemplates<L extends Lang>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templates: TaskTemplate<any, L>[],
  opts: RenderOptions<L>,
): { tasks: RenderedTask<L>[]; perTemplate: RenderStats[] } {
  const tasks: RenderedTask<L>[] = [];
  const perTemplate: RenderStats[] = [];
  for (const t of templates) {
    const out = renderTemplate(t, opts);
    tasks.push(...out.tasks);
    perTemplate.push(out.stats);
  }
  return { tasks, perTemplate };
}

export { paramsHash };
