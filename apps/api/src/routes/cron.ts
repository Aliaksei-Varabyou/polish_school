import type { PortalDb } from "@portal/db";
import type { FastifyInstance } from "fastify";

/**
 * Scheduled maintenance, meant to be hit by a cron trigger (Vercel Cron, or any external scheduler)
 * rather than run via `setInterval` — that only works on a long-lived Node process (see src/index.ts),
 * not on serverless deployments where each invocation is its own process.
 */
export function registerCronRoutes(app: FastifyInstance, db?: PortalDb) {
  app.get("/api/cron/cleanup-consents", async (request, reply) => {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.authorization !== `Bearer ${secret}`) {
      return reply.code(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
    if (!db) return { deleted: 0, note: "accounts are not configured" };
    const deleted = await db.deleteUnconfirmedMinors();
    if (deleted > 0) request.log.info({ deleted }, "deleted accounts without parental consent");
    return { deleted };
  });
}
