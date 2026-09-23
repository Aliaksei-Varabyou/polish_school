// Offline: renders every biology TaskTemplate and brings the task pool in step with the result.
// Usage: npm run render:templates -w @portal/trainer-bio [-- --db=./data/bio.db]
//        With SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY set, works on Postgres instead of local SQLite.
//
// A deploy does not need this: the server runs the same sync on its first biology session. It is
// for looking at the content locally, and for seeing what a sync would change before deploying.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dbConfigFromEnv, PortalDb, SupabaseTaskPool } from "@portal/db";
import { TaskPool, type TaskPoolStore } from "@portal/task-pool";
import { renderContent, TARGET } from "../src/server/content.ts";
import { syncContent } from "../src/server/seed.ts";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));

const dbConfig = dbConfigFromEnv();
const dbPath = args.db ?? resolve(dirname(fileURLToPath(import.meta.url)), "../data/bio.db");
const pool: TaskPoolStore = dbConfig ? new SupabaseTaskPool(new PortalDb(dbConfig).admin) : new TaskPool(dbPath);

console.log(`Pool: ${dbConfig ? `Postgres (${dbConfig.url})` : `SQLite (${dbPath})`}\n`);

for (const stats of renderContent().perTemplate) {
  // a table smaller than the target is expected, not a warning: it simply has that many rows
  const exhausted = stats.accepted < TARGET && stats.rejected === 0;
  const status = stats.accepted === 0 ? "✗" : stats.accepted < TARGET && !exhausted ? "△" : "✓";
  const note = exhausted ? " (whole table)" : "";
  console.log(`${status} ${stats.templateId}: ${stats.accepted} substitutions${note}, ${stats.rejected} rejected`);
  for (const reason of stats.rejectionReasons.slice(0, 3)) console.log(`    - ${reason}`);
}

const { added, removed, total } = await syncContent(pool);
console.log(`\n${total} tasks in the content (both languages): ${added} added, ${removed} stale removed.`);
if (pool instanceof TaskPool) pool.close();
