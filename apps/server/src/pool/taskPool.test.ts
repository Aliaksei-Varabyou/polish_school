import type { Task } from "@matema/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TaskPool } from "./taskPool.ts";

const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  topicId: "sp7.percent",
  subtopic: "procenty",
  difficulty: 2,
  question: `Q ${id}`,
  answerType: "number",
  correctAnswer: "1",
  verifyExpression: "1",
  solution: "1",
  ...overrides,
});

const ctx = { lang: "pl", grade: "sp7" } as const;
const query = { ...ctx, topicId: "sp7.percent", answerMode: "input", excludeIds: [], limit: 10 } as const;

describe("TaskPool", () => {
  let pool: TaskPool;
  beforeEach(() => {
    pool = new TaskPool(":memory:");
  });
  afterEach(() => pool.close());

  it("stores tasks once and filters by language, grade, level and topic", () => {
    pool.add([task("a"), task("b"), task("c", { topicId: "sp7.powers" })], ctx);
    pool.add([task("a")], ctx); // duplicate id ignored
    pool.add([task("d")], { lang: "ru", grade: "sp7" });
    pool.add([task("e")], { lang: "pl", grade: "lo1", level: "R" });

    expect(pool.count()).toBe(5);
    expect(pool.take(query).map((t) => t.id).sort()).toEqual(["a", "b"]);
    expect(pool.take({ ...query, lang: "ru" }).map((t) => t.id)).toEqual(["d"]);
    expect(pool.take({ ...query, grade: "lo1", level: "R" }).map((t) => t.id)).toEqual(["e"]);
    expect(pool.take({ ...query, grade: "lo1", level: "P" })).toEqual([]);
  });

  it("respects answer mode and excluded ids", () => {
    pool.add([task("num"), task("expr", { answerType: "expression" }), task("ch", { answerType: "choice" })], ctx);
    expect(pool.take({ ...query, answerMode: "choice" }).map((t) => t.id)).toEqual(["ch"]);
    expect(pool.take({ ...query, answerMode: "input", excludeIds: ["num"] }).map((t) => t.id)).toEqual(["expr"]);
    expect(pool.take({ ...query, answerMode: "mixed" })).toHaveLength(3);
  });

  it("prefers the requested difficulty and least served tasks", () => {
    pool.add([task("easy", { difficulty: 1 }), task("hard1", { difficulty: 3 }), task("hard2", { difficulty: 3 })], ctx);
    const first = pool.take({ ...query, difficulty: 3, limit: 1 })[0];
    const second = pool.take({ ...query, difficulty: 3, limit: 1 })[0];
    expect([first.id, second.id].sort()).toEqual(["hard1", "hard2"]);
    expect(pool.take({ ...query, difficulty: 3, limit: 1 })[0].difficulty).toBe(3); // both served once -> random hard
    expect(pool.take({ ...query, limit: 0 })).toEqual([]);
  });

  it("returns the full task object", () => {
    const t = task("x", { answerType: "choice", correctChoice: "B", correctAnswer: "B", hint: "h" });
    pool.add([t], ctx);
    expect(pool.take({ ...query, answerMode: "choice" })[0]).toEqual(t);
  });
});
