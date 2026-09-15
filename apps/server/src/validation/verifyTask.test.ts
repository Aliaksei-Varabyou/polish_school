import { topicsFor, type AnswerMode } from "@matema/shared";
import { describe, expect, it } from "vitest";
import { MockProvider } from "../llm/mock.ts";
import { MAX_BATCH, chunk, planSlots } from "../routes/generate.ts";
import { verifyTask } from "./verifyTask.ts";

const ctx = { allowedTopicIds: ["sp7.percent"], answerMode: "input" as AnswerMode };

const numberTask = {
  topicId: "sp7.percent",
  subtopic: "procent danej liczby",
  difficulty: 1,
  question: "Oblicz 15% z 1200.",
  answerType: "number",
  correctAnswer: "180",
  verifyExpression: "1200*0.15",
  hint: "15% = 0,15",
  solution: "0,15 · 1200 = 180",
};

const choiceTask = {
  ...numberTask,
  answerType: "choice",
  correctAnswer: "180",
  choices: [
    { label: "A", text: "18", misconception: "przesunięcie przecinka" },
    { label: "B", text: "180" },
    { label: "C", text: "1215", misconception: "dodanie 15" },
    { label: "D", text: "80", misconception: "zgadywanie" },
  ],
  correctChoice: "B",
};

describe("verifyTask", () => {
  it("accepts a correct number task", () => {
    expect(verifyTask(structuredClone(numberTask), ctx).ok).toBe(true);
  });

  it("rejects a task whose answer does not match verifyExpression", () => {
    expect(verifyTask({ ...numberTask, correctAnswer: "190" }, ctx)).toMatchObject({ ok: false });
  });

  it("rejects a number task without verifyExpression", () => {
    expect(verifyTask({ ...numberTask, verifyExpression: null }, ctx)).toMatchObject({ ok: false, reason: "missing verifyExpression" });
  });

  it("accepts a choice task and stores the label as correctAnswer", () => {
    const r = verifyTask(structuredClone(choiceTask), { ...ctx, answerMode: "choice" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.task.correctAnswer).toBe("B");
  });

  it("rejects a choice task with two equal correct options", () => {
    const bad = structuredClone(choiceTask);
    bad.choices[3].text = "180,0";
    expect(verifyTask(bad, { ...ctx, answerMode: "choice" }).ok).toBe(false);
  });

  it("rejects a choice task whose correct option contradicts verifyExpression", () => {
    const bad = structuredClone(choiceTask);
    bad.correctChoice = "A";
    expect(verifyTask(bad, { ...ctx, answerMode: "choice" }).ok).toBe(false);
  });

  it("rejects task type that does not match answer mode", () => {
    expect(verifyTask(structuredClone(choiceTask), ctx).ok).toBe(false);
    expect(verifyTask(structuredClone(numberTask), { ...ctx, answerMode: "choice" }).ok).toBe(false);
  });

  it("checks topicId against the batch topics", () => {
    const batch = { allowedTopicIds: ["sp7.percent", "sp7.equations"], answerMode: "input" as AnswerMode };
    expect(verifyTask({ ...numberTask, topicId: "sp7.equations" }, batch)).toMatchObject({ ok: true, task: { topicId: "sp7.equations" } });
    expect(verifyTask({ ...numberTask, topicId: "lo4.review" }, batch).ok).toBe(false);
    // a single-topic batch tolerates a missing topicId
    expect(verifyTask({ ...numberTask, topicId: undefined }, ctx)).toMatchObject({ ok: true, task: { topicId: "sp7.percent" } });
    expect(verifyTask({ ...numberTask, topicId: undefined }, batch).ok).toBe(false);
  });

  it.each(["input", "choice", "mixed"] as const)("mock provider tasks pass verification (%s)", async (answerMode) => {
    const provider = new MockProvider();
    const topics = topicsFor("sp7");
    for (let i = 0; i < 10; i++) {
      const slots = planSlots(topics.slice(0, 3), 5, answerMode);
      const raw = await provider.generateTasks({ lang: "pl", grade: "sp7", slots });
      const allowedTopicIds = slots.map((s) => s.topic.id);
      for (const t of raw) expect(verifyTask(t, { allowedTopicIds, answerMode })).toMatchObject({ ok: true });
    }
  });
});

describe("planSlots", () => {
  it("distributes all tasks across topics", () => {
    const topics = topicsFor("lo2", "R");
    for (const count of [5, 10, 15, 20]) {
      const slots = planSlots(topics.slice(0, 3), count, "input");
      expect(slots).toHaveLength(count);
      const counts = new Map<string, number>();
      for (const s of slots) counts.set(s.topic.id, (counts.get(s.topic.id) ?? 0) + 1);
      const perTopic = [...counts.values()];
      expect(Math.max(...perTopic) - Math.min(...perTopic)).toBeLessThanOrEqual(1);
    }
    const many = planSlots(topics, 5, "input");
    expect(new Set(many.map((s) => s.topic.id)).size).toBe(5);
  });

  it("assigns task kinds by answer mode", () => {
    const topics = topicsFor("sp8");
    expect(planSlots(topics, 10, "input").every((s) => s.kind === "input")).toBe(true);
    expect(planSlots(topics, 10, "choice").every((s) => s.kind === "choice")).toBe(true);
    expect(planSlots(topics, 10, "mixed").filter((s) => s.kind === "choice")).toHaveLength(5);
  });

  it("needs count / 5 requests regardless of the number of topics", () => {
    const slots = planSlots(topicsFor("lo2", "R"), 20, "mixed");
    expect(chunk(slots, MAX_BATCH)).toHaveLength(4);
  });

  it("includes extended topics only on level R", () => {
    expect(topicsFor("lo2", "P").some((t) => t.level === "R")).toBe(false);
    expect(topicsFor("lo2", "R").some((t) => t.level === "R")).toBe(true);
  });
});
