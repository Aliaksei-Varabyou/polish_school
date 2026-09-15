import { ApiError, GoogleGenAI } from "@google/genai";
import { FatalLLMError, RateLimitError, type JsonRequest, type LLMClient } from "./provider.ts";

const TIMEOUT_MS = 90_000;
const RETRIES = 2;
const DEFAULT_COOLDOWN_MS = 60_000;
/** daily quota exhausted or model unavailable: don't hammer it (quota resets at midnight Pacific) */
const LONG_COOLDOWN_MS = 60 * 60_000;
/** if every model is cooling down for less than this, wait instead of failing */
const MAX_COOLDOWN_WAIT_MS = 20_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`LLM timeout after ${ms}ms`)), ms);
    }),
  ]);
}

/** Reads retryDelay / quota type from a 429 error body. */
export function cooldownFor429(err: ApiError): number {
  type Detail = { retryDelay?: string; violations?: { quotaId?: string }[] };
  let details: Detail[] = [];
  try {
    details = JSON.parse(err.message)?.error?.details ?? [];
  } catch {
    // message is not JSON
  }
  const daily = details.flatMap((d) => d.violations ?? []).some((v) => /PerDay/i.test(v.quotaId ?? ""));
  if (daily) return LONG_COOLDOWN_MS;
  const seconds = parseFloat(details.find((d) => d.retryDelay)?.retryDelay ?? "");
  return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) : DEFAULT_COOLDOWN_MS;
}

type Cooldown = { until: number; reason: "quota" | "unavailable" };

export class GeminiClient implements LLMClient {
  readonly name = "gemini";
  private ai: GoogleGenAI;
  private cooldowns = new Map<string, Cooldown>();

  /** @param models primary model first, then fallbacks (each model has its own free quota) */
  constructor(
    apiKey: string,
    private models: string[],
  ) {
    if (models.length === 0) throw new Error("At least one Gemini model is required");
    this.ai = new GoogleGenAI({ apiKey });
  }

  /** Model availability for /api/health. */
  status() {
    const now = Date.now();
    return this.models.map((model) => {
      const c = this.cooldowns.get(model);
      return c && c.until > now
        ? { model, available: false, reason: c.reason, retryInSec: Math.ceil((c.until - now) / 1000) }
        : { model, available: true };
    });
  }

  private cool(model: string, ms: number, reason: Cooldown["reason"]) {
    this.cooldowns.set(model, { until: Date.now() + ms, reason });
    console.warn(`[gemini] ${model} ${reason}, skipping for ${Math.round(ms / 1000)}s`);
  }

  /** Tries models in order, skipping ones that are cooling down after 429/404. */
  async generateJson({ system, prompt, schema, temperature }: JsonRequest): Promise<unknown> {
    let lastError: unknown;

    for (let pass = 0; pass < 2; pass++) {
      for (const model of this.models) {
        if ((this.cooldowns.get(model)?.until ?? 0) > Date.now()) continue;

        for (let attempt = 0; attempt <= RETRIES; attempt++) {
          try {
            const response = await withTimeout(
              this.ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                  systemInstruction: system,
                  temperature,
                  responseMimeType: "application/json",
                  responseJsonSchema: schema,
                },
              }),
              TIMEOUT_MS,
            );
            const text = response.text;
            if (!text) throw new Error("Empty LLM response");
            return JSON.parse(text);
          } catch (err) {
            lastError = err;
            if (err instanceof ApiError && err.status === 429) {
              this.cool(model, cooldownFor429(err), "quota");
              break;
            }
            if (err instanceof ApiError && err.status === 404) {
              this.cool(model, LONG_COOLDOWN_MS, "unavailable");
              break;
            }
            if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
              throw new FatalLLMError(err.message, err.status);
            }
            if (attempt < RETRIES) await sleep(1000 * 2 ** attempt);
          }
        }
      }

      const active = this.models.map((m) => this.cooldowns.get(m)).filter((c): c is Cooldown => !!c && c.until > Date.now());
      if (active.length < this.models.length) break; // some model failed for another reason
      const waitMs = Math.min(...active.map((c) => c.until)) - Date.now();
      if (pass === 0 && waitMs <= MAX_COOLDOWN_WAIT_MS) {
        await sleep(Math.max(waitMs, 0));
        continue;
      }
      if (active.every((c) => c.reason === "unavailable")) {
        throw new FatalLLMError("No configured Gemini model is available", 404);
      }
      throw new RateLimitError("All Gemini models are rate limited", waitMs);
    }

    throw lastError ?? new Error("LLM call failed");
  }
}
