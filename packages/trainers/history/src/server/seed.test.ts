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
    expect(await pool.count("history")).toBe(content.tasks.length);
    expect(await syncContent(pool)).toEqual({ added: 0, removed: 0, total: content.tasks.length });
  });

  it("swaps only the task whose content changed, and leaves other trainers alone", async () => {
    const pool = newPool();
    const unrelated: Task = { ...content.tasks[0].task, id: "bio-task" };
    await pool.add([unrelated], { trainerId: "bio", lang: "pl", grade: "sp6" });
    await syncContent(pool);
    const [victim] = await pool.listIds("history");
    await pool.remove([victim]);
    await pool.add([{ ...content.tasks[0].task, id: "history.sp6.stale:pl:ffffffffffff" }], { trainerId: "history", lang: "pl", grade: "sp6" });

    expect(await syncContent(pool)).toEqual({ added: 1, removed: 1, total: content.tasks.length });
    expect(await pool.listIds("bio")).toEqual(["bio-task"]);
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
