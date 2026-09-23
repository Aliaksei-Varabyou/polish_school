import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { LimitedClient, type LLMClient } from "@portal/ai";
import type { PortalDb } from "@portal/db";
import type { TaskPoolStore } from "@portal/task-pool";
import type { TrainerServer } from "@portal/trainer-sdk";
import Fastify from "fastify";
import { registerAuth } from "./auth.ts";
import { createMailer, type Mailer } from "./mailer.ts";
import { registerConsentRoutes } from "./routes/consent.ts";
import { registerCronRoutes } from "./routes/cron.ts";
import { registerMeRoutes } from "./routes/me.ts";
import { registerSessionRoutes } from "./routes/sessions.ts";
import { registerTaskRoutes } from "./routes/tasks.ts";
import { registerTrainerRoutes } from "./routes/trainers.ts";
import { trainers as defaultTrainers } from "./trainers.ts";

const WEB_DIST = resolve(dirname(fileURLToPath(import.meta.url)), "../../web/dist");

export interface AppOptions {
  logger?: boolean;
  pool?: TaskPoolStore;
  reuseRatio?: number;
  trainers?: Map<string, TrainerServer>;
  /** accounts, profiles and history (Supabase); omitted = guest mode only */
  db?: PortalDb;
  /** e-mail sending (parental consent); defaults to SMTP from env or logging */
  mailer?: Mailer;
  /** public base URL used in e-mail links */
  publicUrl?: string;
  /** serve apps/web/dist when it exists (disabled in tests) */
  serveWeb?: boolean;
  /**
   * Per-IP request limits. Off only for the end-to-end suite (DISABLE_RATE_LIMIT=1): it runs every
   * flow from one address within seconds, page assets included, and would trip them by volume alone.
   */
  rateLimit?: boolean;
}

export async function buildApp(
  client: LLMClient,
  {
    logger = true,
    pool,
    reuseRatio,
    trainers = defaultTrainers,
    db,
    mailer = createMailer(),
    publicUrl = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 8787}`,
    serveWeb = true,
    rateLimit: limitRequests = process.env.DISABLE_RATE_LIMIT !== "1",
  }: AppOptions = {},
) {
  const app = Fastify({ logger, bodyLimit: 256 * 1024 });

  await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") ?? true });
  if (limitRequests) await app.register(rateLimit, { global: true, max: 120, timeWindow: "1 minute" });
  registerAuth(app, db);

  app.get("/api/health", async () => {
    const inner = client instanceof LimitedClient ? client.inner : client;
    const models = (inner as { status?: () => unknown }).status?.();
    const poolSize = pool ? await pool.count().catch(() => null) : undefined;
    return {
      ok: true,
      provider: client.name,
      trainers: [...trainers.keys()],
      auth: !!db,
      ...(models ? { models } : {}),
      ...(client instanceof LimitedClient ? { queue: client.limiter.stats } : {}),
      ...(poolSize !== undefined ? { poolSize } : {}),
    };
  });
  registerTrainerRoutes(app, { client, trainers, pool, reuseRatio, db });
  registerSessionRoutes(app, trainers, db);
  registerTaskRoutes(app, pool);
  registerMeRoutes(app, db);
  registerConsentRoutes(app, { db, mailer, publicUrl });
  registerCronRoutes(app, db);

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
