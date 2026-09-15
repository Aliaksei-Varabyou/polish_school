// Entry point for running the API as a Vercel Function (see /api/[...path].ts at the repo root).
// Building the Fastify instance is expensive, so it's memoized: Vercel's Fluid Compute reuses warm
// instances across invocations, and re-running this on every request would be wasteful and would
// also break the in-memory LLM rate limiter and the task pool's process-local caching.
import { createLLMClient } from "@portal/ai";
import { dbConfigFromEnv, PortalDb, SupabaseTaskPool } from "@portal/db";
import { TaskPool, type TaskPoolStore } from "@portal/task-pool";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.ts";

let appPromise: Promise<FastifyInstance> | null = null;

export function getServerlessApp(): Promise<FastifyInstance> {
  appPromise ??= build();
  return appPromise;
}

async function build(): Promise<FastifyInstance> {
  const client = createLLMClient();
  const dbConfig = dbConfigFromEnv();
  const db = dbConfig ? new PortalDb(dbConfig) : undefined;

  // Vercel's filesystem is read-only outside /tmp, and /tmp is wiped between cold starts, so the
  // SQLite pool only makes sense without Supabase as a last resort (guest mode, no persistence
  // across invocations). With Supabase configured the pool lives in Postgres and is shared and durable.
  const pool: TaskPoolStore = db ? new SupabaseTaskPool(db.admin) : new TaskPool(process.env.TASK_DB_PATH || "/tmp/tasks.db");
  const reuseRatio = Math.min(Math.max(Number(process.env.POOL_REUSE_RATIO ?? 0.5), 0), 1);

  // apps/web is deployed as this project's static output; Vercel serves it directly and only
  // routes /api/* to this function, so the API itself never needs to serve the SPA here.
  const app = await buildApp(client, { pool, reuseRatio, db, serveWeb: false });
  await app.ready();
  return app;
}
