import type { FeedbackRequest } from "@portal/core";
import { getTopic } from "../../curriculum/index.ts";
import { LANG_NAMES } from "./generateTasks.ts";

export const FEEDBACK_SYSTEM_PROMPT = `You are a kind but honest Polish mathematics tutor. You analyse a student's practice test
results and explain what to work on. You output only JSON matching the schema.`;

export function buildFeedbackPrompt(input: FeedbackRequest): string {
  const { lang, grade, level, results } = input;
  const stats = new Map<string, { ok: number; total: number; hints: number }>();
  for (const r of results) {
    const s = stats.get(r.topicId) ?? { ok: 0, total: 0, hints: 0 };
    s.total++;
    if (r.correct) s.ok++;
    if (r.usedHint) s.hints++;
    stats.set(r.topicId, s);
  }

  const topicLines = [...stats]
    .map(([id, s]) => `- ${id} ("${getTopic(id)?.name[lang] ?? id}"): ${s.ok}/${s.total} correct, hints used: ${s.hints}`)
    .join("\n");

  const mistakes = results
    .filter((r) => !r.correct)
    .map(
      (r, i) =>
        `${i + 1}. [${r.topicId} / ${r.subtopic} / difficulty ${r.difficulty}] ${r.question}\n` +
        `   student answer: "${r.userAnswer || "(no answer)"}", correct: "${r.correctAnswer}"` +
        (r.misconception ? `, chosen option's typical mistake: ${r.misconception}` : ""),
    )
    .join("\n");

  return `Student: grade ${grade}${level ? `, level ${level}` : ""} (Polish school system).

Results by topic:
${topicLines}

Mistakes:
${mistakes || "(none)"}

Write in ${LANG_NAMES[lang]} only, addressing the student directly ("you"), 2nd person, encouraging tone.
- summary: 2–4 sentences: overall result, strengths, the main problem.
- weakTopics: topics that need work (topicId from the list above) with a concrete reason based on the mistakes
  (what kind of error, e.g. sign errors, order of operations), not just the score. Empty if everything is fine.
- recommendations: 3–5 concrete, actionable tips (what to revise, which rules/formulas, what kind of exercises).
- suggestedTopicIds: topicIds (only from the list above) worth practising next, weakest first.`;
}

export const FEEDBACK_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    weakTopics: {
      type: "array",
      items: {
        type: "object",
        properties: { topicId: { type: "string" }, reason: { type: "string" } },
        required: ["topicId", "reason"],
      },
    },
    recommendations: { type: "array", items: { type: "string" } },
    suggestedTopicIds: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "weakTopics", "recommendations", "suggestedTopicIds"],
} as const;
