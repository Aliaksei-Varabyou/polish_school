import type { LLMClient } from "@portal/ai";
import { FeedbackRequest, GenerateRequest, Grade, Level } from "@portal/core";
import type { TaskPool } from "@portal/task-pool";
import type { TrainerServer } from "@portal/trainer-sdk";
import { generateFeedback, generateTasks } from "@portal/trainer-sdk/server";
import type { FastifyInstance, FastifyReply } from "fastify";

export interface TrainerRoutesOptions {
  client: LLMClient;
  trainers: Map<string, TrainerServer>;
  pool?: TaskPool;
  reuseRatio?: number;
}

const STATUS = { BAD_TOPICS: 400, RATE_LIMIT: 429, LLM_ERROR: 502 } as const;
const MESSAGES = {
  BAD_TOPICS: "No valid topics",
  RATE_LIMIT: "AI rate limit reached, try again later",
  LLM_ERROR: "AI request failed",
} as const;

type TrainerParams = { Params: { trainerId: string } };

export function registerTrainerRoutes(app: FastifyInstance, { client, trainers, pool, reuseRatio }: TrainerRoutesOptions) {
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
      const outcome = await generateTasks(parsed.data, { trainer, client, pool, reuseRatio, log: request.log });
      if (!outcome.ok) return reply.code(STATUS[outcome.code]).send({ error: MESSAGES[outcome.code], code: outcome.code });
      return { tasks: outcome.tasks };
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
      if (!outcome.ok) return reply.code(STATUS[outcome.code]).send({ error: MESSAGES[outcome.code], code: outcome.code });
      return outcome.data;
    },
  );
}
