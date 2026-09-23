import { MockClient, RateLimitError, type LLMClient } from "@portal/ai";
import { Task, topic, type GenerateRequest, type TaskBatchInput } from "@portal/core";
import { TaskPool } from "@portal/task-pool";
import { afterEach, describe, expect, it } from "vitest";
import type { TrainerServer } from "../index.ts";
import { chunk, generateFeedback, generateTasks, MAX_BATCH, planSlots } from "./index.ts";

// A tiny fake trainer: tasks are "n + 1", every generated task is valid.
const topics = ["t1", "t2", "t3", "t4", "t5"].map((id) => topic(`fake.${id}`, "sp7", [id, id, id], ["x"]));
let seq = 0;

const fakeTrainer: TrainerServer = {
  id: "fake",
  topicsFor: () => topics,
  getTopic: (id) => topics.find((t) => t.id === id),
  generateTaskBatch: async (client: LLMClient, input: TaskBatchInput) => {
    const json = await client.generateJson({
      system: "",
      prompt: "",
      schema: {},
      temperature: 0,
      mock: () => ({
        tasks: input.slots.map((s) => ({
          topicId: s.topic.id,
          subtopic: "x",
          difficulty: s.difficulty,
          question: `${++seq} + 1`,
          answerType: "number",
          correctAnswer: String(seq + 1),
          solution: "…",
        })),
      }),
    });
    return (json as { tasks: unknown[] }).tasks;
  },
  verifyTask: (raw, ctx) => {
    const parsed = Task.safeParse({ ...(raw as object), id: crypto.randomUUID() });
    if (!parsed.success || !ctx.allowedTopicIds.includes(parsed.data.topicId)) return { ok: false, reason: "invalid" };
    return { ok: true, task: parsed.data };
  },
  checkAnswer: (task, answer) => task.correctAnswer === answer,
  generateFeedback: async () => ({
    summary: "ok",
    weakTopics: [{ topicId: "fake.t1", reason: "r" }, { topicId: "other.topic", reason: "r" }],
    recommendations: ["r"],
    suggestedTopicIds: ["fake.t1", "fake.t1", "other.topic"],
  }),
};

const request = (extra: Partial<GenerateRequest> = {}): GenerateRequest => ({
  lang: "pl",
  grade: "sp7",
  topicIds: topics.map((t) => t.id),
  count: 10,
  answerMode: "input",
  ...extra,
});

class FailingClient implements LLMClient {
  readonly name = "failing";
  calls = 0;
  async generateJson(): Promise<unknown> {
    this.calls++;
    throw new RateLimitError();
  }
}

const pools: TaskPool[] = [];
function newPool() {
  const pool = new TaskPool(":memory:");
  pools.push(pool);
  return pool;
}
afterEach(() => pools.splice(0).forEach((p) => p.close()));

async function run(client: LLMClient, pool: TaskPool, extra: Partial<GenerateRequest> = {}) {
  const outcome = await generateTasks(request(extra), { trainer: fakeTrainer, client, pool, reuseRatio: 0.5 });
  return { outcome, tasks: outcome.ok ? outcome.tasks : [] };
}

