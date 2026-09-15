import { MockClient, RateLimitError, type LLMClient } from "@portal/ai";
import type { Task } from "@portal/core";
import { TaskPool } from "@portal/task-pool";
import { topicsFor } from "@portal/trainer-math";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";
import { chunk, MAX_BATCH, planSlots } from "./generate.ts";

class FailingClient implements LLMClient {
  readonly name = "failing";
  calls = 0;
  async generateJson(): Promise<unknown> {
    this.calls++;
    throw new RateLimitError();
  }
}

const topicIds = topicsFor("sp7").slice(0, 5).map((t) => t.id);
const body = (extra: object = {}) => ({ lang: "pl", grade: "sp7", topicIds, count: 10, answerMode: "input", ...extra });

const pools: TaskPool[] = [];
function newPool() {
  const pool = new TaskPool(":memory:");
  pools.push(pool);
  return pool;
}
afterEach(() => pools.splice(0).forEach((p) => p.close()));

async function generate(client: LLMClient, pool: TaskPool, extra: object = {}) {
  const app = await buildApp(client, { logger: false, pool, reuseRatio: 0.5, serveWeb: false });
  const res = await app.inject({ method: "POST", url: "/api/generate", payload: body(extra) });
  await app.close();
  return { status: res.statusCode, tasks: (res.json().tasks ?? []) as Task[] };
}

describe("POST /api/generate", () => {
  it("mixes topics in batches: 10 tasks over 5 topics take 2 LLM calls", async () => {
    const mock = new MockClient();
    const pool = newPool();
    const { status, tasks } = await generate(mock, pool);
    expect(status).toBe(200);
    expect(tasks).toHaveLength(10);
    expect(mock.calls).toBe(2);
    expect(new Set(tasks.map((t) => t.topicId))).toEqual(new Set(topicIds));
    expect(pool.count()).toBe(10);
  });

  it("reuses pooled tasks and skips the ones the student has seen", async () => {
    const mock = new MockClient();
    const pool = newPool();
    const first = await generate(mock, pool);

    // everything in the pool was already seen -> generate all again
    mock.calls = 0;
    const seen = await generate(mock, pool, { excludeIds: first.tasks.map((t) => t.id) });
    expect(mock.calls).toBe(2);
    expect(seen.tasks.some((t) => first.tasks.some((f) => f.id === t.id))).toBe(false);

    // a new student: half from the pool, half generated in one call
    mock.calls = 0;
    const fresh = await generate(mock, pool);
    expect(fresh.tasks).toHaveLength(10);
    expect(mock.calls).toBe(1);
    expect(pool.count()).toBe(25);
  });

  it("falls back to the pool when the AI is rate limited", async () => {
    const pool = newPool();
    await generate(new MockClient(), pool);
    await generate(new MockClient(), pool);

    const failing = new FailingClient();
    const { status, tasks } = await generate(failing, pool);
    expect(status).toBe(200);
    expect(tasks).toHaveLength(10);
    expect(failing.calls).toBe(1); // stops after the first rate limit error
  });

  it("does not serve a task generated in the same request twice when topping up from the pool", async () => {
    // first batch succeeds, second hits the rate limit
    let calls = 0;
    const partial: LLMClient = {
      name: "partial",
      generateJson: async (request) => {
        if (calls++ === 0) return request.mock!();
        throw new RateLimitError();
      },
    };
    const pool = newPool();
    const { status, tasks } = await generate(partial, pool, { topicIds: [topicIds[0]] });
    expect(status).toBe(200);
    expect(tasks).toHaveLength(5);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
  });

  it("returns 429 when the AI is rate limited and the pool is empty", async () => {
    const { status } = await generate(new FailingClient(), newPool());
    expect(status).toBe(429);
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
});
