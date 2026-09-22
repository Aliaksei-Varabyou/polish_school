// Engine mechanics live in @portal/trainer-sdk/templates and are tested there. What's left here is
// what only math can check: the pilot templates against math's real, mathjs-backed verifier.
import { describe, expect, it } from "vitest";
import { ALL_TEMPLATES, choiceParam, defineTemplate, intRange, renderTemplate } from "./index.ts";

describe("renderTemplate with math's verifier", () => {
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

  it("rejects a numeric task whose verifyExpression disagrees with correctAnswer", () => {
    const wrong = defineTemplate({
      id: "test.wrong-answer",
      topicId: "sp5.natural",
      difficulty: 1,
      answerType: "number",
      params: { a: intRange(1, 5) },
      subtopic: { ru: "т", pl: "t", en: "t" },
      question: (p) => `${p.a} + 1`,
      verifyExpression: (p) => `${p.a} + 1`,
      correctAnswer: (p) => String(p.a + 2), // off by one
      solution: { ru: () => "s", pl: () => "s", en: () => "s" },
    });
    const { stats } = renderTemplate(wrong, { langs: ["ru"], targetCount: 5, attemptBudget: 10 });
    expect(stats.accepted).toBe(0);
    expect(stats.rejected).toBe(5);
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
