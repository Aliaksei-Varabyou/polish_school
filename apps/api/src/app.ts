import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { LimitedClient, type LLMClient } from "@portal/ai";
import type { TaskPool } from "@portal/task-pool";
import { TOPICS } from "@portal/trainer-math";
import Fastify from "fastify";
import { registerFeedbackRoute } from "./routes/feedback.ts";
import { registerGenerateRoute } from "./routes/generate.ts";

const WEB_DIST = resolve(dirname(fileURLToPath(import.meta.url)), "../../web/dist");

export interface AppOptions {
  logger?: boolean;
  pool?: TaskPool;
  reuseRatio?: number;
  /** serve apps/web/dist when it exists (disabled in tests) */
  serveWeb?: boolean;
}

export async function buildApp(client: LLMClient, { logger = true, pool, reuseRatio, serveWeb = true }: AppOptions = {}) {
  const app = Fastify({ logger, bodyLimit: 256 * 1024 });

  await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  await app.register(rateLimit, { global: true, max: 120, timeWindow: "1 minute" });

  app.get("/api/health", async () => {
    const inner = client instanceof LimitedClient ? client.inner : client;
    const models = (inner as { status?: () => unknown }).status?.();
    return {
      ok: true,
      provider: client.name,
      ...(models ? { models } : {}),
      ...(client instanceof LimitedClient ? { queue: client.limiter.stats } : {}),
      ...(pool ? { poolSize: pool.count() } : {}),
    };
  });
  app.get("/api/curriculum", async () => ({ topics: TOPICS }));
  registerGenerateRoute(app, client, { pool, reuseRatio });
  registerFeedbackRoute(app, client);

  // In production serve the built SPA from the same origin.
  if (serveWeb && existsSync(WEB_DIST)) {
    await app.register(fastifyStatic, { root: WEB_DIST });
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api/")) return reply.code(404).send({ error: "Not found" });
      return reply.sendFile("index.html");
    });
  }

  return app;
}
