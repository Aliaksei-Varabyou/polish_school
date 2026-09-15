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

export const TASKS_SYSTEM_PROMPT = `You are an experienced Polish mathematics teacher who writes practice tasks
for school tests (sprawdziany, kartkówki) strictly following the Polish core curriculum (podstawa programowa).
You are precise: every answer you give is double-checked. You output only JSON matching the schema.`;

export function buildTasksPrompt(input: TaskBatchInput): string {
  const { lang, grade, level, topic, difficulties, answerMode } = input;
  const langName = LANG_NAMES[lang];
  const levelText = level ? `, poziom ${level === "R" ? "rozszerzony (extended)" : "podstawowy (basic)"}` : "";
  const cke = grade === "sp8" || grade.startsWith("lo");

  const modeRule = {
    input: `Every task must have answerType "number" (preferred) or "expression". Do not use "choice".`,
    choice: `Every task must have answerType "choice".`,
    mixed: `Alternate: odd tasks (1st, 3rd, ...) are open ("number" or "expression"), even tasks are "choice".`,
  }[answerMode];

  return `Create ${difficulties.length} math tasks.

Student: ${GRADE_NAMES[grade]}${levelText}.
Topic (Polish curriculum): "${topic.name.pl}".
Subtopics to cover (vary them): ${topic.subtopics.map((s) => `"${s}"`).join(", ")}.
Difficulty of each task in order (1 = easy, 2 = medium, 3 = hard, still within the curriculum): ${difficulties.join(", ")}.
${cke ? "Style: similar to CKE exam tasks (egzamin ósmoklasisty / matura)." : "Style: typical school test (sprawdzian) tasks."}

LANGUAGE: write question, choices text, misconception, hint, solution and subtopic ONLY in ${langName}.
${lang === "en" ? "Use a decimal point in text." : "Use a decimal comma in text (e.g. 2,5) and the terminology used in schools."}

RULES:
- ${modeRule}
- Tasks must be solvable without a picture. Describe any figure fully in words. No proofs, no "show that" tasks.
- Each task has one unambiguous answer. Tasks must differ from each other.
- question: plain text; math in inline LaTeX between single dollar signs, e.g. "Oblicz $\\frac{3}{4} + \\frac{1}{2}$".
- subtopic: short name of the subtopic in ${langName}.
- answerType "number": the answer is a number. correctAnswer uses mathjs syntax with a DOT decimal separator and
  no units or words: "18", "-2.5", "3/4", "2*sqrt(3)", "5*pi". Several values (e.g. roots) are separated by "; ".
- answerType "expression": the answer is an algebraic expression in mathjs syntax, e.g. "2*x+6", "(a-b)^2".
- If the answer is an interval, a set, a sentence or otherwise not a number/expression, use answerType "choice".
- verifyExpression: REQUIRED for "number" tasks and for "choice" tasks with a numeric answer. A mathjs expression that
  computes the answer directly from the data in the question (not copied from correctAnswer), e.g. "1200*0.15",
  "(-1+sqrt(25))/2; (-1-sqrt(25))/2", "sqrt(6^2+8^2)". Degrees in trigonometry: "sin(30 deg)".
- answerType "choice": exactly 4 choices labelled A, B, C, D with exactly one correct (correctChoice). The three wrong
  options must result from typical student mistakes; describe each mistake in "misconception" (in ${langName}).
  Omit misconception for the correct option. correctAnswer = text of the correct option. Randomize the correct label.
- hint: one sentence that helps start without revealing the answer.
- solution: short step-by-step solution (2–5 steps) ending with the answer.`;
}

export const TASKS_JSON_SCHEMA = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
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
        required: ["subtopic", "difficulty", "question", "answerType", "correctAnswer", "hint", "solution"],
      },
    },
  },
  required: ["tasks"],
} as const;
