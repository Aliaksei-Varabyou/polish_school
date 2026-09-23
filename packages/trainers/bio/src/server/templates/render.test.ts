// The highest-value test in the package: it renders every template in both languages, so one run
// catches missing translations, colliding distractors, broken table lookups and empty questions.
import { describe, expect, it } from "vitest";
import { checkAnswer } from "../../answer.ts";
import { TOPICS, getTopic } from "../../curriculum/index.ts";
import { BIO_LANGS } from "../../lang.ts";
import { ALL_TEMPLATES, renderTemplate } from "./index.ts";

const LANGS = [...BIO_LANGS];
/** big enough to walk every row of the largest table */
const TARGET = 60;

describe("biology templates", () => {
  it("has no duplicate template ids", () => {
    const ids = ALL_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only references topics that exist in the curriculum", () => {
    for (const template of ALL_TEMPLATES) {
      expect(getTopic(template.topicId), `${template.id} -> ${template.topicId}`).toBeDefined();
    }
  });

  it("renders every template in pl and ru with nothing rejected", () => {
    for (const template of ALL_TEMPLATES) {
      const { stats } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      expect(stats.rejected, `${template.id}: ${stats.rejectionReasons.join(" | ")}`).toBe(0);
      expect(stats.accepted, `${template.id} produced nothing`).toBeGreaterThan(0);
    }
  });

  it("produces tasks whose own correct answer passes the answer checker", () => {
    for (const template of ALL_TEMPLATES) {
      const { tasks } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      for (const { task } of tasks) {
        // catches the classic mismatch where the client marks an answer right and history marks it wrong
        expect(checkAnswer(task, task.correctAnswer), `${task.id}: ${task.correctAnswer}`).toBe(true);
      }
    }
  });

  it("writes real text in both languages — no leftovers from the other one", () => {
    const cyrillic = /[а-яё]/i;
    for (const template of ALL_TEMPLATES) {
      const { tasks } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      for (const { lang, task } of tasks) {
        expect(task.question.length, `${task.id} question`).toBeGreaterThan(10);
        expect(task.solution.length, `${task.id} solution`).toBeGreaterThan(10);
        expect(task.subtopic.length, `${task.id} subtopic`).toBeGreaterThan(0);
        if (lang === "ru") expect(cyrillic.test(task.question), `${task.id} is not Russian`).toBe(true);
        if (lang === "pl") expect(cyrillic.test(task.question), `${task.id} leaked Russian`).toBe(false);
      }
    }
  });

  it("gives choice tasks four distinct options with exactly one correct", () => {
    for (const template of ALL_TEMPLATES.filter((t) => t.answerType === "choice")) {
      const { tasks } = renderTemplate(template, { langs: LANGS, targetCount: TARGET, attemptBudget: 500 });
      for (const { task } of tasks) {
        expect(task.choices, task.id).toHaveLength(4);
        expect(new Set(task.choices!.map((c) => c.text)).size, `${task.id} duplicate options`).toBe(4);
        expect(task.choices!.some((c) => c.label === task.correctChoice), task.id).toBe(true);
      }
    }
  });

  it("spreads the correct option over all four labels rather than parking it on one", () => {
    const template = ALL_TEMPLATES.find((t) => t.id.endsWith("gland-to-hormone"))!;
    const { tasks } = renderTemplate(template, { langs: ["pl"], targetCount: TARGET, attemptBudget: 500 });
    expect(new Set(tasks.map((t) => t.task.correctChoice)).size).toBe(4);
  });

  it("covers the whole hormone table, not just its first rows", () => {
    const template = ALL_TEMPLATES.find((t) => t.id.endsWith("hormone-to-action"))!;
    const { tasks } = renderTemplate(template, { langs: ["pl"], targetCount: TARGET, attemptBudget: 500 });
    // "adrenalina" sits well past the point a four-way position parameter would have stopped at
    expect(tasks.some((t) => t.task.question.includes("adrenalina"))).toBe(true);
  });
});

describe("biology curriculum", () => {
  it("covers all 11 działy of LO3 rozszerzony, every one at level R", () => {
    expect(TOPICS).toHaveLength(11);
    for (const t of TOPICS) {
      expect(t.grade).toBe("lo3");
      expect(t.level).toBe("R");
      expect(t.subtopics.length).toBeGreaterThan(3);
    }
  });
});
