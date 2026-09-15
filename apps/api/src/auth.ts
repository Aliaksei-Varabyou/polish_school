import type { AuthUser, PortalDb } from "@portal/db";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    /** signed-in user (verified Supabase access token) or null for guests */
    user: AuthUser | null;
  }
}

/**
 * Reads `Authorization: Bearer <supabase access token>` on API requests.
 * No header → guest. A header with an invalid or expired token → 401, so the client refreshes its session.
 */
export function registerAuth(app: FastifyInstance, db?: PortalDb) {
  app.decorateRequest("user", null);

  app.addHook("preHandler", async (request, reply) => {
    request.user = null;
    const header = request.headers.authorization;
    if (!db || !header?.startsWith("Bearer ") || request.url === "/api/health") return;

    const user = await db.userFromToken(header.slice("Bearer ".length).trim());
    if (!user) return reply.code(401).send({ error: "Invalid or expired session", code: "UNAUTHORIZED" });
    request.user = user;
  });
}

/** Sends 503/401 and returns null unless accounts are configured and the user is signed in. */
export function requireUser(request: FastifyRequest, reply: FastifyReply, db?: PortalDb): { user: AuthUser; db: PortalDb } | null {
  if (!db) {
    reply.code(503).send({ error: "Accounts are not configured", code: "AUTH_DISABLED" });
    return null;
  }
  if (!request.user) {
    reply.code(401).send({ error: "Sign in required", code: "UNAUTHORIZED" });
    return null;
  }
  return { user: request.user, db };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);
