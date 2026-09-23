import type { Task } from "@portal/core";
import { TaskPool } from "@portal/task-pool";
import { afterEach, describe, expect, it } from "vitest";
import { renderContent } from "./content.ts";
import { ensureContent, syncContent } from "./seed.ts";

const pools: TaskPool[] = [];
function newPool() {
  const pool = new TaskPool(":memory:");
  pools.push(pool);
  return pool;
}
afterEach(() => pools.splice(0).forEach((p) => p.close()));

const content = renderContent();

describe("syncing the pool with the templates", () => {
  it("fills an empty pool, and a second sync changes nothing", async () => {
    const pool = newPool();
    expect(await syncContent(pool)).toEqual({ added: content.tasks.length, removed: 0, total: content.tasks.length });
    expect(await pool.count("bio")).toBe(content.tasks.length);
    expect(await syncContent(pool)).toEqual({ added: 0, removed: 0, total: content.tasks.length });
  });

  it("replaces a pool filled before paragraphs existed (chapter topics, old ids)", async () => {
    // what production holds before this deploy: the same tasks under chapter ids and parameter-hash ids
    const pool = newPool();
    const old = content.tasks.map(({ lang, task }) => ({
      lang,
      task: { ...task, id: `${task.id.split(":")[0]}:${lang}:0123456789`, topicId: task.topicId.split(".").slice(0, 3).join(".") },
    }));
    for (const lang of ["pl", "ru"] as const) {
      await pool.add(old.filter((t) => t.lang === lang).map((t) => t.task), { trainerId: "bio", lang, grade: "lo3", level: "R" });
    }
    const unrelated: Task = { ...content.tasks[0].task, id: "math-task" };
    await pool.add([unrelated], { trainerId: "math", lang: "pl", grade: "sp7" });

    const result = await syncContent(pool);
    expect(result.removed).toBeGreaterThan(0);
    expect(new Set(await pool.listIds("bio"))).toEqual(new Set(content.tasks.map((t) => t.task.id)));
    expect(await pool.listIds("math")).toEqual(["math-task"]); // other trainers' rows are not biology's to touch
  });

  it("swaps only the task whose content changed", async () => {
    const pool = newPool();
    await syncContent(pool);
    // a row as if an earlier version of its text were stored
    const [victim] = await pool.listIds("bio");
    await pool.remove([victim]);
    await pool.add([{ ...content.tasks[0].task, id: "bio.lo3.stale:pl:ffffffffffff" }], { trainerId: "bio", lang: "pl", grade: "lo3", level: "R" });

    expect(await syncContent(pool)).toEqual({ added: 1, removed: 1, total: content.tasks.length });
  });

  it("runs once per pool however many sessions ask", async () => {
    const pool = newPool();
    let listed = 0;
    const listIds = pool.listIds.bind(pool);
    pool.listIds = (trainerId) => {
      listed++;
      return listIds(trainerId);
    };
    await Promise.all([ensureContent(pool), ensureContent(pool), ensureContent(pool)]);
    await ensureContent(pool);
    expect(listed).toBe(1);
  });
});
