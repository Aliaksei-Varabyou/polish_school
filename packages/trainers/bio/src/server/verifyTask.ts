import { randomUUID } from "node:crypto";
import { Task, type AnswerMode } from "@portal/core";
import { isTermCorrect, normalizeTerm, parseQuantity } from "../answer.ts";

export type VerifyResult = { ok: true; task: Task } | { ok: false; reason: string };

export interface VerifyContext {
  /** topics requested in the batch; the task's topicId must be one of them */
  allowedTopicIds: string[];
  answerMode: AnswerMode;
  /** deterministic id to use instead of a random one (offline template rendering) */
  id?: string;
}

/**
 * Validates a biology task's shape and re-checks its content: a rendered task goes through exactly
 * the same gate as anything an LLM would produce. Written separately from the math verifier rather
 * than shared, so the production math trainer's runtime is not touched at all; the two overlap in
 * the structural checks and diverge completely in the subject ones.
 */
export function verifyTask(raw: unknown, ctx: VerifyContext): VerifyResult {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "not an object" };

  const r = raw as Record<string, unknown>;
  for (const key of ["verifyExpression", "acceptedAnswers", "tags", "choices", "correctChoice", "hint"]) {
    if (r[key] === null || r[key] === "") delete r[key];
  }

  let topicId = typeof r.topicId === "string" ? r.topicId : undefined;
  if (!topicId && ctx.allowedTopicIds.length === 1) topicId = ctx.allowedTopicIds[0];
  if (!topicId || !ctx.allowedTopicIds.includes(topicId)) return { ok: false, reason: `unexpected topicId: ${topicId}` };

  const parsed = Task.safeParse({ ...r, id: ctx.id ?? randomUUID(), topicId });
  if (!parsed.success) return { ok: false, reason: `schema: ${parsed.error.issues[0]?.message}` };
  const task = parsed.data;

  if (ctx.answerMode === "choice" && task.answerType !== "choice") return { ok: false, reason: "expected choice task" };
  if (ctx.answerMode === "input" && task.answerType === "choice") return { ok: false, reason: "expected input task" };
  if (task.answerType === "expression") return { ok: false, reason: "biology has no algebraic answers" };

  if (task.answerType === "text") {
    if (normalizeTerm(task.correctAnswer) === "") return { ok: false, reason: "correctAnswer normalizes to nothing" };
    // a term that already collapses onto another accepted spelling is a copy-paste slip, not an alias
    const forms = [task.correctAnswer, ...(task.acceptedAnswers ?? [])].map(normalizeTerm);
    if (new Set(forms).size !== forms.length) return { ok: false, reason: "duplicate accepted answers" };
    // the canonical answer must be self-consistent: a student typing it back must be marked correct
    if (!isTermCorrect(task.correctAnswer, task.correctAnswer, task.acceptedAnswers)) {
      return { ok: false, reason: "correctAnswer does not match itself after normalization" };
    }
  }

  if (task.answerType === "number") {
    if (parseQuantity(task.correctAnswer) === null) return { ok: false, reason: "correctAnswer is not a number" };
  }

  if (task.answerType === "choice") {
    const choices = task.choices!;
    const labels = new Set(choices.map((c) => c.label));
    if (labels.size !== 4) return { ok: false, reason: "duplicate choice labels" };

    const texts = new Set(choices.map((c) => normalizeTerm(c.text)));
    if (texts.size !== 4) return { ok: false, reason: "duplicate choice texts" };

    const correct = choices.find((c) => c.label === task.correctChoice);
    if (!correct) return { ok: false, reason: "correctChoice is not one of the options" };

    task.correctAnswer = task.correctChoice!;
  }

  return { ok: true, task };
}
