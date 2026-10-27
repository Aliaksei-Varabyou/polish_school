import type { Task } from "@portal/core";
import { describe, expect, it } from "vitest";
import { checkAnswer, isNumberCorrect, isTermCorrect, normalizeTerm, parseQuantity } from "./answer.ts";

const task = (overrides: Partial<Task>): Task => ({
  id: "t",
  topicId: "bio.lo3.hormones",
  subtopic: "s",
  difficulty: 1,
  question: "q",
  answerType: "text",
  correctAnswer: "insulina",
  solution: "s",
  ...overrides,
});

describe("normalizeTerm", () => {
  it("folds case, Polish diacritics and the undecomposable ł", () => {
    expect(normalizeTerm("Tętnica")).toBe("tetnica");
    expect(normalizeTerm("ŻÓŁĆ")).toBe("zolc");
    expect(normalizeTerm("przełyk")).toBe("przelyk");
  });

  it("folds Russian ё and case", () => {
    expect(normalizeTerm("Жёлтое тело")).toBe("желтое тело");
    expect(normalizeTerm("ЖЕЛТОЕ  ТЕЛО")).toBe("желтое тело");
  });

  it("drops surrounding quotes, trailing punctuation and English articles", () => {
    expect(normalizeTerm('  "nefron".  ')).toBe("nefron");
    expect(normalizeTerm("the nephron")).toBe("nephron");
    expect(normalizeTerm("insulina!")).toBe("insulina");
  });

  it("keeps minimal pairs apart — no fuzzy matching", () => {
    expect(normalizeTerm("insulina")).not.toBe(normalizeTerm("inulina"));
    expect(normalizeTerm("tętnica")).not.toBe(normalizeTerm("tętniczka"));
  });
});

describe("isTermCorrect", () => {
  it("accepts the canonical form and every listed alias", () => {
    expect(isTermCorrect("wazopresyna", "wazopresyna", ["ADH", "вазопрессин"])).toBe(true);
    expect(isTermCorrect("adh", "wazopresyna", ["ADH"])).toBe(true);
    expect(isTermCorrect("Вазопрессин.", "wazopresyna", ["вазопрессин"])).toBe(true);
  });

  it("rejects an unlisted inflection, a near-miss and an empty answer", () => {
    expect(isTermCorrect("wazopresyny", "wazopresyna", ["ADH"])).toBe(false);
    expect(isTermCorrect("inulina", "insulina")).toBe(false);
    expect(isTermCorrect("   ", "insulina")).toBe(false);
  });
});

describe("parseQuantity / isNumberCorrect", () => {
  it("reads a decimal comma and ignores units", () => {
    expect(parseQuantity("5,25 l/min")).toBe(5.25);
    expect(parseQuantity("5.25")).toBe(5.25);
    expect(parseQuantity("ok. 120 mmHg")).toBe(120);
    expect(parseQuantity("brak")).toBeNull();
  });

  it("allows no slack at all: a year is exact", () => {
    expect(isNumberCorrect("1569", "1569")).toBe(true);
    expect(isNumberCorrect("1570", "1569")).toBe(false);
    expect(isNumberCorrect("w 1569 r.", "1569")).toBe(true);
  });

  it("stays strict at zero", () => {
    expect(isNumberCorrect("0", "0")).toBe(true);
    expect(isNumberCorrect("0,1", "0")).toBe(false);
  });
});

describe("checkAnswer", () => {
  it("compares choice labels case-insensitively", () => {
    const t = task({ answerType: "choice", correctAnswer: "C", correctChoice: "C" });
    expect(checkAnswer(t, "c")).toBe(true);
    expect(checkAnswer(t, " C ")).toBe(true);
    expect(checkAnswer(t, "B")).toBe(false);
  });

  it("uses acceptedAnswers for text tasks", () => {
    const t = task({ correctAnswer: "insulina", acceptedAnswers: ["инсулин"] });
    expect(checkAnswer(t, "инсулин")).toBe(true);
    expect(checkAnswer(t, "glukagon")).toBe(false);
  });

  it("uses the numeric tolerance for number tasks", () => {
    const t = task({ answerType: "number", correctAnswer: "5,25" });
    expect(checkAnswer(t, "5,25 l/min")).toBe(true);
    expect(checkAnswer(t, "6")).toBe(false);
  });
});
