import type { Task } from "@portal/core";

/** Correct answer as shown to the student. */
export function correctAnswerText(task: Task): string {
  if (task.answerType === "choice") {
    const c = task.choices?.find((ch) => ch.label === task.correctChoice);
    return c ? `${c.label}) ${c.text}` : task.correctAnswer;
  }
  return task.correctAnswer;
}

/**
 * Other spellings the answer would also have been accepted as. Worth showing: a student who wrote
 * "ADH" and got it right should see that "wazopresyna" is the name to remember.
 */
export function alsoAcceptedText(task: Task, max = 4): string | null {
  const list = task.acceptedAnswers?.slice(0, max) ?? [];
  return list.length > 0 ? list.join(", ") : null;
}
