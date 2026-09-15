import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLLMClient } from "@portal/ai";
import { dbConfigFromEnv, PortalDb } from "@portal/db";
import { TaskPool } from "@portal/task-pool";
import { buildApp } from "./app.ts";

const client = createLLMClient();
const dbPath = process.env.TASK_DB_PATH || resolve(dirname(fileURLToPath(import.meta.url)), "../data/tasks.db");
const pool = new TaskPool(dbPath);
const reuseRatio = Math.min(Math.max(Number(process.env.POOL_REUSE_RATIO ?? 0.5), 0), 1);
const dbConfig = dbConfigFromEnv();
const db = dbConfig ? new PortalDb(dbConfig) : undefined;

const app = await buildApp(client, { pool, reuseRatio, db });
const port = Number(process.env.PORT ?? 8787);

try {
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(
    `LLM provider: ${client.name}; task pool: ${dbPath} (${pool.count()} tasks, reuse ${reuseRatio}); accounts: ${db ? dbConfig!.url : "disabled"}`,
  );
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
