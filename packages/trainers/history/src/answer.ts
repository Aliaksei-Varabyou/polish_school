// Answer checking for history: names, terms and years.
// Deliberately not shared with the math trainer, whose checker is entirely mathjs/LaTeX shaped.
import type { AnswerType, Task } from "@portal/core";

/** Letters that Unicode does not decompose into base + combining mark, so NFD alone misses them. */
const UNDECOMPOSABLE: Record<string, string> = { ł: "l", đ: "d", ø: "o", ß: "ss" };

/**
 * Folds a typed term to the form we compare on: case, Polish/Russian diacritics, surrounding
 * punctuation and article noise all stop mattering — "Nefron.", "nefron" and "NEFRON" are one answer.
 *
 * What it deliberately does NOT do is tolerate typos. Names come in minimal pairs (Zygmunt I /
 * Zygmunt II, Jan Kazimierz / Jan III), so a fuzzy match would mark real confusions correct.
 * Inflections belong in the task's `acceptedAnswers` instead, where the author decides.
 */
export function normalizeTerm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[łđøß]/g, (c) => UNDECOMPOSABLE[c])
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/^[„“"'«»(\[]+|[„“"'«»)\].,;:!?]+$/g, "")
    .replace(/^(the|a|an)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the typed term matches the canonical answer or any accepted spelling/inflection. */
export function isTermCorrect(userAnswer: string, correctAnswer: string, acceptedAnswers?: readonly string[]): boolean {
  const typed = normalizeTerm(userAnswer);
  if (!typed) return false;
  return [correctAnswer, ...(acceptedAnswers ?? [])].some((a) => normalizeTerm(a) === typed);
}

/**
 * Parses a year or a count: a trailing "r." / "г." or a leading "w" are fine, so "1569 r.", "w 1569"
 * and "1569" are the same number.
 */
export function parseQuantity(s: string): number | null {
  const cleaned = s
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/^[^\d+-]*/, "")
    .match(/^[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?/);
  if (!cleaned) return null;
  const n = Number(cleaned[0]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Exact: a history number is a year or a count of years, and 1570 is simply not 1569. (Biology
 * allows 1% here for rounded constants; a date tolerates nothing.)
 */
export function isNumberCorrect(userAnswer: string, correctAnswer: string): boolean {
  const user = parseQuantity(userAnswer);
  const correct = parseQuantity(correctAnswer);
  if (user === null || correct === null) return false;
  return Math.abs(user - correct) < 1e-9;
}

/** Dispatches on the task's answer type; used by both the browser and the API. */
export function checkAnswer(task: Task, answer: string): boolean {
  switch (task.answerType as AnswerType) {
    case "choice":
      return answer.trim().toUpperCase() === (task.correctChoice ?? task.correctAnswer).toUpperCase();
    case "text":
      return isTermCorrect(answer, task.correctAnswer, task.acceptedAnswers);
    default:
      return isNumberCorrect(answer, task.correctAnswer);
  }
}
