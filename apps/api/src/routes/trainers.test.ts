import { MockClient } from "@portal/ai";
import type { Task } from "@portal/core";
import { TaskPool } from "@portal/task-pool";
import { topicsFor } from "@portal/trainer-math";
import { mathTrainer } from "@portal/trainer-math/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";

describe("trainer API (math, mock AI)", () => {
  let pool: TaskPool;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    pool = new TaskPool(":memory:");
    app = await buildApp(new MockClient(), { logger: false, pool, serveWeb: false });
  });
  afterEach(async () => {
    await app.close();
    pool.close();
  });

  const topicIds = topicsFor("sp7").slice(0, 5).map((t) => t.id);
  const body = { lang: "pl", grade: "sp7", topicIds, count: 10, answerMode: "mixed" };

  it("lists trainers and their topics", async () => {
    expect((await app.inject("/api/trainers")).json()).toEqual({ trainers: [{ id: "math" }, { id: "bio" }] });
    const topics = await app.inject("/api/trainers/math/topics?grade=lo2&level=R");
    expect(topics.json().topics.map((t: { id: string }) => t.id)).toContain("lo2.polynomialsR");
    expect((await app.inject("/api/trainers/math/topics")).statusCode).toBe(400);
  });

  it("generates verified tasks that the math checker accepts", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/math/generate", payload: body });
    expect(res.statusCode).toBe(200);
    const tasks = res.json().tasks as Task[];
    expect(tasks).toHaveLength(10);
    for (const t of tasks) expect(mathTrainer.checkAnswer(t, t.correctAnswer)).toBe(true);
    expect(await pool.count("math")).toBe(10);
  });

  it("rejects unknown trainers and invalid requests", async () => {
    expect((await app.inject({ method: "POST", url: "/api/trainers/nope/generate", payload: body })).statusCode).toBe(404);
    const bad = await app.inject({ method: "POST", url: "/api/trainers/math/generate", payload: { ...body, count: 7 } });
    expect(bad.statusCode).toBe(400);
    const noTopics = await app.inject({ method: "POST", url: "/api/trainers/math/generate", payload: { ...body, topicIds: ["lo4.review"] } });
    expect(noTopics.json()).toMatchObject({ code: "BAD_TOPICS" });
  });

  it("returns feedback", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/trainers/math/feedback",
      payload: {
        lang: "ru",
        grade: "sp7",
        results: [
          { taskId: "1", topicId: topicIds[0], subtopic: "x", difficulty: 1, question: "q", correct: false, userAnswer: "1", correctAnswer: "2", usedHint: false },
        ],
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ summary: "[mock] 0/1", suggestedTopicIds: [topicIds[0]] });
  });

  it("accepts reports about tasks in the pool", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/math/generate", payload: body });
    const [task] = res.json().tasks as Task[];
    const report = (id: string, payload: object = {}) => app.inject({ method: "POST", url: `/api/tasks/${id}/report`, payload });

    expect((await report(task.id, { reason: "ответ неверный" })).json()).toEqual({ ok: true });
    expect((await report("unknown-task")).statusCode).toBe(404);
    expect((await report(task.id, { reason: "x".repeat(501) })).statusCode).toBe(400);
  });

  it("reports health with pool size", async () => {
    expect((await app.inject("/api/health")).json()).toMatchObject({ ok: true, provider: "mock", poolSize: 0 });
  });
});
