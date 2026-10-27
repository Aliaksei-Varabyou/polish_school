import type { FeedbackRequest, TaskResult } from "@portal/core";
import { describe, expect, it } from "vitest";
import { P } from "../curriculum/index.ts";
import { buildFeedback } from "./feedback.ts";

const result = (topicId: string, correct: boolean, subtopic = "x"): TaskResult => ({
  taskId: `${topicId}-${Math.random()}`,
  topicId,
  subtopic,
  difficulty: 2,
  question: "q",
  correct,
  userAnswer: "a",
  correctAnswer: "b",
  usedHint: false,
});

const request = (results: TaskResult[]): FeedbackRequest => ({ lang: "pl", grade: "sp6", results });

describe("history feedback", () => {
  it("names weak paragraphs with a count, not a percentage of one task", () => {
    const res = buildFeedback(request([result(P.golden.lublin, false), result(P.golden.batory, true)]));
    expect(res.weakTopics).toEqual([{ topicId: P.golden.lublin, reason: "poprawnie 0 z 1" }]);
    expect(res.suggestedTopicIds).toEqual([P.golden.lublin]);
  });

  it("gives one piece of advice per chapter, listing its weak paragraphs", () => {
    const res = buildFeedback(
      request([
        result(P.golden.lublin, false, "unia lubelska"),
        result(P.golden.election, false, "wolna elekcja"),
        result(P.fall.constitution, false, "Konstytucja 3 maja"),
      ]),
    );
    const golden = res.recommendations.filter((r) => r.includes("Złoty wiek"));
    expect(golden).toHaveLength(1);
    expect(golden[0]).toContain("§9");
    expect(golden[0]).toContain("§10");
    expect(golden[0]).toContain("unia lubelska");
    expect(res.recommendations.some((r) => r.includes("Ostatnie stulecie") && r.includes("§29"))).toBe(true);
  });
});
