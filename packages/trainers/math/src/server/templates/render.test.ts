import { describe, expect, it } from "vitest";
import { plural } from "./text.ts";
import { enumerateParams } from "./combinations.ts";
import { renderTemplate, renderTemplates } from "./render.ts";
import { choiceParam, defineTemplate, intRange } from "./types.ts";
import { ALL_TEMPLATES } from "./index.ts";

describe("plural", () => {
  it("selects the CLDR category for ru and pl (declension by count)", () => {
    expect(plural("ru", 1, { one: "ученик", few: "ученика", many: "учеников", other: "ученика" })).toBe("ученик");
    expect(plural("ru", 2, { one: "ученик", few: "ученика", many: "учеников", other: "ученика" })).toBe("ученика");
    expect(plural("ru", 5, { one: "ученик", few: "ученика", many: "учеников", other: "ученика" })).toBe("учеников");
    expect(plural("pl", 1, { one: "zeszyt", few: "zeszyty", many: "zeszytów", other: "zeszytu" })).toBe("zeszyt");
    expect(plural("pl", 3, { one: "zeszyt", few: "zeszyty", many: "zeszytów", other: "zeszytu" })).toBe("zeszyty");
    expect(plural("pl", 5, { one: "zeszyt", few: "zeszyty", many: "zeszytów", other: "zeszytu" })).toBe("zeszytów");
  });

  it("falls back to `other` when a category has no explicit form", () => {
    expect(plural("en", 5, { other: "items" })).toBe("items");
  });
});

describe("enumerateParams", () => {
  it("yields exactly one empty combination for a template with no params", () => {
    expect([...enumerateParams({}, 10)]).toEqual([{}]);
  });

  it("enumerates the full cartesian product when it fits the attempt budget", () => {
    const combos = [...enumerateParams({ a: intRange(1, 3), b: choiceParam("x", "y") }, 100)];
    expect(combos).toHaveLength(6);
    expect(new Set(combos.map((c) => JSON.stringify(c))).size).toBe(6);
  });

  it("samples without duplicates when the product exceeds the attempt budget", () => {
    const combos = [...enumerateParams({ a: intRange(1, 1000), b: intRange(1, 1000) }, 50)];
    expect(combos).toHaveLength(50);
    expect(new Set(combos.map((c) => JSON.stringify(c))).size).toBe(50);
  });
});