describe("generateTasks", () => {
  it("mixes topics in batches: 10 tasks over 5 topics take 2 LLM calls", async () => {
    const mock = new MockClient();
    const pool = newPool();
    const { outcome, tasks } = await run(mock, pool);
    expect(outcome.ok).toBe(true);
    expect(tasks).toHaveLength(10);
    expect(mock.calls).toBe(2);
    expect(new Set(tasks.map((t) => t.topicId)).size).toBe(5);
    expect(await pool.count()).toBe(10);
  });

  it("rejects requests without valid topics", async () => {
    const { outcome } = await run(new MockClient(), newPool(), { topicIds: ["unknown"] });
    expect(outcome).toEqual({ ok: false, code: "BAD_TOPICS" });
  });

  it("reuses pooled tasks and skips the ones the student has seen", async () => {
    const mock = new MockClient();
    const pool = newPool();
    const first = await run(mock, pool);

    mock.calls = 0;
    const seen = await run(mock, pool, { excludeIds: first.tasks.map((t) => t.id) });
    expect(mock.calls).toBe(2);
    expect(seen.tasks.some((t) => first.tasks.some((f) => f.id === t.id))).toBe(false);

    mock.calls = 0;
    const fresh = await run(mock, pool);
    expect(fresh.tasks).toHaveLength(10);
    expect(mock.calls).toBe(1);
    expect(await pool.count()).toBe(25);
  });

  it("keeps pools of different trainers apart", async () => {
    const pool = newPool();
    await run(new MockClient(), pool);
    const other = { ...fakeTrainer, id: "other" };
    const failing = new FailingClient();
    const outcome = await generateTasks(request(), { trainer: other, client: failing, pool });
    expect(outcome).toMatchObject({ ok: false, code: "RATE_LIMIT" });
  });

  it("falls back to the pool when the AI is rate limited", async () => {
    const pool = newPool();
    await run(new MockClient(), pool);
    await run(new MockClient(), pool);

    const failing = new FailingClient();
    const { outcome, tasks } = await run(failing, pool);
    expect(outcome.ok).toBe(true);
    expect(tasks).toHaveLength(10);
    expect(failing.calls).toBe(1);
  });

  it("does not serve a task generated in the same request twice when topping up from the pool", async () => {
    let calls = 0;
    const partial: LLMClient = {
      name: "partial",
      generateJson: async (req) => {
        if (calls++ === 0) return req.mock!();
        throw new RateLimitError();
      },
    };
    const { tasks } = await run(partial, newPool(), { topicIds: [topics[0].id] });
    expect(tasks).toHaveLength(5);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(5);
  });

  it("returns RATE_LIMIT when the AI is rate limited and the pool is empty", async () => {
    const { outcome } = await run(new FailingClient(), newPool());
    expect(outcome).toMatchObject({ ok: false, code: "RATE_LIMIT" });
  });

  it("never calls the LLM for an offline trainer and serves the whole batch from the pool", async () => {
    const pool = newPool();
    await run(new MockClient(), pool); // seed the pool with 10 tasks via the LLM-backed trainer

    const offline: TrainerServer = { ...fakeTrainer, usesLLM: false, reuseRatio: 1 };
    const failing = new FailingClient();
    // deps.reuseRatio is what the API always passes (POOL_REUSE_RATIO); the trainer must override it
    const outcome = await generateTasks(request(), { trainer: offline, client: failing, pool, reuseRatio: 0.5 });

    expect(failing.calls).toBe(0);
    expect(outcome).toMatchObject({ ok: true, stats: { llmCalls: 0, generated: 0, reused: 10 } });
    expect(outcome.ok && outcome.tasks).toHaveLength(10);
  });

  describe("a topic that runs dry", () => {
    // fake.t1 holds 1 task, fake.t2 holds 10: planSlots gives each 5 slots
    async function lopsidedPool() {
      const pool = newPool();
      const make = (topicId: string, n: number): Task[] =>
        Array.from({ length: n }, (_, i) => ({
          id: `${topicId}:${i}`,
          topicId,
          subtopic: "x",
          difficulty: 2,
          question: `${i} + 1`,
          answerType: "number",
          correctAnswer: String(i + 1),
          solution: "…",
        }));
      await pool.add([...make("fake.t1", 1), ...make("fake.t2", 10)], { trainerId: "fake", lang: "pl", grade: "sp7" });
      return pool;
    }
    const twoTopics = { topicIds: ["fake.t1", "fake.t2"] };

    it("hands its slots to the other chosen topics when the trainer is offline", async () => {
      const offline: TrainerServer = { ...fakeTrainer, usesLLM: false, reuseRatio: 1 };
      const outcome = await generateTasks(request(twoTopics), { trainer: offline, client: new FailingClient(), pool: await lopsidedPool() });

      expect(outcome.ok && outcome.tasks).toHaveLength(10);
      const byTopic = outcome.ok ? outcome.tasks.map((t) => t.topicId) : [];
      expect(byTopic.filter((id) => id === "fake.t1")).toHaveLength(1);
      expect(new Set(outcome.ok ? outcome.tasks.map((t) => t.id) : []).size).toBe(10); // nothing served twice
    });

    it("leaves an LLM-backed trainer's gaps alone (it generates for the requested topic instead)", async () => {
      // the AI is down, so only the pool answers — and each slot keeps to its own topic, as before
      const outcome = await generateTasks(request(twoTopics), { trainer: fakeTrainer, client: new FailingClient(), pool: await lopsidedPool(), reuseRatio: 0.5 });
      expect(outcome.ok && outcome.tasks).toHaveLength(6); // t1: 1 of 5, t2: 5 of 5
    });
  });

  describe("when the student has seen everything in the chosen topics", () => {
    const offline: TrainerServer = { ...fakeTrainer, usesLLM: false, reuseRatio: 1 };
    const make = (n: number, prefix = "t"): Task[] =>
      Array.from({ length: n }, (_, i) => ({
        id: `${prefix}${i}`,
        topicId: "fake.t1",
        subtopic: "x",
        difficulty: 2,
        question: `${prefix}${i}`,
        answerType: "number",
        correctAnswer: "1",
        solution: "…",
      }));
    async function poolOf(tasks: Task[]) {
      const pool = newPool();
      await pool.add(tasks, { trainerId: "fake", lang: "pl", grade: "sp7" });
      return pool;
    }
    const ask = (pool: TaskPool, trainer: TrainerServer, count: number, excludeIds: string[]) =>
      generateTasks(request({ topicIds: ["fake.t1"], count, excludeIds }), { trainer, client: new FailingClient(), pool, reuseRatio: 0.5 });
    const idsOf = (o: Awaited<ReturnType<typeof ask>>) => (o.ok ? o.tasks.map((t) => t.id).sort() : []);

    it("repeats seen tasks instead of serving an empty session, never one twice within it", async () => {
      const seen = make(3);
      const outcome = await ask(await poolOf(seen), offline, 5, seen.map((t) => t.id));
      expect(idsOf(outcome)).toEqual(["t0", "t1", "t2"]);
      expect(outcome).toMatchObject({ ok: true, stats: { repeated: 3 } });
    });

    it("goes round the topic: the next session repeats the tasks shown least", async () => {
      const seen = make(4);
      const pool = await poolOf(seen);
      const all = seen.map((t) => t.id);
      const first = idsOf(await ask(pool, offline, 2, all));
      const second = idsOf(await ask(pool, offline, 2, all));
      expect([...first, ...second].sort()).toEqual(all);
    });

    it("serves unseen tasks before any repeat", async () => {
      const seen = make(3, "old");
      const fresh = make(2, "new");
      const outcome = await ask(await poolOf([...seen, ...fresh]), offline, 3, seen.map((t) => t.id));
      const ids = idsOf(outcome);
      expect(ids).toContain("new0");
      expect(ids).toContain("new1");
      expect(outcome).toMatchObject({ stats: { repeated: 1 } });
    });

    it("leaves an LLM-backed trainer's exclusions alone", async () => {
      const seen = make(3);
      const outcome = await ask(await poolOf(seen), fakeTrainer, 5, seen.map((t) => t.id));
      expect(outcome).toMatchObject({ ok: false, code: "RATE_LIMIT" });
    });
  });

  it("keeps the LLM rounds for trainers that do not opt out", async () => {
    const mock = new MockClient();
    const { outcome } = await run(mock, newPool());
    expect(outcome).toMatchObject({ ok: true, stats: { llmCalls: 2 } });
  });
});

