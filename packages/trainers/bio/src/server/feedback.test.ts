import type { FeedbackRequest, TaskResult } from "@portal/core";
import { describe, expect, it } from "vitest";
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

const request = (results: TaskResult[]): FeedbackRequest => ({ lang: "pl", grade: "lo3", level: "R", results });

describe("biology feedback", () => {
  it("names weak paragraphs with a count, not a percentage of one task", () => {
    const res = buildFeedback(request([result("bio.lo3.motion.joints", false), result("bio.lo3.motion.muscles", true)]));
    expect(res.weakTopics).toEqual([{ topicId: "bio.lo3.motion.joints", reason: "poprawnie 0 z 1" }]);
    expect(res.suggestedTopicIds).toEqual(["bio.lo3.motion.joints"]);
  });

  it("gives one piece of advice per chapter, listing its weak paragraphs", () => {
    const res = buildFeedback(
      request([
        result("bio.lo3.motion.joints", false, "maź stawowa"),
        result("bio.lo3.motion.bones", false, "szkielet osiowy"),
        result("bio.lo3.hormones.structure", false, "insulina"),
      ]),
    );
    const motion = res.recommendations.filter((r) => r.includes("Układ ruchu"));
    expect(motion).toHaveLength(1);
    expect(motion[0]).toContain("§3.3");
    expect(motion[0]).toContain("§3.4");
    expect(motion[0]).toContain("maź stawowa");
    expect(res.recommendations.some((r) => r.includes("Układ hormonalny") && r.includes("§10.2"))).toBe(true);
  });

  it("still reads results filed under a chapter by an older client", () => {
    const res = buildFeedback(request([result("bio.lo3.hormones", false)]));
    expect(res.recommendations[0]).toContain("Układ hormonalny");
    expect(res.suggestedTopicIds).toEqual([]); // a chapter is no longer something a session can be built from
  });
});
