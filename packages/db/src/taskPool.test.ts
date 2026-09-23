// Postgres task pool against the local Supabase; skipped when it is not running.
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { Task } from "@portal/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dbConfigFromEnv, PortalDb, SupabaseTaskPool } from "./index.ts";

try {
  process.loadEnvFile(resolve(import.meta.dirname, "../../../.env"));
} catch {
  // no .env — rely on the environment
}

const config = dbConfigFromEnv();

async function reachable(): Promise<boolean> {
  if (!config) return false;
  try {
    const res = await fetch(`${config.url}/auth/v1/health`, {
      headers: { apikey: config.serviceRoleKey },
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const available = await reachable();

describe.skipIf(!available)("SupabaseTaskPool (local Supabase)", () => {
  let db: PortalDb;
  let pool: SupabaseTaskPool;
  // unique trainer id per run keeps tests isolated from real data
  const trainerId = `test-${randomUUID()}`;
  const ctx = { trainerId, lang: "pl", grade: "sp7" } as const;
  const query = { ...ctx, topicId: "sp7.percent", answerMode: "input", excludeIds: [], limit: 10 } as const;

  const task = (name: string, overrides: Partial<Task> = {}): Task => ({
    id: `${trainerId}-${name}`,
    topicId: "sp7.percent",
    subtopic: "x",
    difficulty: 2,
    question: name,
    answerType: "number",
    correctAnswer: "1",
    verifyExpression: "1",
    solution: "s",
    ...overrides,
  });
  const names = (tasks: Task[]) => tasks.map((t) => t.question).sort();

  beforeAll(() => {
    db = new PortalDb(config!);
    pool = new SupabaseTaskPool(db.admin);
  });

  afterAll(async () => {
    await db.admin.from("tasks").delete().eq("trainer_id", trainerId);
  });

  it("adds tasks once and filters by context, topic and answer type", async () => {
    await pool.add([task("a"), task("b"), task("ch", { answerType: "choice" }), task("pow", { topicId: "sp7.powers" })], ctx);
    await pool.add([task("a")], ctx);
    await pool.add([task("ru")], { ...ctx, lang: "ru" });
    await pool.add([task("lo")], { ...ctx, grade: "lo1", level: "R" });

    expect(await pool.count(trainerId)).toBe(6);
    expect(names(await pool.take(query))).toEqual(["a", "b"]);
    expect(names(await pool.take({ ...query, answerMode: "choice" }))).toEqual(["ch"]);
    expect(names(await pool.take({ ...query, answerMode: "mixed" }))).toEqual(["a", "b", "ch"]);
    expect(names(await pool.take({ ...query, lang: "ru" }))).toEqual(["ru"]);
    expect(names(await pool.take({ ...query, grade: "lo1", level: "R" }))).toEqual(["lo"]);
    expect(await pool.take({ ...query, grade: "lo1", level: "P" })).toEqual([]);
    expect(await pool.take({ ...query, trainerId: `${trainerId}-other` })).toEqual([]);
  });

  it("excludes seen tasks, prefers difficulty and least served, returns full tasks", async () => {
    const hard = task("hard", { topicId: "sp7.roots", difficulty: 3, hint: "h" });
    await pool.add([task("easy", { topicId: "sp7.roots", difficulty: 1 }), hard], ctx);
    const roots = { ...query, topicId: "sp7.roots" };

    expect(await pool.take({ ...roots, difficulty: 3, limit: 1 })).toEqual([hard]);
    expect(names(await pool.take({ ...roots, limit: 1 }))).toEqual(["easy"]); // hard was served once already
    expect(names(await pool.take({ ...roots, excludeIds: [hard.id] }))).toEqual(["easy"]);
    expect(await pool.take({ ...roots, limit: 0 })).toEqual([]);
  });

  it("stops serving tasks reported twice", async () => {
    const bad = task("bad", { topicId: "sp7.statistics" });
    await pool.add([bad, task("good", { topicId: "sp7.statistics" })], ctx);
    const stats = { ...query, topicId: "sp7.statistics" };

    expect(await pool.report(bad.id, { reason: "wrong answer" })).toBe(true);
    expect(names(await pool.take(stats))).toEqual(["bad", "good"]);
    expect(await pool.report(bad.id, { userId: null })).toBe(true);
    expect(names(await pool.take(stats))).toEqual(["good"]);
    expect(await pool.report(`${trainerId}-missing`, {})).toBe(false);

    const { data } = await db.admin.from("task_reports").select("reason").eq("task_id", bad.id);
    expect(data?.map((r) => r.reason).sort()).toEqual(["wrong answer", null].sort());
  });

  // keep this in step with the SQLite pool's equivalent test: the two implementations must agree
  it("narrows by cross-cutting tag only when the query asks for one", async () => {
    const topicId = "sp7.tags";
    await pool.add(
      [
        task("homeo", { topicId, tags: ["homeostaza", "regulacja"] }),
        task("plain", { topicId }),
        task("other", { topicId, tags: ["choroby"] }),
      ],
      ctx,
    );
    const q = { ...query, topicId };

    expect(names(await pool.take(q))).toEqual(["homeo", "other", "plain"]);
    expect(names(await pool.take({ ...q, tags: [] }))).toEqual(["homeo", "other", "plain"]);
    expect(names(await pool.take({ ...q, tags: ["homeostaza"] }))).toEqual(["homeo"]);
    expect(names(await pool.take({ ...q, tags: ["choroby", "homeostaza"] }))).toEqual(["homeo", "other"]);
    expect(await pool.take({ ...q, tags: ["nieznany"] })).toEqual([]);
  });
});
