import type { AnswerMode } from "@matema/shared";
import { describe, expect, it } from "vitest";
import { MockProvider } from "../llm/mock.ts";
import { planTopics } from "../routes/generate.ts";
import { topicsFor } from "@matema/shared";
import { verifyTask } from "./verifyTask.ts";

const ctx = { topicId: "sp7.percent", answerMode: "input" as AnswerMode };

const numberTask = {
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
    const r = verifyTask(structuredClone(numberTask), ctx);
    expect(r.ok).toBe(true);
  });

  it("rejects a task whose answer does not match verifyExpression", () => {
    const r = verifyTask({ ...numberTask, correctAnswer: "190" }, ctx);
    expect(r).toMatchObject({ ok: false });
  });

  it("rejects a number task without verifyExpression", () => {
    const r = verifyTask({ ...numberTask, verifyExpression: null }, ctx);
    expect(r).toMatchObject({ ok: false, reason: "missing verifyExpression" });
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

  it.each(["input", "choice", "mixed"] as const)("mock provider tasks pass verification (%s)", async (answerMode) => {
    const provider = new MockProvider();
    const topic = topicsFor("sp7")[0];
    for (let i = 0; i < 20; i++) {
      const raw = await provider.generateTasks({ lang: "pl", grade: "sp7", topic, difficulties: [1, 2, 3], answerMode });
      for (const t of raw) expect(verifyTask(t, { topicId: topic.id, answerMode })).toMatchObject({ ok: true });
    }
  });
});

describe("planTopics", () => {
  it("distributes all tasks across topics", () => {
    const topics = topicsFor("lo2", "R");
    for (const count of [5, 10, 15, 20]) {
      const plan = planTopics(topics.slice(0, 3), count);
      expect(plan.reduce((n, p) => n + p.difficulties.length, 0)).toBe(count);
    }
    const many = planTopics(topics, 5);
    expect(many).toHaveLength(5);
    expect(many.every((p) => p.difficulties.length === 1)).toBe(true);
  });

  it("includes extended topics only on level R", () => {
    expect(topicsFor("lo2", "P").some((t) => t.level === "R")).toBe(false);
    expect(topicsFor("lo2", "R").some((t) => t.level === "R")).toBe(true);
  });
});
