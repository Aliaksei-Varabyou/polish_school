import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.ts";
import { createProvider } from "./llm/index.ts";
import { TaskPool } from "./pool/taskPool.ts";

const provider = createProvider();
const dbPath = process.env.TASK_DB_PATH || resolve(dirname(fileURLToPath(import.meta.url)), "../data/tasks.db");
const pool = new TaskPool(dbPath);
const reuseRatio = Math.min(Math.max(Number(process.env.POOL_REUSE_RATIO ?? 0.5), 0), 1);

const app = await buildApp(provider, { pool, reuseRatio });
const port = Number(process.env.PORT ?? 8787);

try {
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`LLM provider: ${provider.name}; task pool: ${dbPath} (${pool.count()} tasks, reuse ${reuseRatio})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
