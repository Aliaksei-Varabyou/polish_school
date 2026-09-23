// Biology is the offline trainer: no LLM on any path, every task comes from the pool. These tests
// fail the moment something reintroduces a model call or breaks the pool -> API -> answer round trip.
import { type LLMClient } from "@portal/ai";
import type { Task } from "@portal/core";
import { TaskPool } from "@portal/task-pool";
import { topicsFor } from "@portal/trainer-bio";
import { bioTrainer } from "@portal/trainer-bio/server";
import { ALL_TEMPLATES, renderTemplate } from "@portal/trainer-bio/server/templates";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";

/** Any call at all is a failure, so the client throws instead of answering. */
class ForbiddenClient implements LLMClient {
  readonly name = "forbidden";
  calls = 0;
  async generateJson(): Promise<unknown> {
    this.calls++;
    throw new Error("the biology trainer must not call an LLM");
  }
}

describe("trainer API (bio, offline)", () => {
  let pool: TaskPool;
  let client: ForbiddenClient;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    pool = new TaskPool(":memory:");
    client = new ForbiddenClient();
    app = await buildApp(client, { logger: false, pool, serveWeb: false });
    // seed the pool the way scripts/renderTemplates.ts does
    for (const template of ALL_TEMPLATES) {
      const { tasks } = renderTemplate(template, { langs: ["pl"], targetCount: 60, attemptBudget: 500 });
      await pool.add(
        tasks.map((t) => t.task),
        { trainerId: "bio", lang: "pl", grade: "lo3", level: "R" },
      );
    }
  });
  afterEach(async () => {
    await app.close();
    pool.close();
  });

  const body = {
    lang: "pl",
    grade: "lo3",
    level: "R",
    topicIds: ["bio.lo3.hormones"],
    count: 10,
    answerMode: "mixed",
  };

  it("serves the extended-level topics and nothing on the basic level", async () => {
    const r = await app.inject("/api/trainers/bio/topics?grade=lo3&level=R");
    expect(r.json().topics).toHaveLength(11);
    const basic = await app.inject("/api/trainers/bio/topics?grade=lo3&level=P");
    expect(basic.json().topics).toEqual([]);
  });

  it("fills a whole session from the pool without touching the LLM", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: body });
    expect(res.statusCode).toBe(200);
    const tasks = res.json().tasks as Task[];
    expect(tasks).toHaveLength(10);
    expect(client.calls).toBe(0);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(10);
  });

  it("serves both choice and free-text tasks in mixed mode", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...body, count: 20 } });
    const types = new Set((res.json().tasks as Task[]).map((t) => t.answerType));
    expect(types.has("choice")).toBe(true);
    expect(types.has("text")).toBe(true);
  });

  it("accepts every served task's own correct answer", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...body, count: 20 } });
    for (const t of res.json().tasks as Task[]) {
      expect(bioTrainer.checkAnswer(t, t.correctAnswer), `${t.id}: ${t.correctAnswer}`).toBe(true);
    }
  });

  it("produces rule-based feedback without an LLM", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/trainers/bio/feedback",
      payload: {
        lang: "pl",
        grade: "lo3",
        level: "R",
        results: [
          { taskId: "1", topicId: "bio.lo3.hormones", subtopic: "gruczoły dokrewne i hormony", difficulty: 1, question: "q", correct: false, userAnswer: "a", correctAnswer: "b", usedHint: false },
          { taskId: "2", topicId: "bio.lo3.hormones", subtopic: "gruczoły dokrewne i hormony", difficulty: 1, question: "q", correct: false, userAnswer: "a", correctAnswer: "b", usedHint: false },
        ],
      },
    });
    expect(res.statusCode).toBe(200);
    expect(client.calls).toBe(0);
    expect(res.json()).toMatchObject({ weakTopics: [{ topicId: "bio.lo3.hormones" }], suggestedTopicIds: ["bio.lo3.hormones"] });
    expect(res.json().recommendations.length).toBeGreaterThan(0);
  });

  it("rejects a basic-level request, since the whole course is extended level", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...body, level: "P" } });
    expect(res.json()).toMatchObject({ code: "BAD_TOPICS" });
  });

  it("exposes biology topics to the curriculum helper", () => {
    expect(topicsFor("lo3", "R")).toHaveLength(11);
  });
});
