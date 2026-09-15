export interface JsonRequest {
  system: string;
  prompt: string;
  /** JSON Schema of the expected response */
  schema: object;
  temperature: number;
  /** Response used by the mock client (LLM_PROVIDER=mock) instead of calling a model. */
  mock?: () => unknown;
}

/** Subject-agnostic LLM access: trainers build prompts, the client returns parsed JSON. */
export interface LLMClient {
  readonly name: string;
  generateJson(request: JsonRequest): Promise<unknown>;
}

/** Non-retryable error (bad key, unknown model, invalid request) — retrying won't help. */
export class FatalLLMError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "FatalLLMError";
  }
}

export class RateLimitError extends Error {
  constructor(
    message = "LLM rate limit exceeded",
    public retryAfterMs?: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}
