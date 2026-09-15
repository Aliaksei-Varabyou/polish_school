import { GeminiClient } from "./gemini.ts";
import { LimitedClient, LLMLimiter } from "./limiter.ts";
import { MockClient } from "./mock.ts";
import type { LLMClient } from "./provider.ts";

export * from "./provider.ts";
export { cooldownFor429, GeminiClient } from "./gemini.ts";
export { LimitedClient, LLMLimiter, type LimiterOptions } from "./limiter.ts";
export { MockClient } from "./mock.ts";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_FALLBACKS = "gemini-3.1-flash-lite,gemini-3.6-flash";

const num = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(n) ? n : fallback;
};

/** Builds the LLM client from env (LLM_PROVIDER, GEMINI_*, LLM_*) wrapped in the server-wide queue. */
export function createLLMClient(env: Record<string, string | undefined> = process.env): LimitedClient {
  const kind = env.LLM_PROVIDER ?? (env.GEMINI_API_KEY ? "gemini" : "mock");
  let inner: LLMClient;

  if (kind === "mock") {
    inner = new MockClient();
  } else if (kind === "gemini") {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set (or use LLM_PROVIDER=mock)");
    const models = [env.GEMINI_MODEL || DEFAULT_MODEL, ...(env.GEMINI_FALLBACK_MODEL ?? DEFAULT_FALLBACKS).split(",")]
      .map((m) => m.trim())
      .filter((m, i, all) => m && all.indexOf(m) === i);
    inner = new GeminiClient(env.GEMINI_API_KEY, models);
  } else {
    throw new Error(`Unknown LLM_PROVIDER: ${kind}`);
  }

  const limiter = new LLMLimiter({
    maxConcurrent: num(env.LLM_MAX_CONCURRENT, 4),
    rpm: num(env.LLM_RPM, kind === "mock" ? 0 : 15),
    maxWaitMs: num(env.LLM_QUEUE_WAIT_MS, 45_000),
  });
  return new LimitedClient(inner, limiter);
}
