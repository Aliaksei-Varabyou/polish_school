// Fills the task pool from the templates when it is empty.
//
// Biology has no LLM to fall back on, so an empty pool means an empty session. Rather than making
// every deploy depend on someone remembering to run scripts/renderTemplates.ts against production,
// the trainer seeds itself on first use: the rendering is pure computation with no network calls,
// so it is something the server can simply do.
import type { Grade, Level, Task } from "@portal/core";
import type { TaskPoolStore } from "@portal/task-pool";
import { getTopic } from "../curriculum/index.ts";
import { BIO_LANGS, type BioLang } from "../lang.ts";
import { ALL_TEMPLATES, renderTemplate } from "./templates/index.ts";

/** Tasks kept per template. Matches the default of the offline script. */
const TARGET = 40;

/** The whole trainer is one year of one track — see curriculum/lo.ts. */
const GRADE: Grade = "lo3";
const LEVEL: Level = "R";

/**
 * One attempt per pool, not per request. Keyed by the store rather than by the process so that two
 * pools (tests, or a server that swaps its backend) don't shadow each other, and dropped again if
 * the attempt fails, so a transient database error doesn't leave the trainer permanently convinced
 * it has content.
 */
const inFlight = new WeakMap<TaskPoolStore, Promise<void>>();

/** Rows per insert. Everything is rendered first and written in a few batches rather than one call
 *  per template: against Postgres each call is a network round trip, and there are ~50 templates. */
const BATCH = 200;

async function seed(pool: TaskPoolStore, log?: { info(obj: object, msg: string): void }): Promise<void> {
  if ((await pool.count("bio")) > 0) return;

  // every biology topic shares a grade and level, so the pool context differs only by language
  const byLang = new Map<BioLang, Task[]>(BIO_LANGS.map((lang) => [lang, []]));
  for (const template of ALL_TEMPLATES) {
    if (!getTopic(template.topicId)) continue;
    for (const { lang, task } of renderTemplate(template, { langs: [...BIO_LANGS], targetCount: TARGET }).tasks) {
      byLang.get(lang)!.push(task);
    }
  }

  let stored = 0;
  for (const [lang, tasks] of byLang) {
    for (let i = 0; i < tasks.length; i += BATCH) {
      const batch = tasks.slice(i, i + BATCH);
      await pool.add(batch, { trainerId: "bio", lang, grade: GRADE, level: LEVEL });
      stored += batch.length;
    }
  }
  log?.info({ trainer: "bio", stored }, "seeded the biology pool from templates");
}

/**
 * Called by the generation pipeline before it takes anything from the pool.
 *
 * Only the first empty pool costs anything: afterwards this is one `count` query per process, and
 * writes are idempotent (task ids are a hash of the substitution), so two instances racing each
 * other duplicate the work but not the rows.
 *
 * It deliberately does *not* re-seed after the content changes — ids stay the same, so the pool
 * would ignore the new text. Rolling out edited content is still `npm run render:templates` plus
 * deleting the affected rows, or a new template id.
 */
export function ensureContent(pool: TaskPoolStore, log?: { info(obj: object, msg: string): void }): Promise<void> {
  const running = inFlight.get(pool);
  if (running) return running;

  const attempt = seed(pool, log).catch((err: unknown) => {
    inFlight.delete(pool);
    throw err;
  });
  inFlight.set(pool, attempt);
  return attempt;
}
