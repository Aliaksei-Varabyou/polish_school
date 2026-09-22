// Subject-agnostic generation pipeline used by the API for every trainer.
import { FatalLLMError, RateLimitError, type LLMClient } from "@portal/ai";
import {
  FeedbackResponse,
  type AnswerMode,
  type Difficulty,
  type FeedbackRequest,
  type GenerateRequest,
  type Task,
  type TaskKind,
  type TaskSlot,
  type Topic,
} from "@portal/core";
import type { TaskPoolStore } from "@portal/task-pool";
import type { TrainerServer } from "../index.ts";

/** tasks per LLM request (topics are mixed within a batch) */
export const MAX_BATCH = 5;
const MAX_ROUNDS = 3;
const CONCURRENCY = 3;

export interface Logger {
  info(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
  error(obj: object, msg: string): void;
}

const silent: Logger = { info() {}, warn() {}, error() {} };

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

/** Removes the pending slot that best matches an accepted task. */
function claimSlot(pending: TaskSlot[], task: Task): boolean {
  const kind: TaskKind = task.answerType === "choice" ? "choice" : "input";
  let idx = pending.findIndex((s) => s.topic.id === task.topicId && s.kind === kind);
  if (idx === -1) idx = pending.findIndex((s) => s.topic.id === task.topicId);
  if (idx === -1) return false;
  pending.splice(idx, 1);
  return true;
}

export interface GenerateDeps {
  trainer: TrainerServer;
  client: LLMClient;
  pool?: TaskPoolStore;
  /** share of tasks taken from the pool when available (0..1) */
  reuseRatio?: number;
  log?: Logger;
}

export interface GenerateStats {
  requested: number;
  reused: number;
  poolTopUp: number;
  generated: number;
  rejected: number;
  llmCalls: number;
}

export type GenerateOutcome =
  | { ok: true; tasks: Task[]; stats: GenerateStats }
  | { ok: false; code: "BAD_TOPICS" | "RATE_LIMIT" | "LLM_ERROR"; stats?: GenerateStats };

/**
 * 1) reuse unseen verified tasks from the pool, 2) generate the rest in mixed-topic batches,
 * verify and store them, 3) fill remaining gaps from the pool if the AI failed.
 */
export async function generateTasks(req: GenerateRequest, deps: GenerateDeps): Promise<GenerateOutcome> {
  const { trainer, client, pool, log = silent } = deps;
  // an offline-first trainer (content rendered from templates, no LLM) drains the pool instead
  const reuseRatio = deps.reuseRatio ?? trainer.reuseRatio ?? 0.5;
  const usesLLM = trainer.usesLLM ?? true;
  const ctx = { trainerId: trainer.id, lang: req.lang, grade: req.grade, level: req.level };
  const allowed = new Map(trainer.topicsFor(req.grade, req.level).map((t) => [t.id, t]));
  const topics = req.topicIds.map((id) => allowed.get(id)).filter((t): t is Topic => !!t);
  if (topics.length === 0) return { ok: false, code: "BAD_TOPICS" };

  let pending = planSlots(topics, req.count, req.answerMode);
  const exclude = new Set(req.excludeIds ?? []);
  const fromPool: Task[] = [];

  const takeFromPool = async (slot: TaskSlot, strictKind: boolean) => {
    if (!pool) return false;
    const [task] = await pool.take({
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
    if (await takeFromPool(slot, true)) pending = pending.filter((s) => s !== slot);
  }

  // 2) generate the rest; topics are mixed within a batch to save requests
  const generated: Task[] = [];
  let lastError: unknown;
  let stop = false; // set on errors that make further requests pointless
  let rejected = 0;
  let llmCalls = 0;

  for (let round = 0; usesLLM && round < MAX_ROUNDS && pending.length > 0 && !stop; round++) {
    await mapLimit(chunk(pending, MAX_BATCH), CONCURRENCY, async (slots) => {
      if (stop) return;
      try {
        llmCalls++;
        const raw = await trainer.generateTaskBatch(client, { lang: req.lang, grade: req.grade, level: req.level, slots });
        const allowedTopicIds = [...new Set(slots.map((s) => s.topic.id))];
        for (const item of raw) {
          const result = trainer.verifyTask(item, { allowedTopicIds, answerMode: req.answerMode });
          if (!result.ok) {
            const { reason } = result as Extract<typeof result, { ok: false }>;
            rejected++;
            log.warn({ trainer: trainer.id, reason }, "task rejected");
          } else if (claimSlot(pending, result.task)) {
            generated.push(result.task);
          }
        }
      } catch (err) {
        lastError = err;
        log.error({ err, trainer: trainer.id }, "generation batch failed");
        if (err instanceof RateLimitError || err instanceof FatalLLMError) stop = true;
      }
    });
  }

  if (pool && generated.length > 0) {
    // the practice session must not fail because the pool is unavailable
    await pool.add(generated, ctx).catch((err) => log.error({ err, trainer: trainer.id }, "failed to store tasks in the pool"));
  }

  // 3) AI failed or quota exhausted: fill the gaps from the pool
  // (tasks generated in this request are already pooled — don't serve them twice)
  for (const t of generated) exclude.add(t.id);
  const reused = fromPool.length;
  for (const slot of [...pending]) {
    if (await takeFromPool(slot, false)) pending = pending.filter((s) => s !== slot);
  }

  const stats: GenerateStats = {
    requested: req.count,
    reused,
    poolTopUp: fromPool.length - reused,
    generated: generated.length,
    rejected,
    llmCalls,
  };
  log.info({ trainer: trainer.id, provider: client.name, ...stats }, "generate done");

  const tasks = [...fromPool, ...generated];
  if (tasks.length === 0) return { ok: false, code: lastError instanceof RateLimitError ? "RATE_LIMIT" : "LLM_ERROR", stats };

  // mixed topics, easier tasks first — like a real test
  return { ok: true, tasks: shuffle(tasks).sort((a, b) => a.difficulty - b.difficulty), stats };
}

export type FeedbackOutcome = { ok: true; data: FeedbackResponse } | { ok: false; code: "RATE_LIMIT" | "LLM_ERROR" };

/** Asks the trainer for feedback, validates it and keeps only topics present in the results. */
export async function generateFeedback(
  req: FeedbackRequest,
  { trainer, client, log = silent }: Pick<GenerateDeps, "trainer" | "client" | "log">,
): Promise<FeedbackOutcome> {
  try {
    const parsed = FeedbackResponse.safeParse(await trainer.generateFeedback(client, req));
    if (!parsed.success) {
      log.warn({ trainer: trainer.id, issues: parsed.error.issues }, "invalid feedback from LLM");
      return { ok: false, code: "LLM_ERROR" };
    }
    const known = new Set(req.results.map((r) => r.topicId));
    const data = parsed.data;
    return {
      ok: true,
      data: {
        ...data,
        weakTopics: data.weakTopics.filter((w) => known.has(w.topicId)),
        suggestedTopicIds: [...new Set(data.suggestedTopicIds.filter((id) => known.has(id)))],
      },
    };
  } catch (err) {
    log.error({ err, trainer: trainer.id }, "feedback failed");
    return { ok: false, code: err instanceof RateLimitError ? "RATE_LIMIT" : "LLM_ERROR" };
  }
}
