import {
  GenerateRequest,
  topicsFor,
  type Difficulty,
  type Task,
  type Topic,
} from "@matema/shared";
import type { FastifyInstance } from "fastify";
import { FatalLLMError, RateLimitError, type LLMProvider } from "../llm/provider.ts";
import { verifyTask } from "../validation/verifyTask.ts";

const MAX_BATCH = 5;
const MAX_ROUNDS = 3;
const CONCURRENCY = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** ~30% easy, ~50% medium, ~20% hard. */
export function difficultyMix(count: number): Difficulty[] {
  const hard = Math.round(count * 0.2);
  const easy = Math.round(count * 0.3);
  const medium = count - hard - easy;
  return shuffle([...Array(easy).fill(1), ...Array(medium).fill(2), ...Array(hard).fill(3)]);
}

/** Splits `count` tasks across topics as evenly as possible. */
export function planTopics(topics: Topic[], count: number): { topic: Topic; difficulties: Difficulty[] }[] {
  const chosen = topics.length > count ? shuffle(topics).slice(0, count) : shuffle(topics);
  const diffs = difficultyMix(count);
  const base = Math.floor(count / chosen.length);
  let extra = count % chosen.length;
  let offset = 0;
  return chosen.map((topic) => {
    const n = base + (extra-- > 0 ? 1 : 0);
    const difficulties = diffs.slice(offset, offset + n);
    offset += n;
    return { topic, difficulties };
  });
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export function registerGenerateRoute(app: FastifyInstance, provider: LLMProvider) {
  app.post(
    "/api/generate",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const parsed = GenerateRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const req = parsed.data;
      const allowed = new Map(topicsFor(req.grade, req.level).map((t) => [t.id, t]));
      const topics = req.topicIds.map((id) => allowed.get(id)).filter((t): t is Topic => !!t);
      if (topics.length === 0) return reply.code(400).send({ error: "No valid topics", code: "BAD_TOPICS" });

      const plan = planTopics(topics, req.count);
      let lastError: unknown;
      let stop = false; // set on errors that make further requests pointless
      let rejected = 0;

      const collected = await mapLimit(plan, CONCURRENCY, async ({ topic, difficulties }) => {
        const tasks: Task[] = [];
        for (let round = 0; round < MAX_ROUNDS && tasks.length < difficulties.length && !stop; round++) {
          const missing = difficulties.slice(tasks.length);
          for (let i = 0; i < missing.length && !stop; i += MAX_BATCH) {
            const batch = missing.slice(i, i + MAX_BATCH);
            try {
              const raw = await provider.generateTasks({ ...req, topic, difficulties: batch });
              for (const item of raw) {
                if (tasks.length >= difficulties.length) break;
                const result = verifyTask(item, { topicId: topic.id, answerMode: req.answerMode });
                if (result.ok) tasks.push(result.task);
                else {
                  rejected++;
                  request.log.warn({ topic: topic.id, reason: result.reason }, "task rejected");
                }
              }
            } catch (err) {
              lastError = err;
              request.log.error({ err, topic: topic.id }, "generation batch failed");
              if (err instanceof RateLimitError || err instanceof FatalLLMError) {
                stop = true;
                return tasks;
              }
            }
          }
        }
        return tasks;
      });

      const tasks = collected.flat();
      request.log.info({ requested: req.count, generated: tasks.length, rejected, provider: provider.name }, "generate done");

      if (tasks.length === 0) {
        if (lastError instanceof RateLimitError) {
          return reply.code(429).send({ error: "AI rate limit reached, try again in a minute", code: "RATE_LIMIT" });
        }
        return reply.code(502).send({ error: "Failed to generate tasks", code: "LLM_ERROR" });
      }

      // mixed topics, easier tasks first — like a real test
      const ordered = shuffle(tasks).sort((a, b) => a.difficulty - b.difficulty);
      return { tasks: ordered };
    },
  );
}
