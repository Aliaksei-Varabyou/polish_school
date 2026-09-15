import { GeminiProvider } from "./gemini.ts";
import { MockProvider } from "./mock.ts";
import type { LLMProvider } from "./provider.ts";

export function createProvider(env = process.env): LLMProvider {
  const kind = env.LLM_PROVIDER ?? (env.GEMINI_API_KEY ? "gemini" : "mock");
  if (kind === "mock") return new MockProvider();
  if (kind === "gemini") {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set (or use LLM_PROVIDER=mock)");
    return new GeminiProvider(
      env.GEMINI_API_KEY,
      env.GEMINI_MODEL || "gemini-2.5-flash",
      env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite",
    );
  }
  throw new Error(`Unknown LLM_PROVIDER: ${kind}`);
}
