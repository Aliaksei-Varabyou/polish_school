import type { Difficulty, FeedbackRequest, FeedbackResponse, Lang } from "@matema/shared";
import { getTopic } from "@matema/shared";
import type { LLMProvider, TaskBatchInput } from "./provider.ts";

const TEXT: Record<Lang, { calc: string; hint: string; order: string; left: string }> = {
  ru: { calc: "Вычисли", hint: "Сначала выполни умножение.", order: "Неверный порядок действий", left: "Действия слева направо без приоритета" },
  en: { calc: "Calculate", hint: "Do the multiplication first.", order: "Wrong order of operations", left: "Left to right without precedence" },
  pl: { calc: "Oblicz", hint: "Najpierw wykonaj mnożenie.", order: "Zła kolejność działań", left: "Działania od lewej bez kolejności" },
};

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeTask(lang: Lang, topicId: string, difficulty: Difficulty, asChoice: boolean) {
  const t = TEXT[lang];
  const scale = difficulty * 5;
  const a = rnd(2, scale + 5);
  const b = rnd(2, scale);
  const c = rnd(2, scale);
  const answer = a + b * c;
  const base = {
    topicId,
    subtopic: "kolejność wykonywania działań",
    difficulty,
    question: `${t.calc}: $${a} + ${b} \\cdot ${c}$`,
    verifyExpression: `${a} + ${b} * ${c}`,
    hint: t.hint,
    solution: `$${b} \\cdot ${c} = ${b * c}$, $${a} + ${b * c} = ${answer}$`,
  };
  if (!asChoice) return { ...base, answerType: "number", correctAnswer: String(answer) };

  // typical mistakes first, then simple offsets; always 3 distinct wrong values
  const candidates = [(a + b) * c, a + b + c, a * b + c, answer + 1, answer - 1, answer + 10, answer - 10];
  const wrong = [...new Set(candidates.filter((v) => v !== answer))].slice(0, 3);
  const options = [
    { text: String(answer) },
    { text: String(wrong[0]), misconception: t.order },
    { text: String(wrong[1]), misconception: t.left },
    { text: String(wrong[2]), misconception: t.left },
  ].sort(() => Math.random() - 0.5);
  const labels = ["A", "B", "C", "D"] as const;
  const choices = options.map((o, i) => ({ label: labels[i], ...o }));
  return {
    ...base,
    answerType: "choice",
    correctAnswer: String(answer),
    choices,
    correctChoice: choices.find((ch) => ch.text === String(answer))!.label,
  };
}

/** Offline provider for development and tests: arithmetic tasks, no API key needed. */
export class MockProvider implements LLMProvider {
  readonly name = "mock";
  calls = 0;

  async generateTasks(input: TaskBatchInput): Promise<unknown[]> {
    this.calls++;
    return input.slots.map((s) => makeTask(input.lang, s.topic.id, s.difficulty, s.kind === "choice"));
  }

  async generateFeedback(input: FeedbackRequest): Promise<FeedbackResponse> {
    this.calls++;
    const stats = new Map<string, { ok: number; total: number }>();
    for (const r of input.results) {
      const s = stats.get(r.topicId) ?? { ok: 0, total: 0 };
      s.total++;
      if (r.correct) s.ok++;
      stats.set(r.topicId, s);
    }
    const weak = [...stats].filter(([, s]) => s.ok / s.total < 0.7);
    const correct = input.results.filter((r) => r.correct).length;
    const name = (id: string) => getTopic(id)?.name[input.lang] ?? id;
    return {
      summary: `[mock] ${correct}/${input.results.length}`,
      weakTopics: weak.map(([id, s]) => ({ topicId: id, reason: `${name(id)}: ${s.ok}/${s.total}` })),
      recommendations: weak.map(([id]) => `[mock] ${name(id)}`),
      suggestedTopicIds: weak.map(([id]) => id),
    };
  }
}
