import type { Lang } from "@matema/shared";
import type { TaskBatchInput } from "../llm/provider.ts";

export const LANG_NAMES: Record<Lang, string> = { ru: "Russian", en: "English", pl: "Polish" };

const GRADE_NAMES: Record<string, string> = {
  sp5: "szkoła podstawowa, klasa 5 (age ~11)",
  sp6: "szkoła podstawowa, klasa 6 (age ~12)",
  sp7: "szkoła podstawowa, klasa 7 (age ~13)",
  sp8: "szkoła podstawowa, klasa 8 (age ~14, egzamin ósmoklasisty year)",
  lo1: "liceum ogólnokształcące, klasa 1 (age ~15)",
  lo2: "liceum ogólnokształcące, klasa 2 (age ~16)",
  lo3: "liceum ogólnokształcące, klasa 3 (age ~17)",
  lo4: "liceum ogólnokształcące, klasa 4 (age ~18, matura year)",
};

const DIFFICULTY_NAMES = { 1: "easy", 2: "medium", 3: "hard" } as const;

export const TASKS_SYSTEM_PROMPT = `You are an experienced Polish mathematics teacher who writes practice tasks
for school tests (sprawdziany, kartkówki) strictly following the Polish core curriculum (podstawa programowa).
You are precise: every answer you give is double-checked. You output only JSON matching the schema.`;

export function buildTasksPrompt(input: TaskBatchInput): string {
  const { lang, grade, level, slots } = input;
  const langName = LANG_NAMES[lang];
  const levelText = level ? `, poziom ${level === "R" ? "rozszerzony (extended)" : "podstawowy (basic)"}` : "";
  const cke = grade === "sp8" || grade.startsWith("lo");
  const topics = [...new Map(slots.map((s) => [s.topic.id, s.topic])).values()];

  const topicLines = topics
    .map((t) => `- topicId "${t.id}": "${t.name.pl}". Subtopics (vary them): ${t.subtopics.map((s) => `"${s}"`).join(", ")}.`)
    .join("\n");

  const taskLines = slots
    .map(
      (s, i) =>
        `${i + 1}. topicId "${s.topic.id}", difficulty ${s.difficulty} (${DIFFICULTY_NAMES[s.difficulty]}), ` +
        (s.kind === "choice" ? `answerType "choice"` : `open answer: answerType "number" (preferred) or "expression"`),
    )
    .join("\n");

  return `Create exactly ${slots.length} math tasks, in this order:
${taskLines}

Student: ${GRADE_NAMES[grade]}${levelText}.
Topics (Polish curriculum):
${topicLines}
Difficulty 3 is hard but still within the curriculum for this grade.
${cke ? "Style: similar to CKE exam tasks (egzamin ósmoklasisty / matura)." : "Style: typical school test (sprawdzian) tasks."}

LANGUAGE: write question, choices text, misconception, hint, solution and subtopic ONLY in ${langName}.
${lang === "en" ? "Use a decimal point in text." : "Use a decimal comma in text (e.g. 2,5) and the terminology used in schools."}

RULES:
- topicId: copy it from the task list above.
- Tasks must be solvable without a picture. Describe any figure fully in words. No proofs, no "show that" tasks.
- Each task has one unambiguous answer. Tasks must differ from each other.
- question: plain text; math in inline LaTeX between single dollar signs, e.g. "Oblicz $\\frac{3}{4} + \\frac{1}{2}$".
- subtopic: short name of the subtopic in ${langName}.
- answerType "number": the answer is a number. correctAnswer uses mathjs syntax with a DOT decimal separator and
  no units or words: "18", "-2.5", "3/4", "2*sqrt(3)", "5*pi". Several values (e.g. roots) are separated by "; ".
- answerType "expression": the answer is an algebraic expression in mathjs syntax, e.g. "2*x+6", "(a-b)^2".
- If an open task's answer would be an interval, a set, a sentence or otherwise not a number/expression,
  change the task so that the answer is a number.
- verifyExpression: REQUIRED for "number" tasks and for "choice" tasks with a numeric answer. A mathjs expression that
  computes the answer directly from the data in the question (not copied from correctAnswer), e.g. "1200*0.15",
  "(-1+sqrt(25))/2; (-1-sqrt(25))/2", "sqrt(6^2+8^2)". Degrees in trigonometry: "sin(30 deg)".
- answerType "choice": exactly 4 choices labelled A, B, C, D with exactly one correct (correctChoice). The three wrong
  options must result from typical student mistakes; describe each mistake in "misconception" (in ${langName}).
  Omit misconception for the correct option. correctAnswer = text of the correct option. Randomize the correct label.
- hint: one sentence that helps start without revealing the answer.
- solution: short step-by-step solution (2–5 steps) ending with the answer.`;
}

export function tasksJsonSchema(topicIds: string[]) {
  return {
    type: "object",
    properties: {
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            topicId: { type: "string", enum: topicIds },
            subtopic: { type: "string" },
            difficulty: { type: "integer", minimum: 1, maximum: 3 },
            question: { type: "string" },
            answerType: { type: "string", enum: ["number", "expression", "choice"] },
            correctAnswer: { type: "string" },
            verifyExpression: { type: "string" },
            choices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string", enum: ["A", "B", "C", "D"] },
                  text: { type: "string" },
                  misconception: { type: "string" },
                },
                required: ["label", "text"],
              },
            },
            correctChoice: { type: "string", enum: ["A", "B", "C", "D"] },
            hint: { type: "string" },
            solution: { type: "string" },
          },
          required: ["topicId", "subtopic", "difficulty", "question", "answerType", "correctAnswer", "hint", "solution"],
        },
      },
    },
    required: ["tasks"],
  };
}
