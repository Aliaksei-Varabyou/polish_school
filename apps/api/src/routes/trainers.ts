import type { LLMClient } from "@portal/ai";
import { FeedbackRequest, GenerateRequest, Grade, Level } from "@portal/core";
import type { PortalDb } from "@portal/db";
import type { TaskPoolStore } from "@portal/task-pool";
import type { TrainerServer } from "@portal/trainer-sdk";
import { generateFeedback, generateTasks } from "@portal/trainer-sdk/server";
import type { FastifyInstance, FastifyReply } from "fastify";

export interface TrainerRoutesOptions {
  client: LLMClient;
  trainers: Map<string, TrainerServer>;
  pool?: TaskPoolStore;
  reuseRatio?: number;
  /** accounts: sessions of signed-in users are stored in history */
  db?: PortalDb;
}

const STATUS = { BAD_TOPICS: 400, RATE_LIMIT: 429, LLM_ERROR: 502 } as const;
const MESSAGES = {
  BAD_TOPICS: "No valid topics",
  RATE_LIMIT: "AI rate limit reached, try again later",
  LLM_ERROR: "AI request failed",
} as const;

type TrainerParams = { Params: { trainerId: string } };

export function registerTrainerRoutes(app: FastifyInstance, { client, trainers, pool, reuseRatio, db }: TrainerRoutesOptions) {
  const findTrainer = (id: string, reply: FastifyReply) => {
    const trainer = trainers.get(id);
    if (!trainer) reply.code(404).send({ error: `Unknown trainer: ${id}`, code: "UNKNOWN_TRAINER" });
    return trainer;
  };

  app.get("/api/trainers", async () => ({ trainers: [...trainers.keys()].map((id) => ({ id })) }));

  app.get<TrainerParams & { Querystring: { grade?: string; level?: string } }>(
    "/api/trainers/:trainerId/topics",
    async (request, reply) => {
      const trainer = findTrainer(request.params.trainerId, reply);
      if (!trainer) return reply;
      const grade = Grade.safeParse(request.query.grade);
      if (!grade.success) return reply.code(400).send({ error: "grade is required", code: "BAD_REQUEST" });
      const level = Level.safeParse(request.query.level);
      return { topics: trainer.topicsFor(grade.data, level.success ? level.data : undefined) };
    },
  );

  app.post<TrainerParams>(
    "/api/trainers/:trainerId/generate",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const trainer = findTrainer(request.params.trainerId, reply);
      if (!trainer) return reply;
      const parsed = GenerateRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const req = parsed.data;
      const user = db ? request.user : null;

      // signed-in users: never repeat tasks from their history
      if (user && db) {
        const seen = await db.seenTaskIds(user.id, trainer.id);
        req.excludeIds = [...new Set([...(req.excludeIds ?? []), ...seen])];
      }

      const outcome = await generateTasks(req, { trainer, client, pool, reuseRatio, log: request.log });
      if (!outcome.ok) {
        const { code } = outcome as Extract<typeof outcome, { ok: false }>;
        return reply.code(STATUS[code]).send({ error: MESSAGES[code], code });
      }

      if (!user || !db) return { tasks: outcome.tasks };

      try {
        // under 16 (or birth year unknown) without a parent's confirmed consent: practice, but no history
        if (!(await db.canStoreHistory(user.id))) return { tasks: outcome.tasks };
        const { lang, grade, level, topicIds, count, answerMode } = req;
        const sessionId = await db.createSession(user.id, trainer.id, { lang, grade, level, topicIds, count, answerMode }, outcome.tasks);
        return { tasks: outcome.tasks, sessionId };
      } catch (err) {
        // practice must not fail because history could not be saved
        request.log.error({ err }, "failed to store session");
        return { tasks: outcome.tasks };
      }
    },
  );

  app.post<TrainerParams>(
    "/api/trainers/:trainerId/feedback",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const trainer = findTrainer(request.params.trainerId, reply);
      if (!trainer) return reply;
      const parsed = FeedbackRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const outcome = await generateFeedback(parsed.data, { trainer, client, log: request.log });
      if (!outcome.ok) {
        const { code } = outcome as Extract<typeof outcome, { ok: false }>;
        return reply.code(STATUS[code]).send({ error: MESSAGES[code], code });
      }

      const { sessionId } = parsed.data;
      if (db && request.user && sessionId) {
        await db.saveFeedback(sessionId, request.user.id, outcome.data).catch((err) => request.log.error({ err }, "failed to store feedback"));
      }
      return outcome.data;
    },
  );
}
