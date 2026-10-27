// Keeps the task pool in step with the templates.
//
// History has no LLM to fall back on: the templates are the content, and the pool is only a copy of
// them the session pipeline can query. So on first use each server instance reconciles the two by
// id — task ids are content hashes (see contentId), which makes "different id" mean "different
// task". Rows the templates no longer produce are dropped and new ones stored, so a deploy with
// edited content, content moved to another paragraph, or a first deploy onto an empty pool all go
// live without anyone running a script against production.
import type { Grade, Level, Task } from "@portal/core";
import type { TaskPoolStore } from "@portal/task-pool";
import type { HistLang } from "../lang.ts";
import { poolPlace, renderContent } from "./content.ts";

type InfoLog = { info(obj: object, msg: string): void };

/** Rows per insert: against Postgres each call is a network round trip. */
const BATCH = 200;

export interface SyncResult {
  added: number;
  removed: number;
  total: number;
}

/**
 * Makes the pool's history rows exactly the rendered content. New rows go in before stale ones come
 * out, so a session running meanwhile sees extra tasks at worst, never missing ones. Two instances
 * doing this at once is harmless: inserts ignore duplicates and deleting a row twice is a no-op.
 */
export async function syncContent(pool: TaskPoolStore, log?: InfoLog): Promise<SyncResult> {
  const { tasks } = renderContent();
  const wanted = new Set(tasks.map((t) => t.task.id));
  const stored = new Set(await pool.listIds("history"));

  // the pool stores tasks per (language, class, level), so missing ones are grouped the same way
  const missing = new Map<string, { lang: HistLang; grade: Grade; level?: Level; tasks: Task[] }>();
  for (const { lang, task } of tasks) {
    if (stored.has(task.id)) continue;
    const place = poolPlace(task.topicId);
    if (!place) continue;
    const key = `${lang}|${place.grade}|${place.level ?? ""}`;
    const group = missing.get(key) ?? { lang, ...place, tasks: [] };
    group.tasks.push(task);
    missing.set(key, group);
  }
  let added = 0;
  for (const { lang, grade, level, tasks: group } of missing.values()) {
    for (let i = 0; i < group.length; i += BATCH) {
      const batch = group.slice(i, i + BATCH);
      await pool.add(batch, { trainerId: "history", lang, grade, level });
      added += batch.length;
    }
  }

  const stale = [...stored].filter((id) => !wanted.has(id));
  await pool.remove(stale);

  const result = { added, removed: stale.length, total: wanted.size };
  if (added > 0 || stale.length > 0) log?.info({ trainer: "history", ...result }, "synced the history pool with its templates");
  return result;
}

/**
 * One sync per pool, not per request. Keyed by the store rather than by the process so that two
 * pools (tests, or a server that swaps its backend) don't shadow each other, and dropped again if
 * the attempt fails, so a transient database error is retried on the next session instead of
 * leaving the pool out of date for the life of the instance.
 */
const inFlight = new WeakMap<TaskPoolStore, Promise<void>>();

/** Called by the generation pipeline before it takes anything from the pool. */
export function ensureContent(pool: TaskPoolStore, log?: InfoLog): Promise<void> {
  const running = inFlight.get(pool);
  if (running) return running;

  const attempt = syncContent(pool, log).then(
    () => undefined,
    (err: unknown) => {
      inFlight.delete(pool);
      throw err;
    },
  );
  inFlight.set(pool, attempt);
  return attempt;
}
