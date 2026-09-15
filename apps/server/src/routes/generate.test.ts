import { topicsFor, type FeedbackRequest, type Task } from "@matema/shared";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.ts";
import { MockProvider } from "../llm/mock.ts";
import { RateLimitError, type LLMProvider } from "../llm/provider.ts";
import { TaskPool } from "../pool/taskPool.ts";

class FailingProvider implements LLMProvider {
  readonly name = "failing";
  calls = 0;
  async generateTasks(): Promise<unknown[]> {
    this.calls++;
    throw new RateLimitError();
  }
  async generateFeedback(_: FeedbackRequest): Promise<unknown> {
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

async function generate(provider: LLMProvider, pool: TaskPool, extra: object = {}) {
  const app = await buildApp(provider, { logger: false, pool, reuseRatio: 0.5, serveWeb: false });
  const res = await app.inject({ method: "POST", url: "/api/generate", payload: body(extra) });
  await app.close();
  return { status: res.statusCode, tasks: (res.json().tasks ?? []) as Task[] };
}

describe("POST /api/generate", () => {
  it("mixes topics in batches: 10 tasks over 5 topics take 2 LLM calls", async () => {
    const mock = new MockProvider();
    const pool = newPool();
    const { status, tasks } = await generate(mock, pool);
    expect(status).toBe(200);
    expect(tasks).toHaveLength(10);
    expect(mock.calls).toBe(2);
    expect(new Set(tasks.map((t) => t.topicId))).toEqual(new Set(topicIds));
    expect(pool.count()).toBe(10);
  });

  it("reuses pooled tasks and skips the ones the student has seen", async () => {
    const mock = new MockProvider();
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
    await generate(new MockProvider(), pool);
    await generate(new MockProvider(), pool);

    const failing = new FailingProvider();
    const { status, tasks } = await generate(failing, pool);
    expect(status).toBe(200);
    expect(tasks).toHaveLength(10);
    expect(failing.calls).toBe(1); // stops after the first rate limit error
  });

  it("does not serve a task generated in the same request twice when topping up from the pool", async () => {
    // first batch succeeds, second hits the rate limit
    const mock = new MockProvider();
    let calls = 0;
    const partial: LLMProvider = {
      name: "partial",
      generateTasks: async (input) => {
        if (calls++ === 0) return mock.generateTasks(input);
        throw new RateLimitError();
      },
      generateFeedback: async () => ({}),
    };
    const pool = newPool();
    const { status, tasks } = await generate(partial, pool, { topicIds: [topicIds[0]] });
    expect(status).toBe(200);
    expect(tasks).toHaveLength(5);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
  });

  it("returns 429 when the AI is rate limited and the pool is empty", async () => {
    const { status } = await generate(new FailingProvider(), newPool());
    expect(status).toBe(429);
  });
});
