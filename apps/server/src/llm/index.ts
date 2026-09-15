import { GeminiProvider } from "./gemini.ts";
import { LimitedProvider, LLMLimiter } from "./limiter.ts";
import { MockProvider } from "./mock.ts";
import type { LLMProvider } from "./provider.ts";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_FALLBACKS = "gemini-3.1-flash-lite,gemini-3.6-flash";

const num = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(n) ? n : fallback;
};

export function createProvider(env = process.env): LimitedProvider {
  const kind = env.LLM_PROVIDER ?? (env.GEMINI_API_KEY ? "gemini" : "mock");
  let inner: LLMProvider;

  if (kind === "mock") {
    inner = new MockProvider();
  } else if (kind === "gemini") {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set (or use LLM_PROVIDER=mock)");
    const models = [env.GEMINI_MODEL || DEFAULT_MODEL, ...(env.GEMINI_FALLBACK_MODEL ?? DEFAULT_FALLBACKS).split(",")]
      .map((m) => m.trim())
      .filter((m, i, all) => m && all.indexOf(m) === i);
    inner = new GeminiProvider(env.GEMINI_API_KEY, models);
  } else {
    throw new Error(`Unknown LLM_PROVIDER: ${kind}`);
  }

  const limiter = new LLMLimiter({
    maxConcurrent: num(env.LLM_MAX_CONCURRENT, 4),
    rpm: num(env.LLM_RPM, kind === "mock" ? 0 : 15),
    maxWaitMs: num(env.LLM_QUEUE_WAIT_MS, 45_000),
  });
  return new LimitedProvider(inner, limiter);
}
