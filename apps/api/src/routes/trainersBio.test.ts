// Biology is the offline trainer: no LLM on any path, every task comes from the pool. These tests
// fail the moment something reintroduces a model call or breaks the pool -> API -> answer round trip.
import { type LLMClient } from "@portal/ai";
import type { Task } from "@portal/core";
import { TaskPool } from "@portal/task-pool";
import { PARAGRAPH_TASKS, paragraphsOf, PARAGRAPHS, topicsFor } from "@portal/trainer-bio";
import { bioTrainer } from "@portal/trainer-bio/server";
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
    // no seeding step: the trainer syncs the pool with its templates on the first session
    app = await buildApp(client, { logger: false, pool, serveWeb: false });
  });

  it("serves the textbook's paragraphs on the extended level and nothing on the basic one", async () => {
    const r = await app.inject("/api/trainers/bio/topics?grade=lo3&level=R");
    expect(r.json().topics).toHaveLength(54);
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
          { taskId: "1", topicId: "bio.lo3.hormones.structure", subtopic: "gruczoły dokrewne i hormony", difficulty: 1, question: "q", correct: false, userAnswer: "a", correctAnswer: "b", usedHint: false },
          { taskId: "2", topicId: "bio.lo3.hormones.structure", subtopic: "gruczoły dokrewne i hormony", difficulty: 1, question: "q", correct: false, userAnswer: "a", correctAnswer: "b", usedHint: false },
        ],
      },
    });
    expect(res.statusCode).toBe(200);
    expect(client.calls).toBe(0);
    expect(res.json()).toMatchObject({ weakTopics: [{ topicId: "bio.lo3.hormones.structure" }], suggestedTopicIds: ["bio.lo3.hormones.structure"] });
    expect(res.json().recommendations.length).toBeGreaterThan(0);
  });

  it("narrows a session to one cross-cutting theme", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/trainers/bio/generate",
      payload: { ...body, count: 10, tagIds: ["homeostaza"] },
    });
    expect(res.statusCode).toBe(200);
    const tasks = res.json().tasks as Task[];
    expect(tasks.length).toBeGreaterThan(0);
    for (const t of tasks) expect(t.tags, `${t.id} was served for the wrong theme`).toContain("homeostaza");
  });

  it("serves the whole topic when no theme is given", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...body, count: 20 } });
    const tagged = (res.json().tasks as Task[]).filter((t) => t.tags?.includes("homeostaza"));
    expect(tagged.length).toBeLessThan(20);
  });

  it("rejects a basic-level request, since the whole course is extended level", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...body, level: "P" } });
    expect(res.json()).toMatchObject({ code: "BAD_TOPICS" });
  });

  it("exposes biology topics to the curriculum helper", () => {
    expect(topicsFor("lo3", "R")).toHaveLength(54);
  });

  it("no longer builds a session from a whole-chapter id", async () => {
    const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...body, topicIds: ["bio.lo3.hormones"] } });
    expect(res.json()).toMatchObject({ code: "BAD_TOPICS" });
  });

  it("accepts the whole book in one request", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/trainers/bio/generate",
      payload: { ...body, topicIds: PARAGRAPHS.map((p) => p.id), count: 20 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().tasks).toHaveLength(20);
  });

  it("fills a full session from a chapter whose paragraphs are thin", async () => {
    // Układ ruchu: 3.4 has two tasks per language, so its share of 20 comes from the other paragraphs
    const motion = paragraphsOf("bio.lo3.motion").filter((p) => PARAGRAPH_TASKS[p.id]).map((p) => p.id);
    expect(motion).toContain("bio.lo3.motion.bones");
    for (let run = 0; run < 5; run++) {
      const res = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...body, topicIds: motion, count: 20 } });
      const tasks = res.json().tasks as Task[];
      expect(tasks).toHaveLength(20);
      for (const t of tasks) expect(motion).toContain(t.topicId);
    }
  });
  it("serves a finished paragraph again instead of an empty session", async () => {
    // §3.4 holds two tasks per language: after one session there is nothing unseen left in it
    const bones = { ...body, topicIds: ["bio.lo3.motion.bones"], count: 5 };
    const first = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: bones });
    const seen = (first.json().tasks as Task[]).map((t) => t.id);
    expect(seen).toHaveLength(2);

    const again = await app.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: { ...bones, excludeIds: seen } });
    expect(again.statusCode).toBe(200);
    expect((again.json().tasks as Task[]).map((t) => t.id).sort()).toEqual([...seen].sort());
  });

  it("fills an empty pool by itself, so a deploy needs no seeding step", async () => {
    const empty = new TaskPool(":memory:");
    const fresh = await buildApp(new ForbiddenClient(), { logger: false, pool: empty, serveWeb: false });
    try {
      expect(await empty.count("bio")).toBe(0);
      const res = await fresh.inject({ method: "POST", url: "/api/trainers/bio/generate", payload: body });
      expect(res.statusCode).toBe(200);
      expect(res.json().tasks).toHaveLength(10);
      // both content languages, not just the one that was asked for
      expect(await empty.count("bio")).toBe(2 * Object.values(PARAGRAPH_TASKS).reduce((a, b) => a + b, 0));
    } finally {
      await fresh.close();
      empty.close();
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
    // Układ hormonalny — its three paragraphs with tasks
    topicIds: ["bio.lo3.hormones.structure", "bio.lo3.hormones.regulation", "bio.lo3.hormones.disorders"],
    count: 10,
    answerMode: "mixed",
  };
});