describe("generateFeedback", () => {
  it("drops topics that are not in the results", async () => {
    const outcome = await generateFeedback(
      {
        lang: "pl",
        grade: "sp7",
        results: [
          { taskId: "1", topicId: "fake.t1", subtopic: "x", difficulty: 1, question: "q", correct: false, userAnswer: "1", correctAnswer: "2", usedHint: false },
        ],
      },
      { trainer: fakeTrainer, client: new MockClient() },
    );
    expect(outcome).toMatchObject({ ok: true, data: { weakTopics: [{ topicId: "fake.t1" }], suggestedTopicIds: ["fake.t1"] } });
  });
});

describe("planSlots", () => {
  it("distributes all tasks across topics", () => {
    for (const count of [5, 10, 15, 20]) {
      const slots = planSlots(topics.slice(0, 3), count, "input");
      expect(slots).toHaveLength(count);
      const counts = new Map<string, number>();
      for (const s of slots) counts.set(s.topic.id, (counts.get(s.topic.id) ?? 0) + 1);
      const perTopic = [...counts.values()];
      expect(Math.max(...perTopic) - Math.min(...perTopic)).toBeLessThanOrEqual(1);
    }
    const few = planSlots(topics, 3, "input");
    expect(new Set(few.map((s) => s.topic.id)).size).toBe(3);
  });

  it("assigns task kinds by answer mode", () => {
    expect(planSlots(topics, 10, "input").every((s) => s.kind === "input")).toBe(true);
    expect(planSlots(topics, 10, "choice").every((s) => s.kind === "choice")).toBe(true);
    expect(planSlots(topics, 10, "mixed").filter((s) => s.kind === "choice")).toHaveLength(5);
  });

  it("needs count / 5 requests regardless of the number of topics", () => {
    expect(chunk(planSlots(topics, 20, "mixed"), MAX_BATCH)).toHaveLength(4);
  });
});
