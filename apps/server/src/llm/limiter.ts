import type { FeedbackRequest } from "@matema/shared";
import { RateLimitError, type LLMProvider, type TaskBatchInput } from "./provider.ts";

export interface LimiterOptions {
  /** max LLM requests in flight across the whole server */
  maxConcurrent: number;
  /** max LLM requests started per rolling minute (0 = unlimited) */
  rpm: number;
  /** give up if a request waits in the queue longer than this */
  maxWaitMs: number;
}

/** Server-wide queue for LLM calls: caps concurrency and requests per minute. */
export class LLMLimiter {
  private active = 0;
  private starts: number[] = [];
  private waiters = new Set<() => void>();

  constructor(private opts: LimiterOptions) {}

  get stats() {
    return { active: this.active, queued: this.waiters.size, startedLastMinute: this.starts.length };
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.active--;
      this.wakeAll();
    }
  }

  private wakeAll() {
    const waiters = [...this.waiters];
    this.waiters.clear();
    for (const wake of waiters) wake();
  }

  private async acquire(): Promise<void> {
    const deadline = Date.now() + this.opts.maxWaitMs;
    for (;;) {
      const now = Date.now();
      this.starts = this.starts.filter((t) => now - t < 60_000);
      const rpmOk = !this.opts.rpm || this.starts.length < this.opts.rpm;
      if (this.active < this.opts.maxConcurrent && rpmOk) {
        this.active++;
        this.starts.push(now);
        return;
      }
      const remaining = deadline - now;
      if (remaining <= 0) throw new RateLimitError("LLM queue is full", rpmOk ? undefined : this.starts[0] + 60_000 - now);
      const windowWait = rpmOk ? remaining : Math.max(this.starts[0] + 60_000 - now, 1);
      await new Promise<void>((resolve) => {
        const wake = () => {
          clearTimeout(timer);
          this.waiters.delete(wake);
          resolve();
        };
        const timer = setTimeout(wake, Math.min(windowWait, remaining));
        this.waiters.add(wake);
      });
    }
  }
}

/** Routes every provider call through the shared limiter. */
export class LimitedProvider implements LLMProvider {
  constructor(
    readonly inner: LLMProvider,
    readonly limiter: LLMLimiter,
  ) {}

  get name() {
    return this.inner.name;
  }

  generateTasks(input: TaskBatchInput) {
    return this.limiter.run(() => this.inner.generateTasks(input));
  }

  generateFeedback(input: FeedbackRequest) {
    return this.limiter.run(() => this.inner.generateFeedback(input));
  }
}
