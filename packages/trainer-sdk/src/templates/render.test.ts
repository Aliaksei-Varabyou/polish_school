import { Task } from "@portal/core";
import { describe, expect, it } from "vitest";
import type { VerifyFn } from "./render.ts";
import { renderTemplate, renderTemplates } from "./render.ts";
import { enumerateParams } from "./combinations.ts";
import { plural } from "./text.ts";
import { choiceParam, defineTemplate, intRange } from "./types.ts";

/**
 * The engine takes the trainer's verifier rather than owning one, so these tests inject the
 * smallest possible verifier (shape only). Subject-specific checks are covered by each trainer's
 * own test suite, against its real verifier.
 */
const shapeOnly: VerifyFn = (raw, ctx) => {
  const parsed = Task.safeParse({ ...(raw as object), id: ctx.id ?? crypto.randomUUID() });
  if (!parsed.success) return { ok: false, reason: `schema: ${parsed.error.issues[0]?.message}` };
  if (!ctx.allowedTopicIds.includes(parsed.data.topicId)) return { ok: false, reason: "unexpected topicId" };
  return { ok: true, task: parsed.data };
};

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
    const { tasks, stats } = renderTemplate(arithmetic, { langs: ["ru", "pl"], targetCount: 3, verify: shapeOnly });
    expect(stats.accepted).toBe(3);
    expect(tasks).toHaveLength(6); // 3 substitutions x 2 langs
    expect(new Set(tasks.map((t) => t.task.id)).size).toBe(6); // all ids distinct
    for (const { lang, task } of tasks) expect(task.id).toContain(`:${lang}:`);
  });

  it("gives the same substitution the same id on every run (re-rendering is idempotent)", () => {
    const opts = { langs: ["ru"] as const, targetCount: 25, attemptBudget: 25, verify: shapeOnly };
    const first = renderTemplate(arithmetic, opts).tasks.map((t) => t.task.id);
    const second = renderTemplate(arithmetic, opts).tasks.map((t) => t.task.id);
    expect(second).toEqual(first);
  });

  it("drops a substitution rejected by `constraint` without counting it as accepted", () => {
    const evenOnly = defineTemplate({ ...arithmetic, id: "test.even", constraint: (p) => (p.a + p.b) % 2 === 0 });
    const { tasks, stats } = renderTemplate(evenOnly, { langs: ["ru"], targetCount: 3, attemptBudget: 25, verify: shapeOnly });
    expect(stats.accepted).toBe(3);
    for (const { task } of tasks) expect(Number(task.correctAnswer) % 2).toBe(0);
  });

  it("requires a substitution to verify in ALL requested languages, not just some", () => {
    // "en" always produces an empty question -> fails schema validation ("question" min length 1)
    const brokenInEnglish = defineTemplate({ ...arithmetic, id: "test.broken-en", question: (p, _d, lang) => (lang === "en" ? "" : `${p.a}+${p.b}`) });
    const { tasks, stats } = renderTemplate(brokenInEnglish, { langs: ["ru", "en"], targetCount: 25, attemptBudget: 25, verify: shapeOnly });
    expect(tasks).toHaveLength(0);
    expect(stats.accepted).toBe(0);
    expect(stats.rejected).toBe(25);
    expect(stats.rejectionReasons[0]).toContain("[en]");
  });

  it("caps output at targetCount even when more valid substitutions exist", () => {
    const { stats } = renderTemplate(arithmetic, { langs: ["ru"], targetCount: 2, verify: shapeOnly });
    expect(stats.accepted).toBe(2);
  });

  it("lets difficulty vary per substitution, for table-driven templates", () => {
    const perRow = defineTemplate({
      ...arithmetic,
      id: "test.tiered",
      difficulty: (p) => (p.a <= 2 ? 1 : p.a <= 4 ? 2 : 3),
    });
    const { tasks } = renderTemplate(perRow, { langs: ["ru"], targetCount: 25, attemptBudget: 25, verify: shapeOnly });
    expect(new Set(tasks.map((t) => t.task.difficulty)).size).toBeGreaterThan(1);
    for (const { task } of tasks) expect([1, 2, 3]).toContain(task.difficulty);
  });

  it("lets topicOf place each substitution in its own topic, and verifies against that topic", () => {
    const split = defineTemplate({
      ...arithmetic,
      id: "test.split",
      topicOf: (p) => (p.a <= 2 ? "topic.low" : "topic.high"),
    });
    const { tasks, stats } = renderTemplate(split, { langs: ["ru"], targetCount: 25, attemptBudget: 25, verify: shapeOnly });
    // the verifier's allow-list is the resolved topic: had it stayed `topicId`, every task would fail
    expect(stats.rejected).toBe(0);
    for (const { task } of tasks) {
      const a = Number(task.question.split(" + ")[0]);
      expect(task.topicId).toBe(a <= 2 ? "topic.low" : "topic.high");
    }
  });

  it("keeps `topicId` for every task when topicOf is absent", () => {
    const { tasks } = renderTemplate(arithmetic, { langs: ["ru"], targetCount: 5, verify: shapeOnly });
    for (const { task } of tasks) expect(task.topicId).toBe("sp5.natural");
  });

  it("renders a template authored in a subset of the portal languages", () => {
    const ruPlOnly = defineTemplate({
      id: "test.two-langs",
      topicId: "sp5.natural",
      difficulty: 1,
      answerType: "text",
      params: {},
      subtopic: { ru: "термин", pl: "termin" },
      question: (_p, _d, lang) => (lang === "ru" ? "Столица?" : "Stolica?"),
      correctAnswer: () => "Warszawa",
      acceptedAnswers: () => ["Warszawie", "Варшава"],
      solution: { ru: () => "Варшава", pl: () => "Warszawa" },
    });
    const { tasks } = renderTemplate(ruPlOnly, { langs: ["ru", "pl"], targetCount: 1, verify: shapeOnly });
    expect(tasks.map((t) => t.lang)).toEqual(["ru", "pl"]);
    expect(tasks[0].task.acceptedAnswers).toEqual(["Warszawie", "Варшава"]);
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
    const { tasks, perTemplate } = renderTemplates([t1], { langs: ["ru", "pl", "en"], targetCount: 5, verify: shapeOnly });
    expect(perTemplate).toHaveLength(1);
    expect(perTemplate[0].accepted).toBe(1); // zero params -> exactly one substitution
    expect(tasks).toHaveLength(3); // 1 substitution x 3 langs
  });
});
