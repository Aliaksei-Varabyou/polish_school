import { RateLimitError, type LLMClient } from "@portal/ai";
import { FeedbackRequest, FeedbackResponse } from "@portal/core";
import { generateFeedback } from "@portal/trainer-math/server";
import type { FastifyInstance } from "fastify";

export function registerFeedbackRoute(app: FastifyInstance, client: LLMClient) {
  app.post(
    "/api/feedback",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const parsed = FeedbackRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const req = parsed.data;

      try {
        const raw = await generateFeedback(client, req);
        const feedback = FeedbackResponse.safeParse(raw);
        if (!feedback.success) {
          request.log.warn({ issues: feedback.error.issues }, "invalid feedback from LLM");
          return reply.code(502).send({ error: "Invalid feedback from AI", code: "LLM_ERROR" });
        }
        const known = new Set(req.results.map((r) => r.topicId));
        const data = feedback.data;
        return {
          ...data,
          weakTopics: data.weakTopics.filter((w) => known.has(w.topicId)),
          suggestedTopicIds: [...new Set(data.suggestedTopicIds.filter((id) => known.has(id)))],
        };
      } catch (err) {
        request.log.error({ err }, "feedback failed");
        if (err instanceof RateLimitError) {
          return reply.code(429).send({ error: "AI rate limit reached, try again in a minute", code: "RATE_LIMIT" });
        }
        return reply.code(502).send({ error: "Failed to generate feedback", code: "LLM_ERROR" });
      }
    },
  );
}
