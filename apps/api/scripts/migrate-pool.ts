// Copies the local SQLite task pool into Postgres (Supabase).
// Usage: npm run pool:migrate -w @portal/api   (needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dbConfigFromEnv, PortalDb, SupabaseTaskPool } from "@portal/db";
import { TaskPool, type PooledTask } from "@portal/task-pool";

const config = dbConfigFromEnv();
if (!config) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const path = process.env.TASK_DB_PATH || resolve(dirname(fileURLToPath(import.meta.url)), "../data/tasks.db");
if (!existsSync(path)) {
  console.error(`No SQLite pool at ${path}`);
  process.exit(1);
}

const source = new TaskPool(path);
const target = new SupabaseTaskPool(new PortalDb(config).admin);
const rows = source.exportAll();

const groups = new Map<string, PooledTask[]>();
for (const row of rows) {
  const key = JSON.stringify(row.ctx);
  groups.set(key, [...(groups.get(key) ?? []), row]);
}

const before = await target.count();
for (const group of groups.values()) {
  await target.add(
    group.map((r) => r.task),
    group[0].ctx,
  );
  for (const r of group) for (let i = 0; i < r.reports; i++) await target.report(r.task.id, { reason: "migrated from SQLite" });
}
source.close();

console.log(`Copied ${rows.length} tasks from ${path}; Postgres pool: ${before} -> ${await target.count()} tasks`);
