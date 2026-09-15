import { ApiError } from "@google/genai";
import { describe, expect, it } from "vitest";
import { cooldownFor429 } from "./gemini.ts";
import { LLMLimiter } from "./limiter.ts";
import { RateLimitError } from "./provider.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("LLMLimiter", () => {
  it("caps concurrent requests", async () => {
    const limiter = new LLMLimiter({ maxConcurrent: 2, rpm: 0, maxWaitMs: 5_000 });
    let active = 0;
    let peak = 0;
    const job = async () => {
      active++;
      peak = Math.max(peak, active);
      await sleep(20);
      active--;
      return true;
    };
    const results = await Promise.all(Array.from({ length: 6 }, () => limiter.run(job)));
    expect(results.every(Boolean)).toBe(true);
    expect(peak).toBe(2);
  });

  it("caps requests per minute and gives up after maxWaitMs", async () => {
    const limiter = new LLMLimiter({ maxConcurrent: 10, rpm: 3, maxWaitMs: 50 });
    for (let i = 0; i < 3; i++) await limiter.run(async () => i);
    const started = Date.now();
    await expect(limiter.run(async () => 4)).rejects.toBeInstanceOf(RateLimitError);
    expect(Date.now() - started).toBeGreaterThanOrEqual(45);
    expect(limiter.stats.startedLastMinute).toBe(3);
  });

  it("releases the slot when a job throws", async () => {
    const limiter = new LLMLimiter({ maxConcurrent: 1, rpm: 0, maxWaitMs: 100 });
    await expect(limiter.run(async () => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
    await expect(limiter.run(async () => "ok")).resolves.toBe("ok");
  });
});

describe("cooldownFor429", () => {
  const error = (body: unknown) => new ApiError({ message: JSON.stringify(body), status: 429 });

  it("backs off for an hour when the daily quota is exhausted", () => {
    const err = error({ error: { details: [{ violations: [{ quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier" }] }, { retryDelay: "56s" }] } });
    expect(cooldownFor429(err)).toBe(60 * 60_000);
  });

  it("uses retryDelay for per-minute limits", () => {
    const err = error({ error: { details: [{ violations: [{ quotaId: "GenerateRequestsPerMinutePerProjectPerModel-FreeTier" }] }, { retryDelay: "12.5s" }] } });
    expect(cooldownFor429(err)).toBe(12_500);
  });

  it("defaults to a minute when the body is not parseable", () => {
    expect(cooldownFor429(new ApiError({ message: "quota", status: 429 }))).toBe(60_000);
  });
});
