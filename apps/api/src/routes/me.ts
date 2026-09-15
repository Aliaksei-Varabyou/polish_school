import { ProfileUpdate } from "@portal/core";
import type { PortalDb } from "@portal/db";
import type { FastifyInstance } from "fastify";
import { isUuid, requireUser } from "../auth.ts";

/** Profile, history and progress of the signed-in student. */
export function registerMeRoutes(app: FastifyInstance, db?: PortalDb) {
  app.get("/api/me/profile", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const profile = await auth.db.getProfile(auth.user);
    return profile ?? reply.code(404).send({ error: "Profile not found", code: "NOT_FOUND" });
  });

  app.patch("/api/me/profile", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const parsed = ProfileUpdate.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid profile", code: "BAD_REQUEST" });
    }
    const profile = await auth.db.updateProfile(auth.user, parsed.data);
    return profile ?? reply.code(404).send({ error: "Profile not found", code: "NOT_FOUND" });
  });

  app.get<{ Querystring: { limit?: string; before?: string } }>("/api/me/sessions", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const limit = Number(request.query.limit ?? 20);
    const before = request.query.before && !Number.isNaN(Date.parse(request.query.before)) ? request.query.before : undefined;
    const sessions = await auth.db.listSessions(auth.user.id, { limit: Number.isFinite(limit) ? limit : 20, before });
    return { sessions };
  });

  app.get<{ Params: { sessionId: string } }>("/api/me/sessions/:sessionId", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const detail = isUuid(request.params.sessionId) ? await auth.db.getSessionDetail(request.params.sessionId, auth.user.id) : null;
    return detail ?? reply.code(404).send({ error: "Session not found", code: "NOT_FOUND" });
  });

  app.get("/api/me/progress", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    return auth.db.progress(auth.user.id);
  });
}
