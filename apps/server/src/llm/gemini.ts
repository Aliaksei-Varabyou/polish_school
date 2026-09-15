import { ApiError, GoogleGenAI } from "@google/genai";
import type { FeedbackRequest } from "@matema/shared";
import { buildFeedbackPrompt, FEEDBACK_JSON_SCHEMA, FEEDBACK_SYSTEM_PROMPT } from "../prompts/feedback.ts";
import { buildTasksPrompt, TASKS_JSON_SCHEMA, TASKS_SYSTEM_PROMPT } from "../prompts/generateTasks.ts";
import { RateLimitError, type LLMProvider, type TaskBatchInput } from "./provider.ts";

const TIMEOUT_MS = 90_000;
const RETRIES = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`LLM timeout after ${ms}ms`)), ms)),
  ]);
}

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  private ai: GoogleGenAI;

  constructor(
    apiKey: string,
    private model: string,
    private fallbackModel?: string,
  ) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateTasks(input: TaskBatchInput): Promise<unknown[]> {
    const json = await this.callJson(buildTasksPrompt(input), TASKS_SYSTEM_PROMPT, TASKS_JSON_SCHEMA, 0.9);
    const tasks = (json as { tasks?: unknown }).tasks;
    return Array.isArray(tasks) ? tasks : [];
  }

  async generateFeedback(input: FeedbackRequest): Promise<unknown> {
    return this.callJson(buildFeedbackPrompt(input), FEEDBACK_SYSTEM_PROMPT, FEEDBACK_JSON_SCHEMA, 0.5);
  }

  /** Calls the primary model with retries; on quota errors (429) switches to the fallback model. */
  private async callJson(prompt: string, system: string, schema: object, temperature: number): Promise<unknown> {
    const models = [this.model, this.fallbackModel].filter((m): m is string => !!m);
    let lastError: unknown;

    for (const model of models) {
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
          if (err instanceof ApiError && err.status === 429) break; // quota: try next model
          if (err instanceof ApiError && err.status >= 400 && err.status < 500) throw err; // bad request/key
          await sleep(1000 * 2 ** attempt);
        }
      }
    }

    if (lastError instanceof ApiError && lastError.status === 429) throw new RateLimitError();
    throw lastError;
  }
}
