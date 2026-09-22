import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Task } from "@portal/core";
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

const ctx = { trainerId: "math", lang: "pl", grade: "sp7" } as const;
const query = { ...ctx, topicId: "sp7.percent", answerMode: "input", excludeIds: [], limit: 10 } as const;
const ids = (tasks: Task[]) => tasks.map((t) => t.id).sort();

describe("TaskPool (SQLite)", () => {
  let pool: TaskPool;
  beforeEach(() => {
    pool = new TaskPool(":memory:");
  });
  afterEach(() => pool.close());

  it("stores tasks once and filters by trainer, language, grade, level and topic", async () => {
    await pool.add([task("a"), task("b"), task("c", { topicId: "sp7.powers" })], ctx);
    await pool.add([task("a")], ctx); // duplicate id ignored
    await pool.add([task("d")], { ...ctx, lang: "ru" });
    await pool.add([task("e")], { ...ctx, grade: "lo1", level: "R" });
    await pool.add([task("f")], { ...ctx, trainerId: "physics" });

    expect(await pool.count()).toBe(6);
    expect(await pool.count("math")).toBe(5);
    expect(ids(await pool.take(query))).toEqual(["a", "b"]);
    expect(ids(await pool.take({ ...query, lang: "ru" }))).toEqual(["d"]);
    expect(ids(await pool.take({ ...query, grade: "lo1", level: "R" }))).toEqual(["e"]);
    expect(await pool.take({ ...query, grade: "lo1", level: "P" })).toEqual([]);
    expect(ids(await pool.take({ ...query, trainerId: "physics" }))).toEqual(["f"]);
  });

  it("respects answer mode and excluded ids", async () => {
    await pool.add([task("num"), task("expr", { answerType: "expression" }), task("ch", { answerType: "choice" })], ctx);
    expect(ids(await pool.take({ ...query, answerMode: "choice" }))).toEqual(["ch"]);
    expect(ids(await pool.take({ ...query, answerMode: "input", excludeIds: ["num"] }))).toEqual(["expr"]);
    expect(await pool.take({ ...query, answerMode: "mixed" })).toHaveLength(3);
  });

  it("serves free-text answers under input and mixed, never under choice", async () => {
    const term = task("term", { answerType: "text", correctAnswer: "nefron", acceptedAnswers: ["nefronu"], verifyExpression: undefined });
    await pool.add([term, task("ch", { answerType: "choice" })], ctx);
    expect(ids(await pool.take({ ...query, answerMode: "input" }))).toEqual(["term"]);
    expect(ids(await pool.take({ ...query, answerMode: "mixed" }))).toEqual(["ch", "term"]);
    expect(ids(await pool.take({ ...query, answerMode: "choice" }))).toEqual(["ch"]);
  });

  it("prefers the requested difficulty and least served tasks", async () => {
    await pool.add([task("easy", { difficulty: 1 }), task("hard1", { difficulty: 3 }), task("hard2", { difficulty: 3 })], ctx);
    const [first] = await pool.take({ ...query, difficulty: 3, limit: 1 });
    const [second] = await pool.take({ ...query, difficulty: 3, limit: 1 });
    expect([first.id, second.id].sort()).toEqual(["hard1", "hard2"]);
    expect((await pool.take({ ...query, difficulty: 3, limit: 1 }))[0].difficulty).toBe(3);
    expect(await pool.take({ ...query, limit: 0 })).toEqual([]);
  });

  it("stops serving tasks reported twice", async () => {
    await pool.add([task("bad"), task("good")], ctx);
    expect(await pool.report("bad", { reason: "wrong answer" })).toBe(true);
    expect(ids(await pool.take(query))).toEqual(["bad", "good"]);
    expect(await pool.report("bad", {})).toBe(true);
    expect(ids(await pool.take(query))).toEqual(["good"]);
    expect(await pool.report("missing", {})).toBe(false);
  });

  it("returns the full task object and exports everything", async () => {
    const t = task("x", { answerType: "choice", correctChoice: "B", correctAnswer: "B", hint: "h" });
    await pool.add([t], { ...ctx, grade: "lo2", level: "R" });
    expect((await pool.take({ ...query, grade: "lo2", level: "R", answerMode: "choice" }))[0]).toEqual(t);
    expect(pool.exportAll()).toEqual([{ ctx: { trainerId: "math", lang: "pl", grade: "lo2", level: "R" }, task: t, reports: 0 }]);
  });
});

describe("TaskPool migration", () => {
  it("adds trainer_id and reports to a pool created before trainers existed", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pool-"));
    const file = join(dir, "tasks.db");
    try {
      const old = new DatabaseSync(file);
      old.exec(`
        CREATE TABLE tasks (
          id TEXT PRIMARY KEY, lang TEXT NOT NULL, grade TEXT NOT NULL, level TEXT NOT NULL DEFAULT '',
          topic_id TEXT NOT NULL, difficulty INTEGER NOT NULL, answer_type TEXT NOT NULL, data TEXT NOT NULL,
          created_at INTEGER NOT NULL, served INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX tasks_lookup ON tasks (lang, grade, level, topic_id, answer_type);
      `);
      const t = task("legacy");
      old.prepare("INSERT INTO tasks VALUES (?, 'pl', 'sp7', '', 'sp7.percent', 2, 'number', ?, 0, 0)").run(t.id, JSON.stringify(t));
      old.close();

      const pool = new TaskPool(file);
      expect(await pool.count("math")).toBe(1);
      expect(ids(await pool.take(query))).toEqual(["legacy"]);
      expect(await pool.report("legacy", {})).toBe(true);
      pool.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