describe("renderTemplate", () => {
  const arithmetic = defineTemplate({
    id: "test.add",
    topicId: "sp5.natural",
    difficulty: 1,
    answerType: "number",
    params: { a: intRange(1, 5), b: intRange(1, 5) },
    subtopic: { ru: "тест", pl: "test", en: "test" },
    question: (p) => `${p.a} + ${p.b}`,
    verifyExpression: (p) => `${p.a} + ${p.b}`,
    correctAnswer: (p) => String(p.a + p.b),
    solution: { ru: (p) => `${p.a}+${p.b}`, pl: (p) => `${p.a}+${p.b}`, en: (p) => `${p.a}+${p.b}` },
  });

  it("renders verified tasks in every requested language, with a stable id per substitution+lang", () => {
    const { tasks, stats } = renderTemplate(arithmetic, { langs: ["ru", "pl"], targetCount: 3 });
    expect(stats.accepted).toBe(3);
    expect(tasks).toHaveLength(6); // 3 substitutions x 2 langs
    expect(new Set(tasks.map((t) => t.task.id)).size).toBe(6); // all ids distinct
    for (const { lang, task } of tasks) expect(task.id).toContain(`:${lang}:`);
  });

  it("drops a substitution rejected by `constraint` without counting it as accepted", () => {
    const evenOnly = defineTemplate({ ...arithmetic, id: "test.even", constraint: (p) => (p.a + p.b) % 2 === 0 });
    const { tasks, stats } = renderTemplate(evenOnly, { langs: ["ru"], targetCount: 3, attemptBudget: 25 });
    expect(stats.accepted).toBe(3);
    for (const { task } of tasks) expect(Number(task.correctAnswer) % 2).toBe(0);
  });

  it("requires a substitution to verify in ALL requested languages, not just some", () => {
    // "en" always produces an empty question -> fails schema validation ("question" min length 1)
    const brokenInEnglish = defineTemplate({ ...arithmetic, id: "test.broken-en", question: (p, _d, lang) => (lang === "en" ? "" : `${p.a}+${p.b}`) });
    const { tasks, stats } = renderTemplate(brokenInEnglish, { langs: ["ru", "en"], targetCount: 25, attemptBudget: 25 });
    expect(tasks).toHaveLength(0);
    expect(stats.accepted).toBe(0);
    expect(stats.rejected).toBe(25);
    expect(stats.rejectionReasons[0]).toContain("[en]");
  });

  it("caps output at targetCount even when more valid substitutions exist", () => {
    const { stats } = renderTemplate(arithmetic, { langs: ["ru"], targetCount: 2 });
    expect(stats.accepted).toBe(2);
  });

  it("rejects when a choice template's constraint/derive produce a duplicate option (regression: prime/composite)", () => {
    // reproduces the sp5.divisibility.prime-or-composite bug: correctAnswer text must depend on the
    // derived classification, not be a fixed string — otherwise it collides with a "wrong" option.
    const buggy = defineTemplate({
      id: "test.buggy-choice",
      topicId: "sp5.natural",
      difficulty: 1,
      answerType: "choice",
      params: { n: intRange(2, 20), correctPos: choiceParam("A", "B", "C", "D") },
      derive: (p) => ({ isPrime: p.n === 2 || p.n === 3 || p.n === 5 || p.n === 7 || p.n === 11 || p.n === 13 || p.n === 17 || p.n === 19 ? "yes" : "no" }),
      subtopic: { ru: "т", pl: "t", en: "t" },
      question: (p) => `${p.n}?`,
      correctAnswer: (p) => p.correctPos,
      // BUG: always "prime", regardless of `d.isPrime`
      choices: (p) => {
        const labels = ["A", "B", "C", "D"] as const;
        return labels.map((label) => (label === p.correctPos ? { label, text: "prime" } : { label, text: label === labels[0] ? "prime" : "other" }));
      },
      correctChoiceLabel: (p) => p.correctPos,
      solution: { ru: () => "s", pl: () => "s", en: () => "s" },
    });
    const { stats } = renderTemplate(buggy, { langs: ["en"], targetCount: 10, attemptBudget: 40 });
    // half the substitutions collide (correctPos === "A" -> both "prime"); the rest still succeed
    expect(stats.rejected).toBeGreaterThan(0);
    expect(stats.rejectionReasons.some((r) => r.includes("duplicate choice texts"))).toBe(true);
  });
});

describe("renderTemplates (batch)", () => {
  it("keeps per-template stats separate", () => {
    const t1 = defineTemplate({
      id: "test.t1",
      topicId: "sp5.natural",
      difficulty: 1,
      answerType: "number",
      params: {},
      subtopic: { ru: "т", pl: "t", en: "t" },
      question: () => "1+1",
      verifyExpression: () => "1+1",
      correctAnswer: () => "2",
      solution: { ru: () => "s", pl: () => "s", en: () => "s" },
    });
    const { tasks, perTemplate } = renderTemplates([t1], { langs: ["ru", "pl", "en"], targetCount: 5 });
    expect(perTemplate).toHaveLength(1);
    expect(perTemplate[0].accepted).toBe(1); // zero params -> exactly one substitution
    expect(tasks).toHaveLength(3); // 1 substitution x 3 langs
  });
});

describe("pilot templates (SP5 + LO2-P)", () => {
  it("every template renders without errors and reaches a modest target in ru/pl/en", () => {
    for (const template of ALL_TEMPLATES) {
      const { stats } = renderTemplate(template, { langs: ["ru", "pl", "en"], targetCount: 5, attemptBudget: 200 });
      expect(stats.accepted, `${template.id} rejections: ${stats.rejectionReasons.join(" | ")}`).toBe(5);
    }
  });

  it("has no duplicate template ids", () => {
    const ids = ALL_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
