import { AnswerRequest } from "@portal/core";
import type { PortalDb } from "@portal/db";
import type { TrainerServer } from "@portal/trainer-sdk";
import type { FastifyInstance } from "fastify";
import { isUuid, requireUser } from "../auth.ts";

type SessionParams = { Params: { sessionId: string } };

/** Answers and completion of a stored practice session. Answers are re-checked on the server. */
export function registerSessionRoutes(app: FastifyInstance, trainers: Map<string, TrainerServer>, db?: PortalDb) {
  app.post<SessionParams>("/api/sessions/:sessionId/answers", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const parsed = AnswerRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid answer", code: "BAD_REQUEST" });
    }
    const { sessionId } = request.params;
    const { position, answer, usedHint } = parsed.data;

    const stored = isUuid(sessionId) ? await auth.db.getSessionTask(sessionId, auth.user.id, position) : null;
    if (!stored) return reply.code(404).send({ error: "Task not found", code: "NOT_FOUND" });
    if (stored.answered) return reply.code(409).send({ error: "Task already answered", code: "ALREADY_ANSWERED" });

    const trainer = trainers.get(stored.trainerId);
    if (!trainer) return reply.code(500).send({ error: `Trainer ${stored.trainerId} is not available`, code: "UNKNOWN_TRAINER" });

    const correct = trainer.checkAnswer(stored.task, answer);
    const recorded = await auth.db.recordAnswer(sessionId, position, { answer, correct, usedHint });
    if (!recorded) return reply.code(409).send({ error: "Task already answered", code: "ALREADY_ANSWERED" });
    return { correct };
  });

  app.post<SessionParams>("/api/sessions/:sessionId/finish", async (request, reply) => {
    const auth = requireUser(request, reply, db);
    if (!auth) return reply;
    const summary = isUuid(request.params.sessionId) ? await auth.db.finishSession(request.params.sessionId, auth.user.id) : null;
    if (!summary) return reply.code(404).send({ error: "Session not found", code: "NOT_FOUND" });
    const { tasks: _tasks, feedback: _feedback, ...rest } = summary as typeof summary & { tasks?: unknown; feedback?: unknown };
    return rest;
  });
}
