import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLLMClient } from "@portal/ai";
import { dbConfigFromEnv, PortalDb, SupabaseTaskPool } from "@portal/db";
import { TaskPool, type TaskPoolStore } from "@portal/task-pool";
import { buildApp } from "./app.ts";

const client = createLLMClient();
const dbConfig = dbConfigFromEnv();
const db = dbConfig ? new PortalDb(dbConfig) : undefined;

// with Supabase the pool is shared in Postgres; otherwise a local SQLite file
const sqlitePath = process.env.TASK_DB_PATH || resolve(dirname(fileURLToPath(import.meta.url)), "../data/tasks.db");
const pool: TaskPoolStore = db ? new SupabaseTaskPool(db.admin) : new TaskPool(sqlitePath);
const reuseRatio = Math.min(Math.max(Number(process.env.POOL_REUSE_RATIO ?? 0.5), 0), 1);

const app = await buildApp(client, { pool, reuseRatio, db });
const port = Number(process.env.PORT ?? 8787);

try {
  await app.listen({ port, host: "0.0.0.0" });
  const poolSize = await pool.count().catch(() => "?");
  app.log.info(
    `LLM provider: ${client.name}; task pool: ${db ? "postgres" : sqlitePath} (${poolSize} tasks, reuse ${reuseRatio}); accounts: ${db ? dbConfig!.url : "disabled"}`,
  );
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// RODO: accounts of students under 16 without a confirmed parental consent are removed after 14 days
if (db) {
  const cleanup = async () => {
    try {
      const deleted = await db.deleteUnconfirmedMinors();
      if (deleted > 0) app.log.info({ deleted }, "deleted accounts without parental consent");
    } catch (err) {
      app.log.error({ err }, "parental consent cleanup failed");
    }
  };
  void cleanup();
  setInterval(cleanup, 24 * 60 * 60 * 1000).unref();
}
