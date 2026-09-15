import type { Task } from "@matema/shared";

/** Makes a machine answer ("2*sqrt(3); -2.5") readable ("2·√(3); -2,5"). */
export function prettyAnswer(answer: string, lang: string): string {
  let s = answer.replace(/sqrt/g, "√").replace(/\*/g, "·").replace(/pi/g, "π");
  if (lang !== "en") s = s.replace(/(\d)\.(\d)/g, "$1,$2");
  return s;
}

/** Correct answer as shown to the student. */
export function correctAnswerText(task: Task, lang: string): string {
  if (task.answerType === "choice") {
    const c = task.choices?.find((ch) => ch.label === task.correctChoice);
    return c ? `${c.label}) ${c.text}` : task.correctAnswer;
  }
  return prettyAnswer(task.correctAnswer, lang);
}
