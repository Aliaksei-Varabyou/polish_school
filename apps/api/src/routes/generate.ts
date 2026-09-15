import { FatalLLMError, RateLimitError, type LLMClient } from "@portal/ai";
import {
  GenerateRequest,
  type AnswerMode,
  type Difficulty,
  type Task,
  type TaskKind,
  type TaskSlot,
  type Topic,
} from "@portal/core";
import type { TaskPool } from "@portal/task-pool";
import { topicsFor } from "@portal/trainer-math";
import { generateTaskBatch, verifyTask } from "@portal/trainer-math/server";
import type { FastifyInstance } from "fastify";

/** tasks per LLM request (topics are mixed within a batch) */
export const MAX_BATCH = 5;
const MAX_ROUNDS = 3;
const CONCURRENCY = 3;

export interface GenerateRouteOptions {
  pool?: TaskPool;
  /** share of tasks taken from the pool when available (0..1) */
  reuseRatio?: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** ~30% easy, ~50% medium, ~20% hard. */
export function difficultyMix(count: number): Difficulty[] {
  const hard = Math.round(count * 0.2);
  const easy = Math.round(count * 0.3);
  const medium = count - hard - easy;
  return shuffle([...Array(easy).fill(1), ...Array(medium).fill(2), ...Array(hard).fill(3)]);
}

/** Splits `count` tasks across topics as evenly as possible; slots are grouped by topic. */
export function planSlots(topics: Topic[], count: number, answerMode: AnswerMode): TaskSlot[] {
  const chosen = topics.length > count ? shuffle(topics).slice(0, count) : shuffle(topics);
  const diffs = difficultyMix(count);
  const base = Math.floor(count / chosen.length);
  let extra = count % chosen.length;
  const slots: TaskSlot[] = [];
  for (const topic of chosen) {
    const n = base + (extra-- > 0 ? 1 : 0);
    for (let i = 0; i < n; i++) slots.push({ topic, difficulty: diffs[slots.length], kind: "input" });
  }
  const kinds = shuffle(slots.map((_, i): TaskKind => (answerMode === "mixed" ? (i % 2 ? "choice" : "input") : answerMode)));
  slots.forEach((s, i) => (s.kind = kinds[i]));
  return slots;
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

/** Removes and returns the pending slot that best matches an accepted task. */
function claimSlot(pending: TaskSlot[], task: Task): boolean {
  const kind: TaskKind = task.answerType === "choice" ? "choice" : "input";
  let idx = pending.findIndex((s) => s.topic.id === task.topicId && s.kind === kind);
  if (idx === -1) idx = pending.findIndex((s) => s.topic.id === task.topicId);
  if (idx === -1) return false;
  pending.splice(idx, 1);
  return true;
}

export function registerGenerateRoute(app: FastifyInstance, client: LLMClient, opts: GenerateRouteOptions = {}) {
  const { pool, reuseRatio = 0.5 } = opts;

  app.post(
    "/api/generate",
    { config: { rateLimit: { max: 8, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const parsed = GenerateRequest.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid request", code: "BAD_REQUEST" });
      }
      const req = parsed.data;
      const ctx = { lang: req.lang, grade: req.grade, level: req.level };
      const allowed = new Map(topicsFor(req.grade, req.level).map((t) => [t.id, t]));
      const topics = req.topicIds.map((id) => allowed.get(id)).filter((t): t is Topic => !!t);
      if (topics.length === 0) return reply.code(400).send({ error: "No valid topics", code: "BAD_TOPICS" });

      let pending = planSlots(topics, req.count, req.answerMode);
      const exclude = new Set(req.excludeIds ?? []);
      const fromPool: Task[] = [];

      const takeFromPool = (slot: TaskSlot, strictKind: boolean) => {
        if (!pool) return false;
        const [task] = pool.take({
          ...ctx,
          topicId: slot.topic.id,
          answerMode: strictKind ? slot.kind : req.answerMode,
          difficulty: slot.difficulty,
          excludeIds: [...exclude],
          limit: 1,
        });
        if (!task) return false;
        exclude.add(task.id);
        fromPool.push(task);
        return true;
      };

      // 1) reuse verified tasks the student hasn't seen
      const reuseTarget = pool ? Math.floor(req.count * reuseRatio) : 0;
      for (const slot of shuffle(pending)) {
        if (fromPool.length >= reuseTarget) break;
        if (takeFromPool(slot, true)) pending = pending.filter((s) => s !== slot);
      }

      // 2) generate the rest; topics are mixed within a batch to save requests
      const generated: Task[] = [];
      let lastError: unknown;
      let stop = false; // set on errors that make further requests pointless
      let rejected = 0;
      let llmCalls = 0;

      for (let round = 0; round < MAX_ROUNDS && pending.length > 0 && !stop; round++) {
        const batches = chunk(pending, MAX_BATCH);
        await mapLimit(batches, CONCURRENCY, async (slots) => {
          if (stop) return;
          try {
            llmCalls++;
            const raw = await generateTaskBatch(client, { ...ctx, slots });
            const allowedTopicIds = [...new Set(slots.map((s) => s.topic.id))];
            for (const item of raw) {
              const result = verifyTask(item, { allowedTopicIds, answerMode: req.answerMode });
              if (!result.ok) {
                rejected++;
                request.log.warn({ reason: result.reason }, "task rejected");
              } else if (claimSlot(pending, result.task)) {
                generated.push(result.task);
              }
            }
          } catch (err) {
            lastError = err;
            request.log.error({ err }, "generation batch failed");
            if (err instanceof RateLimitError || err instanceof FatalLLMError) stop = true;
          }
        });
      }

      if (pool && generated.length > 0) pool.add(generated, ctx);

      // 3) AI failed or quota exhausted: fill the gaps from the pool
      // (tasks generated in this request are already pooled — don't serve them twice)
      for (const t of generated) exclude.add(t.id);
      const reusedCount = fromPool.length;
      for (const slot of [...pending]) {
        if (takeFromPool(slot, false)) pending = pending.filter((s) => s !== slot);
      }

      const tasks = [...fromPool, ...generated];
      request.log.info(
        {
          requested: req.count,
          reused: reusedCount,
          poolTopUp: fromPool.length - reusedCount,
          generated: generated.length,
          rejected,
          llmCalls,
          provider: client.name,
        },
        "generate done",
      );

      if (tasks.length === 0) {
        if (lastError instanceof RateLimitError) {
          return reply.code(429).send({ error: "AI rate limit reached, try again later", code: "RATE_LIMIT" });
        }
        return reply.code(502).send({ error: "Failed to generate tasks", code: "LLM_ERROR" });
      }

      // mixed topics, easier tasks first — like a real test
      const ordered = shuffle(tasks).sort((a, b) => a.difficulty - b.difficulty);
      return { tasks: ordered };
    },
  );
}
