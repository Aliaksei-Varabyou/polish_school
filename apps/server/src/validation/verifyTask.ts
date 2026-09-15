import { randomUUID } from "node:crypto";
import {
  evaluateNumber,
  isAnswerCorrect,
  normalizeAnswer,
  Task,
  type AnswerMode,
} from "@matema/shared";

export type VerifyResult = { ok: true; task: Task } | { ok: false; reason: string };

export interface VerifyContext {
  /** topics requested in the batch; the task's topicId must be one of them */
  allowedTopicIds: string[];
  answerMode: AnswerMode;
}

const numericParts = (s: string) => s.split(";").map((p) => evaluateNumber(normalizeAnswer(p)));
const isNumeric = (s: string) => numericParts(s).every((n) => n !== null);

function sameValue(a: string, b: string): boolean {
  if (isNumeric(a) && isNumeric(b)) return isAnswerCorrect(a, b, "number");
  return normalizeAnswer(a) === normalizeAnswer(b);
}

/**
 * Validates the shape of an LLM-generated task and re-checks its math:
 * verifyExpression (computed independently by mathjs) must match correctAnswer,
 * and for choice tasks exactly one option must equal the correct answer.
 */
export function verifyTask(raw: unknown, ctx: VerifyContext): VerifyResult {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "not an object" };

  const r = raw as Record<string, unknown>;
  // LLMs sometimes send null for optional fields
  for (const key of ["verifyExpression", "choices", "correctChoice", "hint"]) {
    if (r[key] === null || r[key] === "") delete r[key];
  }

  let topicId = typeof r.topicId === "string" ? r.topicId : undefined;
  if (!topicId && ctx.allowedTopicIds.length === 1) topicId = ctx.allowedTopicIds[0];
  if (!topicId || !ctx.allowedTopicIds.includes(topicId)) return { ok: false, reason: `unexpected topicId: ${topicId}` };

  const parsed = Task.safeParse({ ...r, id: randomUUID(), topicId });
  if (!parsed.success) return { ok: false, reason: `schema: ${parsed.error.issues[0]?.message}` };
  const task = parsed.data;

  if (ctx.answerMode === "choice" && task.answerType !== "choice") return { ok: false, reason: "expected choice task" };
  if (ctx.answerMode === "input" && task.answerType === "choice") return { ok: false, reason: "expected input task" };

  if (task.answerType === "number") {
    if (!isNumeric(task.correctAnswer)) return { ok: false, reason: "correctAnswer is not numeric" };
    if (!task.verifyExpression) return { ok: false, reason: "missing verifyExpression" };
    if (!isAnswerCorrect(task.verifyExpression, task.correctAnswer, "number")) {
      return { ok: false, reason: `verifyExpression (${task.verifyExpression}) != correctAnswer (${task.correctAnswer})` };
    }
  }

  if (task.answerType === "expression") {
    if (!isAnswerCorrect(task.correctAnswer, task.correctAnswer, "expression")) {
      return { ok: false, reason: "correctAnswer is not a valid expression" };
    }
    if (task.verifyExpression && !isAnswerCorrect(task.verifyExpression, task.correctAnswer, "expression")) {
      return { ok: false, reason: "verifyExpression != correctAnswer" };
    }
  }

  if (task.answerType === "choice") {
    const choices = task.choices!;
    const labels = new Set(choices.map((c) => c.label));
    if (labels.size !== 4) return { ok: false, reason: "duplicate choice labels" };

    const texts = new Set(choices.map((c) => normalizeAnswer(c.text)));
    if (texts.size !== 4) return { ok: false, reason: "duplicate choice texts" };

    const correct = choices.find((c) => c.label === task.correctChoice)!;
    if (task.verifyExpression && isNumeric(correct.text) && !isAnswerCorrect(task.verifyExpression, correct.text, "number")) {
      return { ok: false, reason: `verifyExpression (${task.verifyExpression}) != correct choice (${correct.text})` };
    }
    const alsoCorrect = choices.filter((c) => c.label !== task.correctChoice && sameValue(c.text, correct.text));
    if (alsoCorrect.length > 0) return { ok: false, reason: "more than one correct choice" };

    task.correctAnswer = task.correctChoice!;
  }

  return { ok: true, task };
}
