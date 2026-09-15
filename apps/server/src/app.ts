import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { TOPICS } from "@matema/shared";
import Fastify from "fastify";
import { LimitedProvider } from "./llm/limiter.ts";
import type { LLMProvider } from "./llm/provider.ts";
import type { TaskPool } from "./pool/taskPool.ts";
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

export async function buildApp(provider: LLMProvider, { logger = true, pool, reuseRatio, serveWeb = true }: AppOptions = {}) {
  const app = Fastify({ logger, bodyLimit: 256 * 1024 });

  await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  await app.register(rateLimit, { global: true, max: 120, timeWindow: "1 minute" });

  app.get("/api/health", async () => {
    const inner = provider instanceof LimitedProvider ? provider.inner : provider;
    const models = (inner as { status?: () => unknown }).status?.();
    return {
      ok: true,
      provider: provider.name,
      ...(models ? { models } : {}),
      ...(provider instanceof LimitedProvider ? { queue: provider.limiter.stats } : {}),
      ...(pool ? { poolSize: pool.count() } : {}),
    };
  });
  app.get("/api/curriculum", async () => ({ topics: TOPICS }));
  registerGenerateRoute(app, provider, { pool, reuseRatio });
  registerFeedbackRoute(app, provider);

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
